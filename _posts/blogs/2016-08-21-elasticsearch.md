---
layout: post
categories: [blog, nosql]
tags : [distributed, elasticsearch]
title: Elasticsearch
---
{% include JB/setup %}

## 入门

### 特点

* 分布式的实时文件存储，每个字段都被索引并可被搜索
* 分布式的实时分析搜索引擎
* 可以扩展到上百台服务器，处理PB级结构化或非结构化数据
* 提供 RESTful API
* 面向文档(document oriented)

### 术语

> Relational DB -> Databases -> Tables -> Rows -> Columns  
  Elasticsearch -> Indices   -> Types  -> Documents -> Fields

---

## 分布式集群

* 节点(node)

  就是一个Elasticsearch实例

* 集群(cluster)

  由一个或多个节点组成，它们具有相同的cluster.name，它们协同工作，分享数据和负载。

  当加入新的节点或者删除一个节点时，集群就会感知到并平衡数据

  集群中一个节点会被选举为主节点(master),它将临时管理集群级别的一些变更，例如新建或删除索引、增加或移除节点等。主节点不参与文档级别的变更或搜索，这意味着在流量增长的时候，该主节点不会成为集群的瓶颈

  client能够与集群中的任何节点通信，包括主节点。每一个节点都知道文档存在于哪个节点上，它们可以转发请求到相应的节点上。我们访问的节点负责收集各节点返回的数据，最后一起返回给客户端

* 集群健康检查

  > `GET /_cluster/health`

  其中status:

  * green: 所有主要分片和复制分片都可用
  * yellow: 所有主要分片可用，但不是所有复制分片都可用
  * red: 不是所有的主要分片都可用


---

## 索引

* 索引只是一个用来指向一个或多个分片(shards)的“逻辑命名空间(logical namespace)”

* 索引名字: 必须是全部小写，不能以下划线开头，不能包含逗号

* 默认情况下，文档中的所有字段都会被索引（拥有一个倒排索引）

* 创建索引

      PUT /blogs
      {
         "settings" : {
            "number_of_shards" : 3,
            "number_of_replicas" : 1
         }
      }

* 当索引创建完成的时候，主分片的数量就固定了，但是复制分片的数量可以随时调整:

      PUT /blogs/_settings
      {
         "number_of_replicas" : 2
      }


* 默认情况下，一个索引被分配5个主分片

---

## 分片

* 一个分片(shard)是一个最小级别“工作单元(worker unit)”,它只是保存了索引中所有数据的一部分

* 分片可以是主分片(primary shard)或者是复制分片(replica shard)

* 复制分片可以提供读请求，比如搜索或者从别的shard取回文档

---

## 文档

* 文档是不可变的——它们不能被更改，只能被替换

* 文档元数据:
  * `_index`: 文档存储的地方
  * `_type`: 文档代表的对象的类, 名字可以是大写或小写，不能包含下划线或逗号
  * `_id`: 文档的唯一标识, 一个字符串, `_index`和`_type`组合可以在Elasticsearch中唯一标识一个文档

* 创建

  * 使用自定义ID (把文档存储到某个ID对应的空间, PUT: update)

        PUT /{index}/{type}/{id} 返回值中元数据`created` 是true
        {
          "field": "value",
          ...
        }

    PUT 如果传入参数index,type,id是存在的, 则会变成全量更新, 此时可以通过参数强制声明为create:

    > PUT /{index}/{type}/{id}?op_type=create  
      PUT /{index}/{type}/{id}/_create

    这种情况如果重复创建将返回409

  * 自增ID (把这个文档添加到某个type下, POST: create)

        POST /website/blog/
        {
          "title": "My second blog entry",
          "text":  "Still trying this out...",
          "date":  "2014/01/01"
        }

    自动生成的ID有22个字符长，URL-safe, Base64-encoded string universally unique identifiers, 或者叫 UUIDs

* 查询

      GET /{index}/{type}/{id}
      {
         "_index": "foxtest",
         "_type": "person",
         "_id": "1",
         "_version": 1,
         "found": true, //如果存在为true, 否则false
         "_source": {
            "name": "zhong",
            "age": 18
         }
      }

  * 如果只需要原始数据, 不需要元数据: `GET /{index}/{type}/{id}/_source`
  * 参数 pretty: 美化输出json
  * `?_source=title,text` 检索一部分字段
  * 存在性检测: `HEAD /{index}/{type}/{id}` 返回只有状态码, 存在200, 不存在404

* 更新整个文档

  > PUT /{index}/{type}/{id}

  和自定义ID创建的一样, 不过返回值中元数据`created` 是false

  `_version` 增长; 旧版本文档不会立即消失，但你也不能去访问它。Elasticsearch会在你继续索引更多数据时清理被删除的文档

  注意这是全量更新, 如果有的字段没带上, 将认为这些字段是删除掉

* 局部更新

  > `POST /{index}/{type}/{id}/_update`
  > {...} //它会合并到现有文档中——对象合并在一起，存在的标量字段被覆盖，新字段被添加

  使用Groovy脚本局部更新: TODO

* 删除

  > DELETE /{index}/{type}/{id}

  找到删除成功: 200 且 json 中`"found" : true`

  未找到: 404 且 json 中`"found" : false`

* 乐观并发控制

  在更新时带上version参数, 如`?version=1`, 如果数据库中`_version`和参数一致, 才会更新

  注意url中参数是version, 但数据库字段名是`_version`

  如果出现版本不一致, 拒绝更新返回`409 Conflict`

* 外部版本号

  除了使用`_version`最为版本控制戳, 还可以自定义使用其他字段

  参数`version_type`用于指定外部字段名, 仍使用参数version作为外部字段的value

  使用外部版本号的区别:

  * 它不再检查`_version`是否与请求中version指定的一致，而是检查数据库`_version`是否小于参数。如果请求成功，外部版本号就会被存储到`_version`中
  * 外部版本号不仅在索引和删除请求中指定，也可以在创建(create)新文档中指定

* 批量查询

  检索不同index, 不同type:
  > POST /\_mget  
  > {docs: [  
  >   {...} //\_index、\_type、\_id必要,\_source可选, 指定返回的字段  
  >]}

  如果在同一个索引内
  > POST /{index}/{type}/\_mget  
  > {docs: [  
  >   {...} //\_type、\_id` 或者只有\_id, \_source可选  
  >]}

  如果在同一个索引和type内
  > POST /{index}/{type}/\_mget  
  >  { "ids" : [ "2", "1" ] }

  批量结果:

  > { "doc": [{"found": true ...}, {"found": false ...}] }

  且状态码始终是200

* 批量操作

  TODO

---

## 分布式实现

* 分片算法:

  > shard = hash(routing) % numberOfPrimaryShards

  routing默认使用id, 也可以自定义

  由此可以看出主分片数量不可修改的重要性

* 自定义:

  所有的文档API（get、index、delete、bulk、update、mget）都接收一个routing参数，它用来自定义文档到分片的映射

* 写流程

  新建、索引和删除请求都是写(write)操作，它们必须在主分片上成功完成才能复制到相关的复制分片上

  wirte的默认流程(假设需要写数据在P0):

      node1(R0, P1)
      node2(R0, R1)
      node3(P0, R1)

      1. client -> node1
      2. node1 -> node3 请求转发
      3. node3 执行write
      4. node3 -> node1, node2 到同步复制节点
      5. node1, node2 -> node3 回复写成功
      6. node3 -> node1 回复写成功
      7. node1 -> client 回复写成功

* NWR

  * replication: 默认sync, 如果改成async, 主写到从将是异步, 对应上面(4, 5)步骤
  * consistency: 默认主分片在尝试写入时需要规定数量(quorum)或过半的分片（可以是主节点或复制节点）可用
    默认quorum(过半), 可以设置为one(主分片), all(所有主从)
  * 参数timeout: 如果分片不足, es将等待足够分片出现, 默认一分钟, 可以调整

---

## 参考

* [Elasticsearch 权威指南（中文版）](http://es.xiaoleilu.com/)
