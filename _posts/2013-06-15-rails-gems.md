---
layout: post
category : rails
tags : [rails, gem, rails_config, jbuilder, nifty-generators]
title: Rails 项目常用的gem使用汇总
---
{% include JB/setup %}

###rails_config

<https://github.com/railsjedi/rails_config>

1. `gem "rails_config"`

2. 运行`rails g rails_config:install`, 以生成以下文件，并自动修改.gitignore文件

        create  config/initializers/rails_config.rb
        create  config/settings.yml
        create  config/settings.local.yml
        create  config/settings
        create  config/settings/development.yml
        create  config/settings/production.yml
        create  config/settings/test.yml
        append  .gitignore

   `config/initializers/rails_config.rb`中设定了：`config.const_name = "Settings"`

3. 读取配置：

        Settings.my_config_entry
        Settings.my_section.some_entry
        Settings[:my_section][:some_entry]

4. 执行顺序如下，下面的会覆盖上面的：

        config/settings.yml
        config/settings/#{environment}.yml
        config/environments/#{environment}.yml

        config/settings.local.yml
        config/settings/#{environment}.local.yml
        config/environments/#{environment}.local.yml

5. 其他：

   * 在运行时加载其他yml配置文件

   * 在yml中用erb执行ruby

----

###Jbuilder

<https://github.com/rails/jbuilder>

<http://www.rdoc.info/github/rails/jbuilder/Jbuilder>

好处：

1. DSL

2. 适合处理循环生成或者复杂逻辑生成的json

3. 在view中使用: 便于使用helper和缓存, view的模块以 `.json.jbuilder` 结尾，在view中已经有了`json`对象可供使用

4. 在modle中使用：`Jbuilder.new do |modle| ..modle is self... end`, 该Jbuilder对象可相互嵌套以生成复杂的json。 最后对结果进行`target!`已生成json字符串(这个在console测试有问题，估计和全局的self相关，待调研)

使用：

1. `gem 'jbuilder'`

2. 构建json外层结构（object， array， null）

   * **object**  `Jbuilder.encode do |json| ... end` 使用内部代码构建一个json字符串, 代码块中构建json内容 这会构建一个js对象{...}

   * **array** 如果想返回的是array，需在上面block中对Jbuilder实例`json`进行：`json.array!(collection) do ... end` 代码块中构建数组元素

     `json.array! ruby_collection, :key_symbol_1, :key_symbol_2` 通过遍历ruby_collection生成array，array的item是含有key_symbol键值对的对象。

   * **null** `json.null!` 或者 `json.nil!` 返回 "null" 字符串

3. 构建json内部键值对

   * `json.key value` 将生成键值对 `"key": value`， 使用 `json.key do ... end` 生成嵌套键值对

   * `json.set! key_var, value` 通过变量动态指定key

   * `json.(ruby_object, :key_symbol_1, :key_symbol_2 ...)` 将生成若干键值对，value将是在ruby_object上调用key方法

     等同于 `json.extract! ruby_object, *attributes`

   * `json.key ruby_collection, :key_symbol_1, :key_symbol_2 ...` 生成一个键值对，值是array，array中的item是object，通过遍历ruby_collection获得键值对。

   * `json.key ruby_collection do ... end` 类上条，但通过block构建数组中item

4. 对键的格式的声明

   将下划线分隔的key转化成camel格式的key： `json.key_format! :camelize => :lower`

   或者在配置的定义：`Jbuilder.key_format :camelize => :lower`

----

###nifty-generators

<https://github.com/ryanb/nifty-generators>

1. `gem "nifty-generators", :group => :development`

2. `rails generate nifty:layout [layout_name] [options]` 

   如果不传name将是application

   会生成：

   * layout

   * css

   * app/helpers/layout_helper.rb

   * app/helpers/error_messages_helper.rb 

3. `rails generate nifty:scaffold ModelName [controller_actions and model:attributes] [options]`

   ModelName可以是 CamelCased 或 under_scored

   --namespace-model **Admin::User生成的Model将始终是顶级model admin/user的model是有namespace的**

   --rspec 如果要用rspect框架必须手工指定

   如果没有 actions ， 默认将是index, show, new, create, edit, update, destroy

   如果没有 attributes，model 不会生成, 将会依据现有模型推测attributes

   使用 "!" 排除其他action

4. `rails generate nifty:config [config_name] [options]`

5. `rails generate nifty:authentication [user_name] [sessions_controller_name] [options]` 有问题

----

### rack-mini-profiler

<https://github.com/kevinpang/rack-mini_profiler>

1. `gem 'rack-mini-profiler'`

2. profile指定的代码：

        Rack::MiniProfiler.step("fetch projects") do
          @projects.all
        end

3. 在开发环境，因为一些延迟加载，profile结果不太稳定，可以在生产环境进行测试，默认生产环境profile不会开启，可通过在controller中添加before_filter实现

        before_filter :miniprofiler

        private

        def miniprofiler
          Rack::MiniProfiler.authorize_request # if user.admin?
        end

4. mini-profiler 能按照重定向的顺序列出各自的profile，顺序是从下往上

5. `pp=help` 查看可传递的若干参数帮助

### better_errors binding_of_caller

<https://github.com/charliesome/better_errors>

<https://github.com/banister/binding_of_caller>

1. 通常只需要在develop环境引入

        group :development do
          gem 'better_errors'
          gem 'binding_of_caller'
        end

2. better_errors 展示错误前后的代码，实现快速定位bug，并可以帮助查看rails调用栈

3. binding_of_caller 保留错误代码处的执行环境，可通过交互式命令行调试

### 去掉请求assets的日志：`gem 'quiet_assets', group: :development`
