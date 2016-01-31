---
layout: post
categories: [blog, server]
tags : [latency, redis]
title: Redis 延迟分析
---
{% include JB/setup %}


本文是阅读[redis latency](http://redis.io/topics/latency) 以及 [redis latency-monitor](http://redis.io/topics/latency-monitor) 后的总结, 部分翻译, 部分笔记

---


## 测量延迟

    redis-cli --latency -h `host` -p `port`

## redis 内建延迟监控工具

### 开启延迟监控

`CONFIG SET latency-monitor-threshold 100` 单位为毫秒

默认情况latency-monitor-threshold为0, 即延迟监控是关闭的

延迟监控功能占用内存很小, 不过对于性能良好的redis也没有必要开启

TODO

* LATENCY LATEST
* LATENCY HISTORY event-name
* LATENCY RESET [event-name ... event-name]
* LATENCY GRAPH event-name
* LATENCY DOCTOR

---

## 各种延迟的原因

### 内在延迟

操作系统会造成一定的延迟, 称作`intrinsic latency`

如何测量(版本需要 2.8.7 及以上):

    ./redis-cli --intrinsic-latency 100

100代表需要测试的时间, 单位为秒

注意这个测量需要在redis server本机执行,

intrinsic latency 会受系统负载影响

### 网络通信延迟

通常1G网卡的延迟时间是200μs, Unix domain socket延迟大概30us, 实际中, 延迟受系统和网络情况影响

系统延迟在虚拟机中比物理机中要大很多

虽然redis命令在微秒级别, 但是client因为命令的网络往返, 需要忍受这部分延迟

高效的client会使用pipeline或者聚合命令

guidelines:

* redis server 最好使用物理机, 而不是虚拟机
* 不要频繁连接释放, 使用长连接
* 如果client和server在同一机器, 使用Unix domain sockets
* 优先使用聚合命令(MSET/MGET), 而不是pipeline
* 优先使用pipeline, 而不是频繁发送命令(多次网络往返)
* 对不适合使用pipeline的命令, 可以考虑使用lua脚本

redis server 命令处理是单线程, 但是redis内部还有有很多多线程, 用于处理类似bgsave, AOF等操作, 因此, redis server不适合在单核机器上运行

#### redis 单线程的本质

redis 使用一个线程处理clients的所有命令:

* multiplexing 多路IO复用
* 顺序执行
* 非阻塞调用(类似nodejs)

### 慢查询引起的延迟

GET or SET or LPUSH 等命令执行时间是常数, 不过类似 SORT, LREM, SUNION等操作多个元素的命令执行时间是O(N)

最佳时间:  对于不熟悉的命令, 一定要去查看文档, 搞清楚时间复杂度

解决方案:

* 减少多元素慢命令的使用
* 特别地, 对于 KEYS命令只能用于线下调试, 生产环境可以使用 SCAN, SSCAN, HSCAN and ZSCAN等命令代替
* 使用主从复制, 将慢的命令放到复制机器上执行


Additionally, you can use your favorite per-process monitoring program (top, htop, prstat, etc ...) to quickly check the CPU consumption of the main Redis process. If it is high while the traffic is not, it is usually a sign that slow commands are used

#### 使用SLOWLOG 诊断问题

* `SLOWLOG LEN` 当前慢查询个数
* `SLOWLOG RESET` 清空记录
* `CONFIG GET slowlog-max-len` 获得最大存储量, 默认好像128
* `CONFIG GET slowlog-log-slower-than` 获得慢查询阈值, 单位微秒, 默认10毫秒
* `SLOWLOG GET [number]` 展示number条慢查询

  格式如下

      redis> SLOWLOG GET
      1) 1) (integer) 12                      # 唯一性(unique)的日志标识符
         2) (integer) 1324097834              # 被记录命令的执行时间点，以 UNIX 时间戳格式表示
         3) (integer) 16                      # 查询执行时间，以微秒为单位
         4) 1) "CONFIG"                       # 执行的命令，以数组的形式排列
            2) "GET"                          # 这里完整的命令是 CONFIG GET slowlog-log-slower-than
            3) "slowlog-log-slower-than"

### fork 引起的延迟

生成RDB或者AOF会使redis 主线程fork后台线程, 这会造成一定延迟

TODO

### 过期操作引起的延迟

redis 数据过期有以下两种方式:

1. 惰性过期: 操作指定key时, 检测过期时间, 如果已过期则删除
2. 主动过期, 每100ms进行一次过期检测(每秒10次)

主动过期算法:

* 每次扫描`ACTIVE_EXPIRE_CYCLE_LOOKUPS_PER_LOOP`(默认20)个redis数据, 删除已过期数据
* 如果有大于25%的数据过期, 则重复执行

如果同一时刻, 有大量key过期, 主动过期算法发现大于25%的过期数据, 它将重复执行主动过期扫描, 直到过期比例小于25%, 这可能造成延迟

这种算法是必要的, 用于避免大量过期数据占用内存, 通常来说也是无害的, 因为很少会有大量数据在同一时刻过期, 除非大量使用`EXPIREAT 同一时间`

实例参看: [善待Redis里的数据](http://neway6655.github.io/redis/2015/12/19/%E5%96%84%E5%BE%85Redis%E9%87%8C%E7%9A%84%E6%95%B0%E6%8D%AE.html)

---

## Redis software watchdog

TODO (2.6)

