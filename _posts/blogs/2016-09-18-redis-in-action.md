---
layout: post
categories: [blog, nosql]
tags : [cache, redis, nosql]
title: Redis实战干货
---
{% include JB/setup %}


### expire 陷阱

执行类似zadd sadd hset等操作的时候，一定要先进行expire，如果miss(expire返回0表示不存在)则不执行，等到查询miss的时候在从db中load

如果先zadd, 在设置expire的话, 可能zadd前, 数据已经过期了, 再zadd后的缓存只有刚加入的数据, 造成缓存中数据不全

[缓存使用总结](http://lintanghui.com/2016/09/10/cache.html)

---

### redis 过期策略

* 定时删除: redis并不使用这种策略, 定时器对内存友好, 对cpu不友好

redis 结合使用:

* 惰性删除: CPU 友好, 内存不友好
* 定期删除: 是上面2中的折中 难点是确定删除操作执行的时长和频率

[Redis之过期键删除策略](http://blog.edagarli.com/2016/06/08/Redis%E4%B9%8B%E8%BF%87%E6%9C%9F%E9%94%AE%E5%88%A0%E9%99%A4%E7%AD%96%E7%95%A5/)

Redis是单线程的，基于事件驱动的，Redis中有个EventLoop, 有2类事件:

* IO事件
* 定时事件: 类似JavaScript的EventLoop

[Redis缓存失效机制](https://my.oschina.net/andylucc/blog/679222)

---

### 持久化选择策略

* Snapshot:

  * 有2个命令可以主动save:
    * save 是由主进程进行快照操作，会阻塞其它请求;
    * bgsave 会通过 fork 子进程进行快照操作
  * 开启: `save 时间内 写次数 时间内 写次数 ...` save  后接存储的时机 及时 在多少秒内发生多少次写, 就进行一次快照写入
  * 关闭: `save ""`

  其他配置:

      # 当snapshot 时出现错误无法继续时，是否阻塞客户端变更操作
      stop-writes-on-bgsave-error yes
      # 是否启用rdb文件压缩，默认为 yes cpu消耗，快速传输
      rdbcompression yes
      # rdb文件名称
      dbfilename dump.rdb

* AOF

  * 将 操作 + 数据 以格式化指令的方式追加到操作日志文件的尾部
  * AOF Rewrite: 类似Snapshot, 遍历内存到aof文件, rewrite的触发机制是aof文件大小超过阈值
  * 开启: `appendonly yes`
  * 关闭: `appendonly no`

  其他配置:

      ##只有在yes下，aof重写/文件同步等特性才会生效
      appendonly no
      ##指定aof文件名称
      appendfilename appendonly.aof
      ##指定aof操作中文件同步策略，有三个合法值：always everysec no，默认为everysec
      appendfsync everysec
      ##在aof-rewrite期间，appendfsync 是否暂缓文件同步，no 表示不暂缓，yes 表示暂缓，默认为no
      no-appendfsync-on-rewrite no
      ##aof文件rewrite触发的最小文件尺寸 只有大于此aof文件大于此尺寸是才会触发rewrite，默认64mb，建议512mb
      auto-aof-rewrite-min-size 64mb
      ##相对于上一次rewrite，本次rewrite触发时aof文件应该增长的百分比
      auto-aof-rewrite-percentage 100

* 比较

  * Snapshot: 数据可能缺失部分; copy-on-write造成极端情况内存是实际数据的2倍; db文件尺寸小; 恢复快
  * AOF: AOF文件非常的庞大; 恢复时间长(用rewrite缓解); 更多的磁盘IO; 数据更完整

* 选择: 

  * Snapshot 用于主从同步
  * 通常 master 使用AOF，slave 使用 Snapshot，master 需要确保数据完整性，slave 提供只读服务
  * 如果你的网络稳定性差， 物理环境糟糕情况下，那么 master， slave均采取 AOF，这个在 master， slave角色切换时，可以减少时间成本

[Redis 该选择哪种持久化配置](http://zheng-ji.info/blog/2016/03/10/gai-xuan-ze-na-chong-redischi-jiu-hua-pei-zhi/)

---

## 配置

* `> CONFIG GET * `  查看所有配置

* `dir` 是db文件的存储目录
