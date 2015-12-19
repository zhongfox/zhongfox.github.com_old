---
layout: post
categories: [blog, java]
tags : [java, Kafka]
title: Kafka
---
{% include JB/setup %}


* Broker 注册到zookeeper, 临时节点信息: `/brokers/ids/{brokder id}` 数据存储类似

  `{"jmx_port":-1,"timestamp":"1442872597263","host":"localhost","version":1,"port":9092}`

* topic 在zk的存储: `/brokers/topics/testtopic/partitions/0/state`


* Kafka 启动 `bin/kafka-server-start.sh config/server.properties`

  server.properties 主要配置:

      # broker的id. 每个broker的id必须是唯一的
      Broker.id=0
      # 存放log的目录
      log.dir=/tmp/kafka8-logs
      # Zookeeper 连接串
      zookeeper.connect=localhost:2181

* 创建一个仅有一个Partition的topic `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic testtopic`

* 启动生产者: `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic testtopic`

* 启动消费者: `bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic testtopic --from-beginning`


## 参考

* http://blog.csdn.net/beitiandijun/article/category/2664119
* http://my.oschina.net/u/1419751/blog/360060
* http://blog.csdn.net/suifeng3051/article/category/2386223
