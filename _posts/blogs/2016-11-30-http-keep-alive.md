---
layout: post
categories: [blog, server]
tags : [tcp, http, keep-alive]
title: HTTP keep-alive
---
{% include JB/setup %}

---

TCP  Keepalive/HTTP长连接/短连接/并行连接/HTTP keep-alive/pipeline, 这些术语经常出现混淆, 今天来总结一下.

---

## TCP Keepalive

目的: 在规定时间内不活跃的链接上, 通过发送心跳空包, 检测已经不通的tcp链接, 并释放链接, 主要目的是为了回收资源

* TCP是无感知的虚拟连接, 中间断开两端不会立刻得到通知. (一般在使用长连接的环境下，需要心跳保活机制可以勉强感知其存活) 业务层面有心跳机制，TCP协议也提供了心跳保活机制, 就是Keepalive

* TCP Keepalive虽不是标准规范，但操作系统一旦实现，默认情况下须为关闭，可以被上层应用开启和关闭

* TCP Keepalive必须在没有任何数据（包括ACK包）接收之后的周期内才会被发送，允许配置，默认值不能够小于2个小时

* 规范建议keepalive保活包不应该包含数据，但也可以包含1个无意义的字节，比如0x0

---

## HTTP

* HTTP 短连接: 创建tcp连接->请求资源->响应资源->释放TCP连接
* HTTP 并行连接: 通常指并发的HTTP 短连接, 不过有时也指浏览器同源并行长连接, 在chrome中, 同源TCP链接限制为6个
* HTTP 长连接(persistent connection): 一个TCP连接, 完成多个http事务请求, 可以重用TCP链接, 但是http事务还是顺序完成后发送
* HTTP pipelining: 基于HTTP 长连接, 批量提交多个request, 而不用等待上次请求结束.

### HTTP Keep-alive

* HTTP/1.0 默认是短连接, 如需开启长连接, 需要增加header `Connection: Keep-alive`

* HTTP1.1 默认开启长连接, `Connection: Keep-alive` 可以不带, 但是实践中可以发现，浏览器的报文请求都会带上它

  如果HTTP1.1希望使用短连接, 需要带上header `Connection: close`

* Keep-alive 超时控制

  服务器有时候会告诉客户端长连接超时时间, 在响应头里可能有:

  `Keep-Alive: timeout=20` 表示TCP通道可以保持20秒

  `max=XXX` 表示这个长连接最多接收XXX次请求就断开

  如果服务器没有告诉客户端超时时间也没关系，服务端可能主动发起四次握手断开TCP连接，客户端能够知道该TCP连接已经无效；另外TCP还有心跳包来检测当前连接是否还活着，方法很多，避免浪费资源

* 长连接传输完成标识

  对于 服务端生成`Content-Length`, 客户端通过`Content-Length`进行判断

  对于动态内容, chunked传输, 没有`Content-Length`, 这时候就要根据chunked编码来判断，chunked编码的数据在最后有一个空chunked块，表明本次传输数据结束

* 和HTTP管道不同的是, 非管道的长连接, 需要等上个http事务返回后, 再发起第二个http事务.

  HTTP/1.x 多次请求必须严格满足先进先出（FIFO）的队列顺序：发送请求，等待响应完成，再发送客户端队伍中的下一个请求。也就是说，每个 TCP 连接上只能同时有一个请求/响应。这样一来，服务器在完成请求开始回传到收到下一个请求之间的时间段处于空闲状态

### HTTP 管道/流水线技/管线化/pipelining

* 因为兼容性等原因, 并没有发展起来?
* 基于http长连接, 仅HTTP/1.1支持此技术, 并且只有GET和HEAD要求可以进行管线化，而POST则有所限制
* HTTP管线化是将多个HTTP要求（request）整批提交的技术，而在传送过程中不需先等待服务端的回应
* 此技术之关键在于多个HTTP的要求消息可以同时塞入一个TCP分组中，所以只提交一个分组即可同时发出多个要求，借此可减少网络上多余的分组并降低线路负载
* server端需要FIFO处理管道中的请求, 也就是虽然请求可以并行, 但是响应还是必须串行. 这样可能会因为前面的响应慢, 造成"队首阻塞"
* client需要通过`Content-Length` 或者chunked进行传输完成判断?

---

### 其他

* TCP层是没有“请求”一说的，经常听到在TCP层发送一个请求，这种说法是错误的。TCP是一种通信的方式，“请求”一词是事务上的概念，HTTP协议是一种事务协议

* 注意TCP的Keepalive, 和HTTP的Keep-alive完全不是一个事, 写法都不同

  还有HTTP的Keep-alive其实是用于控制TCP连接的

---

## 参考

* [TCP心跳 TCP keepAlive](http://blog.csdn.net/cccallen/article/details/8003324)
* [我为什么要谈KeepAlive](http://blog.sina.com.cn/s/blog_e59371cc0102ux5w.html)
* [HTTP的长连接和短连接](http://www.cnblogs.com/cswuyg/p/3653263.html)
