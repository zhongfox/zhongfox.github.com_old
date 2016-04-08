---
layout: post
categories: [blog, java]
tags : [java, Kafka]
title: Kafka
---
{% include JB/setup %}

---

## 原理

* Broker

  Controller: Kafka集群中的其中一个Broker会被选举为Controller，主要负责Partition管理和副本状态管理，也会执行类似于重分配Partition之类的管理任务。如果当前的Controller失败，会从其他正常的Broker中重新选举Controller

* Partition: 分 leader 和 followers, leader负责读写, followers 作为backup

  消息在一个Partition中的顺序是有序的，但是Kafka只保证消息在一个Partition中有序，如果要想使整个topic中的消息有序，那么一个topic仅设置一个Partition即可

  物理分区: 每个分区在物理上对应一个文件夹，以`topicName_partitionIndex`的命名方式命名，该文件夹下存储这个分区的所有消息(.log)和索引文件(.index)

* Producers:

  * Producer可以自己决定把消息发布到这个主题的哪个Partition
  * 采用异步push方式, 可以通过参数控制是采用同步还是异步方式
  * Kafka支持以消息集合为单位进行批量发送

* Message:

  * offset: 和(partition, consumer group)相关, 值指向partition中下一个要被消费的消息位置
  * 支持消息压缩, Producer端进行压缩之后，在Consumer端需进行解压
  * 消息转运过程中的可靠性: Producer会等待broker成功接收到消息的反馈（可通过参数控制等待时间）; Consumer可控制这个offset值以应对消费失败

* 消息系统的通用模式:

  * queuing（队列）

    一个ConsumerGroup中的所有Consumer, 可以认为是队列消费模式

  * publish-subscribe （发布-订阅）

    Consumer都是不同的ConsumerGroup, 可以认为是发布-订阅 (都能获取)

  在Group内部是以queuing的模式消费Partition，在Group之间是以pub-scrib模式消费

---

## 使用

* Kafka 启动 `bin/kafka-server-start.sh config/server.properties`

  server.properties 主要配置:

      # broker的id. 每个broker的id必须是唯一的
      Broker.id=0
      # 存放log的目录
      log.dir=/tmp/kafka8-logs
      # Zookeeper 连接串
      zookeeper.connect=localhost:2181
      # 这个可以设置集群
      # 默认Kafka会使用ZooKeeper默认的/路径，这样有关Kafka的ZooKeeper配置就会散落在根路径下面，如果 你有其他的应用也在使用ZooKeeper集群，查看ZooKeeper中数据可能会不直观，所以强烈建议指定一个chroot路径，直接在 zookeeper.connect配置项中指定
      # 需要手动在ZooKeeper中创建路径/kafka
      zookeeper.connect=192.168.169.91:2181,192.168.169.92:2181,192.168.169.93:2181/kafka

* 创建一个仅有一个Partition的topic `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic testtopic`

  zookeeper指定其中一个节点即可，集群之间会自动同步

* 查看已有topic: `bin/kafka-topics.sh --list --zookeeper localhost:2181`

* 启动生产者: `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic testtopic`

* 启动消费者: `bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic testtopic --from-beginning`

* 查看topic状态: `bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic foxtest`

  每行一个Partition:

  * Partition: 分区编号
  * Leader: leader 所在broker id
  * Replicas: 所有副本所在broker id
  * Isr: in-sync, 当前活跃的副本列表, 是Replicas的子集

* 停止: `bin/kafka-server-stop.sh`

* 修改/删除配置

  `bin/kafka-topics.sh —alter --zookeeper 192.168.172.98:2181/kafka  --topic my_topic_name --config key=value`
  `bin/kafka-topics.sh —alter --zookeeper 192.168.172.98:2181/kafka  --topic my_topic_name --deleteConfig key`

---

## 参考

* [kafka 文档](http://blog.csdn.net/beitiandijun/article/category/2664119)
* [apache kafka系列之在zookeeper中存储结构](http://my.oschina.net/u/1419751/blog/360060)
* [Kafka 设计与原理详解](http://blog.csdn.net/suifeng3051/article/category/2386223)
* [Kafka集群操作指南](http://www.lujinhong.com/kafka%E9%9B%86%E7%BE%A4%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97.html)
* [Kafka分区机制介绍与示例](http://lxw1234.com/archives/2015/10/538.htm)
