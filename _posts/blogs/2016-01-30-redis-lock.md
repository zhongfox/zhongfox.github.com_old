---
layout: post
categories: [blog, server]
tags : [distributed, redis, nosql]
title: Redis 分布式锁
---
{% include JB/setup %}


利用Redis是单线程模型，命令操作原子性，可以很容易的实现分布式锁

---

## 加锁

    SETNX key value

将 key 的值设为 value ，当且仅当 key 不存在。

若给定的 key 已经存在，则 SETNX 不做任何动作。

SETNX 是『SET if Not eXists』(如果不存在，则 SET)的简写

设置成功，返回 1 。

设置失败，返回 0 。

---

## 释放锁

释放锁有两种方式:

1. 主动删除: `del key`
2. 加锁时给锁设置一个过期时间: `expire key time`, 此手段也可以防止加锁后程序异常没有主动释放锁

对于一个指定名称的锁, 需要反复的被使用的情况, 释放锁需要1,2两种解锁同时使用

对于只一次性使用的锁, 可以只使用第2中解锁方式

---

## 可复用的锁

**加锁(ruby)**

    def get_redis_lock
      if Redis.current.setnx(lock_key, current_client_id)
        Redis.current.expire(lock_key, 300)
        true
      else
        false
      end
    end


`del key` 解锁时, 需要确保只能是获得锁的client删除锁, 否则会出现分布式锁失效, 举例:

1. A客户端拿到对象锁，但在因为一些原因被阻塞导致无法及时释放锁。
2. 因为过期时间已到，Redis中的锁对象被删除。
3. B客户端请求获取锁成功。
4. A客户端此时阻塞操作完成，删除key释放锁。
5. C客户端请求获取锁成功。
6. 这时B、C都拿到了锁，因此分布式锁失效。

因此在第4步del key时需要判断一下:

lua(原子性??):

    if redis.call("get",KEYS[1]) == ARGV[1] then
      return redis.call("del",KEYS[1])
    else 
      return 0
    end

---

## 一次性锁

加锁时给锁设置一个过期时间, 无需显示解锁

    def get_redis_lock(uniq_key)
      lock_key = "mylock_#{uniq_key}"
      if Redis.current.setnx(lock_key, 1)
        Redis.current.expire(lock_key, 300)
        true
      else
        false
      end
    end

---

## Redis的SETNX中的陷阱

<http://huoding.com/2015/09/14/463>

## 参考

* <http://www.cnblogs.com/mushroom/p/4752499.html>
