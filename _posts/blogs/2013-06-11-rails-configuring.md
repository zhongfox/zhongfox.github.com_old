---
layout: post
categories: [blog, rails]
tags : [rails, rails guides, config]
title: Rails 常见配置
---
{% include JB/setup %}


## 配置相关加载顺序

* 在rails加载前如需执行

  将代码加载 `require 'rails/all'(config/application.rb)` 之前

* config/application.rb

* config/environments/环境名.rb

      # rails 定义的
      initializer :load_environment_config, before: :load_environment_hook, group: :all do
        paths["config/environments"].existent.each do |environment|
          require environment
        end
      end

* Initializers

  按照文件字母顺序加载

* After-initializers

* `config.after_initialize { }` 自定义

---

* `Rails::Railtie` 及其子类都有`config` 方法

---

## 加载相关

* `config.autoload_paths`

  接受一个数组，当需找未加载的变量时，去这些数组里的路径寻找. Default is all directories under app

  production模式同样会有autoload机制, 默认情况production的`eager_load_paths` 只包括app下所有目录, 因此如果常量不存在, production会去尝试`autoload_paths` 减去 `eager_load_paths`剩下的目录autoload

* `config.autoload_once_paths`

  接受一个数组, 必须在`config.autoload_paths`里, 也会被autoload, 但只加载一次, 不会被`reload!` 擦除或重新加载


* `config.cache_classes`

  ~~决定是否对class和module进行缓存~~

  development默认不缓存(false): 在每次请求时清除autoload的常量
  test和production模式默认开启缓存(true): 没有清除动作

* `config.action_view.cache_template_loading`

  决定view是否在每次请求时重新加载, 默认值同由`config.cache_classes`决定

* `config.dependency_loading`

  是否支持autoload缺失常量的开关, 此开关起效的前提是`config.cache_classes` 为true

  此开关在development 和 production 环境都是 true

* `config.eager_load`  rails 4有效, TODO

* `config.eager_load_namespaces`  rails 4有效, TODO

* `config.eager_load_paths`

  接受一个路径数组。 如果有开启类缓存(`config.cache_classes`), 那么 Rails 会在启动时即时加载(eager load)这些路径里的所有的内容. 默认是应用程序 app 目录下的所有目录

  在默认不开启类缓存的develop没啥用

* `config.file_watcher`

* `config.reload_classes_only_on_change`

  只有在`config.cache_classes` 为true才有效, development, production 默认都是true

  其实还是影响移除常量

  true: 只移除那些文件改变的常量, 因此每次请求都会重新加载那些文件改变了且用到的常量所在的文件

  false: 移除所有常量, 因此每次请求都会重新加载用到的常量所在的文件

---

## 日志相关

* `config.filter_parameters`

  日志中参数过滤, 默认[:password]

  rails 4 期望把新加的此配置放到文件`config/initializers/filter_parameter_logging.rb`

* `config.colorize_logging`

* `config.log_tags`  rails logger 前缀如 [:uuid, :remote_ip]

* `config.log_formatter`

* `config.log_level`

* `config.log_tags`

* `config.logger`

---

## 时间相关

* `config.beginning_of_week`

*

---

## 异常相关

* `config.exceptions_app`

* `config.consider_all_requests_local`

  bool值, 如果true的话, 将把错误信息返回给http.

  development 默认 true, production 默认false

  更细粒度的控制方案: set this to false and implement local_request? in controllers to specify which requests should provide debugging information on errors.

---

### 其他

* `config.encoding`

* `config.force_ssl`

* `config.middleware`

* `config.cache_store`

  选项: `:memory_store, :file_store, :mem_cache_store, :null_store`

* `config.console` 配置使用其他console

* `config.active_record.record_timestamps` 控制是否自动维护字段` created_at/created_on updated_at/updated_on.`


