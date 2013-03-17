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

2.  define_method 是 BasicObject 的私有类方法

    `BasicObject.private_methods.grep(/^define_method/) => [:define_method]`

    经常在Kernel上使用该类方法，来定义一个**内核方法**： `Kernel.send :define_method, :test do puts 'Im a test' end` 因为define_method是Kernel的私有方法，所有用send来调用。

    但是Module也有一个私有实例方法 define_method

    `Module.private_instance_methods(false).grep(/define_method/) => [:define_method]`

    该方法成为每个模块/类的类方法，所以任何模块/类都可以用 define_method 为本模块/类增加实例方法
