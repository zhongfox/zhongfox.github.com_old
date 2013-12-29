---
layout: post
category: ruby
tags: [ruby, OOP]
title: Ruby 继承链
---
{% include JB/setup %}



Ruby在方法查找和常量查找都依赖继承链，直接上图：

<img src="/assets/images/ruby_inheritance_chain.jpg" />

需要总结的几点：

* 可以用以下办法查找一个类/对象的单件类：

        class Object
          def eigenclass
            class << self; self; end
          end
        end

  `Object#singleton_class` 也是返回单件类：Returns the singleton class of obj. This method creates a new singleton class if obj does not have it.


* 比较MyModule和MyClass，发现MyModule不能实例化对象，也没有继承的超类，简单的可以理解为，Module和Class的区别，Module是Class的超类，Class比Module多了3个实例方法：`new superclass allocate`  前两个方法就决定了MyModule无法实例化和无超类

* 普通类的 ancestors 会沿着 superclass 查找，但是所有单件类的 ancestors 都是 [MyClass, Object, Kernel, BasicObject] 

* 从图中虽然每个单件类都有superclass，但是单件类无法显式被继承。试图显式地去继承一个单件类，将会得到错误：can't make subclass of singleton class

* 最右边的单件类继承链，可以用来说明为什么类方法是可以继承的。

* 对于类对象，eigenclass 的超类就是超类的 eigenclass; 对于非类对象，eigenclass的超类就是对象的类。

* BasicObject 没有超类，但是#BasicObject有，就是Class！


