---
layout: post
category : ruby
title: Ruby 常量查找
tags : [ruby, OOP, constant]
---
{% include JB/setup %}


Ruby 常量查找并不是简单的从继承链继承，总的来说，常量查找根据以下三个规则来：

1. 查找当前环境的 `Module.nesting`, 这会是一个模块（类也是模块）的数组。

2. 如果 #1 找不到，且 `Module.nesting.first` 是一个类，那么查找 `Module.nesting.first.ancestors`

3. 如果 #1 和 #2 都找不到， 那么查找`Object.ancestors`

虽然规则很简单明了，但是还是有很多需要说的：

1. 前缀式的模块嵌套，并不会计入`Module.nesting`里， 比如：

        module A;
          B = 10;
        end

        module A::C
          puts Module.nesting # [A::C]
          puts B              # uninitialized constant A::C::B
        end

    如果把换成一下格式就OK了

        module A;
          B = 10;
        end

        module A
          module C
            puts Module.nesting # [A::C, A]
            puts B              # 10
          end
        end

2.  关于规则2，一个常见的错误是认为，在ancestors里查找是从self.class开始， 正确的是从`Module.nesting.first.ancestors.first`开始：

        class A
          def get_c; 
            puts self                                 #b 
            puts self.class                           #B
            puts Module.nesting.first.ancestors.first #A
            puts C;                                   #uninitialized constant A::C
          end
        end

        class B < A
          C = 10
        end

        b = B.new
        b.get_c

    这个例子说明`puts C` 是查找的`A::C`(Module.nesting.first.ancestors.first) 而不是`B::C`(self.class)

3. 在顶层 Module.nesting 为空，顶层的常量定义和查找是在Object里

4. class_eval, module_eval, instance_eval, define_method 不会改变Module.nesting， 也就不会改变常量查找

5. 在本体类里查找常量，并不会查到这个原类的继承链，因为本体类的继承链是从Clss开始的：

        class A
          B = 10
        end

        class C < A

          class << C
            puts ancestors # [Class, Module, Object, Kernel, BasicObject]
            puts B         # uninitialized constant Class::B
          end
        end

    这是一个很常见的错误，以为puts B 应该输出A::B


## 参考资料
[Everything you ever wanted to know about constant lookup in Ruby](http://cirw.in/blog/constant-lookup)
