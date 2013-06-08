---
layout: post
category : rails
tags : [rails debug config]
title: Rails 调试技巧和常用配置
---
{% include JB/setup %}

### 为什么要总结常用的调试技巧

  1. 使开发更加顺畅、高效

  2. 快速定位bug，减少出错时候纠结的时间

  3. 总结和学习开发调试技巧需要花些时间，但是从长远来说是值得的。

### 有哪些方面的技巧可以帮助我们开发和调试?

  * Rails 相关命令行

  * Rails Console

  * Rake

  * Rails Server 和 Log

### Rails Command Line

  * rails console = rails c

    * rails c --sandbox 沙箱模式 不会修改数据

    用途：
    * 测试代码

    * 读取/修改数据

    * 读取配置

  * rails server = rails s

    * -e 设置运行环境 `rails s -e production`

    * -p 指定端口 `rails s -p 3001`

    * -b 绑定ip

    * -d 以守护进程（daemon）运行

  * rails generate = rails g 

    * Usage: rails generate GENERATOR [args] [options]

    * 直接 rails g 可以查看有哪些生成器

  * rails destroy = rails d  是rails generate的逆操作

  * rails dbconsole = rails db 进入配置的数据库命令行

    * `rails db 环境名` 模式名是指test production 等, 默认是develop

    * `rails db -p` 从 database.yml 里获取密码

  * rails runner = rails r 非交互式运行rails代码

    * -e 环境名称

### Rake

  * rake --tasks 或者 rake -T 查看所有rake 

  * rake about 环境相关信息

  * assets
  
    * rake assets:precompile 静态资源预编译;  
   
    * rake assets:clean 删除已编译的静态资源

  * db

    * create 



