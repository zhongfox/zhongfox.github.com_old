---
layout: post
categories: [blog, javascript]
tags : [nodejs, thunk, promise, co, koa]
title: 学习KOA 之前需要知道的
---
{% include JB/setup %}

---
先盗一张图: js流程控制的演进过程

<img src="/assets/images/koa/callback.png" width="60%" />

---

## promise

* Promise并不是从JavaScript中发祥的概念

* promise 的三态:

  * "has-resolution" - Fulfilled: resolve(成功)时。此时会调用 onFulfilled
  * "has-rejection" - Rejected: reject(失败)时。此时会调用 onRejected
  * "unresolved" - Pending: promise对象刚被创建后的初始化状态等

  promise对象的状态，从Pending转换为Fulfilled或Rejected之后， 这个promise对象的状态就不会再发生任何变化

* 除promise对象规定的方法(如 then,catch等)以外的方法都是不可以使用的

* 创建:

      var promise = new Promise(function(resolve, reject) {
        if (...succeed...) {
            resolve(data);
        } else {
            reject(new Error(somemessage));
        }
      }

  * resolve方法的参数并没有特别的规则，基本上把要传给回调函数参数放进去就可以了。 ( then 方法可以接收到这个参数值)

  * 传给reject 的参数也没有什么特殊的限制，一般只要是Error对象（或者继承自Error对象）就可以. 这个参数的值可以被 then 方法的第二个参数或者 catch 方法中使用

* Promise实例方法:

  * promise.then(onFulfilled, onRejected)

    如果只想处理异常: promise.then(undefined, onRejected), 不过推荐catch

  * promise.catch(onRejected) 是`promise.then(undefined, onRejected)`的别名

* Promise类方法

  * Promise.resolve(value)

    创建一个promise对象立即进入确定（即resolved）状态,并返回一个新的promise, 会把value传入新promise的resolve方法

    等价于

        new Promise(function(resolve){
            resolve(value);
        });

    Promise.resolve 方法另一个作用就是将 thenable 对象转换为promise对象 TODO

  * Promise.reject(error)

    等价于

        new Promise(function(resolve,reject){
            reject(error);
        });

  * Promise.all

    在接收到的所有的对象promise都变为 FulFilled 或者 Rejected 状态之后才会继续进行后面的处理

    并发promise: `Promise.all([promise1, promise2]).then(function(results) ...)`, 每个promise的结果（resolve或reject时传递的参数值），和传递给 Promise.all 的promise数组的顺序是一致的

    promise并不是一个个的顺序执行的，而是同时开始、并行执行的

  * Promise.race

    只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理


* promise chain

      var promise = Promise.resolve();
      promise
          .then(taskA)
          .then(taskB)
          .catch(onRejected)
          .then(finalTask);

<img src="/assets/images/koa/chain_ok.png" width="40%"/>
<img src="/assets/images/koa/chain_fail.png" width="40%"/>

* promise chain 中如何传递参数

  每个resolve的return值, 不仅只局限于字符串或者数值类型，也可以是对象或者promise对象等复杂类型

  return的值会由 Promise.resolve(return的返回值) 进行相应的包装处理, 传递给下一个then的resolve

---

## Thunk

参考 <http://www.ruanyifeng.com/blog/2015/05/thunk.html>

---

## CO

<https://github.com/tj/co>

* co 函数库其实就是将两种自动执行器（Thunk 函数和 Promise 对象），包装成一个库。

  使用 co 的前提条件是，Generator 函数的 yield 命令后面，只能是 Thunk 函数或 Promise 对象

* Co v4 版本之前返回thunk, v4以后返回promise, 未来可能不支持thunk

* Yieldables:

  * promises
  * thunks (functions)
  * array (并发处理) 
  * objects (并发处理)
  * generators (delegation)
  * generator functions (delegation)

* API

  * `co(fn*).then( val => )`
  * `var fn = co.wrap(fn*)` 把generator转换为Promise


---

## 参考资料

* [nodejs异步控制「co、async、Q 、『es6原生promise』、then.js、bluebird」有何优缺点？最爱哪个？哪个简单？](https://www.zhihu.com/question/25413141)
* [JavaScript Promise迷你书](http://liubin.github.io/promises-book/)
* <http://nya.io/Node-js/promise-in-nodejs-get-rid-of-callback-hell/>
* [Thunk 函数的含义和用法](http://www.ruanyifeng.com/blog/2015/05/thunk.html)
* [Generator 函数的含义与用法](http://www.ruanyifeng.com/blog/2015/04/generator.html)
* [co 函数库的含义和用法](http://www.ruanyifeng.com/blog/2015/05/co.html)
