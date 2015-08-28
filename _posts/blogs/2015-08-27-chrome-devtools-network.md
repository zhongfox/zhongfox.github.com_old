---
layout: post
categories: [blog, sundry]
tags : [chrome]
title: Chrome 开发者工具网络视图
---
{% include JB/setup %}

---

仅记录文档中之前不常用/不知道的功能, 作为补充备忘

---

## Network panel overview

* Size and Content:

  Size是从服务器接收到的所有header和内容整体(压缩后的, 实际传输量)

  Content是解码后的http content实际大小, Content可能比Size大, 也可能比Size小

  `from cache` 表示是从浏览器缓存中获得 (如果早浏览器强制刷新, 带上`Pragma:no-cache`可以重新获取)

* Time and Latency:

  Time是持续时间, 从请求开始到请求的最后一个字节接收完毕, 包括(Latency + Content Download/Downloading)

  Latency等待时间: 是请求开始到接收到第一个字节前的时间, 包括(Stalled/Blocking + DNS Lookup + Initial Connection/Connecting + Waiting (TTFB))

* Timeline: 网络瀑布流

---

## Determine performance by resource type

* 资源颜色

  <img src="/assets/images/chrome/color.png" />

* 蓝色垂直线: DOMContentLoaded, 文档结构解析完成

* 红色垂直线: load, 页面所有资源加载完成

## HTTP headers

在各个资源的Headers视图, 在`Query String Parameters` 部分, 可以点击`View decoded/View URL encoded` 转换格式查看查询参数

## WebSocket frames

TODO

---

## Resource network timing

  <img src="/assets/images/chrome/timing.png" />

* Stalled/Blocking: 请求等待被发送的时间, 包括`Proxy Negotiation`, 以及等待可用tcp连接的时间(Chrome's maximum six TCP connection per origin rule)

* Proxy Negotiation: 代理协商

* DNS Lookup: DNS查找

* Initial Connection / Connecting: 建立连接的时间, 包括TCP握手和SSL谈判(negotiating a SSL)

* SSL: ssl握手

* Request Sent / Sending: 发送请求耗时

* Waiting (TTFB): 等待首字节到来时间

---

### 参考

* [Measure Resource Loading Times](https://developers.google.com/web/tools/profile-performance/network-performance/resource-loading)
