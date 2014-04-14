---
layout: post
categories: [blog, rails]
tags : [delegate]
title: ActiveSupport 中的 delegate
---
{% include JB/setup %}

---

`vi /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/core_ext/module/delegation.rb`

* activesupport 通过扩展Moudle，为所有Moudle增加了类方法`delegate`, 作用是把**类的实例**的方法委托到接受者

* 用法：

  `delegate 方法symbol列表, to: 接收者`  to 接受者（target）

  接收者可以是方法，对象，或者：

        delegate :sum, to: :CONSTANT_ARRAY #常量
        delegate :min, to: :@@class_array  #类变量
        delegate :max, to: :@instance_array #实例变量


  还可以委托到自己的类上：`delegate :hello, to: :class`

* 可选参数

  * `prefix: true` : 在调用的方法前加上to（target）指向的前缀：

        Person = Struct.new(:name, :address) #TODO 总结Struct

        class Invoice < Struct.new(:client)
          delegate :name, :address, to: :client, prefix: true
        end

        john_doe = Person.new('John Doe', 'Vimmersvej 13')
        invoice = Invoice.new(john_doe)
        invoice.client_name    # => "John Doe"
        invoice.client_address # => "Vimmersvej 13"


  * 也可以对prefix赋予具体前缀 `prefix: :customer`

  * `allow_nil: true` 如果target是nil，为防止报错，可以用allow_nil。但是注意如果target非nil，但是方法不存在还是会报错 （也就是只能防止target为nil情况）

* 一点源码, 看源码可以不经意学到一些东西

        def delegate(*methods)
          options = methods.pop #学习如何处理参数最后的option
            ....
          prefix, allow_nil = options.values_at(:prefix, :allow_nil) #学习使用values_at


  另外activesupport是通过`module_eval`给类加上新的实例方法
