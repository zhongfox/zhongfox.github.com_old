---
layout: post
categories: [blog, linux]
tags : [linux]
title: Linux 笔记
---
{% include JB/setup %}

* `cd ~` 可以简写为 `cd`

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

    `mv  文件名 文件名` 将源文件名改为目标文件名

    `mv  文件名 目录名` 将文件移动到目标目录

    `mv  目录名 目录名`

     目标目录已存在，将源目录移动到目标目录；

     目标目录不存在则改名

    `mv 目录名 文件名` 出错

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

  * 命令查找顺序：1)绝对/相对路径执行命令 2)alias 3)bash内置命令 4)$PATH中查找到的第一个命令

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

* 软件安装

  * DEB:

    `dpkg -L/--listfiles 包` 查看已安装包所有相关联的文件

    `dpkg -S/--search 文件` 查看该文件属于哪个包，文件必须用绝对路径

    `dpkg -i XXX.deb` 安装指定本地包

    `dpkg  -l/--list [包]` 查看[指定包/所有已安装包]列表

    使用`aptitude` 通常需要先安装`apt-get install aptitude`

    aptitude库: `/etc/apt/sources.list` 修改该文件后需要`apt-get update` 使之生效

    `aptitude` 全屏交互式界面查看软件状态

    `aptitude show 包` 查看软件库中该包状态，也能看到该包是否已经安装

    `aptitude search 包` 搜索软件包，自动使用通配符匹配， i表示已安装，p未安装

    `aptitude install 包` 安装该包

    `aptitude safe-upgrade` 将所有已安装软件包安全升级

    `aptitude remove 包` 删除软件，保留配置

    `aptitude purge 包` 删除软件和配置

    使用`apt-get` <http://wiki.ubuntu.org.cn/UbuntuHelp:AptGet/Howto/zh>

    `sudo apt-get update` 在更新source list 要执行更新操作

    ubuntu 的source 位置`/etc/apt/sources.list`


  * rpm/yum

    rpm 安装信息位于`/var/lib/rpm/`数据库内

    * 查询

      `rpm -qa ` 列出所有已安装包

      `rpm -q 包` 查询该包是否安装

      `rpm -ql 包` 列出该包所有的文件和目录

      `yum search 包` 列出库中该包所有相关包

      `yum list installed` 列出所有已安装包

      `yum list` 列出服务器上所有包

      `yum list 包` 列出服务器上该包相关包，分为已安装，可升级或未安装

      `yum list updates` 列出可供本机升级的包

    * 安装软件包

      `yum install <package>`

      `rpm -ivh XXX.rpm` -i 安装 -v详细安装画面 -h 安装进度

    * 升级

      `rpm -UFvh <package>`  U 表示没有安装则安装，安装了则升级，F表示只升级

      `yum update` 升级所有可升级的包

      `yum update 包` 升级指定包

    * 卸载

      `rpm -e 包` 卸载，注意可能会提示依赖

      `yum remove 包` 卸载指定包

  * yum 设置

    * `yum repolist all` 列出使用的所有仓库

    * `yum version nogroups` 查看变量 $releasever 和 $basearch 或者 `python -c 'import yum, pprint; yb = yum.YumBase(); pprint.pprint(yb.conf.yumvar, width=1)'`

    * <http://zhumeng8337797.blog.163.com/blog/static/100768914201231852812921/>

* 查看所有别名 `alias`

* 重定向标准输出 `> file` `>> file` 标准错误输出 `2> file` `2>> file` 2者同时 `&> file`

  双向重定向：`tee -a file ` 把标准输出转存文件并且输出到屏幕，-a表示追加到文件，否则新建文件

* 判断执行：

  * `cmd1;cmd2`  顺序执行 不考虑成功

  * `cmd1 && cmd1` 前面执行成功才执行后面，回传码`$?`==0即为成功

  * `cmd1 || cmd2` 前面不成功才执行后面

  * 常用：`cmd1 && cmd2 || cmd3` cmd2是一个一定成功的命令，用于 cmd1 ? cmd2 :cmd3

* 管道：管道命令必须能接受标准输入。前一条命令的**标准输出**作为后一条的**标准输入**

  * `cut` 每次处理一行，每行也对应一行结果

    -d '单个分隔字符' -f 指示输出切割后的第几段，可接多个段，逗号分隔 `-`表示到最前/末

    -c '每行输出的范围' 用于输出排列整齐的数据， 范围如 `5` `2-` `3-5` `-7`

  * `wc` 默认输出行，单词，字符，分别对应参数 -lwm

  * `tr -ds`

    -d 删除指定字符 `cat dos.rb | tr -d '\r' > dos.rb ` 把其中dos回车去掉

    -s 替换，貌似只能对等的替换，替换目标和结果字符数必须一致,是全局替换

  * `split`文件切割

    -b 以文件大小来切割 接单位bkm等，`split -b 30k bigfile smallfile` 会生成smallfileaa smallfileab等

    -l 按行数切割 `ls -al / | split -l 10 - listbackup` **注意最后一个-, 可以代表标准输入或者输出**

* `mail username@host`: 如果是localhost，host可以省略，会让你输入subject和正文，换行输入点号结束。

  收邮件`mail` `N`表示未读邮件

* jobs

  -l 可以展示pid

  `fg %jobid` 将该job转到前台，running

  `bg %jobid` 将该后台（suspended stopped） 进程转为 后台running

  jobs 的状态： running suspended stopped killed

  `ctrl + Z` 前台job转变为 suspended 或者 stopped后台进程 （怎么区别？？？？？？）

  `command & ` 以后台进程运行，job状态为 running 或者 suspended（怎么区别？？？）

  `kill -signal %jobsid` 发送信号给后台job， 注意%表示后面是jobsid，1 reload配置，2 同ctrl+C 9立即强制结束  15正常结束

* top

  -d 秒数，刷新频率

  -p 进程转为号，指定进程监控

        us 用户空间占用CPU百分比
        sy 内核空间占用CPU百分比
        ni 用户进程空间内改变过优先级的进程占用CPU百分比
        id 空闲CPU百分比
        wa 等待输入输出的CPU时间百分比
        hi 硬件中断
        si 软件中断
        st: 实时

  * linux 按照cpu排序`P` 按照内存排序 `M`
  * mac 按照cpu排序`ocup` 按照内存排序 `ovsize`

* pstree -u 同时列出进程所属账号 -p 同时列出pid

* daemon/service

  文件/etc/services 设置了服务和端口的对应

  daemon分为`stand alone`和`super daemon`

  相关配置文件：

  `/etc/init.d/*` 启动脚本放置处

  **stand alone 管理**

  `/etc/init.d/some_daemon` 不加参数会返回所有可用命令

  如`Usage: /etc/init.d/mongod {start|stop|status|restart|reload|force-reload|condrestart}`

  辅助命令`service`实现以上功能：

  `service [service name] (start|stop|restart|...)`

  `service --status-all`展示系统所有服务的状态

* 查看线程

  ` ps -eLf |grep 命令 |grep -v grep` 将打印出：

  UID PID PPID C(?)  LWP(轻量级进程，即线程标识符) NLWP(线程数量) STIME TTY TIME CMD

  `top -bH -d 3 -p  ${pid}` top动态查看线程情况

  `ps -mp $pid ` 简略查看进程的线程数，每行一个线程

* 键盘操作

  `ctrl + WhdK` 删除光标(之前所有，之前一个，之后一个，之后所有)

  `ctrl + u` 整行删除

  `ctrl + L` 清屏

  `ctrl + a e` 光标前置/后置

  `ctrl + 光标` 按照word移动，xsehll里无效

* 安装`oh my zshell`

  * `echo $SHELL` 查看当前使用的是什么shell
  * `which zsh` 如果没有zsh, 需要先安装zsh `sudo apt-get install zsh`
  * `curl -L http://install.ohmyz.sh | sh`
  * `chsh -s \`which zsh\`` 
