---
layout: post
categories: [blog, tool]
tags : [tool, supervisor]
title: 使用supervisor
---
{% include JB/setup %}


## 介绍


> Supervisor,是一个进程控制系统，是一个客户端/服务器端系统允许用户在UNIX-LIKE 操作系统中去监控，控制一些进程。Supervisor作为主进程，Supervisor下管理的时一些子进程，当某一个子进程异常退出时，Supervisor会立马对此做处理，通常会守护进程，重启该进程。

monit和supervisor的一个比较大的差异是supervisor管理的进程必须由supervisor来启动, monit可以管理已经在运行的程序

supervisor还要求管理的程序是非daemon程序，supervisord会帮你把它转成daemon程序

---

## 组件

* supervisord 服务端程序
* supervisorctl client端程序/管理程序
* Web Server
* XML_RPC接口

---

## 安装

环境: centos

* 安装 python-setuptools

  > sudo yum install python-setuptools

* 安装supervisor

  > sudo easy_install supervisor

* 测试安装是否成功

  > echo_supervisord_conf

---

## 使用

* 创建主配置文件:

  > echo_supervisord_conf > /etc/supervisor.conf

* 启动:

  > supervisord -c /to/your/path/supervisord.conf

  `supervisord`不带参数将按照以下优先级寻找配置文件:

  * `$CWD/supervisord.conf`
  * `$CWD/etc/supervisord.conf`
  * `/etc/supervisord.conf`


* `supervisorctl update`: 添加新的配置文件后，执行该命令，会把新添加的服务启动起来，且不会影响正在运行的服务
* `supervisorctl status`:查看运行状态

  > 程序名称   状态      pid        运行时间  
  > nodeppt    RUNNING   pid 27264, uptime 0:04:0

* `supervisorctl reload`: 重新载入会读取最新配置并重新启动所有进程

  各个程序 pid 重新生成, uptime重置

* supervisorctl start <name>:启动进程 ：supervisorctl start all 表示启动所有

* supervisorctl stop <name>: 停止进程

* supervisorctl restart <name>: 重启进程

* console:

      ➜  ~ sudo supervisorctl
      nodeppt                          RUNNING   pid 32285, uptime 0:07:06
      supervisor>
      add        clear      fg         maintail   pid        reload     reread     shutdown   start      stop       update
      avail      exit       help       open       quit       remove     restart    signal     status     tail       version

## 配置笔记

> [inet_http_server]  
  port=0.0.0.0:9001 ; 这里如果需要适配所有ip, 设置`*:port`或者`:port`貌似没用, 用`0.0.0.0`验证有效

---

## 参考资料

* [配置详解](http://lixcto.blog.51cto.com/4834175/1539136)
* [官方网站](http://supervisord.org/)
* [Supervisor学习](http://beginman.cn/linux/2015/04/06/Supervisor/)

* <http://www.jianshu.com/p/9abffc905645>
* <http://blog.chinaunix.net/uid-26000296-id-4759916.html>
