---
layout: post
category : Ruby
title: Ruby 元编程学习笔记
tags : [ruby, OOP, metaprograming]
---
{% include JB/setup %}



最近又在翻看《Ruby元编程》，觉得有些东西记下来印象会更深刻。决定用这篇文章来记录Ruby元编程的相关笔记，持续更新。

1.  send 是BasicObject的公用类方法, 但却不是它的单键方法，因为BasicObject已无超类，怀疑是BasicObject mixin 了什么模块？

    `BasicObject.public_methods.grep(/^send/) => [:send]`

    `BasicObject.public_methods(false).grep(/^send/) => []` 

    send的一个用处是用来调用某一对象的私有方法


2.  Module有一个私有实例方法 define_method

    `Module.private_instance_methods(false).grep(/define_method/) => [:define_method]`

    该方法成为每个模块/类的类方法，所以任何模块/类都可以用 define_method 为本模块/类增加实例方法

    经常在Kernel上使用该类方法，来定义一个**内核方法**： `Kernel.send :define_method, :test do puts 'Im a test' end` 因为define_method是Kernel的私有方法，所有用send来调用。

    Calss是Module的subclass，Object是Class的实例，所以：

    `Object.private_methods.grep(/define_method/) => [:define_method]`

    但是这是为什么？ `BasicObject.private_methods.grep(/^define_method/) => [:define_method]`

3.  `class` `module` `def` 关键字会开启新的作用域

    与之对应的通过传递block来扁平化作用域的办法有：`Class.new` `Module.new` `Module#define_method`

    其他常见的扁平化作用域的：`Object#instance_eval` `class_eval` `module_eval`

4.  可调用对象：Proc对象, lambda, method对象

    可调用对象的一个使用是实现延迟执行，这个在rails的scope中经常用到（scope中的lambda的Time.now不会在class加载的时候固化）

    `Proc.new => proc`

    `proc {block} => proc`

    `lambda {block} => lambda`

    `->(arg) {block} => lambda`

    proc 和 lambda 的区别： 
   
    * proc中的return会从**定义**proc的作用域返回，lambda会更合理的从lambda中返回

    * proc自适应传递的参数个数，lambda严格要求参数个数

    可以使用多个代码块来共享一个局部变量，但是我更喜欢这种类似javascript的闭包的方式：

        lambda {
          share = 10

          Kernel.send :define_method, :increase_a do
            share += 1
          end

          Kernel.send :define_method, :show_a do
            puts share
          end

        }.call

    这和js最佳实践中，每个文件都定义一个马上运行的闭包如出一辙：

        (function () {
          var share = 10;
          
          function increaseA()  {
            share++;
          } 

          function showA()  {
            alert(share);
          }
          
          window.increaseA = increaseA;
          window.showA = showA

        } ());
