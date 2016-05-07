---
layout: post
categories: [blog, javascript]
tags : [inherits, OOP]
title: javascript 继承
---
{% include JB/setup %}

---

    var util=require('util');

    function A() {};
    A.prototype.a = function() {console.log('a')};
    function B() {A.call(this)}; //目的是让this去执行A方法, 这样this可以有A方法里定义的属性 (类似其他语言中调用super)
    util.inherits(B, A);

    var a = new A();
    var b = new B();

或者

    function A() {};
    A.prototype.a = function() {console.log('a')};
    function B() {};
    B.prototype = new A();

    var a = new A();
    var b = new B();


---

<img src="/assets/images/javascript_inherit/inherits.jpg" />

---

* `x instanceof y` 可以理解为:

  `x[.__proto__]+ === y.prototype` //[和]和+是正则表达式中的含义

  因为`b.__proto__ === B.prototype` 所以 `b instanceof B 为 true`

  因为`b.__proto__.__proto__ === A.prototype` 所以 `b instanceof A 为 true`

  因为`b.__proto__.__proto__.__proto__ === Object.prototype` 所以 `b instanceof Object 为 true`

  而`b instanceof Function 为 false`

* `__proto__`

  * 函数: 所有函数的`__proto__` 指向Function.prototype

  * 对象:

    手动实现的继承`B.prototype = new A()` `子类.__proto__` 指向`父类.prototype`

    除此之外的`__proto__`指向`Object.prototype`

* 原型链继承的本质是: 在对象上迭代`__proto__` 直到找到需要的方法.

---

## 参考资料

* <http://blog.oyanglul.us/javascript/understand-prototype.html>
* <http://blog.rainy.im/2015/07/20/prototype-chain-in-js/>
* <http://yijiebuyi.com/blog/ea4b2a30f73596a08ce85211626b68e5.html>
* <http://my.oschina.net/antianlu/blog/262595>
