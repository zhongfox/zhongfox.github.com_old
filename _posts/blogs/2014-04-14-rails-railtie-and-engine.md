---
layout: post
categories: [blog, rails]
tags : [railtie, engine]
title: Rails Railtie 和 Rails Engine
---
{% include JB/setup %}

---

先看看官网介绍，有点感性认识：

Rails的主要组件 (Action Mailer, Action Controller, Action View and Active Record) 都是Railtie，各自负责自己的initialization，Railtie使得Rails不涉及组件的回调（？？），并运行组件代替Rails的默认配置

开发Rails的gem并不要求一定是Railtie，但是如果想在Rails启动时有所交互，那么需要使用Railtie，比如：

* 创建 initializers
* 进行Rails框架的配置，如generator
* 对环境添加`config.*`
* 订阅 `ActiveSupport::Notifications`
* 添加rake

---

* Railtie 是抽象类，把new方法定义为private：

        class << self
          private :new
        ...

  在Configurable 中通过`@instance ||= new` 生成唯一实例（私有方法只是不能显示调用，还是可以调用）

* inherited回调中记录了非抽象railtie

        ABSTRACT_RAILTIES = %w(Rails::Railtie Rails::Engine Rails::Application)

        def subclasses
          @subclasses ||= []
        end

        def inherited(base)
          unless base.abstract_railtie?
            base.send(:include, Railtie::Configurable)
            subclasses << base            #把直接子类存入subclasses，注意间接子类不在其中，如Rails::Application
          end
        end

---

### 创建Railte

        # lib/my_gem/railtie.rb
        module MyGem
          class Railtie < Rails::Railtie
          end
        end

        # lib/my_gem.rb
        require 'my_gem/railtie' if defined?(Rails) 需要在rails启动过程中加载


---

### Initializers

        class MyRailtie < Rails::Railtie
          initializer "my_railtie.configure_rails_initialization" do |app| #app是项目application实例
            app.middleware.use MyRailtie::Middleware
          end
        end

  * 源码分析

    Railtie 中混入了`include Initializable`  在Initializable中

          module Initializable
            def self.included(base) #:nodoc:
              #通过include只是给目标类加上了实例方法，如果还要加类方法，通用的做法就是在included回调中base.extend一个内部module
              base.extend ClassMethods
            end

    `initializer`正是在ClassMethods中定义, 所有Rails::Railtie 的子类都有了该类方法

    `initializer` 方法把Initializer的实例放在各自（Rails::Railtie的子类）的（类的）实例变量中

    `initializer` 可选参数 before after group

  * application 对initializers的调用：

    项目目录下`config/environment.rb`: `R4test::Application.initialize!` 其实并不存在这个类方法，参见<http://stackoverflow.com/questions/15387983/what-does-myappapplication-initialize-calling> 这里用method missing 代理到了R4test::Application 的instance上：

        def method_missing(*args, &block)
          instance.send(*args, &block)
        end

    lib/rails/application.rb  中的实例方法

        # Initialize the application passing the given group. By default, the
        # group is :default but sprockets precompilation passes group equals
        # to assets if initialize_on_precompile is false to avoid booting the
        # whole app.
        def initialize!(group=:default) #:nodoc:
          raise "Application has been already initialized." if @initialized
          run_initializers(group, self)
          @initialized = true
          self
        end

    Initializable 中的 实例方法 `run_initializers` 最后调用`initializers_chain` 获取ancestors 上的initializers 进行初始化

---

### Configuration

类方法`config` 是被所有railtie和application共享的配置对象

        #Rails::Railtie中的实例方法
        def config
          @config ||= Railtie::Configuration.new #存于singleton installce的实例变量
        end

共享的原理：

在类Configurable中`delegate :config, to: :instance` 也就是类方法config 是委托到installce上的，而installce在整个RailTie继承链上只有一个（singleton）：

        def instance
          @instance ||= new
        end

---

### Loading rake tasks and generators

* `rake_tasks` 此类方法用于加载railtie中的 rake

* `generators` rails会加载符合约定位置的generator，如果自定义的generator不在约定位置，可以用此类方法指定加载

---

### Engine

Engine 只是一个指定了一些initializers的railtie


#### 创建engine：

* `rails plugin new blorgh --full`

  * app 目录结构(完整的内部目录结构，但是没有具体文件)
  * config/routes.rb
  * lib/blorgh/engine.rb
  * test/dummy/ 测试项目

* `rails plugin new blorgh --mountable`

  `--mountable` 除了生成以上文件外，区别是：

  * app 目录结构中有骨架文件, `application_controller.rb` `application_helper.rb application.html.erb`等，而且都是有（engine name）module命名空间的
  * config/routes.rb 也有命名空间
  * lib/blorgh/engine.rb 有`isolate_namespace Blorgh` 声明
  * test/dummy/ 的routes.rb 挂载了此engine `mount Blorgh2::Engine => "/blorgh2"`


#### 关键文件

* ` blorgh.gemspec`  engine 可以按照gem方式加载 `gem 'blorgh', path: "vendor/engines/blorgh"`

  bundler 加载gem时会首先加载gem中 `lib/blorgh.rb`

  该文件中`require "blorgh/engine"` (lib/blorgh/engine.rb)

* `lib/blorgh/engine.rb`

        module Blorgh
          class Engine < Rails::Engine
            isolate_namespace Blorgh
          end
        end

  通过继承Rails::Engine， Rails会把engine的app 加到load path中去（TODO how）

  **solate_namespace**

  通过这个声明，engine的所有类都需要有命名空间，数据库表名称也有前缀，这样防止和主站命名冲突

  如在engine项目下运行`rails g model post` 创建的post将在` app/models/blorgh/` 下，数据库表名称为`blorgh_posts`

* app目录

* bin目录

  `bin/rails` 用于调用`rails g ...`

* test目录

  test/dummy 是一个缩减版的rails项目 用于测试

* config/routes.rb

        Blorgh::Engine.routes.draw do # Blorgh::Engine 将routes限制在engine内部
          resources :posts #内部路由无需带上命名空间, engine根路由将是blorgh/ 开始
          root to: "posts#index"  # http://localhost:3000/blorgh
        end

#### 运行engine

* 在engine下

  `rake db:migrate`  #这个会使用test/dummy项目下的数据库配置

* 在test/dummy

  `rails s`

  `rails c`

#### 挂载engine到Application

* 在application中 `gem 'blorgh', path: "/path/to/blorgh"` 然后bundle

* 在application routes里 `mount Blorgh::Engine, at: "/blog"` 在app的route中制定挂载engine

* 在application下 `rake blorgh:install:migrations` 复制（改名）engine中的migrate到application，多次执行该命令只会复制没有复制过的

* 上一步只是复制了migration文件, 还需要在application下执行`run rake db:migrate` 

  还可以指定只执行一个engine的migration `rake db:migrate SCOPE=blorgh`

#### Engine 也可以使用 Application的model

engine可以和Application有关联关系，关联类在engine中可能有不同的叫法

如在engine中`belongs_to :author, class_name: "User"`

#### Engine 也可以使用 Application的Controller

        class Blorgh::ApplicationController < ApplicationController #因为常量查找缘故，这里的ApplicationController将是主app的controller
        end

#### 配置engine

* 初始化文件放在 `config/initializers/`

* 本地化文件放在 `config/locales`

#### view

application查找view，会先从`app/views` 开始，如果找不到，会查找各个engine

#### routes

`<%= link_to "Blog posts", posts_path %>`  如果在engine和application里各种调用的话，会调用各自的路由

`<%= link_to "Blog posts", blorgh.posts_path %>` 指定是engine的路由

`<%= link_to "Home", main_app.root_path %>` 指定是主站的路由


### Engine 和 Plugin

Engines are also closely related to plugins. The two share a common lib directory structure, and are both generated using the rails plugin new generator. The difference is that an engine is considered a "full plugin" by Rails (as indicated by the --full option that's passed to the generator command). This guide will refer to them simply as "engines" throughout. An engine can be a plugin, and a plugin can be an engine

### 其他

1. 实例方法 app, 返回最底层的被装饰者

        # Returns the underlying rack application for this engine.
        def app
          @app ||= begin
            #这句话把config.middleware变成了Rails::Configuration::MiddlewareStackProxy 变成了ActionDispatch::MiddlewareStack
            config.middleware = config.middleware.merge_into(default_middleware_stack)
            config.middleware.build(endpoint) # TODO
          end
        end

---

### 参考资料

* <http://wangjohn.github.io/railties/rails/gsoc/2013/07/10/introduction-to-railties.html>

* <http://api.rubyonrails.org/classes/Rails/Railtie.html>

