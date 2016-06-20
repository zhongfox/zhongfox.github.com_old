---
layout: post
categories: [blog, java]
tags : [java, zookeeper]
title: zookeeper
---
{% include JB/setup %}

* zk提供以下分布式一致性特性:

  * 顺序一致性: 同一个客户端发起的事务请求会按序执行
  * 原子性: 分布式集群
  * 单一视图: zk集群的数据模型一致
  * 可靠性
  * 实时性

 * 设计目标

   * 简单的数据模型
   * 可构建集群
   * 顺序访问: 对于客户端的每个更新请求, zk都会分配一个全局唯一的递增编号, 可以反映事务操作的先后顺序
   * 高性能

* 集群角色

  * Leader 读和写
  * Follower 提供读
  * Observer 提供读, 不参与Leader选举, 不参与"过半写成功"

* 数据节点ZNode

  2个维度, 四个组合

  是否持久:

  * 持久节点
  * 临时节点: 生命周期和客户端会话绑定, 临时节点不能有子节点, 即临时节点只能是叶子节点

  是否顺序:

  * 顺序节点: 会自动在节点名加上一个数字后缀
  * 非顺序节点

* 版本: 每个ZNode记录一个stat

  * version 当前ZNode版本
  * cversion 子节点版本
  * aversion ACL版本

* 会话

  客户端和zk之间是一个TCP长连接, 通过心跳保持会话

  可以设置sessionTimeout参数, 当会话异常中断, 在此时间段内重连上任意台zk, 会话任然有效

* Watcher: 客户端可以在指定ZNode上注册事件

* ACL:

  * CREATE
  * READ
  * WRITE
  * DELETE
  * ADMIN

* ZAB

  * 所有事务必须由一个全局唯一的服务器(leader)来协调处理, 其他服务器为follower
  * leader负责将客户端请求转换为Proposal(提议), 分发给所有follower, 等待半数以上的follower的正确反馈后, leader再次向所有follower分发Commit
  * 非leader接收到客户端的事务请求, 会先转发到leader

  * 启动或者leader网络中断, 进行**恢复模式**, 选举leader; 当过半机器完成与leader数据同步, 退出恢复模式, 进入消息**广播模式**

  * Leader会为每个事务生成全局唯一递增的**事务ID(ZXID)**, 每个事务按照ZXID先后顺序排序处理

---

## 客户端脚本

* `./zkCli.sh -server 127.0.0.1:2181` 连接server

* `create [-s] [-e] path data acl` 创建节点, s 顺序节点, e 临时节点, 默认持久节点

* `ls path  [watch]` 读取子节点

* `get path [wathc]` 获得该节点的数据内容和属性

* `set path data [version]` 更新

* `delete path [version]` 删除叶子节点

属性信息:

* cZxid: 创建节点事务id
* ctime: 创建节点时间
* mZxid: 更新节点事务id
* mtime: 更新节点时间
* dataVersion: 数据版本
* version: 版本
* cversion: 子节点版本
* acersion: 节点的ACL版本号
* ephemeralOwner: 临时节点的sessionID, 持久节点为0
* dataLength: 数据内容长度
* numChildren: 子节点个数
* pzxid: 子节点列表最后一次被修改的事务ID, 只有子节点列表变更才会修改pzxid, 子节点内容变更不会


---

## 应用场景

### 1. 发布订阅

发布订阅常规的方式:

* push: 服务器推送新消息给客户端
* pull: 客户端通过轮询, 检测到新消息后, 主动拉取消息

zk实现发布订阅(如配置同步): 客户端watch节点数据变化(这是pull模式中轮询的作用), watch事件发生, TODO

### 2. 负载均衡

TODO

### 3. 命名服务

命名服务的关键在于在分布式系统中, 获得一个全局唯一的标识.

UUID的劣势: 长度太长, 含义不明

zk的实现: 在一个节点下, 创建顺序节点, 将可以得到在本节点下的全局唯一id

### 4. 分布式协调通知

通过引入一个协调者, 将分布式协调的职责从应用中分离出来, 减小系统耦合, 提高性能

实例:

#### Mysql数据复制总线

zk用于协调复制组件分布式集群

* 任务注册: 组件通过创建节点代表: `mysql_replicator/tasks/copy_hot_item`, 组件如果发现节点存在, 则不再创建
* 任务热备份: 一主多备 进行热备: 在任务节点下的instances节点下创建临时顺序子节点, 如`mysql_replicator/tasks/copy_hot_item/instances/host-1`, 通过**小序号优先**获得任务执行权, 其他机器作为STANDBY
* 热备切换: STANDBY的机器注册"子节点变更"的watch, 如果出现变更通知(RUNNING机器宕机), 则开始新一轮RUNNING选举
* 记录执行状态: 通过共享节点``mysql_replicator/tasks/copy_hot_item/lastCommit`

* 冷备切换: 组件属于一个group, 各个task也属于不同group, 一个group有多个task, 一个组件可能处理所属group中的任意task
  组件实例节点类似: `mysql_replicator/tasks/group1/copy_hot_item/instances/host-1`
  组件遍历group下的tasks, 仍然通过"最小序号有限"获得task的执行权, 不同的是, 如果没有获得执行权的组件, 会继续遍历其他task

冷热比较:

热备每个task至少需要2台机器, 冷备机器利用率更高.

#### 通用分布式系统通信

* 心跳检测: 基于zk的临时节点特性, 在zk的指定节点下, 各个分布式节点在这里创建临时节点, 可以相互检测出对方(分布式节点)是否存活.
* 工作进度汇报: 在zk指定的节点下, 各个分布式节点在这里创建临时节点, 存储自己工作进度
* 系统调度: 控制台在zk发布消息, 各个分布式节点通过事件通知获得调度消息

### 5. 集群管理

* 集群机器数量
* 集群数据收集
* 机器机器上下线

zk的特点:

* 客户端对数据节点注册watcher, 当数据节点内容或子节点变更, zk会给客户端发送变更消息
* 客户端如果与服务器会话失效, 临时节点将自动清除

实例:

#### 分布式日志收集系统

#### 在线云主机管理

### 6. Master 选举

* 常规基于mysql的master选举: 集群中所有节点向mysql中插入同一个id的主键数据, 成功者为master
  缺点: 在master宕机无法得到通知

* 基于zk: **数据强一致性** 在高并发下, 仍能保证对指定节点, 只有一个客户端创建成功
  创建成功的成为master, 不成功的watch节点变化, 当master挂掉, 进行master再选举

### 7. 分布式锁

* 排它锁
* 共享锁






---

## 参考:

* zookeeper web 工具: https://github.com/qiuxiafei/zk-web
