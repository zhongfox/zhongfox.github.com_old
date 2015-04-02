---
layout: post
categories: [blog, mysql]
tags : [mongo]
title: mongo 笔记
---
{% include JB/setup %}

## 开始

* `mongo`:

  --port 默认27017
  --host 默认localhost

* `db` 对象, 当前的数据库

* `show dbs` 展示所有数据库

* `use mydb` 切换数据库

  MongoDB will not permanently create a database until you insert data into that database

* `.help()` 可用于追加到各个方法或者(cursor object)后面, 用来查看帮助

---

## 游标对象

* 游标对象(cursor object): When you query a collection, MongoDB returns a “cursor” object that contains the results of the query

  shell 默认返回前20条, 后续需要手动遍历, 输入`it` 继续遍历后面20

  手动遍历:

      var c = db.testData.find()
      while ( c.hasNext() ) printjson( c.next() )

  数组方式操作游标: `c[2]` 返回值基于当前的游标索引, 而不是从结果最开始
  mongo first calls the cursor.toArray() method and loads into RAM all documents returned by the cursor
  此方式后, 游标遍历结束(`c.hasNext()`为false)

---

## CRUD

* `insert`

  When you insert the first document, the mongod will create both the mydb database and the testData collection

      j = { name : "mongo" }
      db.testData.insert( j )

* `find(条件)`

  查询所有: `db.testData.find()` 返回游标

  指定条件: `db.testData.find( { x : 18 } )` 返回游标

  查找一个: `db.testData.findOne( { x : 18 } )` 返回一个文档

  limit: `db.testData.find().limit(3)` 返回游标

---

## Replication

  Replica set can have only one primary

  The primary logs all changes to its data sets in its oplog

  The secondaries replicate the primary’s oplog and apply the operations to their data sets

  If the primary is unavailable, the replica set will elect a secondary to be primary

  By default, clients read from the primary, however, clients can specify a read preferences


* Priority 0: 不能作为主, 可以配置读, 可以配置投票

* `db.isMaster()` 展示集群信息和自身状态

* Hidden Replica:

  invisible to client applications, 不会接收到读,因此主要用于reporting and backups

  cannot become primary, 可以配置投票

  db.isMaster() method does not display hidden members

* Delayed Replica

  should be hidden

  Must be priority 0

  可以设置一个延迟时间(slaveDelay), 类似保存历史快照


