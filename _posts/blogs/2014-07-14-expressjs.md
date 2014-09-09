---
layout: post
categories: [blog, javascript]
tags : [nodejs expressjs]
title: expressjs
---
{% include JB/setup %}

---

* ejs view中只能引用`app.locals`的属性, 同样不能引用app
* res.render(view, [locals], callback) app.render(view, [options], callback)
* app.settings

      { 'x-powered-by': true,
        etag: true,
        env: 'development',
        'subdomain offset': 2,
        view: [Function: View],
        views: '/home/zhonghua/code/work/zxx800_node/views',
        'jsonp callback name': 'callback' }

* 对app.settings 直接写, 可影响app.get

* res.render(view, [locals], callback) When an error occurs next(err) is invoked internally
