---
layout: link
category : link
link: https://www.coffeepowered.net/2009/01/23/mass-inserting-data-in-rails-without-killing-your-performance/
title: Rails大量数据insert优化
---


### 优化策略

1. 单个事务

   pros:

   * 避免大量数据库事务

2. 多次拼接sql：

   pros:

   * （前提是确认不需要）避免避免AD的验证回调，AD对象生成等

   cons:

   * 需要自己确保数据有效性，并对过滤有害sql
   * 多次mysql执行往返

3. 拼接单条sql

   pros：

   * （前提是确认不需要）避免避免AD的验证回调，AD对象生成等
   * 单个mysql执行往返

   cons：

   * 需要自己确保数据有效性，并对过滤有害sql

---

### 使用和性能比较

1. ActiveRecord without transaction [无策略]

        1000.times { Model.create(options) }

   测试结果：base

2. ActiveRecord with transaction [策略1]

        ActiveRecord::Base.transaction do
          1000.times { Model.create(options) }
        end

   测试结果： 1.29x faster than base

3. Raw SQL without transaction [策略2]

        1000.times do |i|
          Foo.connection.execute "INSERT INTO foos (counter) values (#{i})"
        end

   测试结果：5.07x faster than base

4. Raw SQL with transaction [策略1 + 策略2]

        Foo.transaction do
          1000.times do |i|
            Foo.connection.execute "INSERT INTO foos (counter) values (#{i})"
          end
        end

   测试结果：11.46x faster than base

5. Single mass insert [策略3]

        inserts = []
        TIMES.times do
          inserts.push "(3.0, '2009-01-23 20:21:13', 2, 1)"
        end
        sql = "INSERT INTO user_node_scores (`score`, `updated_at`, `node_id`, `user_id`) VALUES #{inserts.join(", ")}"

   因为是单条sql，所以自动会有策略1

   测试结果：70.35x faster than base

