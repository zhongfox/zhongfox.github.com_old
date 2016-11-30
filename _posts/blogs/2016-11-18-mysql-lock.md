---
layout: post
categories: [blog, mysql]
tags : [mysql, lock]
title: Mysql 中的锁
---
{% include JB/setup %}

## 锁

* 不同mysql存储引擎支持不同的锁机制

  InnoDB 支持行锁和表锁, 默认是行锁

  | 锁类型     | 行锁 | 页面锁 | 表锁 |
--|------------|------|--------|------|
  | 开销       | 大   | 介于   | 小   |
  | 加锁效率   | 慢   | 介于   | 快   |
  | 死锁可能   | 可能 | 可能   | 不会 |
  | 锁粒度     | 小   | 介于   | 大   |
  | 锁冲突概率 | 低   | 介于   | 高   |
  | 并发度     | 高   | 介于   | 低   |
  {: class="table"}

* `show status like 'table%';`

  如果Table_locks_waited的值比较高，则说明存在着较严重的表级锁争用情况


---

## 悲观锁

具有强烈的独占和排他特性

> 只有数据库层提供的锁机制才能真正保证数据访问的排他性


使用:

1. 开始事务:

   `begin;/begin work;/start transaction;`

2. 加悲观锁锁查询:

   `select status from goods where id=1 for update;`

3. 修改:

   `update...`

4. 提交事务:

   `commit;/commit work;`

在上述过程中, 对于被锁的实体(行或者表) `SELECT ... FOR UPDATE` 或`LOCK IN SHARE MODE`需要等待该实体的事务结束, 才能继续进行, 对该实体的普通select不受影响

简单说: 写锁对写锁具有排他性

---

### 锁行/锁表

* InnoDB默认Row-Level Lock，所以只有「明确」地指定主键，MySQL 才会执行Row lock (只锁住被选取的数据) 

  `select * from goods where id=1 for update` 有主键, 行锁


  如果主键不明确(TODO) 也会造成表锁

* 如果明确指定索引, 也是行锁(TODO)

* 否则MySQL 将会执行Table Lock (将整个数据表单给锁住)

  `select * from goods where name='道具' for update`  无主键, 表锁

悲观锁大多数情况下依靠数据库的锁机制实现，以保证操作最大程度的独占性。如果加锁的时间过长，其他用户长时间无法访问，影响了程序的并发访问性，同时这样对数据库性能开销影响也很大

---

## 乐观锁

乐观锁假设认为数据一般情况下不会造成冲突，所以在数据进行提交更新的时候，才会正式对数据的冲突与否进行检测

```sql
update t_goods
set status=2,version=version+1
where id=#{id} and version=#{version};
```
如果更新失败则重新获取version等数据, 重试.

不依赖数据库锁, 数据库压力小




