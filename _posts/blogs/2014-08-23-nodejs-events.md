---
layout: post
categories: [blog, javascript]
tags : [nodejs, events, emitter]
title: 利用nodejs events 解决雪崩现象
---
{% include JB/setup %}


## events模块

类似前端dom中的注册事件和触发事件的功能, events模块实现了node中的**事件发布/订阅**模式, 但nodejs中的事件不涉及事件冒泡.


* 事件发布/订阅

      var events = require('events');
      var emitter = new events.EventEmitter(); //创建一个监视者

      //订阅
      emitter.on('event1', function (message) {
        console.log(message);
      });

      //发布
      emitter.emit('event1', 'Im a message');

* 继承

      var events = require('events');
      function MyClass() {
        events.EventEmitter.call(this); //TODO
      }
      util.inherits(MyClass, events.EventEmitter);

* 事件队列

  emitter._events是一个事件名和回调事件队列的对象

      function callback1() { console.log('Im callback1'); }
      function callback2() { console.log('Im callback2'); }

      emitter.on('event2', callback1);
      emitter.on('event2', callback2);

      emitter._events
      => { 'event1': [Function],
        'event2': [ [Function: callback1], [Function: callback2] ] }

  利用once添加的事件队列, 将在事件触发后自动去除

      function callback3() { console.log('Im callback3'); }
      emitter.on('event3', callback3);
      emitter._events
      => { event1: [Function],
        event2: [ [Function: callback1], [Function: callback2] ],
        event3: [Function: callback3] }

      emitter.emit('event3'); //Im callback3
      emitter._events
      => { event1: [Function],
        event2: [ [Function: callback1], [Function: callback2] ],
        event3: [Function: callback3] }




* 主要API:

  实例方法:

  * `emitter.on(event, listener)` (别名addListener)
  * `emitter.once(event, listener)` 利用once添加的事件队列, 将在事件触发后自动去除
  * `emitter.removeListener(event, listener)` listener是之前添加的回调函数对象
  * `emitter.removeAllListeners([event])` 如果没有指定events,将去掉所有事件监听
  * `emitter.setMaxListeners(n)` 一个emitter的任意一个事件队列超过10个回调, (添加第11个)将会得到警告, 通过该方法设置警戒线, 0代表不限制
  * `emitter.listeners(event)` 返回该event对应的事件队列
  * `emitter.emit(event, [arg1], [arg2], [...])` 如果有对应事件, 触发后返回true, 否则false

  类方法:

  `EventEmitter.listenerCount(emitter, event)` 获得指定emitter指定的event对应的事件回调个数

  


---

## 雪崩现象

所谓**雪崩现象**, 就是在高访问量,大并发的情况下缓存失效的情景, 此时大量的请求涌入数据库中, 数据库无法同时承受如此大的查询请求, 进而影响网站整体的相应性能(from 深入浅出nodejs)

<img src="/assets/images/nodejs_events/xuebeng.png" />

---

## 利用nodejs events 解决雪崩现象

<img src="/assets/images/nodejs_events/node_xuebeng.png" />


---

## 代码

rails 中提供了`Rails.cache.fetch` 方法

    Rails.cache.fetch(my_cache_key, expires_in: 8.minutes) do
      get_real_data_from_database
    end

类似的, 在nodejs中实现fetch方法:




## 参考资料

* <http://nodejs.org/api/events.html>
*  <深入浅出Nodejs>
