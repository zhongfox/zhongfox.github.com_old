---
layout: post
categories: [blog, javascript]
tags : [nodejs]
title: nodejs 简介
---
{% include JB/setup %}

---

## 什么是Node

Node是基于事件驱动的服务器Javascript运行平台

<img src="/assets/images/nodejs_intro/node_component.png" />

---

## Node的特点

### 一. 异步I/O

  * 浏览器

        $.post('/url', function (responseData) {
          alert(responseData);
        });
        someOtherAction();

    <img src="/assets/images/nodejs_intro/ajax.png" />

  * Node

        fs.readFile('/home/zhonghua/.vimrc', function(err, file) {
          console.log('读取文件完成');
        })
        console.log('其他调用');

    <img src="/assets/images/nodejs_intro/read_file.png" />

### 二. 事件与回调函数

### 三. 单线程

  优势：

  * 没有多线程上下文切换的开销
  * 没有死锁问题, 无需考虑状态同步

  劣势：

  * 无法利用多核CPU （解决方案：多进程 child_process）
  * 错误会引起整个应用退出（健壮性）
  * cpu密集操作会影响异步IO的调用

  对比MRI (C ruby)同步IO:

  * ruby 单线程

    <img src="/assets/images/nodejs_intro/ruby_single.png" />

  * ruby 多线程

    <img src="/assets/images/nodejs_intro/ruby_multiple.png" />


### 四. 跨平台

---

## Node应用场景

1. IO密集型
2. CPU密集型应用需要合理调度
3. 基于Node的大前端架构
4. 分布式系统，实时系统（利用Node的高性能IO）

---

## Node异步IO的实现


Node异步IO基本要素:

* 事件循环

  Node维护了一个类似`while(true)`的死循环, 每次循环叫做一个Tick.


  <img src="/assets/images/nodejs_intro/tick.png" />


* 观察者

  观察者是异步IO过程中一个抽象的概念, 观察者会接收到IO事件, 然后再传递给事件循环.

  观察者分为文件IO观察者, 网络IO观察者等等

* 请求对象

  请求对象是异步IO过程中的重要产物, 它存储了需要执行的IO操作, 回调处理等.

* IO线程池


整个异步IO流程:

<img src="/assets/images/nodejs_intro/async_io.png" />

---

## 参考资料

* <深入浅出nodejs>
* <http://www.cnblogs.com/Mainz/p/3552717.html>
