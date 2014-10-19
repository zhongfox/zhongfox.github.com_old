---
layout: post
categories: [blog, javascript]
title: Javascript 特性介绍
tags : [函数, 闭包, 原型链, ruby]
---
{% include JB/setup %}

## 1. 函数是一等对象（first-class object）

* 函数可以在运行时动态创建，还可以在程序执行过程中创建
* 函数可以分配变量，可以将它们的引用复制到其他变量
* 可以作为参数传递给其他函数，可以作为返回值(高阶函数)
* 函数可以有自己的属性和方法

简单的说，一等对象就是说在使用上和其他对象没有任何区别

    // 函数作为返回值
    function foo(x) {
        return function() {
            return x;
        }
    }

    // 函数作为参数
    function foo(x, bar) {
        return bar(x);
    }
    foo('javascript', function(args) { console.log('hello ' + args) }) //hello javascript

类比ruby 中的可调用**对象**：Proc对象, lambda, method对象

    bar = ->() { puts 'Im a lambda object' }

    // lambda作为返回值
    def foo
        ->() { puts 'Im a lambda object' }
    end

    // lambda作为参数
    def foo(x, bar)
        bar.call(x)
    end
    foo('ruby', ->(args) { puts "hello #{args}" }) #hello ruby

---

## 2. 闭包

**定义**: 一个拥有许多变量和绑定了这些变量的环境的表达式（通常是一个函数）

**闭包的实现基础**:

* 函数是一等对象(可以传递, 可以用变量引用)
* 函数提供了作用域

        var m = 'hello '
        function foo() {
            var n = 'javascript';
            return function () {
                console.log(m + n);
            };
        }
        var bar = foo();
        bar(); //hello javascript

**类比ruby中的method和lambda**

        m = 'hello '
        def foo
            n = 'ruby';
            return -> { puts n }
            #return -> { puts m } #undefined local variable or method `m'
        end

        bar = foo()
        bar.call # ruby

**ruby 中的binding**

  binding 代表了代码执行的上下文环境(类似javascript中的闭包)

  * `Kernel#binding`可以获得当前的Binding对象

  * `Proc#binding`可以获得代码块的闭包Binding对象

        # 例1
        def var_from_binding(&b)
          eval('var', b.binding)
        end
        var = 123
        var_from_binding {} #123

        # 例2
        class A
          def abc
            binding
          end

          private
          def xyz
            'xyz'
          end
        end

        eval "xyz",  A.new.abc # => "xyz"

总结:

* ruby 中有且只有三个作用域门 `def` `class` `module` 开启了全新的作用域, `lambda` 开启了一个扁平作用域(flattening)

* javascript中的function 开启的是扁平作用域

* javascript 中的闭包类似ruby中的binding

---

## 3. 原型链继承


    function Animal() {
      this.color = 'unknown';
    }

    Animal.prototype.say = function() { console.log('Im a animal with color ' + this.color); };
    Animal.prototype.eat = function() { console.log('eat food'); };

    function Duck() {
      this.color = 'yellow';
    }

    Duck.prototype = new Animal();      //继承
    Duck.prototype.constructor = Duck;  //对constructor进行修正

    Duck.prototype.eat = function() { console.log('eat fish'); };

    animal = new Animal();
    animal.say();   //Im a animal with color unknown
    animal.eat();   //eat food

    duck = new Duck();
    duck.say();     //Im a animal with color yellow
    duck.eat();     //eat fish



<img src="/assets/images/javascript_intro/prototype.png" />

类比ruby代码(不是完全等价):

    class Animal
      attr_accessor :color

      def initialize
        self.color = 'unknown'
      end

      def say
        puts "Im a animal with color #{self.color}"
      end

      def eat
        puts 'eat food'
      end

    end

    class Duck < Animal  #继承

      def initialize
        self.color = 'yellow'
      end

      def eat
        puts 'eat fish'
      end

    end

    animal = Animal.new
    animal.say   #Im a animal with color unknown
    animal.eat   #eat food

    duck = Duck.new;
    duck.say     #Im a animal with color yellow
    duck.eat     #eat fish

其他:

* javascript 中的每个function都有prototype属性
* 对function 的实例, 对prototype中的属性有读权限, 但是不能写(如果写的话, 会修改/添加自身属性)
* 在构造器function中的this表示该构造器新建的实例, 该this会被自动return
* 在构造器中, 对this增加的属性是普通属性, 可以读写(区别于prototype中的属性)
* 对象的方法`hasOwnProperty` 用于过滤原型链上的属性
