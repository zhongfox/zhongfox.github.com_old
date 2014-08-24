---
layout: post
categories: [blog, javascript]
tags : [nodejs, events, emitter, eventproxy]
title: nodejs eventproxy
---
{% include JB/setup %}

* 这个世界上不存在所谓回调函数深度嵌套的问题。 —— Jackson Tian
* 世界上本没有嵌套回调，写得人多了，也便有了}}}}}}}}}}}}。 —— fengmk2

---

## 例

* bad: 串行, 深度嵌套

      var render = function (template, data) {
        _.template(template, data);
      };
      $.get("template", function (template) {
        // something
        $.get("data", function (data) {
          // something
          $.get("l10n", function (l10n) {
            // something
            render(template, data, l10n);
          });
        });
      });

* good: 并行, 无嵌套

      var ep = EventProxy.create("template", "data", "l10n", function (template, data, l10n) {
        _.template(template, data, l10n);
      });

      $.get("template", function (template) {
        // something
        ep.emit("template", template);
      });
      $.get("data", function (data) {
        // something
        ep.emit("data", data);
      });
      $.get("l10n", function (l10n) {
        // something
        ep.emit("l10n", l10n);
      });

---

## API

* all 多类型异步协作(单次)

      var EventProxy = require('eventproxy');
      var ep = new EventProxy();

      ep.all('event1', 'event2', function (data1, data2) {
        console.log(data1);
        console.log(data2);
      });

      ep.emit('event1', '1'); //第一次触发有效
      ep.emit('event1', '2'); //无效
      ep.emit('event2', '3');
      => 1
      => 3
      //类似once, 用all添加的事件, 只会被触发一次
      ep.emit('event1', '4');
      ep.emit('event2', '5');
      => 无输出

  all 等价于 `EventProxy.create('event1', 'event2', function (data1, data2) {...`


* tail 持续型多类型异步协作

      var EventProxy = require('eventproxy');
      var ep = new EventProxy();

      ep.tail('event1', 'event2', function (data1, data2) {
        console.log(data1);
        console.log(data2);
      });

      ep.emit('event1', '1'); //第一次的数据会被覆盖
      ep.emit('event1', '2'); //有效, tail会用最新的数据
      ep.emit('event2', '3');
      => 2
      => 3
      //类似on, 用tail添加的事件, 会用最新的数据, 多次触发
      ep.emit('event1', '4');
      ep.emit('event2', '5');
      => 4
      => 5


* after 重复单类型异步协作

      var EventProxy = require('eventproxy');
      var ep = new EventProxy();

      ep.after('event', 10, function(datas) {
        //datas 是按序累积的事件返回数据数组
      });

* 友好的Error handling

      exports.getContent = function (callback) {
       var ep = new EventProxy();
        ep.all('tpl', 'data', function (tpl, data) {
          // 成功回调
          callback(null, {
            template: tpl,
            data: data
          });
        });
        // 添加error handler
        ep.fail(callback);

        fs.readFile('template.tpl', 'utf-8', ep.done('tpl'));
        db.get('some sql', ep.done('data'));
      };

* fail

      ep.fail(callback);
      // 由于参数位相同，它实际是
      ep.fail(function (err) {
        callback(err);
      });

      // 等价于
      ep.bind('error', function (err) {
        // 卸载掉所有handler
        ep.unbind();
        // 异常回调
        callback(err);
      });

* done 其实是个偏函数, 当有error, 自动触发error事件, 否则触发对应完成事件

      ep.done('tpl'); 
      // 等价于
      function (err, content) {
        if (err) {
          // 一旦发生异常，一律交给error事件的handler处理
          return ep.emit('error', err);
        }
        ep.emit('tpl', content);
      }

  上例中接受事件名的done, 没有预处理数据的能力, 如需预处理数据, 可以传递函数给done

## 参考资料

* <https://www.npmjs.org/package/eventproxy>
*  <深入浅出Nodejs>
