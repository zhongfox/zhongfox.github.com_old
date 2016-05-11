---
layout: post
categories: [blog, server]
tags : [distributed, CouchBase]
title: CouchBase
---
{% include JB/setup %}

# 0 简介

* 流行缓存系统 memcached/redis 的不足

  * Cluster 不足: 扩展性, 负载均衡, 高可用

    (memcached 无备份节点, 高可用不强; redis集群增删节点需要人工介入, 负载不均)

  * 持久化问题: cache失效恢复时间长; cache失效带来惊群效应

    (memcached没有持久化, redis 的持久化会造成系统间歇性的负载很高)

    (题外话)惊群效应: 主要指资源竞争, 当你往一群鸽子中间扔一块食物，虽然最终只有一个鸽子抢到食物，但所有鸽子都会被惊动来争夺，没有抢到食物的鸽子只好回去继续睡觉， 等待下一块食物到来。这样，每扔一块食物，都会惊动所有的鸽子，即为惊群。对于操作系统来说，多个进程/线程在等待同一资源是，也会产生类似的效果，其结 果就是每当资源可用，所有的进程/线程都来竞争资源

* CouchBase 特点:

  * 对等节点: 可容忍任何单节点失效(比对主从节点方式); (读写负载可以均匀分布在系统的不同节点上, 更高的读写并发)
  * 高可用: 多节点备份, 可容忍单节点失效
  * online rebalancing
  * vBucket设计:
    * 自动分片(auto-sharding of data across nodes): 以 vBucket 为单位的主从备份, 可以方便灵活的把数据的子集在不同节点上移动，以实现集群动态管理
    * 动态扩容: 增删节点很方便
  * 专业管理界面
  * RESTAPI, 方便其他系统集成
  * Smart Client: 同步 vBucket 表, 在客户端实现负载均衡, 高效应对节点失效

---

# 1. Concepts and architecture

## 1.1 CouchBase Server concepts

### 1.1.1 Data model

* K-V数据
* 文档数据(JSON)

**文档**

* JSON, 可以嵌套, 没有严格schemas

* 相对独立的文档, 对可扩展行和延时至关重要, 文档备份和修改不会影响其他文档, 这对水平扩展很重要

* 动态的schema:
  * CouchBase 的schema 是指json结构, 完全是由application程序控制
  * schema只需要定义在application 程序, 而不需要在application和db都需要同步存在
  * 文档多样性, 减少不必要的null值
  * 适应数量上的多样性: 嵌套文档(array)可多可少

* 文档结构设计:
  * 少量但是复杂的文档: 更好的扩展性(文档之间关系更少) 和性能(一次操作可以同时读写多个属性, 更好的原子性)以及更好的一致性
  * 简单但是大量的文档: 如果读取方式都是可预见的少量读取, 简单文档应该优先, 可以减少网络传输

* 支持JOIN操作

### 1.1.2 Data access

* Key-Value access

  KV store is an extremely simple, schema-less approach to data management


  V 可以是blob 或者 JSON, json会被N1QL和MapReduce使用

  提供 simple CRUD (Create, Read, Update, Delete) APIs, 都是原子性

  querying the KV store directly will always access the latest version of data

  * KV: 高效访问, 强一致性, 简单访问
  * N1QL: 丰富的查询接口, 最终一致 (貌似可以指定版本)
  * MapReduce: 最终一致


* N1QL

  great for fast access to your data for operations such as secondary lookup on attributes in your JSON document

  接近SQL, 快速熟悉

  optimized for modern, highly parallel multi-core execution

  可以处理变量和嵌套结构

  处理json, 返回json格式给application

* MapReduce views

* Full text search

### 1.1.3 Indexing

### 1.1.4 Data management

* 文档操作是原子性, 对一个文档的属性操作要么都成功要么都不成功, (跨文档操作原子性需要其他方式)

* 关于CAP, couchbase默认配置主要是CP:

  application 直接读写数据所在的node

  replicas are primarily for the purpose of high availability and by default do not service any traffic until made active ??

  关于P: 当一个node down, 在改node上的部分数据将不可写, 直到完成失效转移; 读一直可用, 因为有备份数据

* cross datacenter replication (XDCR): 跨多集群数据复制: 提高可用性

* Couchbase Lite 可以提高mobile数据的可用性: 保留用户改动, 有网络后再推送到服务器

* 默认情况下,  indexes and replicas 的同步是异步进行的, 目的是更好的性能

  per-write or per-query 可以选择放弃一部分性能而获得更好的可靠性(对于复制而言)或者更好的一致性(对于查询而言)

* 索引是增量构建

* 写操作是异步的, 当写入内存后, data manager就会发送ACK给客户端, 紧接着会把数据写入硬盘和备份集群以及索引队列

  为了 increase tolerance to failures, 可以配置在以上操作都成功后再发送ACK, 会增加客户端延迟

* CouchBase 提供悲观锁和乐观锁避免并发问题

  乐观锁是基于Compare-and-Swap (CAS): 唯一且原子增长的标识, 是文档metadata的一部分, 多个更新操作依赖这个值: application在写的时候传入这个值, couchbase在执行更新操作前, 需要验证这个值是没有变化的.

  悲观锁不常用

* 数据可以设置有效期(TTL), 过期后会自动删除, 数据可以被touch, 以更新过期时间

### 1.1.5 Distributed data management

* 所有node都是对等节点; 集群容量可以通过简单增删节点实现
* node结构都一样

#### 1.1.5.1 node组成架构

* cluster manager

   configuring nodes, monitoring nodes, gathering statistics, logging, and controlling data rebalancing among cluster nodes. The cluster manager determines the node’s membership in a cluster, responds to heartbeat requests, monitors its own services and repairs itself if possible

   在node中会选一个作为orchestrator: 维护权威的集群配置, 解决node交互的冲突, 当某node下线时通知其他node, 激活备份数据(failover)

  如果orchestrator下线, 集群将自动选出新的orchestrator

* data service

  处理数据管理操作,数据存储和获取, 比如KV的GET/SET, 构建维护 MapReduce views

  构成: managed cache (based on memcached), a storage engine, and the view query engine

* query service

  维护(创建.删除)索引

  接收data service 数据变更后的通知, 更新索引

* index service

  处理N1QL查询解析, 优化和执行, index service需要和data service和query service交互, 然后将数据返回application

* Storage Layer

  处理数据从内存到硬盘, 以及必要时从硬盘到内存

  将收到的写操作追加到AOF文件, 该文件在node重启时可能重放到cache中

<img src="/assets/images/couchbase/node.png" />


* couchbase 周期性地执行数据文件和索引文件压缩, 以节约空间

* node内建多线程 Managed Cache, data service和index service均使用

  data service 使用的cache基于memcached, application可以使用memcached协议进行交互; Couchbase可以用于替代memcached

#### 1.1.5.2 Multidimensional scaling

multidimensional scaling (MDS) 运行集群中的某些node打开/关闭某些服务, 以适应特定的工作场景

优势:

* 各服务可以独立进行伸缩, 比如数据集增长需要对data service进行扩容
* query和index service 对于index存在于少量node情况下, 更加高效
* 可以指定机器做指定的工作, 比如cpu较多的机器处理query需求
* 隔离不同的工作流

MDS示例:

<img src="/assets/images/couchbase/mds.png" />

#### 1.1.5.3 Buckets and vBuckets

* bucket 是逻辑上文档的聚合, 类似关系数据库中的database
* application 直接和bucket交互, 一个bucket里可以有多种schemas
* vBuckets类似一个数据分区的概念, auto-sharding将vBuckets分不到不同的nodes, vBuckets用于实现复制, 失效转移, 动态集群配置
* 一个bucket分为1024个激活vBuckets和1024个复制vBuckets
* cluster map 是vBuckets 和node的动态映射关系, application通过map实现smart client

#### 1.1.5.4 Replication

* 集群自动对active data进行备份, 将备份数据分布到不同的node, 并持续维护
* 最多可以有3个备份, 也就是4份数据
* 每个node都备份一部分其他node的部分数据(通过vBuckets), 没有单点失效问题
* failover过程: 一个node失效, 集群激活这个node对应的备份数据, 这个过程可以是自动或者手动
* 除了增加高可用, 在failover 完成之前, 集群还可以允许对失效数据的读操作?how?
* 默认情况, replicas目的只是高可用, 而不提供数据服务, 这样可以实现更好的一致性 (读写都只有一份数据)

#### 1.1.5.5 Client topology awareness

* client 自动感知集群中3中服务(data, index, query)的变化
* 一个client在启动是通常配置多余一个的集群server node ip
* client基于集群拓扑变化通知, 本地保留并维护集群map, 因此可以在读写时直接定位到文档, 不需要中间代理
* client hash算法:  CRC32 hash对应到(1024个)vBuckets, 从而找到对应的vBuckets, 然后查找集群map, 找到vBuckets对应的node
* N1QL query也是类似, query service也有类似的集群map, 用于定位哪个node提供query服务, 不过query service是无状态的, 任何一个开启query service的node可以执行query

### 1.1.6 High availability and disaster recovery

### 1.1.7 Deployment and operations

* Couchbase所有的操作和部署都可以在线完成, 而不会影响在运行的application
* 管理和监控操作可以通过以下方式进行: web console, 命令行, REST API
* 管理操作包括以下内容:
  * 部署
  * 升级
  * 失效转移
  * 监控
  * 压缩
  * 权限管理
  * bucket 管理
  * Recover node: 失效node重新加入
  * 备份
  * Cross Data Center Replication


### 1.1.8 Security

### 1.1.9 Application development

---

## 1.2 Data modeling in Couchbase Server

数据模型主要从三个阶段理解:

* 逻辑数据模型

  描述实体(或元组)和关系; 主要包括定义:

  * 实体key: unique key, 标识实体
  * 实体属性
  * 实体间关系

* 物理数据模型

  物理模型将逻辑模型中的实体和关系, 映射到物理容器中

  couchbase物理容器和关系型数据库类比

  <img src="/assets/images/couchbase/data_model.png" />

  **Items**:

  * Key:  unique key, 通常用计数器或者UUID实现, key不可变, 用于在一个bucket中标识value(binary or JSON)

  * Value:

    * Binary value: 高性能(?通过压缩?) 加密文本, session等是二进制文件的典型用例
    * JSON value: 更强的表现力, 在实例和关系建模时更灵活, 可以进行索引和query

  **Bucket**:

  起到边界控制的作用

  item的聚合, 主要用于控制资源的分配, 不同的安全和存储策略, 如不同的RAM需求, 压缩需求, 高可用需求, IO需求

* 数据模型演进

  数据模型变化是开发的常态, Couchbase因为不要求schema声明, 因此更能适应数据模型演进

---

## 1.3 Data access using N1QL

---

## 1.4 Couchbase Server architecture

### 1.4.1 Terminology
### 1.4.2 Connectivity architecture
### 1.4.3 High availability and replication architecture
### 1.4.4 Storage architecture
### 1.4.5 Managed caching layer architecture
### 1.4.6 Cluster manager
### 1.4.7 Services architecture and multidimensional scaling
### 1.4.8 Views, indexing, and index service

### 1.4.9 Querying data and query data service

* Retrieving data with document key

  通过key查询, 返回该文档所有内容, 速度最快, 由data service提供

---

# 2 Administration guide

## 2.1 Couchbase Web Console

Cluster Overview

* RAM

  * Total in Cluster: 集群所有node的 `创建集群时指定的"Data RAM Quota"` 之和
  * Total Allocated: 已经分配给Bucket的内存之和 每个bucket创建时`Memory size`之和
  * Unallocated: `Total in Cluster` 中还没分配给bucket的内存
  * In Use: `Total Allocated`中bucket已经实际使用的内存, 实际数据占用
  * Unused: `Total Allocated`中还没有被bucket使用的内存

  Total in Cluster = Total Allocated + Unallocated

  Total Allocated = In Use + Unused

* Disk Overview (这个貌似和配置无关, 和集群中硬盘容量相关)

  * Total Cluster Storage: 集群硬盘总容量
  * Usable Free Space:
  * Other Data
  * In Use
  * Free

* Buckets

  * Operations per second 集群每秒操作(读写)次数
  * Disk fetches per second 集群每秒对磁盘的读次数 (写呢?)

* Servers

  * Active Servers
  * Servers Failed Over
  * Servers Down
  * Servers Pending Rebalance

---

## 2.2 Cluster setup

## 2.3 Server setup and usage limits

## 2.4 Bucket setup

## 2.4 Indexing in Couchbase

## 2.5 Security in Couchbase

## 2.6 Cross Datacenter Replication (XDCR)

## 2.7 Settings

## 2.8 Monitoring

## 2.9 Backup and restore

## 2.10 Logs

## 2.11 Troubleshooting

---

# 3 Developer guide

## 3.1 Accessing data

CRUD:

* Create(create/insert)
* Read(cat/get)
* Update(replace)
* Delete(rm)

### 3.1.1 Accessing data from a command line

* brew install libcouchbase

* cbc create / cbc-create

  `-M  --mode  <upsert|insert|replace> Mode to use when storing [Default='upsert']`

  `cbc create --mode insert somekey < test.json`

* cbc cat / cbc-cat

* cbc n1ql / cbc-n1ql

* cbc rm / cbc-rm

* 支持的命令: `ls /usr/local/Cellar/libcouchbase/2.5.6/bin/`

* Unlike most SDKs, the command line client is not JSON-aware. If dealing with JSON documents, ensure that values passed to it are well formed JSON because the cbc program does not do any validation.

Accessing data with a browser

### 3.1.3 Accessing data with a browser

TODO

---

## 3.2 Connecting

    client = (new Cluster(‘couchbase://node’)).openBucket(‘travel-sample’)
    client = new Bucket(‘couchbase://node/bucket?option1=value1&option2=value2’)
    client = new Bucket(‘couchbase://node://bucket’, ‘bucketPassword’)

* node(ip:port) 可以是任意机器node地址

* 命令行连接: `cbc 命令 命令参数 -U couchbase://node/bucket` -U 默认是`couchbase://localhost/default`

* Connect to multiple nodes: `couchbase://10.4.3.41,10.4.3.42,10.4.3.43/default`

---

## 3.3 Updating and creating documents

* insert(docid, document) 文档不存在, 才创建
* replace(docid, document) 文档存在, 才覆盖
* upsert(docid, document) 不管文档存在否, 都覆盖

* Document IDs 限制: UTF-8 编码; 不长于 250 bytes
* Document format: 大多数SDK会自动把传入的val转为json, 如果转换失败会报错, 也可以自定义是否转为json

* 附加参数:
  * TTL 过期时间
  * CAS 乐观锁防止并发

### 3.3.1 Removing documents

* `cb.remove(docid)`
* remove 也可以带上CAS值

### 3.3.2 Atomic Counters

* `cb.counter('counter_id', delta=20, initial=100).value` 

  delta 是增长值, 可正可负, initial可选, 代表如果原始没有此值的初始值

  操作会返回操作后的当前值

  CAS值无效, 因为counter操作是原子性的

  Expiration 有效

  内部使用 64-bit unsigned integer

### 3.3.3 Raw append and prepend

* append(docid, fragment)
* prepend(docid, fragment)

* 只针对二进制文档
* 原子性, 不需要CAS
* 文档必须存在, 否则要报错

* 性能考虑:

  文档不宜过长, couchbase文档上线是20MB, 最好小于100KB

  append节约了client到server的内容传输, 但是在server node之间复制还是全量复制, 所以也要尽量缩短长度

---

## 3.4 Retrieving documents

* cb.get('docid')
* cbc cat docid
* SDK 会自动转换json文档为当前平台的json
* 非JSON文档可以通过返回的flags标识
* 可以批量get
* 支持 getAndTouch, get时更新TTL
* N1QL也可以使用主键查询: `SELECT * FROM default USE KEYS ["docid"];` `SELECT * FROM default WHERE META(default).id = "docid"`

---

## 3.5 Querying with N1QL

---

## 3.6 Querying with MapReduce views

---

## 3.7 Advanced connection details

* SDK 连接集群分为2个阶段:

  * Bootstrapping:

    SDK 启动时会去连接一个node(配置的), 然后从这个node获得集群map, 包含集群所有node以及他们提供的服务

    该阶段还会处理认证和某些negotiation

    Bootstrapping 是bucket层, 每个bucket有独立的服务和认证. 所以如果连接多个bucket, 需要多个SDK实例

  * Service (data) access

    SDK直接访问node获得数据访问(kv, query, MR)

* SDK会检测到node增删, 并进行重新Bootstrap

* node 处于 fail 时, SDK 访问会出现临时错误, 直到node 完成失效转移, SDK 将停止访问失效的node

* Bootstrap 时提供冗余node:

  Bootstrap会依次连接配置node, 直到有一个成功

  冗余有必要, 但没必要所有node都配置

* 每个SDK instance (“Bucket”) 和集群有多个TCP连接:

  * KV 服务 (默认端口 11210)
  * Bootstrapping: 通常使用(in-band)KV服务信道 (默认端口 11210)
  * MapReduce (默认端口 8092)
  * Query (默认端口 8093)
  * 某些SDK可能使用 8091 作为 Bootstrap

* 某些SDK会打开以上所有连接, 有的SDK会按需打开

* KV node 有限制: 最多 10,000个并发连接

---

## 3.8 Durability

---

## 3.9 Document expiration

* 默认没有过期时间, 可以在(upsert replace insert)时设置

* getAndTouch 获取的同时修改过期时间 (某些SDK 通过get的参数实现)

* touch 不获取, 直接改过期时间

* 过期时间可以是相对当前时间, 也可以是绝对时间

* 如果想保持key的过期时间, 在后续写操作上都需要带上过期时间 (TODO 感觉不合理)

  某些操作会隐含地去掉过期时间

* 已过期数据不会马上删掉, 但是访问时会被告知不存在

  内部定时进程expiry pager会扫描并删除过期的数据

---

## 3.10 Error handling

---

## 3.11 Concurrent document mutations

* CAS(Compare And Swap) 乐观锁

* CAS 代表item当前状态, 每次item修改, CAS变化

* 当访问文档时, CAS会作为元数据返回

* 在application进行写操作时(insert, upsert, replace, remove) CAS作为可选参数

  如果存在CAS参数, 如果传入CAS和存储的CAS一致, 则执行更新, 否则执行将失败

* Handling CAS errors: 

  * 如果CAS不一致更新失败, couchbase返回错误, 根据不同语言错误可能是返回code 或者异常
  * application 通用的错误处理机制: 重新获取文档, 带上新CAS重试更新

* 带上CAS更新没有额外的开销, couchbase server 仅仅需要对比一个integer值. CAS 无论如何都是会返回的

* application 应该认为 CAS值 是不透明的, 不要去尝试理解和预判CAS返回值

---

## 3.12 Batching operations

## 3.13 Reactive asynchronous clients

## 3.14 Dealing with non-JSON documents

---

## 参考资料

* [Couchbase 4.1 官方文档](http://developer.couchbase.com/documentation/server/4.1/introduction/intro.html)
* [Couchbase 介绍 - 更好的 Cache 系统](https://segmentfault.com/a/1190000002907171)
* [Couchbase 介绍及实战](http://wenku.baidu.com/link?url=jt8TuG2IaMuil76demVE-BxJcgH9EFw-K1DC6CKghhNZGHGiXqsEQQ7zAYJQMV9cWhypOBV1_-FgYxmRhkXvOFGN_Z-FDFES46ryJCvdjSW)
* [Couchbase学习笔记](http://my.oschina.net/jewill/blog/381636)
