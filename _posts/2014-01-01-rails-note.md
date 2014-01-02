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

  * `cattr_accessor(*syms, &block)`

      通过类变量，生成类读写方法和类实例读写方法，**因为类变量在继承链上下都是完全共享的**，所以该方法的修改对继承链上所有类可见

      block用于设置默认值

      设置去掉类实例访问器：` instance_writer: false` `instance_reader: false` `instance_accessor: false`(同时去掉读写)

  * cattr_reader(*syms)

    通过定义类的单件方法和类的实例方法，去写类变量，支持配置`instance_reader: false` `instance_accessor: false`

  * cattr_writer(*syms)

    通过定义类的单件方法和类的实例方法，去写类变量，支持配置`instance_writer: false` `instance_accessor: false`

  * class_attribute

    给类添加读写方法和谓词方法，以及类的实例添加读写谓词方法。
    
    内部通过给类定义单件方法(单键写方法每次调用，会重新定义单键读方法)，结合读写类的实例变量来实现

    因为是类的单件方法，所有方法是对子类可以继承的，但是子类也可以生成自己类的方法

    又因为是使用（当前的）类的实例变量，所以改变子类的值，不会影响到父类的值，但是要注意以下例外：

    如果不是用等号赋值的写方法，列如用`Subclass.setting << :foo` 这可能直接修改父类的类的实例变量

    可以传入的控制实例方法的参数：`instance_reader: false` `instance_writer: false` `instance_accessor: false` `instance_predicate: false`

        def class_attribute(*attrs)
          options = attrs.extract_options!
          # double assignment is used to avoid "assigned but unused variable" warning
          instance_reader = instance_reader = options.fetch(:instance_accessor, true) && options.fetch(:instance_reader, true)
          instance_writer = options.fetch(:instance_accessor, true) && options.fetch(:instance_writer, true)
          instance_predicate = options.fetch(:instance_predicate, true)

          attrs.each do |name|
            define_singleton_method(name) { nil }
            define_singleton_method("#{name}?") { !!public_send(name) } if instance_predicate #定义类的谓词方法

            ivar = "@#{name}"

            define_singleton_method("#{name}=") do |val| #定义类的写方法
              singleton_class.class_eval do
                remove_possible_method(name)
                define_method(name) { val } #定义类的读方法
              end

              if singleton_class?
                class_eval do
                  remove_possible_method(name)
                  define_method(name) do
                    if instance_variable_defined? ivar
                      instance_variable_get ivar
                    else
                      singleton_class.send name
                    end
                  end
                end
              end
              val
            end

            if instance_reader
              remove_possible_method name
              define_method(name) do #定义类的实例的读方法
                if instance_variable_defined?(ivar)
                  instance_variable_get ivar
                else
                  self.class.public_send name
                end
              end
              define_method("#{name}?") { !!public_send(name) } if instance_predicate #定义类的实例的谓词方法
            end

            attr_writer name if instance_writer #这里应该是定义类的实例的写方法
          end
        end

* ActiveSupport::DescendantsTracker

  类的后代跟踪模块，指定类 extend 该模块后，该类和其后代类就拥有了被跟踪(该类作为父类)的能力

  实现：模块定义了实例方法`inherited` (extend后成为类的类方法)，并借助模块的Hash类变量（@@direct_descendants）进行记录

  `descendants`  返回所有后代类

  `direct_descendants` 返回直接后代类

  与此同时ActiveSupport还对所有类增加了2个类似的方法(但是是遍历ObjectSpace，效率低)：
  
  `descendants` 返回所有后代类
  
  `subclasses` 返回直接后代类
