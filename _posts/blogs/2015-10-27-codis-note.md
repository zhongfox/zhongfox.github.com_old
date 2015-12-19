---
layout: post
categories: [blog, server]
tags : [cache, redis]
title: Codis
---
{% include JB/setup %}

## mac 安装

* 安装go `brew isntall go` 设置好$GOPATH 和 GOROOT, 可以参考 https://gist.github.com/vsouza/77e6b20520d07652ed7d

* 安装codis, 可以参考: https://github.com/wandoulabs/codis/blob/master/doc/tutorial_zh.md#user-content-build-codis-proxy--codis-config

  但是这里网了一步: 在make前, 执行`./bootstrap.sh`

## 初始化

* 启动 dashboard `bin/codis-config dashboard` 默认配置是config.ini

* 初始化 slots `bin/codis-config slot init` 会在zookeeper上创建slot相关信息

* 启动 Codis Redis,  启动四个测试:

  `bin/codis-server --port 10001`
  `bin/codis-server --port 10002`
  `bin/codis-server --port 10003`
  `bin/codis-server --port 10004`

* 添加 Redis Server Group, 2个group, 一主一从

  `codis-config server add 1 localhost:10001 master`
  `codis-config server add 1 localhost:10002 slave`
  `codis-config server add 2 localhost:10003 master`
  `codis-config server add 2 localhost:10004 slave`

* 设置 server group 服务的 slot 范围

  `bin/codis-config slot range-set 0 511 1 online`
  `bin/codis-config slot range-set 512 1023 2 online`

* 

## 参考

* [Codis 使用文档](https://github.com/wandoulabs/codis/blob/master/doc/tutorial_zh.md)
* [Codis (RebornDB) 的设计与实现](http://0xffff.me/blog/2014/11/11/codis-de-she-ji-yu-shi-xian-1/)
* [Codis作者黄东旭细说分布式Redis架构设计和踩过的那些坑们](http://www.open-open.com/lib/view/open1436360508098.html)
