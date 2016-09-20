---
layout: post
categories: [blog, javascript]
tags : [cache, http]
title: 浏览器缓存
---
{% include JB/setup %}

---

本笔记是公司同事Tom Wang的分享,言简意赅,总结得很好,贴在这里作为备忘

### 缓存协商

   <img src="/assets/images/browser_cache/huancunxieshang.png" />

---

### 协商的两种方式

   <img src="/assets/images/browser_cache/two_way.png" />

---

### 彻底消灭请求

   <img src="/assets/images/browser_cache/xiaomieqingqiu.png" />

这个好像只对使用`Last-Modified` 有效, 对使用`Etag`的方式不知道有没有办法

如果`Expires` 和`Cache-Contrl: max-age` 同时存在, `max-age`覆盖前者

---

### 如何请求页面

windows:

   * Ctrl + F5:

     强制刷新: `Last-Modified & Expires`无效

   * F5:

     一般刷新: `Last-Modified有效,Expires`无效

   * URL+回车

     `Last-Modified & Expires`有效

Mac:

  * command + shift + R:

    强制刷新, 会发送 `Cache-Control:no-cache`

  * command + R:

    一般刷新

---

2016/2/1 补充

* 浏览器缓存和缓存协商, 偶尔也叫作强缓存和协商缓存, 两者都希望使用浏览器本地的缓存

* Expires是较老的强缓存管理header，由于它是服务器返回的一个绝对时间，在服务器时间与客户端时间相差较大时，缓存管理容易出现问题，比如随意修改下客户端时间，就能影响缓存命中的结果。所以在http1.1的时候，提出了一个新的header，就是Cache-Control，这是一个相对时间，在配置缓存的时候，以秒为单位

* 协商缓存需要配合强缓存使用，比如，除了Last-Modified这个header，还有强缓存的相关Expires header，因为如果不启用强缓存的话，协商缓存根本没有意义(存疑??)


参考: <http://www.cnblogs.com/lyzg/p/5125934.html>
