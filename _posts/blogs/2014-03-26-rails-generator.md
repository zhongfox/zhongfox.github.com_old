---
layout: post
categories: [blog, rails]
tags : [rails, rails guides, generator]
title: Rails associations
---
{% include JB/setup %}

* 调用generator时，generator中的所有public方法将会按照定义顺序依次执行

* `rails generate 生成器名称 --help`

  * `desc` 方法：指定Description
  * 另一种修改Description 是在生成器同级添加文件`USAGE`


* Rails提供了生成generator的generator `rails generate generator #{g_name}` g_name可以加上斜线作为目录命名空间

  * 默认在`lib/generators/#{g_name}/` 下生成`#{g_name}_generator.rb` `USAGE` `templates/(有的版本不创建)`
  * 新建的generator继承`Rails::Generators::NamedBase` 表示使用该generator需要传一个name， 该name在generator中由方法 `file_name`获得

* 使用generator时，查找路径顺序，相对于 $LOAD_PATH, rails项目下的lib属于其中，每个gem下的lib也属于：

        rails/generators/initializer/#{g_name}_generator.rb
        generators/initializer/#{g_name}_generator.rb
        rails/generators/#{g_name}_generator.rb
        generators/#{g_name}_generator.rb

* 可以在` config/application.rb`中对`config.generators`进行generator

        g.orm             :active_record
        g.template_engine :erb
        g.test_framework  :test_unit, fixture: true

  其他可以定义举例：

  * `g.stylesheets false` 去掉样式
  * `g.test_framework  :test_unit, fixture: false` 测试去掉创建固件

* 在generator中调用其他generator`hook_for other_generator_name`

* generator获得模板除了会查找source root外，还会查找`lib/templates` (查找顺序？)



---

### 方法

* `source_root` 指定generator的source目录，目录中放置和该generator相关的模板， 如`copy_file(source, to)`的source文件将相对于此目录

* `file_name` 单数 小写

* `class_name` 首字母大写 单数

* `plural_name` 复数 首字母小写





### 参考资料

* Creating and Customizing Rails Generators & Templates <http://guides.rubyonrails.org/association_basics.html>
