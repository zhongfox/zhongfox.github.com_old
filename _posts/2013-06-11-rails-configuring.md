---
layout: post
category : rails
tags : [rails, config]
title: Rails 常见配置
---
{% include JB/setup %}

* `config.cache_classes` 决定是否对class和module进行缓存。development默认不缓存(false)，在每次请求时重新加载**该请求用到的且被修改过的**class和module, test和production模式默认开启缓存(true)。 Can also be enabled with threadsafe!.

* `config.eager_load_paths` 接受一个路径数组。 如果有**开启类缓存**(在默认不开启类缓存的develop没啥用)，那么 Rails 会在启动时即时加载(eager load)这些路径里的所有的内容. 默认是应用程序 app 目录下的所有目录

* `config.autoload_paths` 接受一个数组，当需找未加载的变量时，去这些数组里的路径寻找. Default is all directories under app

lib修改后重新加载与否与什么有关？
