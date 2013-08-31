---
layout: post
category : linux
tags : [linux]
title: Linux 笔记
---
{% include JB/setup %}

* 查看操作系统位数`getconf LONG_BIT` `getconf WORD_BIT`

* 查看cpu架构：`arch` `uname -m` `echo $HOSTTYPE`HOSTTYPE貌似有问题

* `uname` Print certain system information
  * -a 所有信息
  * -r 内核版本
  * -m cpu架构

* `stat` 查看文件inode信息

* 通常命令执行方式 `命令 -参数 文件或目录` 其实参数可以放到最后, 文件或目录通常可以接多个

* 修改文件属性：

  `-R` 连同目录子目录和文件

  * `chgrp [-R] {group} file` root和文件属主可用，且文件属主必须属于group
  * `chown [-R] [owner][:group] file` 仅root可用，修改owner，也可以顺便修改group
  * `chmod [-R] {new_mod} file` root和文件属主可用，否则即使你有w权限，也没法使用该命令，`chmod 644 ...` `chown u+x ...` `chown u=rwx,go-x ...` 最后一种注意没有逗号
  `cp`创建的文件会使用执行者的权限(根据umask?)，可能需要改变文件属性

* 对目录有r权限但是没有x权限的话，可以看到目录内的文件名，但是看不到文件的权限等信息（以问号代替）


* 文件目录管理

  * `mkdir [-mp] name`  -m 指定权限, -p 递归创建, 可以接很多name 

  * `rmdir [-p] name` 删除**空的**目录，-p递归删除，只能删除空的

  * `rm [-rRf] 目录` 递归删除非空目录 r R都行; -f 强制删除

  * `ls -alFihR` F是展示目录附加信息， /代表目录，*代表可执行文件，=代表socket; 通常` alias ll='ls -alF'`; -i 列出inode; -h文件大小使用易读的单位, -R递归遍历子目录

  * 列出当前目录下的一级子目录`ll -d */`

  * `cp 源文件 目标文件` -i 若目标文件存在,进行询问，-f 强制复制，-r -R 目录递归复制，即使目录是空的也需要，-l 进行硬链接，-s 进行软连接,-p 连同文件属性一起复制，复制链接文件时，无-d复制原始文件，加参数复制链接文件

  * `mv -fiu 源文件1 源文件2 目标文件` 如果有多个源文件，目标文件一定是目录

  * `basename` 文件名 `dirname` 目录名

* 内容查阅

  * `cat` `tac` -n显示行号

  * `more` 无法前翻无法展示行号

  * `less` bf 前翻后翻，:f 展示文件名(同vi) q 离开

  * `head ` `tail` -n 展示多少行，默认是10行, tail可以持续监测 -f


* `touch -mac` m 修改时间(默认) a访问时间 c创建时间， -d 或者 -t指定时间

* 查找

  * `which -a 命令` 在$PATH中查找命令，包括别名，但是找不到bash内置命令如cd, -a 列出$PATH中说有的，而不是第一个

  * `type -a 命令` shell内置命令，查找别名，$PATH和shell内置

  * `whereis -bmsu file`  不靠谱

  * `locate -ir 关键字`  -i 忽略大小写 r接正则表达式。 查找数据库，依赖于定时任务`updatedb` 需要root权限

  * `find 目录 -option action`

    find app/ -name '*deal*' 按照文件名查找，目录包括子目录，文件名可以使用通配符

* 磁盘

  * `df` 查看当前磁盘挂载情况 -a 所有文件系统包括/proc等用于内存的，-h 易读单位， -i 不用硬盘容量使用inode数

  * `dumpe2fs 设备文件名` 

  * `du -ahsS 目录文件`  默认只列出目录大小-a 列出目录和文件，-h易读单位，默认会递归遍历，-s列出目录总大小，不递归，-S递归时不计算子目录大小不计入父目录大小中。常用`du -hs 某一目录/*/`展示该目录下第一层子目录大小

  * 硬链接：共享inode和对应的block，不能跨越文件系统，不能链接目录：`ln 原文件 目标文件`

  * 软连接：有不同的inode和不同的block，链接目标文件的文件block存的是原文件的文件名，根据文件名再链接到原文件的inode和文件：`ln -s 原文件 目标文件` 可以链接目录

* 压缩

  * `gzip -vdc` 默认是压缩，后缀`gz` 只能压缩文件并会删除原文件，-v显示压缩时压缩比等信息，-d解压参数，-c压缩后的数据输出到终端

    保留原始文件：`gzip -c 原始文件 > 压缩后的文件.gz`

    `zcat` 用于查看gzip压缩后的文本文件

  * `bzip2 -vdck` 默认是压缩，后缀`bz2`, -vdc同上，-k保留原文件

    `bzcat` 用于查看bzip2压缩后的文本文件 

* 打包 tar

  -j 使用bzip2 -z 使用gzip

  `-c` 打包，原文件不会删除

  `-x` 解包，原文件不会删除

  `-f 新建文件名 要压缩的目录` tar打包时必须指定目标文件名,需要自己加上后缀`tar.bz2`或者`tar.gz`,该参数最好独立出来, **解包时候也必须加上这个参数**

  `-v` 打包/解包过程中输出正在处理的文件

  `-p`打包时保留原文件属性

  `-C 目录` 解包是指定目录，默认在当前目录

* shell

  * shell命令中的**优先执行命令**： $(优先执行命令) 或者用反引号

  * 变量：
  
    环境变量通常全大写,和shell操作接口相关的自定义变量通常也大写

    export: 后面跟变量将会把该变量转化成环境变量，不加变量同env
  
    读变量有2种：`$VAR`或者`${VAR}`, 写变量不需要$

    写变量用`=`两边不能有空格，值可以用可选的单双引号，双引号支持变量内插

    变量内容增加：`var="$var"somethingelse`

    取消变量`unset myvar`

    `env` 显示所有环境变量

    `set` 显示所有变量, ????

    常用变量：$ 本shell的pid， ?上一条命令的回传码

