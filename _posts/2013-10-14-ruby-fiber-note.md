---
layout: post
category : linux
tags : [fiber, ruby]
title: Ruby 纤程小记
---
{% include JB/setup %}

* Ruby1.9中引入的Fiber 是一种协同例程(coroutine)，或者更准确叫做半协同例程，fiber常见的用法是实现生成器(generator)

* fiber的使用：

  * `Fiber.new { block }` 创建一个纤程，但是不会马上执行代码块

  * `Fiber.resume(optional_args)` 调用纤程，初次调用时，optional_args传递为block的参数，block遇到yield停止执行，并返回yield的参数给调用者做为返回值，调用者再次resume调用纤程，所带的optional_args为当前yield的返回值。

* 高级纤程特性：

  Fiber实现的是半协同例程

  通过`require 'fiber'`可以使用其他高级特性，fiber库允许纤程对象相互调用（使用方法`Fiber#transfer`）

  `Fiber#current` 返回当前掌握控制权的Fiber


* Fiber和Thread的区别：

  * Fiber不会马上执行代码块，需要手动resume/transfer调用

  * 操作系统对线程有控制权调度器，纤程可以使用resume/transfer显示的调度
