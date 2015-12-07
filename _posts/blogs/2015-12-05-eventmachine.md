---
layout: post
categories: [blog, ruby]
tags : [eventmachine, ruby, io, actor]
title: EventMachine
---
{% include JB/setup %}

## IO

### 同步异步阻塞非阻塞

**同步异步** 区别在于通知方式

* 同步: 同步指的是用户进程触发IO操作并等待或者轮询的去查看IO操作是否就绪
* 异步: 异步是指用户进程触发IO操作以后便开始做自己的事情，而当IO操作已经完成的时候会得到IO完成的通知, 异步的特点就是通知

**阻塞非阻塞** 区别在于进程在访问数据的时候, 读取或者写入操作函数的实现方式不同

* 阻塞: 阻塞方式下读取或者写入函数将一直等待，
* 非阻塞: 读取或者写入函数会立即返回一个状态值

### 5种类UNIX下可用的I/O模型:

同步:

* 阻塞式I/O

* 非阻塞式I/O

  轮询, EventMachine

  进程把一个套接字设置成非阻塞是在通知内核，当所请求的I/O操作非得把本进程投入睡眠才能完成时，不要把进程投入睡眠，而是返回一个错误

* I/O复用

  select，poll，epoll... 系统调用是阻塞的, 采用select函数有个好处就是它可以同时监听多个文件句柄（就绪的没有就绪的都有监听，epoll是select的替代方式，只监听就绪的文件句柄），从而提高系统的并发性！

  (某些时候会理解为异步阻塞?)

* 信号驱动式I/O（SIGIO）

异步:

* 异步I/O（POSIX的`aio_`系列函数）

  这类函数的工作机制是告知内核启动某个操作，并让内核在整个操作（包括将数据从内核拷贝到用户空间）完成后通知我们


总结: 阻塞的不能做其他事, 异步可以做其他事

另外一种解释:

老张爱喝茶，废话不说，煮开水。

出场人物：老张，水壶两把（普通水壶，简称水壶；会响的水壶，简称响水壶）。

1. 老张把水壶放到火上，立等水开。（同步阻塞）

    老张觉得自己有点傻

2. 老张把水壶放到火上，去客厅看电视，时不时去厨房看看水开没有。（同步非阻塞）

    老张还是觉得自己有点傻，于是变高端了，买了把会响笛的那种水壶。水开之后，能大声发出嘀~~~~的噪音。

3. 老张把响水壶放到火上，立等水开。（异步阻塞）

    老张觉得这样傻等意义不大

4. 老张把响水壶放到火上，去客厅看电视，水壶响之前不再去看它了，响了再去拿壶。（异步非阻塞）

    老张觉得自己聪明了。

所谓同步异步，只是对于水壶而言。普通水壶，同步；响水壶，异步。虽然都能干活，但响水壶可以在自己完工之后，提示老张水开了。这是普通水壶所不能及的。同步只能让调用者去轮询自己（情况2中），造成老张效率的低下。

所谓阻塞非阻塞，仅仅对于老张而言。立等的老张，阻塞；看电视的老张，非阻塞。情况1和情况3中老张就是阻塞的，媳妇喊他都不知道。虽然3中响水壶是异步的，可对于立等的老张没有太大的意义。所以一般异步是配合非阻塞使用的，这样才能发挥异步的效用

---

## Reactor 模式

简单说就是一个死循环

* Reactor：反应器实现以下功能：

  1. 供应用程序注册和删除关注的事件句柄；
  2. 运行事件循环；
  3. 有就绪事件到来时，分发事件到之前注册的回调函数上处理；

* 所有的 reactor 系统是单线程模式，但是它也可以应用到多线程环境之中
* “反应”器名字中”反应“的由来： “反应”即“倒置”，“控制逆转”,具体事件处理程序不调用反应器，而是由反应器分配一个具体事件处理程序，具体事件处理程序对某个指定的事件发生做出反应；这种控制逆转又称为“好莱坞法则”（不要调用我，让我来调用你）
* 流程:
  1. 应用程序注册读/写就绪事件和相关联的事件处理器
  2. 事件分离器等待事件的发生 (Reactor负责)
  3. 当发生读就绪事件的时候，事件分离器调用第一步注册的事件处理器(Reactor负责)
  4. 事件处理器首先执行实际的读取操作，然后根据读取到的内容进行进一步的处理(用户处理器负责)

---

## Lightweight Concurrency 轻量级并发

Lightweight Concurrency (LC)是相对于ruby thread而言, lighter 指的是更少的资源占用(cpu/memory)

ruby 中至少有一个LC的实现: Fiber

LC和thread对比:

* ruby中的thread在运行时, 将公平的进行调度(线程调度开销)
* LC 中的运行单位在结束前不会被取代, 也就是没有线程的调度开销

  Scheduled entities in LC run to completion and are never preempted. The runtime system has far less work to do since it has no need to interrupt threads or to schedule them fairly. This is what makes LC lighter and faster

参考: <http://eventmachine.rubyforge.org/docs/LIGHTWEIGHT_CONCURRENCY.html>

---

## EventMachine

### 关于

* Ruby 的 EventMachine 是ruby下的一个事件驱动的网络程序库

* EventMachine 是 reactor pattern 的一个实现，解耦了处理网络逻辑和主程序逻辑

  他将网络逻辑层从应用逻辑层中抽离。这意味着你无需操心底层的网络连接和 socket 逻辑处理。你只需要实现对应网络事件的回调即可

* EventMachine 是轻量级的并且支持系统底层网络基础操作。这意味着 Ruby 本身的运行效能也不是问题:真正关注高性能的部分都是由 C/C++ 实现的，而且用到了操作系统的最优特性（比如说，linux 下的 epoll)

  EventMachine 可以轻松的用ruby 编写高可伸缩性的网络服务

* 高效的 IO 是 eventmachine 的全部意义所在

  一定要理解这一点。当你使用 eventmachine 进行网络 IO 编程时，你要么直接使用 eventmachine，要么是通过 eventmachine 钩子扩展的某种 lib (在 github 上你会找到很多的这种例子，很好识别，因为他们大多以em- 开头命名)

  如果你选择不当就会阻塞 reactor，就是在 IO 操作结束前，eventmachine 将不会触发任何事件

### 使用


* 安装 `gem install eventmachine`

  Note that EventMachine requires a C++ compiler on your system to build the native extensions

* EM的核心是Reactor, Reactor是一个死循环, 可以通过以下方式启动

      EventMachine.run do
        EventMachine.start_server host, port, EchoServer
      end

  这个do end块不等同于死循环, 死循环是在do end执行后开始

  因为是单线程死循环, 所以run block后面的代码是不会执行的

  除非reactor循环退出, 使用`EventMachine::stop_event_loop` or `EventMachine::stop`

* `EventMachine::start_server host, port, EchoServer`

   第三个参数是handler, 类似nodejs的回调, 一个Module:

   * `Server#receive_data(data)`: 接收到请求的处理

   * `Server#post_init`:  means a new client has just connected

   * `Server#unbind`  mean that a client had disconnected

* `EventMachine::connect host, port, Client`

  * `Client#post_init`:  表示just connected to a server

  * `Client#receive_data(data)`

  * `Client#unbind` called when either end of the connection is closed

  connection 支持Blocks/Procs, Modules, Classes形式, 参见<https://github.com/eventmachine/eventmachine/wiki/General-Introduction>

  如果是Classes形式, 初始化参数传递方式`EventMachine::connect host, port, Client, args...`

* Timer

  * 支持 blocks/procs, instances, subclasses形式

  * `timer = EventMachine::Timer.new(5) do .... end` 一次性timer, 类似js setTimeout

  * `timer = EventMachine::PeriodicTimer.new(5) do .... end` 循环timer, 类似js setInterval

  * `timer.cancel` 取消timer, 类似js clearTimeout 以及 clearInterval

* 键盘事件

  * 单字符: `EM.open_keyboard(MyKeyboardHandler)` `MyKeyboardHandler#receive_data(data)` 中data是单个字符
  * 行: 在`MyKeyboardHandler`中mixin`include EM::Protocols::LineText2`, 可以支持`MyKeyboardHandler#receive_line(line_data)`

* EventMachine::Deferrable

  单线程, 可以被mixin, 通过`#callback` `#errback` 传递回调, `#succeed` `#fail` 进行相对触发

  `#callback` `#errback` 可以注册多个回调, 注册甚至可以在成功失败触发之后, 这样会立即执行, just like JS!

  参考: <http://eventmachine.rubyforge.org/docs/DEFERRABLES.html>

  API: <http://www.rubydoc.info/github/eventmachine/eventmachine/EventMachine/Deferrable>

* EM.defer(op = nil, callback = nil, errback = nil, &blk)

  通过将传递的block在内置线程池(默认20个)中异步执行, 执行完毕和会自动调用成功/失败参数对应的回调, 回调可以省略

  EM.defer is one of EventMachine’s mechanisms for lightweight concurrency. (Spawned Processes is another.)??

  参考: <http://www.rubydoc.info/github/eventmachine/eventmachine/EventMachine.defer>

---

## 参考资料

* <http://www.zhihu.com/question/19732473>
* <http://www.2cto.com/kf/201504/395318.html>
* <https://github.com/eventmachine/eventmachine/wiki/>
* <http://blog.chinaunix.net/uid-298861-id-3251139.html>
* <https://www.igvita.com/2008/05/27/ruby-eventmachine-the-speed-demon/>
