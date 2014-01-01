---
layout: post
category : rails
tags : [rails]
title: Rails 杂记
---
{% include JB/setup %}

* includes preload eager_load 区别

  includes：Rails会选择使用 LEFT OUTER JOIN 还是独立sql查询被关联对象

  preload：一定是使用独立sql查询

  eager_load： 一定是使用 LEFT OUTER JOIN 

  使用 LEFT OUTER JOIN 策略时，可能会有若干问题，如被关联对象的default_scope 里的order没法应用。

  <http://stackoverflow.com/questions/11946311/whats-the-difference-between-includes-and-preload-in-an-activerecord-query>

* 查找super方法定义：

  阅读rails源码时，经常发现super调用，但是却无法查找到具体方法定于在何处。下面的小方法可以解决这个问题


        def get_all_super_method_location(object, method_name)
          method_locations = []
          object.singleton_class.ancestors.each do |klass|
            if klass.public_instance_methods(false).include?(method_name)
              method_locations << [klass.name] + klass.instance_method(method_name).source_location
            end
          end
          method_locations
        end


  如果object是类，类方法可能是在类的单件类中定义的（或者extend 其他模块，extend扩展了类的单件类的继承链，但是没有影响类本身的继承链）

  方法查找都是从singleton_class的ancestors的instance_method查找，其中object可以是任何ruby对象(类对象或者类的实例)，由衷赞叹ruby对类和对象设计的统一性

* rails 对类访问的扩展：

  * cattr_accessor

  *  cattr_reader

  *  cattr_writer

  *  class_attribute
