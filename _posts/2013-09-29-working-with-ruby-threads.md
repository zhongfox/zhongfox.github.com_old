---
layout: post
category : linux
tags : [linux, thread, ruby]
title: 《Working With Ruby Threads》读书笔记
---
{% include JB/setup %}

### Chapter 0 Introduction

* `||=` 在ruby中是非线程安全的

* 进程可以实现并发，为什么还要线程呢？

  线程的并发开销更小，进程复制内存，线程共享内存，因此线程行时需要更少的资源。这意味这使用相同的资源，线程允许更多的并发单元。

* 几种ruby解释器：

  * **MRI** C ruby

  * **JRuby** Java ruby

  * **Rubinius** Ruby ruby

----

### Chapter 1 You're Always in a Thread

* 任何程序至少有一个线程：主线程`Thread.main`

  主线程退出会导致其他兄弟线程的立刻终止

* 当前线程：`Thread.current` 指向当前运行的线程

----

### Chapter 2 Threads of Execution

* 创建线程 `Thread.new { "Did it!" }`

* 在主线程中对其他线程调用join，将阻塞主线程以等待该子线程结束 `sub_threads.each(&:join)`

* 多线程是以不可预见的方式进行线程调度的,线程的上下文切换由OS控制。

* 所有ruby衍生的线程最终会映射到操作系统的本地线程上，mac上查看一个进程衍生的线程数量：

  `top -l1 -pid 8409 -stats pid,th` 如果衍生100个子线程，将由102个线程，一个main，一个ruby用于管理线程的线程

* `||=` 可以分解为以下三步：

  1)判断左值是否为nil

  2)如果为空,执行右边表达式

  3)赋予左值

  因为各个线程的上下文切换可以出现在以上任何时刻。会导致**竟态条件(race condition)**

  竟态条件是指多个线程竞争地在一个共享数据上执行操作

  与竟态条件对立的是**原子操作(atomic operation)**：即操作不会被中断的操作

  `||=`不是原子操作,在多线程编程下应该避免这种延迟初始化，可以在`initialize`中提前初始化。

* 只要有2个或2个以上的线程同时执行，就可能出现线程安全问题，考虑解决线程安全问题的2个策略：

  1) 禁止并发

  2) 保护并发修改(共享数据)

----

### Chapter 3 Lifecycle of a Thread

* `require 'thread'` 只是加载了一些线程工具，诸如Queue，并没有加载常量Tread，Tread是默认加载的

* `Thread.new` `Thread.fork` `Thread.start` 是别名关系

  可以通过以下方式传递参数：`Thread.start(1, 2) { |x, y| x + y }`

  以上方式都会执行传入的block，并且在当前执行线程中，返回改thread实例

* `Thread#join` 当前线程会sleep以等待调用join的线程终止(包括抛出异常终止)

  如果当前线程中对子线程调用join，子线程中的异常会在当前线程中重新抛出

* `Thread#value` 同`Thread#join`，唯一的区别是value会返回衍生线程代码块的最后的表达式值

* `Thread#status` 返回该线程的当前状态，有以下可能值：

  * run：正在运行

  * sleep：休眠状态，可能是主动sleep，等待io，等待mutex等等

  * false: 已经正常终止

  * nil：已经异常终止

  * aborting：正在退出

* `Thread.stop` 该线程主动休眠，并不再被调度，直到调用`Thread#wakeup`后，该线程才再次成为可调度线程

* `Thread.pass` 类似stop，请求调度器调度其他线程，但是该线程并不会sleep

* `Thread#raise` 抛出异常，不建议使用，因为不能正确处理ensure块

* `Thread#kill` 大致同raise，不建议使用

----

### Chapter 4 Concurrent != Parallel

* 多线程编程一定是**并发(Concurrent)**，但不一定是**并行(Parallel)**，并行一定是并发的。

* **并行(Parallel)**需要硬件支持(多核cpu)，以及调度器的支持，代码层面无法保证并发，但是只要我们实现了并行，在硬件和系统的支持下，我们就可能达到并行。

* 因此多线程编程应该以并发的方式思考，而不是并行

----

### Chapter 5 The GIL and MRI

* MRI 通过GIL(Global Interpreter Lock)，运行并发，阻止并行执行ruby代码

* JRuby 和 Rubinius 没有GIL因此允许并行执行ruby代码

* GIL 或者叫 GVL (Global VM Lock)，每个MRI的ruby进程会有一个GIL，同一个进程的所有线程共享一个GIL，线程必须先获得GIL才能执行代码，因此可以禁止并行执行ruby代码

* GIL允许并行的特使情况：IO等待(blocking IO)

  持有GIL一旦进入IO等待状态，将会释放GIL，因此等待IO的线程(可以是多个)和执行代码的线程(最多一个)可以并行

* GIL的目的：

  阻止并行执行，以降低竟态条件(不会完全消除，因为并发就可以引起竟态)

  更便利的使用C扩展api

* GIL就像穿着盔甲过马路，一定程度上保护了你(竟态条件)但也是你受到明显限制(没法并行执行)

* 关于GIL的错误认识：

  错误认识一：GIL保证代码线程安全

  GIL阻止并行执行，只是降低了出现竟态条件的可能性，但没有消除

  错误认识二：GIL阻止了并发

  GIL没有阻止并发，GIL基本上可以理解为将多核cpu当做单核cup来用，没法利用多核并行执行代码。但即使在单核cpu，并发依然可以实现

----

### Chapter 6 Real Parallel Threading with JRuby and Rubinius

* 题外记：使用Benchmark进行测试报告

  `require 'benchmark'`

  输出四个时间分别是(单位是秒)：

        user: the amount of time spent executing userspace code (i.e.: your code),
        system: the amount of time spent executing kernel code
        user + system
        real: the "real" amount of time it took to execute the code (i.e. system + user + time spent waiting for I/O, network, disk, user input, etc.). Also known as "wallclock time".

  * `Benchmark.measure {code}`

  * `Benchmark.bm(label_width = 0) {|job| job.report(label) {code} }` 可以有多个job.report， label可选

* 对应cpu密集的程序，MRI的多线程编程起不到优化作用，JRuby 和 Rubinius多线程编程有明显优化

* 为什么JRuby 和 Rubinius不需要GIL？TODO 不想翻译了，自己去看

----

### Chapter 7 How Many Threads Are Too Many?

* 到底多少线程合适，这个取决于该程序的性质，可以借鉴的试探模式：先依照cpu数量，1比1的线程数，然后对比1比5的线程数。然后酌情调整

* 一个进程可以衍生的线程数是有上限的，各个系统不尽相同。mac大概2000左右，有的linux可达到10000

* 尽管线程共享内存，开销不大，但是过多的衍生线程任然是不明智的，线程开销还包括调度器的开销。

* 虽然同一时间最多可并行的线程是等于cpu内核的数量，但是有时衍生大于cpu内核数量的线程数还是有帮助的(对于IO密集的程序，一部分线程可以等待io)

* 对于IO密集的程序，**最佳线程数(the sweet spot)**(表示增加线程数不会再提高性能，相反可能降低性能)一般大于cpu数量，the sweet spot可以通过增减线程数测量出来。最要是测量得到可以并行的IO等待线程数量，这个和业务逻辑及硬件性能，网络条件等关系密切

* 对于cpu密集的程序，最佳线程数对于不同ruby解释器有较大差异（因为GIL）

  MRI: 单线程性能最高，增加线程数反而增加了开销

  JRuby 和 Rubinius： 最佳线程数基本等于cpu核数，继续增加线程将增加开销

----

### Chapter 8 Thread safety

* **线程安全**的程序表明该程序在多线程环境下，底层(内存中的)数据将是安全的，一致的，并且语义逻辑将是正确的

* 非原子型的操作`check-then-set` 是非线程安全问题的高发区，关键的操作必须使之成为原子性的

* 一个困难的问题是，程序/系统并不会发现线程安全问题，线程安全问题不会抛出什么异常或者警告，这需要我们自己去发现和处理。而且这种问题往往在开发模式不会出现，而在高并发的生产模式突然出现

* 在ruby中，很少有操作是保证线程安全的

  即使是是看起来是单步的操作，如+= ||=，也不是原子性的。

  核心的集合类，如Array，Hash同样也不是原子性的

  **任何对同一对象的并发修改(Array#<< 赋值等等)都是非线程安全**

  但以上问题只是在多线程中会有问题，单线程不存在线程安全问题

----

### Chapter 9 Protecting Data with Mutexes

* [Mautex(mutual exclusion)](http://www.kuqin.com/rubycndocument/man/addlib/thread-Mutex.html)提供了保证关键代码不会被多个线程同时执行的机制, 保证代码的原子性

        mutex = Mutex.new
        mutex.lock
        shared_array << nil
        mutex.unlock

  或者

        mutex = Mutex.new
        mutex.synchronize do
          shared_array << nil
        end

  **该机制要起作用，必须是Mutex实例被多个线程共享**

* Mutex 和内存可见性(开始怎么也没看懂，然后睡一觉起来就看懂了)

  如果在mutex里修改了一个变量值，如果其他线程想看到正确的,最近更新的值，需要应用同一个mutex去获取，如：

        status = mutex.synchronize { order.status }
        if status == 'paid'
          # send shipping notification
        end
  
  原因是OS的缓存机制的影响，比如当变量刚被修改，新值只在缓存L2中应用，在内存中还是旧值，此时另一线程很可能读到了旧值
  
  该现象在单线程编程中不会出现，但是在多线程编程中无法保证

  解决方案是叫做**memory barrier**的机制，Mutex实现了该机制

* Mutex 性能

  GIL是抑制并发，Mutex抑制并行，所以应该只对**需要原子性的，关键的，尽可能少的**步骤使用mutex

* ruby 中的Queue是原子性的，Array不是

* 死锁(deadlock)

  一个线程申请第一个mutex使用lock是可以的，但是在未释放第一个mutex时继续申请其他mutex，应该使用`Mutex#try_lock`避免出现死锁，在后续的mutex返回false时，应该释放掉所有的mutex，然后重试。

  另一个解决方案是，实行mutex层级，即所有线程应该按照固定的顺序去申请mutex

----

### Chapter 10 Signaling Threads with Condition Variables

**ConditionVariable** 可以在某些指定的事件发生后，发送信号给某些线程

* `ConditionVariable#signal` 调用时不带参数，也没有有意义的返回值，它仅仅是唤醒正在等待它自己的**第一个**线程，如果没有等待线程，那什么也不会发生

* `ConditionVariable#wait(locked_mutex)` 调用时传递一个已经锁定的mutex，该操作会将该mutex释放，并把持有mutex的线程sleep，调用`ConditionVariable#signal`会唤醒在等待的第一个线程(wait貌似可以中断mutex的原子操作？？)

* `ConditionVariable#broadcast` 将唤醒等待该ConditionVariable实例的**所有**线程

----

### Chapter 11 Thread-safe Data Structures
