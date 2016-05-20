---
layout: post
categories: [blog, server]
tags : [redis, nosql]
title: Redis 性能调优相关笔记
---
{% include JB/setup %}

## info

可以使用`info [类别]`输出指定类别内容

info命令输出的数据可分为10个类别，分别是：

* server

* clients

      # Clients
      connected_clients:2 #Redis默认允许客户端连接的最大数量是10000。若是看到连接数超过5000以上，那可能会影响Redis的性能
      client_longest_output_list:0
      client_biggest_input_buf:0
      blocked_clients:0

      限制客户端连接数: maxclients 配置可以配置客户端连接的最大数
      这个数字应该设置为预期连接数峰值的110%到150之间，若是连接数超出这个数字后，Redis会拒绝并立刻关闭新来的连接

* memory

      # Memory
      #实际缓存占用的内存和Redis自身运行所占用的内存(如元数据、lua)。
      #它是由Redis使用内存分配器分配的内存，所以这个数据并没有把内存碎片浪费掉的内存给统计进去
      #如果used_memory > 可用最大内存，那么操作系统开始进行内存与swap空间交换
      #当 rss > used ，且两者的值相差较大时，表示存在（内部或外部的）内存碎片。
      #内存碎片的比率可以通过 mem_fragmentation_ratio 的值看出。
      #当 used > rss 时，表示 Redis 的部分内存被操作系统换出到交换空间了，在这种情况下，操作可能会产生明显的延迟
      used_memory:9892187056
      used_memory_human:9.21G

      #从操作系统上显示已经分配的内存总量, 包括碎片
      used_memory_rss:11148713984

      used_memory_peak:11236792296
      used_memory_peak_human:10.47G
      used_memory_lua:35840

      #内存碎片率
      #内存碎片率稍大于1是合理的，这个值表示内存碎片率比较低，也说明redis没有发生内存交换。
      #但如果内存碎片率超过1.5，那就说明Redis消耗了实际需要物理内存的150%，其中50%是内存碎片率
      #若是内存碎片率低于1的话，说明Redis内存分配超出了物理内存，操作系统正在进行内存交换。内存交换会引起非常明显的响应延迟
      mem_fragmentation_ratio:1.13
      mem_allocator:jemalloc-3.6.0

* persistence
* stats

      total_connections_received:273
      total_commands_processed:105868 #总共处理的命令数
      instantaneous_ops_per_sec:0
      rejected_connections:0
      sync_full:0
      sync_partial_ok:0
      sync_partial_err:0
      expired_keys:1
      evicted_keys:0 #因为maxmemory限制导致key被回收删除的数量
      keyspace_hits:28076
      keyspace_misses:52981
      pubsub_channels:0
      pubsub_patterns:0
      latest_fork_usec:414

* replication
* cpu

      都是累计值, 随着Redis启动的时间长度不断累计上升，并在你重启Redis服务后清0

      used_cpu_sys : Redis 服务器耗费的系统 CPU
      used_cpu_user : Redis 服务器耗费的用户 CPU
      used_cpu_sys_children : 后台进程耗费的系统 CPU
      used_cpu_user_children : 后台进程耗费的用户 CPU

* commandstats
* cluster
* keyspace

---

## 回收策略

### 相关配置

* maxmemory

  `CONFIG SET/GET maxmemory 100mb` 读/写最大内存配置

  `maxmemory 100mb` redis.conf 配置

  如果为0表示没有限制

* maxmemory-policy 回收策略(当内存达到maxmemory限制)

  `CONFIG SET/GET maxmemory-policy`

* maxmemory-samples 回收样本大小

### maxmemory-policy 六种方式

* volatile-lru：（默认值）从已设置过期时间的数据集（server.db[i].expires）中挑选最近最少使用的数据淘汰
* volatile-random：从已设置过期时间的数据集（server.db[i].expires）中任意选择数据淘汰
* volatile-ttl ： 从已设置过期时间的数据集（server.db[i].expires）中挑选将要过期的数据淘汰
* allkeys-lru ： 从数据集（server.db[i].dict）中挑选最近最少使用的数据淘汰
* allkeys-random：从数据集（server.db[i].dict）中任意选择数据淘汰
* noeviction ： 禁止驱逐数据,永不过期，返回错误

tip:

* 如果数据分布符合幂定律分布, 如果你不确定选择什么，`allkeys-lru`是个很好的选择
* volatile-ttl 样本同样受`maxmemory_samples`控制

### LRU:

#### lru属性

* redisObject 结果包括一个lru属性, 记录了对象最后一次被命令程序访问的时间
* `OBJECT IDLETIME` 输出对象的空转时间, 是将当前时间减去对象lru, 该命令是特殊实现, 不会修改对象的lru属性
* lru 属性用于配合实现maxmemory-policy中volatile-lru和allkeys-lru回收策略

#### lru算法

在Redis中LRU算法是一个近似算法，默认情况下，Redis随机挑选maxmemory-samples个键，并且从中选取一个最近最久未使用的key进行淘汰，

在配置文件中可以通过maxmemory-samples的值来设置redis需要检查key的个数,但是栓查的越多，耗费的时间也就越久,但是结构越精确(也就是Redis从内存中淘汰的对象未使用的时间也就越久~)

---

## 性能分析

### 延迟检测

`Redis-cli --latency -h 127.0.0.1 -p 6379` 结果单位是ms;

### 诊断响应延迟

跟踪`info  stats` `total_commands_processed`的变化

定期记录`total_commands_processed`的值。当客户端明显发现响应时间过慢时，可以通过记录的`total_commands_processed`历史数据值来判断命理处理总数是上升趋势还是下降趋势

延迟的可能原因;

* 命令队列里的命令数量过多，后面命令一直在等待中。
* 几个慢命令阻塞Redis。

方案:

1. 使用多参数命令
2. 管道命令
3. 避免操作大集合的慢命令

---

## Redis配置

* redis.conf 配置实例:

      slaveof 127.0.0.1 6380
      requirepass "hello world" # 如果有空格

* 通过命令行传参

      ./redis-server --port 6380 --slaveof 127.0.0.1 6379

* `CONFIG REWRITE` 重写配置文件, 会将服务器启动后的`CONFIG SET...`写入配置文件, 参见<http://redisdoc.com/server/config_rewrite.html>

---

## 其他

* 监控工具 [redis-stat](https://github.com/junegunn/redis-stat)

----

## 参考资料

* <http://www.cnblogs.com/mushroom/p/4738170.html>
