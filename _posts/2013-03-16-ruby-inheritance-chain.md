---
layout: post
category : Ruby
title: Ruby 继承链
tags : [ruby OOP]
---
{% include JB/setup %}



Ruby在方法查找和常量查找都依赖继承链，直接上图：

<img src="/assets/images/ruby_inheritance_chain.jpg" />

需要总结的几点：

* 比较MyModule和MyClass，发现MyModule不能实例化对象，也没有继承的超类，简单的可以理解为，Module和Class的区别，Module是Class的超类，Class比Module多了3个实例方法：`new superclass allocate`  前两个方法就决定了Module无法实例化和无超类
* 一般来说对象的ancestors会沿着superclass查找，但是对本体类`#MyClass` 比较奇怪, irb测试：

  `class MyClass; end; class << MyClass; puts superclass; puts ancestors; end` 

  可以看到本体类`#MyClass`的超类是Object，但是它的祖先链却是： `Class Module Object Kernel BasicObject`
