---
layout: post
categories: [blog, server]
tags : [cache, redis]
title: Redis笔记
---
{% include JB/setup %}


## 事务

* MULTI
* DISCARD
* EXEC
* WATCH key [key ...]
* UNWATCH 取消当前客户端 WATCH 命令对所有 key 的监视


  * 乐观锁
  * 当 EXEC 被调用时， 不管事务是否成功执行， 对所有键的监视都会被取消
  * 当客户端断开连接时， 该客户端对键的监视也会被取消

**2个保证**

* 隔离性: 事务中的所有命令都会序列化、按顺序地执行;事务在执行的过程中，不会被其他客户端发送来的命令请求所打

* 原子性：事务中的命令要么全部被执行，要么全部都不执行(但不保证都会成功)

**其他**

* 使用流水线（pipeline），因为发送事务和读取事务的回复都只需要和服务器进行一次通讯

  MULTI 是一次, 然后所有命令和EXEC是一次;

* 在 EXEC 命令执行之后所产生的错误， 并没有对它们进行特别处理： 即使事务中有某个/某些命令在执行时产生了错误， 事务中的其他命令仍然会继续执行

* 当使用 AOF 方式做持久化的时候， Redis 会使用单个 write(2) 命令将事务写入到磁盘中

* 不支持回滚

* Redis 中的脚本本身就是一种事务， 所以任何在事务里可以完成的事， 在脚本里面也能完成。 并且一般来说， 使用脚本要来得更简单，并且速度更快

----

## 密码

* `CONFIG SET requirepass secret_password`  服务器将密码设置为 `secret_password`, 如果`secret_password` 是空字符则代表取消设置

  也可以通过配置文件中的`requirepass`进行设置

* `AUTH secret_password` 客户端进行验证

---

## 复制

* `SLAVEOF ip port` 会把从的删掉, 复制主的

* 如果主服务器设置了`requirepass`, 从服务器需要设置`masterauth`

* `INFO replication` 查看主从状态, 主从端均可执行

---

## Pub/Sub（发布/订阅）

### 订阅

* SUBSCRIBE channel [channel ...] 批量订阅
* PSUBSCRIBE pattern [pattern ...] 批量模式订阅

### 退订

* UNSUBSCRIBE [channel [channel ...]] 批量退订
* PUNSUBSCRIBE [pattern [pattern ...]] 批量模式退订

### 发布

* PUBLISH channel message 发布, 返回接收到信息 message 的订阅者数量

### 内省

* PUBSUB
  * PUBSUB CHANNELS [pattern] 返回订阅者大于0的频道, pattern可选
  * PUBSUB NUMSUB [channel-1 ... channel-N] 返回频道以及对应的订阅人数
  * PUBSUB NUMPAT 返回订阅模式的数量, 被订阅的模式的和, 相同的模式订阅多次也加一, 没啥意义

---

## 复制

* 复制功能可以单纯地用于数据冗余（data redundancy）， 也可以通过让多个从服务器处理只读命令请求来提升扩展性（scalability）： 比如说， 繁重的 SORT 命令可以交给附属节点去运行

* 可以通过复制功能来让主服务器免于执行持久化操作： 只要关闭主服务器的持久化功能， 然后由从服务器去执行持久化操作即可

* 从 Redis 2.6 开始， 从服务器支持只读模式， 并且该模式为从服务器的默认模式

* 只读模式由 redis.conf 文件中的 slave-read-only 选项控制， 也可以通过 CONFIG SET 命令来开启或关闭这个模式


---

## Key

* 设置/取消过期时间

  * `EXPIRE key seconds`
  * `PEXPIRE key milliseconds`
  * `EXPIREAT key timestamp`
  * `PEXPIREAT key milliseconds-timestamp`

  逆操作`PERSIST key`

  生存时间可以通过使用 DEL 命令来删除整个 key 来移除，或者被 SET 和 GETSET 命令覆写(overwrite)，这意味着，如果一个命令只是修改(alter)一个带生存时间的 key 的值而不是用一个新的 key 值来代替(replace)它的话，那么生存时间不会被改变

  如果使用 RENAME 对一个 key 进行改名，那么改名后的 key 的生存时间和改名前一样

* 获得过期时间

  * TTL key
  * PTTL key

* KEYS pattern

  支持 `? [] *`

---


<table id='redis_table' class='table'>
  <thead>
   <th style="width: 20px"></th>
   <th>String</th>
   <th>Hash</th>
   <th>List</th>
   <th>Set</th>
   <th>Zet</th>
  </thead>
  <tbody>
  </tbody>
<table>

<link rel="stylesheet" type="text/css" href="/assets/css/redis_tooltip.css">
<script src='/assets/javascripts/jquery-2.1.3.min.js' type='text/javascript'></script>
<script src='/assets/javascripts/bootstrap.min.js' type='text/javascript'></script>
<script src='/assets/javascripts/redis_cmd.js' type='text/javascript'></script>
