---
layout: post
category : server side
tags : [cache, share]
title: 使用Redis
tagline: 高性能的key-value数据存储服务器
---
{% include JB/setup %}

## Redis简介
1. Redis 是一个高性能的key-value数据存储服务器
2. 支持类型： strings(字符串)、lists(链表)、sets(集合)、sorted
sets(有序集合)、hashes(哈希)

## 获取和安装
  wget http://redis.googlecode.com/files/redis-2.4.17.tar.gz
  tar xzf redis-2.4.17.tar.gz
  cd redis-2.4.17
  make
  cp src/redis-server src/redis-cli /usr/bin
  
## Redis的特点
1. **丰富的数据类型**。
2. **单进程单线程**
redis利用队列技术将并发访问变为串行访问，消除了传统数据库串行控制的开销
3.
**原子性**：Redis的各个数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。
4. **高性能**：Redis的性能非常出色，每秒可以处理超过
10万次读写操作，是已知性能最快的Key-Value DB。
