---
layout: post
category : javascript
tags : [javascript, jquery]
title: jquery 笔记
---
{% include JB/setup %}

几年前做前端开发主要用的jQuery版本还是1.4，现在jQuery版本都到了2.0+了，最近打算系统学习一下

* load(url,[data],[function(response,status,xhr)])

  用于ajax加载页面片段，非常方便

  它几乎与 $.get(url, data, success) 等价，不同的是它不是全局函数，并且它拥有隐式的回调函数。当侦测到成功的响应时（比如，当 textStatus 为 "success" 或 "notmodified" 时），.load() 将匹配元素的 HTML 内容设置为返回的数据。这意味着该方法的大多数使用会非常简单

  即使不传递data，也可以传递回调函数

  先调用默认回调(处理返回)，然后执行附加的回调

  如果data不传，或者是字符串，将是get，如果是对象，将是post

* $.get(URL,callback)

* $.post(URL,data,callback)

* $.noConflict()
  
  会释放会 $ 标识符的控制, 仍然可以通过全名替代简写的方式来使用 jQuery

* 
