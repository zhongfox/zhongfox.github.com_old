---
layout: post
category : rails
tags : [rails]
title: Rails 杂记
---
{% include JB/setup %}

* includes preload eager_load 区别

  includes：Rails会选择使用 LEFT OUTER JOIN 还是独立sql查询被关联对象

  preload：一定是使用独立sql查询

  eager_load： 一定是使用 LEFT OUTER JOIN 

  使用 LEFT OUTER JOIN 策略时，可能会有若干问题，如被关联对象的default_scope 里的order没法应用。

  <http://stackoverflow.com/questions/11946311/whats-the-difference-between-includes-and-preload-in-an-activerecord-query>


