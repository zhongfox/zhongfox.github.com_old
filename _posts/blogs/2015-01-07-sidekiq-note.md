---
layout: post
categories: [blog, ruby]
tags : [cache, redis, sidekiq]
title: Sidekiq笔记
---
{% include JB/setup %}


## client

* 普通job

      MyWorker.perform_async(1, 2, 3)
      SomeClass.delay.some_class_method(1, 2, 3)                      # 实例方法也行, 但是不推荐
      Sidekiq::Client.push('class' => MyWorker, 'args' => [1, 2, 3])  # Lower-level generic API
      Sidekiq::Client.push('class' => 'MyWorker', 'args' => [1, 2, 3])  # Can also pass class as a string.

  `HardWorker.perform_async('bob', 7)` 创建:
  
  * `#{client命名空间}:queue:default` (list) 存放job, 大概结构:

        "{\"retry\":true,
          \"queue\":\"default\",
          \"class\":\"HardWorker\",
          \"args\":[\"bob\",7],
          \"jid\":\"9ecb42764a7a3632828daed2\",
          \"enqueued_at\":1420603909.9561894
        }"

  数据在执行后会删掉

  * `#{client命名空间}:queue` (set) 记录了不包含命名空间的队列名字, 如 "default"

* Scheduled Jobs

  `HardWorker.perform_in(5.minutes, 'bob', 90)` 创建`#{命名空间}:schedule` (zset) 数据类似

      {\"retry\":true,
        \"queue\":\"default\",
        \"class\":\"HardWorker\",
        \"args\":[\"bob\",90],
        \"jid\":\"7d5a535954d0b2ddf37ad3c6\",
        \"enqueued_at\":1420629780.7888222
      }
      1420683139.6217363  权重应该是对应执行时间

  数据在执行后会删掉
  
* Delayed jobs

  存储类似Scheduled Jobs

      UserMailer.delay.welcome_email(@user.id)
      UserMailer.delay_for(5.days).find_more_friends_email(@user.id)
      UserMailer.delay_until(5.days.from_now).find_more_friends_email(@user.id)

      User.delay.delete_old_users('some', 'params')
      @user.delay.update_orders(1, 2, 3) #不推荐在实例上调用
      User.delay_for(2.weeks).whatever
      User.delay_until(2.weeks.from_now).whatever

      MyClass.delay.some_method(1, 'bob', true)

      MyClass.delay(:retry => false).some_method(1, 2, 3)
      MyClass.delay_for(10.minutes, :retry => false).some_method(1, 2, 3)

* 关闭

  * `USR1`: 首先尝试, USR1 tells Sidekiq to stop pulling new work and finish all current work
  * `TERM`: 最后尝试, TERM tells Sidekiq to exit within N seconds, where N is set by the -t timeout option and defaults to 8

---

## server

* `bundle exec sidekiq`

  执行一个job的输出:

      2015-01-07T06:21:34.358Z 7501 TID-5ki4s HardWorker JID-9ecb42764a7a3632828daed2 INFO: start hard work bob 7
      2015-01-07T06:21:34.645Z 7501 TID-5ki4s HardWorker JID-9ecb42764a7a3632828daed2 INFO: done: 0.286 sec

  创建:

  * `#{命名空间}:stat:processed`(string) : 计数器, 已经处理的job个数
  * `#{命名空间}:stat:processed:#{当天date}`(string): 应该是当天计数器
  * `#{命名空间}:stat:processes`(set): 记录服务端进程, 内容如`zhonghua-ThinkPad-Edge-E440:3120` 数字是server进程id
  * `#{命名空间}:#{host name}:3120` (hash) 未知

---

## 配置

* 默认配置文件`config/sidekiq.yml`
* 运行时指定配置文件`sidekiq -C 配置文件`
* 运行时指定队列和权重: `sidekiq -q critical,2 -q default`
* 运行时指定并发: `sidekiq -c 10` 默认一个进程25个并发, 注意`config/database.yml`中pool需要设置一致或者相近
* worker指定队列`sidekiq_options :queue => :critical`

  其他配置:
  retry: 默认 true, 除了true/false还可以
  backtrace: 默认false, 错误的堆栈信息是否在UI的retry 中展示, 还可以设置为行数

* 可以在`config/initializers/sidekiq.rb` 中 修改各种默认配置, 如`Sidekiq.default_worker_options = { 'backtrace' => true } `

  默认检测新job的间隙是15s(每个并发独立计算), 可以修改`Sidekiq.configure_server { |config| config.poll_interval = 25 }`

* 配置文件指定：

      ---
      :concurrency: 5
      :pidfile: tmp/pids/sidekiq.pid
      :logfile: ./log/sidekiq.log  #指定日志文件
      staging:
        :concurrency: 10
      production:                #指定环境的配置会覆盖上面全局配置
        :concurrency: 20
      :queues:
        - default
        - [myqueue, 2]

---

## 日志

* 默认日志是STDOUT, 运行时指定日志`bundle exec sidekiq ... -L log/sidekiq.log`
* worker 的 perform 方法中可以使用`logger.info` `logger.debug`记录日志

---

## API

* `Sidekiq::Workers.new` 是活跃的线程集合(可能是多个进程中的)
* `Sidekiq::Queue.new` 是等待执行的普通job集合
* `Sidekiq::ScheduledSet.new` 等待执行Scheduled Jobs 的集合
* `Sidekiq::RetrySet.new` 重试集合
* `Sidekiq::ProcessSet.new` 服务端进程集合
* `Sidekiq::Stats.new` 状态信息如processed, failed, queues, enqueued

---

## 最佳实践

1. Make your jobs input small and simple

   the arguments to your worker must be simple JSON datatypes (numbers, strings, boolean, array, hash)

2. Make your jobs idempotent(幂等) and transactional

   因为可能retry, 所以需要幂等

3. use a process supervisor like runit or upstart to manage Sidekiq (or any other server daemon) versus something like nohup or the -d flag

---

## 参考资料

* <https://github.com/mperham/sidekiq/wiki>
