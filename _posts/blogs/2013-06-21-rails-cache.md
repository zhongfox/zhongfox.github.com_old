---
layout: post
categories: [blog, rails]
tags : [rails, rails guides, cache]
title: Rails 缓存
---
{% include JB/setup %}

### 配置

* 开启rails缓存：`config.action_controller.perform_caching=true` 这个默认在production是开启，在development和test是关闭的。

  该配置影响所有缓存


###页面缓存

页面缓存始终是用文件系统，原理：

0. 在controller中 `caches_page :index`

1. 在第一次访问该action时，在after filter中，生成一个静态页面，忽略参数

2. 页面缓存机制会自动添加 .html 后缀名到请求的没有后缀的页面，以使 webserver 更加容易的查找到这些页面。可以通过修改配置选项 `config.action_controller.page_cache_extension` 来改变。

3. 放置于webserver指向的root目录, 后续请求webserver直接读取root里的文件，不再进入rails

4. 清除页面缓存 `expire_page :action => :index`

###Action 缓存

和页面缓存类似，区别：

1. 后续请求，action缓存会进入rails，执行before filter, 存储介质由`config.cache_store`决定

2. `cache_path`,  默认使用的存储路径是'views/访问路径'

   使用 `caches_action :index[, cache_path: some_path]` 时，可以传递一个`cache_path`修改存储时的"访问路径"，some_path如果是symbol的话代表调用该方法。

3. 使失效： `expire_action :action => :index`

###Fragment 缓存

在view中使用 `<% cache(:action => 'recent', :action_suffix => 'all_products') do %>`将会生成如下键的缓存：

    views/#{host.com}/admin/#{controller}/recent?action_suffix=all_products

或者使用全局的片段缓存`<% cache('all_available_products') do %>`, 将存储于

    views/all_available_products

使过期： `expire_fragment(:controller => #{controller}, :action => 'recent', :action_suffix => 'all_products')`

###Sweepers

TODO

###SQL Caching

* 缓存了每一个数据库查询的结果于内存

* 只持续在当前action，包括view

* 如果缓存命中，可以在控制台看到`CACHE (0.0ms) select ... `

##Cache Stores

* 缓存介质：`config.cache_store`

  使用dalli客户端的memcache缓存：

    :dalli_store, Memcache::Config.servers, { namespace: 'shezhao:rails', expires_in: 1.day, compress: true }


  该配置影响: action缓存，Fragment 缓存，对象缓存，但不影响页面缓存


### memcached telnet

* 需要安装telnet： yum install telnet

* `telnet 127.0.0.1 11211 `

* 参考命令 <http://chembo.iteye.com/blog/1255284>

* 退出： Ctrl + ] quit

### 参考资料
* Caching with Rails: An overview <http://guides.rubyonrails.org/caching_with_rails.html>
