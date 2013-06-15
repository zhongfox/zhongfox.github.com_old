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

  * Rails 相关命令行

  * View Helpers

  * Rails Console

  * Rake

  * Rails Server 和 Log

----

## 检视对象

### 在 View 中检视对象

  * `debug(ruby_object)` hepler方法，使用YAML格式展示ruby对象

  * `ruby_object.to_yaml` 功能基本同上

  * `ruby_object.inspect` ruby对象的方法，对hash和array和AD对象特别有用


### 日志 Logger 

1. Rails Logger

   Rails 使用ruby标准的logger来记录信息。

   默认的Rails.logger指向的是 Rails.root/log/environment_name.log

   在Rails中指定其他logger：

   在某个environment.rb中 Rails.logger = Logger.new(STDOUT)

   在Initializer部分：config.logger = Logger.new(STDOUT)


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

   **确保使用了合理的日志级别，这样可以避免在生产日志中添加大量的无用的琐碎信息。**


### 参考资料
* Debugging Rails Applications <http://guides.rubyonrails.org/debugging_rails_applications.html>
