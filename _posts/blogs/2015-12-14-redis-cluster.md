---
layout: post
categories: [blog, nosql]
tags : [cache, RedisCluster, nosql]
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

以下是2个例子;

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

### 多键操作

借助`hash tags`, 可以实现多建操作

不过如果在重新分片过程中, 原本属于一个solt的key分布于源节点和目的节点, 导致多键操作不可用, 此时集群会返回错误`TRYAGAIN`, 此时客户端可以在一段时间后重试, 或者上报错误

### 使用slave扩展集群读能力

默认slave提供读, 可以通过`READONLY`命令开启slave可读, 不过客户端要能接受读取陈旧数据的结果(脏读)

开启READONLY后, 以下情况slave会返回跳转

1. slot不是slave对应的master负责
2. 集群重新配置过程中, 如重新分片

此情况下, client应该更新solt映射配置

命令`READWRITE`可以取消slave可读


---

## 客户端

* 因为集群节点不能代理（proxy）命令请求， 所以客户端应该在节点返回 -MOVED 或者 -ASK 转向（redirection）错误时， 自行将命令请求转发至其他节点
* 因为客户端可以自由地向集群中的任何一个节点发送命令请求， 并可以在有需要时， 根据转向错误所提供的信息， 将命令转发至正确的节点， 所以在理论上来说， 客户端是无须保存集群状态信息的。

  不过， 如果客户端可以将键和节点之间的映射信息保存起来， 可以有效地减少可能出现的转向次数， 籍此提升命令执行的效率

---

## 容错

### 心跳检测和流言消息

心跳检测包:
1. 发送 ping, 返回pong
2. 节点也可以自主发送pong包, 用于配置广播, 而不用有回复包


节点每秒会随机ping一部分其他节点

不过, 节点会保证在`NODE_TIMEOUT/2`时间内对指定节点发送ping, 同时node也会在`NODE_TIMEOUT`结束前重连指定节点.

所以, 如果`NODE_TIMEOUT`太小, 而集群较大, 心跳消息将会很多

### 心跳包内容

#### 心跳包组成:

* header
* 流言

#### 心跳包header内容:

* Node id
* currentEpoch 和 configEpoch
* 标志位: 主从标识, 以及其他标识位
* hash solts位图
* 发送node的base 端口(提供给client连接的端口)
* 集群状态, 是发送节点的观点
* 父节点id (如果是slave的话)

#### 心跳包流言内容:

包含发送者已知的其他node中的一部分 (数量和集群规模有关)

node信息:

* node id
* ip, port
* node 标识位

此部分作用是进行失效检测, 以及节点发现

### 失效检测

失效检测用于识别, 对于**大部分master**来说, 不可达的master或者slave, 失效检测后, 将会进行slave提升. 如果slave提升失败(比如没有多余slave), 集群将设置错误标识, 并停止处理客户端请求.

每个节点都对其他节点记录了一些表征存活状态的标志位:

* PFAIL:

  可能失败, 还没有确认的失败状态

  集群中任一节点都可以标记其他任一节点的PFAIL

  `NODE_TIMEOUT`内没有收到对应的pong

* FAIL:

  在一定时间内, 已经被大多数master确认的失败

#### PFAIL升级为FAIL流程:

* A 标记 B 为PFAIL
* A 通过流言收集B的状态
* 当在`NODE_TIMEOUT * FAIL_REPORT_VALIDITY_MULT`内, A收集到大多数master对B的标记都是PFAIL或者FAIL
* A标记B为FAIL
* A发送FAIL消息给其他可达的节点
* FAIL消息会强制接收到消息的节点, 对B标记FAIL

FAIL标记去除条件:

* FAIL slave 变为可达, FAIL标记会去除, 因为之前没有发送过故障转移
* FAIL master 但是没有负责任何slot的节点, 变为可达, FAIL标记会去除
* FAIL master 但是没有备用的slave提升, 此时FAIL master会去掉FAIL标记而重用

TODO

----

## 配置处理,传播和失效转移

**纪元**: 版本递增的事件, 当不同节点提供了有冲突的信息时, 纪元用于确定哪个版本是最新的

### 当前纪元

* 当(主从)节点创建时, currentEpoch为0
* 节点接收到的流言中, header中的currentEpoc如果大于自己的, 自己的将被更新
* 因此集群逐步会有相同的currentEpoc
* currentEpoc用于当集群状态变化时, 节点间达成一致(即slave提升)
* 本质上说，epoch 是一个集群里的逻辑时钟

### 配置纪元

configEpoch 用于在不同节点提出不同的配置信息的时候（这种情况或许会在分区之后发生）解决冲突

**主节点**

* 每一个主节点总是通过发送 ping 包和 pong 包向别人宣传它的 configEpoch 和一份表示它负责的哈希槽的位图
* 当(任何?)一个新节点被创建的时候，主节点中的 configEpoch 设为零

**从节点**

* 从节点也会在 ping 包和 pong 包中向别人宣传它的 configEpoch 域, 此值是同步其master的configEpoch
* 当一个节点重启，它的 configEpoch 值被设为所有已知节点中最大的那个 configEpoch 值

### 丛节点的选举和提升

#### slave 发起选举的条件:

* 对应的主节点处于 FAIL 状态
* 这个主节点负责的哈希槽数目不为零
* 从节点和主节点之间的重复连接（replication link）断线不超过一段给定的时间


#### slave 发起选举有一定延迟:

`DELAY = fixed_delay + (data_age - NODE_TIMEOUT) / 10 + 0到2000毫秒之间的随机数`

* `fixed_delay`: 确保等到 FAIL 状态在集群内广播
* `data_age - NODE_TIMEOUT`: 让从节点有时间去获得新鲜数据 ???
* 随机延时: 减少多个从节点在同一时间发起选举的可能性，因为若同时多个从节点发起选举或许会导致没有任何节点赢得选举

#### slave提升过程:

申请者从:

* 提高它的 currentEpoch 计数
* 向主节点们请求投票`FAILOVER_AUTH_REQUEST`
* 然后等待回复（最多等 `NODE_TIMEOUT` 这么长时间）

投票者主:

* 判断该从节点的主节点是否被标记为 FAIL
* 主节点保留上次投票的纪元lastVoteEpoch, 如果请求中 currentEpoch 小于 lastVoteEpoch, 拒接投票
* 主节点投票 `FAILOVER_AUTH_ACK`，会带上从请求中的`currentEpoch`, 并且在 `NODE_TIMEOUT` * 2 这段时间内不能再给同个主节点的其他从节点投票

#### 成功流程:

* 从节点收到了大多数主节点的回应，那么它就赢得了选举
* 该从设置 configEpoch 为 currentEpoch（选举开始时生成的）
* 该从用 ping 和 pong 数据包向其他节点宣布自己已经是主节点，并提供它负责的哈希槽
* 其他节点会检测到有一个新的主节点（带着更大的configEpoch）在负责处理之前一个旧的主节点负责的哈希槽，然后就升级自己的配置信息
* 旧主节点的从节点，或者是经过故障转移后重新加入集群的该旧主节点，不仅会升级配置信息，还会配置新主节点的备份。

#### 失败流程:

* 如果无法在 `NODE_TIMEOUT` 时间内访问到大多数主节点，那么当前选举会被中断并在 `NODE_TIMEOUT` * 4 这段时间后由另一个从节点尝试发起选举

### 服务器哈希槽信息的传播规则

个体持续交流使用的 ping 包和 pong 包都包含着一个头部，这个头部是给发送者使用的，为了向别的节点宣传它负责的哈希槽

传播和更新规则:

* 如果一个哈希槽是没有赋值的，然后有个已知节点认领它，那么我就会修改我的哈希槽表，把这个哈希槽和这个节点关联起来 (节点初始化时, 通过redis-trib实现)
* 如果一个哈希槽已经被赋值了，有个节点它的 configEpoch 比哈希槽当前拥有者的值更大，并且该节点宣称正在负责该哈希槽，那么我们会把这个哈希槽重新绑定到这个新节点上 (出现在slave提升)

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

* READONLY

  开启slave可读

* READWRITE

  取消slave可读

* CLUSTER SLAVES node-id

  获得指定master的slave, 格式同`CLUSTER NODES`

---

## 参考资料

* <http://redis.io/topics/cluster-spec>
* <http://redisdoc.com/topic/cluster-spec.html>
* <http://www.redis.cn/topics/cluster-spec.html>
