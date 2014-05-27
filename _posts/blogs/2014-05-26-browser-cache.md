---
layout: post
categories: [blog, javascript]
tags : [cache]
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

---

### 如何请求页面

   * Ctrl + F5:

     强制刷新: `Last-Modified & Expires`无效

   * F5:

     一般刷新: `Last-Modified有效,Expires`无效

   * URL+回车

     `Last-Modified & Expires`有效

