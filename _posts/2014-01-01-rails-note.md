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

* ActiveSupport::Callbacks

  在类中`include ActiveSupport::Callbacks`后，该类会有callback的功能

  * 类方法`define_callbacks(*callbacks)`

    定义若干回调链标识

    参数：

    `terminator` 设置终止before filter 和event的条件，默认false，表示不启用

    `skip_after_callbacks_if_terminated` 默认terminator不影响after回调，设置该参数true的话，使after也被终止

    `scope ` 当 set_callback 中回调是一个对象时，改参数用于去该对象中调用回调方法

    如`define_callbacks :save, scope: [:kind, :name]` kind表示before after around，name表示回调链标识

  * 类方法 `set_callback(name, [kind], *filter_list, &block)`

    为指定回调链添加回调方法

    name是回调链标识，kind如果不传是before，filter_list可以是多个：a symbol naming an instance method; as a proc, lambda, or block; as a string to be instance evaluated; or as an object that responds to a certain method determined by the :scope argument to define_callback

    如果同时有symbol和block，block的定义会提前

    参数：

    if：symbol实例方法名或者proc，返回true，回调才执行

    unless: 类似上面

    prepend：如果是true将会把该回调放到最前面

  * 实例方法`run_callbacks(kind, &block)`

    运行指定的回调链

        require 'active_support'
        class Account
          include ActiveSupport::Callbacks

          define_callbacks :save
          set_callback :save, :before, :before1, :before2 do
            puts 'before_block'
          end

          set_callback :save, :around, :test_around

          set_callback :save, :after, :after1, :after2 do
            puts 'after_block'
          end

          def event
            run_callbacks :save do
              puts 'save in main'
            end
          end

          def before1
            puts 'before1'
          end

          def before2
            puts 'before2'
          end

          def test_around
            puts 'before test around'
            yield
            puts 'after test around'
          end

          def after1
            puts 'after1'
          end

          def after2
            puts 'after2'
          end

        end

        Account.new.event

        before_block
        before1
        before2
        before test around
        save in main
        after2
        after1
        after_block
        after test around #我疑惑

* `require 'active_support/core_ext/kernel/singleton_class'`

  在Kernel中添加的实例方法叫内核方法，因为`Object.include Kernel` Object的子类的对象，都拥有内核方法

  也就是说，所有的对象(类对象，模块对象，类的实例)都有内核方法，如：

        module Kernel
          def test
            puts 'test'
          end
        end

        class A

        end

        A.test #'test'

        A.new.test #'test'

  Rails 对Kernel的扩展，对类的实例增加了class_eval方法：

        module Kernel
          # class_eval on an object acts like singleton_class.class_eval.
          def class_eval(*args, &block)
            singleton_class.class_eval(*args, &block)
          end 
        end
  但这不会覆盖类的类方法`Module#class_eval`, 从类对象的继承链来看

  `Class.new.class.ancestors => [Class, Module, Object, Kernel, BasicObject]`

  `Module#class_eval` 会优先于 `Kernel#class_eval`被调用

