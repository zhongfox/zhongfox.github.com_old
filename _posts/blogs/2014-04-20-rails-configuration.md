---
layout: post
categories: [blog, rails]
tags : [configuration]
title: rails 中的Configuration
---
{% include JB/setup %}

---

* Configuration 继承链

        Rails::Application::Configuration.ancestors
        => [Rails::Application::Configuration, Rails::Engine::Configuration, Rails::Railtie::Configuration, Object, PP::ObjectMixin, ActiveSupport::Dependencies::Loadable, JSON::Ext::Generator::GeneratorMethods::Object, Kernel, BasicObject]


* 类Rails::Application中的config定义（实例方法）

        def config #:nodoc:
          @config ||= Application::Configuration.new(find_root_with_flag("config.ru", Dir.pwd))
        end

* Rails::Engine的config定义（实例方法）

        delegate :middleware, :root, :paths, to: :config
        ......
        def config
          @config ||= Engine::Configuration.new(find_root_with_flag("lib"))
        end

* Rails::Railtie的config定义（实例方法）

        def config
          @config ||= Railtie::Configuration.new
        end
