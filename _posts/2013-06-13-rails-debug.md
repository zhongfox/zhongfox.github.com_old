---
layout: post
category : rails
tags : [rails, rails guides, debug]
title: Rails 调试
---
{% include JB/setup %}

### 为什么要总结常用的调试技巧

  1. 使开发更加顺畅、高效

  2. 快速定位bug，减少出错时候纠结的时间

  3. 总结和学习开发调试技巧需要花些时间，但是从长远来说是值得的。

----

### 有哪些方面的技巧可以帮助我们开发和调试?

  * stack trace

  * logger

  * Rails Console

  * 检视对象技巧

----

### 异常调用栈 stack trace

  * 当程序产生异常，Rails默认会在development环境中展示调用栈，而在production中不展示(展示500页面)，该行为是通过以下配置决定：

        config.consider_all_requests_local  # 默认在development是true，在production是false

  * 其他优化展示调用栈的gem:

    [better_errors](https://github.com/charliesome/better_errors) 展示错误前后的代码，实现快速定位bug，并可以帮助查看rails调用栈

    [binding_of_caller](https://github.com/banister/binding_of_caller) 保留错误代码处的执行环境，可通过交互式命令行调试

    [debugger](http://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debugger-gem) 提供交互式命令行方式进行断点调试

----

### 日志 Logger

1. Rails Logger

   默认的Rails.logger指向的是 {Rails.root/log}/{environment_name}.log,也会输出到终端

   在Rails中指定其他logger：

   在某个environment.rb中 Rails.logger = Logger.new(STDOUT) #这个配置将导致日志只输出到终端，不会记录到{environment_name}.log

   在Initializer部分：config.logger = Logger.new(STDOUT)

   可以使用gem`quiet_assets`去掉请求assets的日志：`gem 'quiet_assets', group: :development`


2. ActiveRecord Logger

   使用： ActiveRecord类或者对象上调用，如 User.logger.error('some info') 或者  user.logger.error('some info')

   默认的Rails.logger指向的是 Rails.root/log/environment_name.log, 也会输出到server终端(至少WEBrick 是这样)

   可以在配置中指定：`config.active_record.logger=Logger.new(somefile)`

   设置为nil的话可以禁用该日志

3. Log Levels

   每个日志输出的方法都对应一个等级，只有当该方法的等级大于等于**配置日志等级**时，日志才会成功输出。

   可用的日志等级符号和对应的数字表示：

        :debug | :info | :warn | :error | :fatal
          0    |   1   |   2   |   3    |   4

   production模式默认的日志等级是 info， development和test模式默认是debug

   修改日志等级：

        config.log_level = :warn # In any environment initializer, or
        Rails.logger.level = 0 # at any time

4. 使用日志： logger.(debug|info|warn|error|fatal)

   * `logger`方法在controller和view中可见，在其他地方可使用`Rails.logger`

   * **确保使用了合理的日志级别，这样可以避免在生产日志中添加大量的无用的琐碎信息。**

5. 自定义logger：

            my_logger = Logger.new("#{Rails.root}/tmp/my_logger.txt")
            my_logger.level #=> 0 默认日志级别是0 debug
            my_logger.debug('this is my log info')

----

### Rails Console

请见[Rails 控制台技巧](/Rails/2013/03/22/Rails-console-tips/)

----

### 检视对象

#### 1.在 View 中检视对象

  * `debug(ruby_object)` hepler方法，使用YAML格式展示ruby对象

  * `ruby_object.to_yaml` 功能基本同上

  * `ruby_object.inspect` ruby对象的方法，对hash和array和AD对象特别有用


#### 2.ruby 检视方法内省

ruby元编程有很强大的内省机制，可以帮助我们检视对象：

**对于ruby对象**

传递false给xxx_methods方法，将排除继承来的方法

1. `methods`

   快速得知对象上是不是有某些方法：`o.methods.include? :some_method`  或者 `o.methods.grep /some_method/`

2. `public_methods`

3. `protected_methods`

4. `private_methods`

5. `singleton_methods` 单键方法

6. `instance_variables` 返回该对象拥有的实例变量

7. `respond_to?` 查询对象是否可调用指定的方法，要注意只有public方法才返回true，protected或private方法返回false。

**对于类或者模块**

传递false给xxx_methods方法，将排除继承来的方法

1. `instance_methods` 获得非private实例方法

2. `public_instance_methods` 获得public实例方法

3. `protected_instance_methods` 获得protected实例方法

4. `private_instance_methods` 获得private实例方法

5. `class_variables` 返回类拥有的类变量


**变量检视**

1. `local_variables` 局部变量

2. `global_variables` 全局变量

----

### 参考资料

* Debugging Rails Applications <http://guides.rubyonrails.org/debugging_rails_applications.html>

* 檢視物件 <http://openhome.cc/Gossip/Ruby/Introspection.html>
