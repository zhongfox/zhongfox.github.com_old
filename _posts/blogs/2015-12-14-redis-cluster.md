---
layout: post
categories: [blog, server]
tags : [cache, RedisCluster]
title: RedisCluster
---
{% include JB/setup %}


## 主要特性和设计

### 目标

* 高性能和线性可扩展性: 最多可达1000个node, 无代理, 异步复制
* Acceptable degree of write safety: 存在极少的写丢失情况
* 高可用: 
  
  * 多数master存活+其他master有存活的slave
  * replicas migration: slave 借用

### 实现子集

* Redis 集群实现了单机 Redis 中， 所有处理单个数据库键的命令
* 多key复杂计算没有实现, 如集合的并集操作、合集操作
* hash tags
* 不支持SELECT选库, 只用0号

### 节点职责

* 持有键值对数据
* 记录集群的状态，包括键到正确节点的映射 TODO
* 自动发现其他节点
* 识别工作不正常的节点
* 主节点选举

### Gossip 协议

* 传播（propagate）关于集群的信息，以此来发现新的节点
* 向其他节点发送 PING 数据包，以此来检查目标节点是否正常运作
* 在特定事件发生时，发送集群信息

### 写安全

Redis Cluster 采用**异步复制** 和 **last failover wins** 导致存在写丢失的概率, 但对于连接多数派masters和少数派的masters, 区别很大(TODO)

一下是2个例子;

1. 主写入, 响应client, 但是在同步给从之前挂掉了, 从提升为主, 造成写丢失
2. 主挂掉, 从提升, 有的客户端还没来得及更新路由, 这时候原来的主复活, 但是还没来得及降为从, 此时接收到写

少数派的masters, 写丢失概率更大:

一个master不可达, 达到`NODE_TIMEOUT` 将发生故障转移, 但是如果在`NODE_TIMEOUT`之前,网络分区修复了, 就不会有写丢失, 但是如果网络分区超过`NODE_TIMEOUT`, 应用在少数派的写将丢失. 在这之后, 少数派将拒接写入.

### 可用性

集群在网络分区的少数派区不可用, 在多数派中, 如果每个失效的master都有对应的slave, 集群将在`NODE_TIMEOUT`加上几秒后(slave提升的时间)变为可用

This means that Redis Cluster is designed to survive failures of a few nodes in the cluster, but it is not a suitable solution for applications that require availability in the event of large net splits.

**replicas migration**: 没有slave的master, 将从其他有多个slave的master获得一个slave

### 性能

* 集群节点不代理其他节点, 而是指导client进行跳转找到正确的node
* 异步复制, 节点写入不等待其他节点确认, 直接返回客户端(除非明确要求WAIT)
* multi-key命令只适用于near keys (TODO)
* 数据迁移只出现在resharding

N个master的集群可以获得N倍于单机的线性性能提升

---

## 主要概念

### 键分布模型

* 键空间被分割为 16384 个槽
* 最大节点数量也是 16384 个, 荐的最大节点数量为 1000 个左右
* solt计算算法: `HASH_SLOT = CRC16(key) mod 16384`

### Keys hash tags

hash tags用于确保一些特定的keys存于同一个slot, 用于实施多建操作, 如mget

规则: 第一个`{`和它之后的第一个`}` 之间如果有字符, 那么使用这些字符进行slot计算

### 集群节点属性

* 每个节点在集群中都有一个独一无二的 ID ， 该 ID 是一个十六进制表示的 160 位随机数, ID保存的文件应该是配置中的`cluster-config-file`
* 一个节点可以改变它的 IP 和端口号， 而不改变节点 ID 。 集群可以自动识别出 IP/端口号的变化， 并将这一信息通过 Gossip 协议广播给其他节点知道 TODO

### Cluster bus 集群消息总线

* 集群节点之间的通信是通过(client 端口+1000)这个端口进行通信
* 通信协议: The Cluster bus binary protocol

### 集群拓扑

* 集群节点通过tcp相互链接, 每个node有N-1个outgoing TCP连接, 和N-1个incoming TCP连接
* 节点之间的连接一直存活而不是按需连接
* 节点之间通过流言协议和配置更新, 保证消息流量不会太多

### 节点握手

* 节点总是应答（accept）来自集群连接端口的连接请求, 即使是非可信节点, 除了 PING 之外， 节点会拒绝其他所有并非来自集群节点的数据包。
* 管理员显式地向源节点发送 CLUSTER MEET 目标节点ip 目标port, 源节点向目标节点发送MEET
* 可信节点相互传播, 扩展拓扑结构

---

## 重定向和重新分片

### MOVE

* 一个 Redis 客户端可以向集群中的任意节点（包括从节点）发送命令请求. 如果所查找的槽不是由该节点处理的话， 节点将查看自身内部所保存的哈希槽到节点 ID 的映射记录， 并向客户端回复一个 MOVED 错误
*  节点在 MOVED 错误中直接返回目标节点的 IP 和端口号， 而不是目标节点的 ID
* 虽然不是必须的， 但一个客户端应该记录重定向后的路由; 另一个方案是client通过`CLUSTER NODES or CLUSTER SLOTS` 刷新客户端路由映射, 因为这时候可能存在机器重新配置的情况.

### 集群在线重配置

slot 分配相关命令: `CLUSTER ADDSLOTS|DELSLOTS|SETSLOT`, 与此同时, 节点和client之间通过`-ASK` `ASKING`保证找到正在移动的键

键值的实际移动由一个特殊的客户端` redis-trib`完成:

1. `CLUSTER GETKEYSINSLOT slot count` 获得slot里count个key; ` redis-trib`通过此命令得到源node的key, 然后对源node发送MIGRATE命令
2. `MIGRATE target_host target_port key target_database id timeout` 执行 MIGRATE 命令的节点会连接到 target 节点， 并将序列化后的 key 数据发送给 target ， 一旦 target 返回 OK ， 节点就将自己的 key 从数据库中删除

### ASK

* MOVED 是永久跳转, ASK 是仅针对当前一次命令的临时跳转
* 在重新分片时,  客户端应该先访问源节点 ，找不到再访问目标节点
* client 访问转向目标节点时,  应该先发送一个 ASKING 命令， 否则这个针对带有 IMPORTING 状态的槽的命令请求将被目标节点拒绝执行
* 在处理ASK时, client不必更新路由, 因为对应solt还没有迁移完, 一旦迁移完成, 下次访问会有MOVED跳转

### 客户端初次连接和处理跳转

* 不缓存slot配置的客户端不是好的客户端(可以工作但是低效)
* 高效的客户端应该在以下时候获得更新slot映射:
  1. 启动时
  2. 接收到MOVED (通常表明有重新分片或者故障转移)
* 客户端可以通过`CLUSTER SLOTS `获得slot映射
* 但该命令不保证覆盖了所有的slots, 比如出现配置有误的情况, 此时, 如果出现了用户端访问这些没有分配的slot, client应该返回错误



---

## 客户端

* 因为集群节点不能代理（proxy）命令请求， 所以客户端应该在节点返回 -MOVED 或者 -ASK 转向（redirection）错误时， 自行将命令请求转发至其他节点
* 因为客户端可以自由地向集群中的任何一个节点发送命令请求， 并可以在有需要时， 根据转向错误所提供的信息， 将命令转发至正确的节点， 所以在理论上来说， 客户端是无须保存集群状态信息的。

  不过， 如果客户端可以将键和节点之间的映射信息保存起来， 可以有效地减少可能出现的转向次数， 籍此提升命令执行的效率


---

## 集群命令

* CLUSTER NODES

  空格分隔: `<id> <ip:port> <flags> <master> <ping-sent> <pong-recv> <config-epoch> <link-state> <slot> <slot> ... <slot>`

* CLUSTER SLOTS

  返回最新的slots和node的映射, 返回格式为: 起始slot, 结束slot, master, slave1, slave2 .....

* CLUSTER ADDSLOTS slot1 [slot2] ... [slotN]

  slot加入本节点

* CLUSTER DELSLOTS slot1 [slot2] ... [slotN]

  本节点删除slot

* CLUSTER SETSLOT slot NODE node

  设置指定节点的slot

* CLUSTER SETSLOT slot MIGRATING node

  指定节点迁出slot

* CLUSTER SETSLOT slot IMPORTING node

  指定节点迁入


---

## 参考资料

* <http://redis.io/topics/cluster-spec>
* <http://redisdoc.com/topic/cluster-spec.html>
