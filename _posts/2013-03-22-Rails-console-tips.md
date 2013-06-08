---
layout: post
category : Rails
title: Rails 控制台技巧
tags : [rails, console]
---
{% include JB/setup %}

在进行Rails开发的时候，我一般都会开一个console，方便调试，掌握一些实用的console技巧往往使开发调试非常方便。


## 控制台公共实例方法
  * app(create=false) 代表一个session [ActionDispatch::Integration::Session](http://api.rubyonrails.org/classes/ActionDispatch/Integration/Session.html)
  * controller()
  * helper()
  * new_session() 创建一个新session
  * reload!(print=true)


## 关于 app
  app本质是调用session() 创建一个ActionDispatch::Integration::Session， 如果传入true为参数，将新建一个session。

  1. 调用routes的helper： `app.deal_path(Deal.last) => /ju_deal/lvchayanbu_19912`

  2. 发起请求：使用app的方法`get(path, parameters = nil, headers = nil)`
     
     `app.get('/ju_deal/lvchayanbu_19912') => 200`, 这个会 方法会render view，此时使用`app.response.body` 查看生成的view

  3. 使用helper：`helper.link_to "Home", app.root_path => "<a href=\"/\">Home</a>" `

  4. 查找方法：`app.method(:get).source_location =>`

     `["/home/Zhong/.rvm/gems/ruby-1.9.3-p125/gems/actionpack-3.2.11/lib/action_dispatch/testing/integration.rb", 32] `

## 其他

  * Rails.application.config 返回 Rails::Application::Configuration 对象。

  * Rails.root 返回当前项目的根目录

## 参考资料
[Three quick Rails console tips](http://37signals.com/svn/posts/3176-three-quick-rails-console-tips)

