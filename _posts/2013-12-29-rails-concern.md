---
layout: post
category : rails
tags : [rails, concern, ruby, extended, included, append_features]
title: Rails Concern
---
{% include JB/setup %}

* 先学习几个ruby中Module的**实例方法**：

  * `extended(base)`

    当`other_module.extend this_module` 时，触发回调`this_module.extended`, base 将是other_module

    注意该方法应该定义成this_module的单键方法

  * `included(base)`

    当`other_module.include this_module` 时，触发回调`this_module.included`, base 将是other_module

    注意该方法应该定义成this_module的单键方法

  * `append_features(base)`

    和included很类似，也是被include时的回调

    区别：

    append_features首先被调用，在append_features中实现了include的作用(扩展other_module的实例方法)，然后included才被触发

    这个例子非常清楚 <https://gist.github.com/paneq/3273049>

    还有这里 <http://ruby-china.org/topics/5835>

  * `const_defined?(sym, inherit=true) → true or false`

    查找module中是否定义了该常量，如果inherit是true，还会检查ancestors

  * `const_get(sym, inherit=true) → obj`

    sym是常量名的symbol(或者字符串)，返回module命名空间下的该常量的值，如果不存在则抛出NameError

    这个主要作用是当module是一个变量时，没法使用`SomeMoule::A`这种形式，只能用这种形式：

    `module_var.const_get("ClassMethods") if module_var.const_defined?("ClassMethods")`

---

在module中`extend ActiveSupport::Concern` 使之成为Concern

Rails Concern 主要是实现2个目的：

1. 优雅地实现分离**扩展类方法定义** **扩展类宏的使用** **扩展实例方法定义**

   * **扩展类方法定义** 将扩展类方法定义到Module`ClassMethods`中

   * **扩展类宏的使用** 将类宏使用(如scope)放在included {....}的block中，ruby正常情况在included中用class_eval 实现

   * **扩展实例方法定义** 直接放在module中定义

2. 想解决模块间的依赖关系：

   直接复制官网的例子(加上注释)：

            module Foo
              def self.included(base)
                base.class_eval do
                  def self.method_injected_by_foo
                    ...
                  end
                end
              end
            end

            module Bar
              def self.included(base)
                #关键是Bar对Host的扩展时，要求Host先扩展Foo，但是其实这个要求是Bar提出的，Host不应该知情
                base.method_injected_by_foo
              end
            end

            class Host
              include Foo # We need to include this dependency for Bar
              include Bar # Bar is the module that Host really needs
            end

           如果只是在Bar中扩展Foo是无法实现的，因为Foo中的base问题：

          module Bar
            include Foo #Foo中base会是Bar，而不是期望的Host
            def self.included(base)
              base.method_injected_by_foo
            end
          end

          class Host
            include Bar
          end

          使用Concern解决

          require 'active_support/concern'

          module Foo
            extend ActiveSupport::Concern    #步骤1
            included do                      #步骤2
              def self.method_injected_by_foo
                ...
              end
            end
          end

          module Bar
            extend ActiveSupport::Concern    #步骤1
            include Foo                      #步骤3

            included do                      #步骤2
              self.method_injected_by_foo
            end
          end

          class Host
            include Bar # works, Bar takes care now of its dependencies #步骤4
          end

---

源码分析

          1   module Concern
          2     def self.extended(base) #:nodoc:
          3       base.instance_variable_set("@_dependencies", [])
          4     end
          5
          6     def append_features(base)
          7       if base.instance_variable_defined?("@_dependencies")
          8         base.instance_variable_get("@_dependencies") << self
          9         return false
         10       else
         11         return false if base < self
         12         @_dependencies.each { |dep| base.send(:include, dep) }
         13         super
         14         base.extend const_get("ClassMethods") if const_defined?("ClassMethods")
         15         base.class_eval(&@_included_block) if instance_variable_defined?("@_included_block")
         16       end
         17     end
         18
         19     def included(base = nil, &block)
         20       if base.nil?
         21         @_included_block = block
         22       else
         23         super
         24       end
         25     end
         26   end

对应着上面Foo Bar Host 的例子中4个步骤：

1. 步骤1：`Foo/Bar extend ActiveSupport::Concern` 

   将设置Foo/Bar的实例变量@_dependencies=[] **line 3**

   这步很简单，可以理解为用一个实例变量，以标识改module为Concern, 并在之后存放依赖

   并且用ActiveSupport::Concern 中的 append_features 和 included覆盖了父类Module中继承的同名方法，以在之后进行干预

2. 步骤2：`Foo/Bar module中included {...调用类宏...}`

   将设置Foo/Bar的实例变量@_included_block为block **line21**

   这一步也很简单，只是把block存放起来延迟执行

3. 步骤3：`Bar include Foo`

   此时将依次调用Foo.append_features 和Foo.included（从步骤1中继承来的）

   实现把Foo存到Bar的@\_dependencies中 **line8**（延迟使用，延迟给Host使用） ，但是没有去调用父类的append\_features，所以Bar并没有被扩展什么方法

   应该还走了**line23**

4. 步骤4 `Host include Bar`

   此时将依次调用Bar.append_features 和Bar.included（从步骤1中继承来的）

   实现遍历@\_dependencies（从步骤3中得到的），并依次进行Host include @\_dependencies, 实现**扩展类宏的使用**. 这样实现了我们想要的Host去扩展Foo **line12**

   然后调用Module#append_features, 实现 **扩展实例方法定义** **line 13**

   最后**line 14 15** 实现了**扩展类方法定义**

