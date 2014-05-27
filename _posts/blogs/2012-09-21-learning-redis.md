---
layout: post
categories: [blog, server-side]
tags : [cache, share, redis]
title: 使用Redis
tagline: 高性能的key-value数据存储服务器
---
{% include JB/setup %}


## Redis简介
1. Redis 是一个高性能的key-value数据存储服务器
2. 支持类型： strings(字符串)、lists(链表)、sets(集合)、sorted sets(有序集合)、hashes(哈希)

## 获取和安装
    wget http://download.redis.io/releases/redis-2.8.9.tar.gz
    tar xzf redis-2.8.9.tar.gz
    cd redis-2.8.9
    make
    sudo make install
  
开机启动

    wget https://github.com/ijonas/dotfiles/raw/master/etc/init.d/redis-server
    wget https://github.com/ijonas/dotfiles/raw/master/etc/redis.conf
    sudo mv redis-server /etc/init.d/redis-server
    sudo chmod +x /etc/init.d/redis-server
    sudo mv redis.conf /etc/redis.conf

    sudo useradd redis 
    sudo mkdir -p /var/lib/redis 
    sudo mkdir -p /var/log/redis 
    sudo chown redis.redis /var/lib/redis 
    sudo chown redis.redis /var/log/redis

    sudo update-rc.d redis-server defaults

    sudo /etc/init.d/redis-server start

## Redis的特点
1. __丰富的数据类型__
2. __单进程单线程__ redis利用队列技术将并发访问变为串行访问，消除了传统数据库串行控制的开销
3. __原子性__：Redis的各个数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。
4. __高性能__：Redis的性能非常出色，每秒可以处理超过 10万次读写操作，是已知性能最快的Key-Value DB。

__Redis的主要缺点__是数据库容量受到物理内存的限制，不能用作海量数据的高性能读写，因此Redis适合的场景主要局限在较小数据量的高性能操作和运算上。

##Redis适用场景##

少量数据存储，高速读写访问。此类需求可通过数据全部in-momery 的方式来保证高速访问，同时提供数据持久化的功能，实际这正是Redis最主要的适用场景。


* Redis使用最佳方式是全部数据in-memory。
* Redis更多场景是作为Memcached的替代者来使用。
* 当需要除key/value之外的更多数据类型支持时，使用Redis更合适。
* 当存储的数据不能被剔除时，使用Redis更合适。

## Redis的键
Resis的是键字符串。

键的命名规则：

1. 不要使用太长或太短的键w

    太长的坏处： （除了浪费空间以外，增加了查找成本）

    太短的坏处： （可读性不好不易理解）

2. 命名尽量坚持一个模式， 比如"object-type:id:field"

键的操作：

* `DEL key [key ...]`
* `EXISTS key`
* `EXPIRE key seconds`
* `RENAME key newkey`

## 数据类型和操作

**一. String 字符串类型**

  将字符串存入Redis的值类似memcached，值的大小不能大于512M

* `SET key value`
* `GET key`
* `INCR key`

**二. Linked List 链表**

  实现： 双向链表

* `LPUSH key value [value ...]`
* `RPUSH key value [value ...]`
* `LRANGE key start stop`
* `LINDEX key index`
* `LLEN key`

应用：

* 实现先进先出队列，消息机制等。

**三. Set 集合**

  无序的不重复字符串集合

  实现： value永远为null的HashMap

* `SADD key member [member ...]`
* `SISMEMBER key member`
* `SMEMBERS key`
* `SINTER key [key ...]` （交集）

应用：

* 可以使用Redis的Set数据类型跟踪一些唯一性数据
* 充分利用Set类型的服务端聚合操作方便、高效的特性，可以用于维护数据对象之间的关联关系。

**四. Sorted Set 有序集合**

  有序不重复字符串的集合，每个元素关联了一个用于排序的权重

  实现： HashMap和跳跃表(SkipList)

* `ZADD key score member [score] [member]`
* `ZRANGE`
* `ZRANGE key start stop [WITHSCORES]` （默认升序）
* `ZREVRANGE key start stop [WITHSCORES]`
* `ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]`

应用：

* 可以用于大型在线积分排行榜

**五. Hash 哈希**

  实现： 一维数组（成员较少时）或HashMap

* `HSET key field value`
* `HGET key field`
* `HDEL key field [field ...]`

应用：

* 从内存优化角度， 应尽量使用hash

## 名词解释

**竞态条件（race condition）**

  从多进程间通信的角度来讲，是指两个或多个进程对共享的数据进行读或写的操作时，最终的结果取决于这些进程的执行顺序。

  对值的读和写发生在不同的时间，会引起竞态条件

**原子操作**

  原子操作是不可分割的，在执行完毕不会被任何其它任务或事件中断

  在同一个操作对值进行读写可以解决竟态条件


## Redis内存模型

在Redis中，并不是所有的数据都一直存储在内存中的，Redis只会缓存所有的key的信息。

如果Redis发现内存的使用量超过了某一个阀值，将触发swap的操作，Redis根据

`swappability = age*log(size_in_memory)`

 计 算出哪些key对应的value需要swap到磁盘。然后再将这些key对应的value持久化到磁盘中，这种特性使得Redis可以 保持超过其机器本身内存大小的数据。当然，机器本身的内存必须要能够保持所有的key，毕竟这些数据是不会进行swap操作的。

###Redis虚拟内存###

为什么Redis不使用OS的虚拟内存？

1. 为了更小粒度的数据交换： os的虚拟内存是已4k页面为最小单位进行交换的。而redis的大多数对象都远小于4k，所以一个os页面上可能有多个redis对象。另外redis的集合对象类型如list,set可能存在与多个os页面上。最终可能造成只有10%key被经常访问，但是所有os页面都会被os认为是活跃的，这样只有内存真正耗尽时os才会交换页面。

2. 减少IO开销： 相比于os的交换方式。redis可以将被交换到磁盘的对象进行压缩,保存到磁盘的对象可以去除指针和对象元数据信息。一般压缩后的对象会比内存中的对象小10倍。这样redis的vm会比os vm能少做很多io操作。

Redis虚拟内存相关配置：

    vm-enabled yes                      #开启vm功能
    vm-swap-file /tmp/redis.swap        #交换出来的value保存的文件路径/tmp/redis.swap
    vm-max-memory 1000000               #redis使用的最大内存上限，超过上限后redis开始交换value到磁盘文件中。
    vm-page-size 32                     #每个页面的大小32个字节
    vm-pages 134217728                  #最多使用在文件中使用多少页面,交换文件的大小 = vm-page-size * vm-pages
    vm-max-threads 4                    #用于执行value对象换入换出的工作线程数量。0表示不使用工作线程

和os一样redis也是按页面来交换对象的。redis规定同一个页面只能保存一个对象。但是一个对象可以保存在多个页面中。在redis使用的内存没超过vm-max-memory之前是不会交换任何value的。redis会在内存中对应一个1bit值来记录页面的空闲状态。



##数据持久化##

###Redis提供的持久化机制：###

1. RDB持久化：
该机制是指在指定的时间间隔内将内存中的数据集快照写入磁盘。
2. AOF持久化(append-only fashion):
该机制将以日志的形式记录服务器所处理的每一个写操作，在Redis服务器启动之初会读取该文件来重新构建数据库，以保证启动后数据库中的数据是完整的。
AOF可以选择每秒同步、每操作同步和不同步。
3. 无持久化：
我们可以通过配置的方式禁用Redis服务器的持久化功能，这样我们就可以将Redis视为一个功能加强版的memcached了。
4. 同时应用AOF和RDB。这种情况下，AOF文件将会用于重构原始数据集。

###RDB特点###

* 优势：

  * 整个Redis数据库将只包含一个文件，适合文件备份, 方便转移到其它存储介质。出现灾难性故障非常容易的进行恢复。
  * 性能最大化。对于Redis的服务进程而言，在开始持久化时，它唯一需要做的只是fork出子进程，之后再由子进程完成这些持久化的工作，这样就可以极大的避免服务进程执行IO操作了。
  * 相比于AOF机制，如果数据集很大，RDB的启动效率会更高。

* 劣势：

  * 缺乏数据高可用性，不能最大限度的避免数据丢失。

###AOF特点###

* 优势：

  * AOF是每次修改同步（记日志），更高的数据安全性，即数据持久性。

* 劣势：

  * 对于相同数量的数据集而言，AOF文件通常要大于RDB文件。
  * 根据同步策略的不同，AOF在运行效率上往往会慢于RDB。

缺省的机制是RDB， redis会把数据集快照写入文件dump.rdb（可配置）， 我们还可以配置redis每隔N秒检查一次是否有M个key值更新，如果是，则进行一次持久化。
比如 `save 60 1000`


## Redis和其他两种数据存储系统的比较

Redis, Memcache, MongoDB 都是k/v类型的NOSQL.

区别：

**Memcache**

1. Redis中，并不是所有的数据都一直存储在内存中的，这是和Memcached相比一个最大的区别。

2. Redis不仅仅支持简单的k/v类型的数据，同时还提供list，set，hash等数据结构的存储。此外Redis单个value的最大限制是1GB，不像 memcached只能保存1MB的数据

3. Redis支持数据的备份，即master-slave模式的数据备份。

4. Redis支持数据的持久化，可以将内存中的数据保持在磁盘中，重启的时候可以再次加载进行使用。

**MongoDB**

  Redis是将key和部分value存于内存， 可以用作缓存系统， MongoDB数据是存于硬盘。




## Redis其他主题

###发布和订阅  publish/subscribe

* `PUBLISH channel message`
* `SUBSCRIBE channel [channel ...]`


###Redis事务

    > MULTI
    OK
    > INCR foo
    QUEUED
    > INCR bar
    QUEUED
    > EXEC
    1) (integer) 1
    2) (integer) 1

Redis事务特点：

* 连续性保证
* 原子性保证，执行事务期间，不再为其他请求服务。
* 和关系型数据库中的事务相比，在Redis事务中如果有某一条命令执行失败，其后的命令仍然会被继续执行

###其他

* Redis 主从复制 <http://redis.io/topics/replication>
* Redis Lua 脚本 <http://redis.io/commands/eval>
* Redis 管线 <http://redis.io/topics/pipelining>

    客户端在发送命令之后，不用立刻等待来自服务器的应答，而是可以继续发送后面的命令。在命令发送完毕后，再一次性的读取之前所有命令的应答。这样便节省了同步方式中RTT的开销

* Redis 内存优化 <http://redis.io/topics/memory-optimization>
    * 特殊编码
    * bit和byte级别的操作
    * 尽可能使用Hash

## 参考资料
* Redis官网 <http://redis.io>
* redis-objects <https://github.com/nateware/redis-objects>
* 关于跳跃链表 <http://www.cppblog.com/superKiki/archive/2010/10/18/130328.html>
* 关于原子性 <http://nateware.com/2010/02/18/an-atomic-rant/>
* 关于Redis虚拟内存 <http://antirez.com/post/redis-virtual-memory-story.html>
* 关于Redis产品定位 <http://www.infoq.com/cn/articles/tq-why-choose-redis>
