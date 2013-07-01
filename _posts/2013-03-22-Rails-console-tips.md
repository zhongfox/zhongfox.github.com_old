---
layout: post
category : Rails
title: Rails 控制台技巧
tags : [rails, console]
---
{% include JB/setup %}

在进行Rails开发的时候，我一般都会开一个console，方便调试，掌握一些实用的console技巧往往使开发调试非常方便。

Rails Console 是加载了rails环境的irb，使用console我们可以快速的进行：

* 代码测试

* 对象检视

* 生成测试数据

----

### 常用技巧


  1. 调用routes的helper：
  
        app.deal_path(Deal.last) => /ju_deal/lvchayanbu_19912

  2. ActionView::Base实例helper来使用基本的helper方法：
  
        helper.link_to "Home", app.root_path => "<a href=\"/\">Home</a>"

  3. 发起请求： `app.get(path, parameters = nil, headers = nil)`, 同理可使用post, put等
     
        app.get('/ju_deal/lvchayanbu_19912') => 200 # 这个会 方法会render view，此时使用 app.response.body 查看生成的view

  4. 查找方法：
  
        app.method(:get).source_location =>

        ["/home/Zhong/.rvm/gems/ruby-1.9.3-p125/gems/actionpack-3.2.11/lib/action_dispatch/testing/integration.rb", 32]

  5. `reload!` 当修改了`autoload_paths`中的class，通过该方法重新对其加载

  6. 在执行语句后面加分号，可去掉console执行回显

  7. 使用方法`y`以yaml输出展示对象，对于输出大容量的ActiveRecord对象比较有用

  8. 方法 `_` 返回上次表达式执行的结果

  9. Rails.application.config 返回 Rails::Application::Configuration 对象, 可用于检视当前环境的配置

  10. Console清屏 `Ctrl+L`

----

### 关于app

  app(create=false) 代表一个session [ActionDispatch::Integration::Session](http://api.rubyonrails.org/classes/ActionDispatch/Integration/Session.html)

  app本质是调用session() 创建一个ActionDispatch::Integration::Session， 如果传入true为参数，将新建一个session。

----

### 参考资料

[Three quick Rails console tips](http://37signals.com/svn/posts/3176-three-quick-rails-console-tips)

