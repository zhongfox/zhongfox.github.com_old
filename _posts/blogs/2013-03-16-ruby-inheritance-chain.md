---
layout: post
categories: [blog, ruby]
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

* 普通类的 ancestors 会沿着 superclass 查找，~~但是所有单件类的 ancestors 都是[Class, Module, Object, Kernel, BasicObject]~~

  对类对象, 1.9.3 和2.1.1有区别:

  * 1.9.3: 所有类的 `singleton_class.ancestors` 都是  [Class, Module, Object, Kernel, BasicObject] (不符合上图)
  * 2.1.1:  所有类的 `singleton_class.ancestors`符合上图, 如`Myclass.singleton_class.ancestors`为`[#<Class:MyClass>, #<Class:Object>, #<Class:BasicObject>, Class, Module, Object, Kernel, BasicObject]`

  * 两个版本的`MySubClass.singleton_class.superclass`都是一致的


* 从图中虽然每个单件类都有superclass，但是单件类无法显式被继承。试图显式地去继承一个单件类，将会得到错误：can't make subclass of singleton class

* 最右边的单件类继承链，可以用来说明为什么类方法是可以继承的。

* 对于类对象，eigenclass 的超类就是超类的 eigenclass; 对于非类对象, eigenclass的超类就是对象的类。

  * 非类对象, 三角关系: `my_obj #my_obj MyClass`

    `my_obj.singleton_class.instance_methods(false)` 能得到`my_obj`的单键方法(得不到MyClass中定义的实例方法), 可以说明对象的单键方法, 其实是对象单键类中定义的实例方法(因为对象是单件类的实例,所有可以调用其实例方法)

    又因为`#my_obj`继承于MyClass, 因此`my_obj`也能使用MyClass中的实例方法

  * 类对象, 四角关系: `MySubClass #MySubClass MyClass #MyClass`

    四角关系可以说明为什么类的单件方法可以继承: MyClass的单件方法是#MyClass定义的实例方法, #MySubClass继承#MyClass, 因此#MyMyClass继承了#MyClass定义的实例方法, 因此实例MySubClass就可以使用MyClass定义的方法


  想想四角中其实缺失了三角的一个关系: MySubClass为什么可以调用Class中定义的实例方法(如MySubClass.new), 其实是因为继承链`#MySubClass -> #MyClass -> #Object -> #BasicObject -> Class`

  总结:

  * 实例方法存在与本类中(`klass.instance_methods`), 单件方法存在于其单件类中(`obj.singleton_methods`)

  * 类的继承实现了类的实例方法的传承(实现实例方法继承); 单件类的继承实现了单件的实例方法的传承(实现类方法继承)

  * 非类对象三角关系, 类对象四角关系

  * 统一, 太完美!

* BasicObject 没有超类, 但是#BasicObject有, 就是Class！


