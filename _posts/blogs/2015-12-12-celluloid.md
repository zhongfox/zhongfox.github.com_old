---
layout: post
categories: [blog, ruby]
tags : [celluloid, ruby, thread, actor]
title: Celluloid
---
{% include JB/setup %}

## Actor

* Actor模型为并行而生, Actor模型的理念非常简单：天下万物皆为Actor，Actor之间通过发送消息进行通信。Actor模型的执行方式有两个特点：
  1. 每个Actor，单线程地依次执行发送给它的消息。(原生多线程操作时需要加锁的地方, Actor采用此机制实现)
  2. 不同的Actor可以同时执行它们的消息。 (Actor实现了原生多线程的并非性)

* 提到Actor模型的实现就不得不提Erlang。Erlang专以Actor模型为准则进行设计，它的每个Actor被称作是“进程（Process）”，而进程之间唯一的通信方式便是相互发送消息。一个进程要做的，其实只是以下三件事情：

  1. 创建其他进程
  2. 向其他进程发送消息
  3. 接受并处理消息

* Actor模型的任务调度方式分为“基于线程（thread-based）的调度”以及“基于事件（event-based）的调度”两种

* Actor的关键是: 不共享数据, 需要共享的数据存到Actor实例中, 单个Actor对于接受到的消息是顺序执行, 保证了线程安全

---

## Celluloid

对[A gentle introduction to actor-based concurrency](https://practicingruby.com/articles/shared/nkhaprcgwrpv) 中经典的解释性代码解读

    require 'thread'

    module Actor  # To use this, you'd include Actor instead of Celluloid
      module ClassMethods
        def new(*args, &block)
          Proxy.new(super)
        end
      end

      class << self
        def included(klass)
          klass.extend(ClassMethods)
        end

        def current
          Thread.current[:actor]
        end
      end

      class Proxy                #include Celluloid后的对象都是一个代理对象
        def initialize(target)
          @target  = target      #原始对象
          @mailbox = Queue.new   #存放异步执行的消息
          @mutex   = Mutex.new
          @running = true

          @async_proxy = AsyncProxy.new(self) #延迟执行的代理对象

          @thread = Thread.new do
            Thread.current[:actor] = self    #Actor.current 就是当前线程的代理对象
            process_inbox
          end
        end

        def async              #延迟执行代理
          @async_proxy
        end

        def send_later(meth, *args)
          @mailbox << [meth, args]
        end

        def terminate
          @running = false
        end

        def method_missing(meth, *args) #立即消息, 直接调用, 没用async, 将马上在线程中同步执行
          process_message(meth, *args)
        end

        private

        def process_inbox   # 循环执行邮箱中的延迟消息
          while @running
            meth, args = @mailbox.pop
            process_message(meth, *args)
          end

        rescue Exception => ex
          puts "Error while running actor: #{ex}"
        end

        def process_message(meth, *args)   #同步执行消息, 不管是立即还是延迟消息
          @mutex.synchronize do
            @target.public_send(meth, *args)
          end
        end
      end

      class AsyncProxy
        def initialize(actor)
          @actor = actor
        end

        def method_missing(meth, *args)
          @actor.send_later(meth, *args) #延迟代理对象把消息存到代理对象的邮箱中
        end
      end
    end

### 总结

* 每个使用Celluloid的类都变成了一个拥有自己的执行线程的Actor。
* Celluloid库通过async代理对象截获了方法调用，并将其保存到相应Actor的邮箱（mailbox）中。Actor的线程将按照顺序，一个接一个地执行前面保存起来的方法。
* 这种行为使得我们无须显式地管理线程和互斥锁同步。Celluloid库以一种面向对象的方式在幕后处理了这些问题。
* 如果我们将所有数据封装进Actor对象中，那么就只有Actor的线程能够访问和修改它自己的数据了。这样就避免了两个线程同时写入临界区，从而消除了死锁和数据损坏的风险

### 使用

* 引用 `require 'celluloid/current'`

* Async

  `#async.other_method`: 在actor线程中异步顺序执行, 立即返回值是`#<Celluloid::Proxy::Async(SomeClass)>`

* Future

  `#future.other_method`: 立即返回`#<Celluloid::Future:0x.....>`对象, 异步顺序执行

  通过返回值的`Celluloid::Future#value`阻塞获得返回值, 阻塞的是当前执行线程(多半是主线程)

  `future = Celluloid::Future.new { 2 + 2 }` 独立的Future, 在内置线程池中异步执行, 多个此类Future会并发执行

  If an exception occured during the method call, the call to future.value will reraise the same exception

* Actor lifecycle

  Actor 不会自动被垃圾回收, 需要调用`#terminate` 自行回收, 调用后, actor未完成的消息也不会被处理. 线程被回收.

  link机制是例外:  Linking automates much of the headache involved in managing the lifecycle of groups of actors, allowing you to start up and shut down actors in large groups instead of micromanaging each one

* Signaling

  `#wait :some_key` 会阻塞当前执行线程, 等待唤醒, 所有一般不在主线程中执行, 而一般在actor中执行

  `#signal :some_key, value` 唤醒等待的actor, value成为wait的返回值

* Celluloid::Condition

  用法差不多: `condition.wait` 阻塞等待, `condition.signal(value)` 唤醒并传值

* Notifications

  Actor `include Celluloid::Notifications`

  订阅`#subscribe(topic_string, method)`

  发布`#publish(topic_string, *payload)`

  在Actor外也可以发布`Celluloid::Notifications.publish ...`

* Linking

  Whenever any unhandled exceptions occur in any of the methods of an actor, that actor crashes and dies

  actor 可以通过`Actor#link other_actor`链接起来, 这样的话, crash 消息将会通过link传递, 会kill掉相互链接的actor

  actor可以通过声明`trap_exit :some_method`捕获crash 消息, 从而阻止自己被kill

* Registry

  注册actor: `Celluloid::Actor[:some_name] = a_actor`

  访问: `Celluloid::Actor[:some_name]` 或者`Celluloid::Actor.some_name`

  The main use of the registry is for interfacing with actors that are automatically restarted by supervisors when they crash

* Supervision

  功能已经独立到新的gem, 旧文档不适用, 参见<http://www.rubydoc.info/gems/celluloid-supervision/0.20.5>

  监控每个 actor 的运行，如果 crashed 可以重启。

  普通actor 中出现未处理的异常时就会down掉, 后续未完成的消息不会被执行, 添加新消息也没有反应(TODO)

  `supervisor = SomeClass.supervise as: 'a_actor_name'` 返回 `Celluloid::Supervision::Service::Public::...`, 同时也会创建一个name为`a_actor_name`的actor

  还会自动注册, 因此可以通过`Celluloid::Actor[:a_actor_name]`获取

  actors可以通过`supervisor.actors`获取

* Supervision Container

  原来的SupervisionGroups, 文档还不是很完善, 参见<https://github.com/celluloid/celluloid-supervision>

* Timers

  actor使用`#after`设置一个定时器: ` after(3) { puts "Timer fired!"; @fired = true }` 返回一个定时器对象`#<Timers::Timer:...`

  Timers::Timer的`#reset`方法可以重置定时(重新开始)

  `#every`循环定时器

* Fault Tolerance

  TODO

* Exclusive

  TODO

* Finalizers

  用类方法声明一个actor退出时的钩子方法: `finalizer :some_method`

* Pool

  Celluloid 通过类方法 pool 提供一种代理池机制: `pool = MyActor.pool`

  通常情况下，pool 方法会会为每个cpu 核心创建一个 MyWorker cell，这意味着，无论你向 pool 发送什么任务，你都将自动获得并发访问特性

  pool行为上表现类似一个actor实例, 但是pool的每个worker会对应创建一个actor

  pool 会自动调度将请求转发至 pool 中的某个 worker

  GIL 问题：

  如果你使用的是 JRuby 或 Rubinius，Celluloid 将充分利用多路多核 CPU 的并发性能。
  如果你使用的是 MRI/YARV，由于 GIL 的限制，无法并发执行，你只能得到并发 I/O，无法并发运算

  容错性：

  worker 中如果产生了未捕获的异常将导致 worker crashed，同时这个异常将在 caller 中触发。
  但一般你不用操心这个问题。pool 会自动重新创建一个新的 worker 来取代 crash 掉的 worker。
  这个特性在创建一个稳定的可容错的持久性网络连接时会非常有用，因为一旦故障，一个新的 worker 会立即取代故障的 worker`

* Finite State Machines

  TODO


---

## 参考资料

* <http://blog.zhaojie.me/2009/05/a-simple-actor-model-implementation.html>
* <http://www.oschina.net/translate/ruby-gentle-introduction-to-actor-based-concurrency>
* <https://github.com/celluloid/celluloid/wiki>
* <https://github.com/celluloid/celluloid/wiki/Tutorials>
