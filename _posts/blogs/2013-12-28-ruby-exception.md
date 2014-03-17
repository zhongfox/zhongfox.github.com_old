---
layout: post
categories: [blog, ruby]
tags : [ruby, exception]
title: Ruby 异常
---
{% include JB/setup %}

```
Exception
 NoMemoryError
 ScriptError
   LoadError
   NotImplementedError
   SyntaxError
 SignalException
   Interrupt
 StandardError
   ArgumentError
   IOError
     EOFError
   IndexError
   LocalJumpError
   NameError
     NoMethodError
   RangeError
     FloatDomainError
   RegexpError
   RuntimeError
   SecurityError
   SystemCallError
   SystemStackError
   ThreadError
   TypeError
   ZeroDivisionError
 SystemExit
 fatal
```

* 所有异常都继承自类`Exception`

* 异常对象的实例方法：

  * `message` 字符串的异常消息
  * `backtrace` 形如`filename:linenumber in methodname`的字符串数组，异常抛出点的调用栈
    `Kernel#caller`也会提供这样格式的返回

* 创建异常对象

  通常通过`Kernel#raise` (`fail` 是同义词)创建， 不过也可以通过Exception.new，接受一个可选参数作为message

* raise

  * 无实参：抛出RuntimeError, 不带消息, **在rescue从句中无实参调用rails，将简单抛出正在处理的异常**

  * raise(message): 抛出带有message的RuntimeError

  * rails(异常对象)：抛出指定的异常, 可以是异常类或者异常对象，他们都有exception方法，都返回异常类

  * rails(异常类.new(message))

  * rails(可以相应exception方法的对象, message)

  * rails(可以相应exception方法的对象, message, 异常回溯的字符串数组) 如果不传，ruby自行设置异常回溯


* rescue

  rescue和raise不同，rescue不属于Kernel，而是ruby语言的基础部分

  * `$!` 代表当前正在处理的异常

  * 把异常对象赋值给变量`rescue => ex `

  * rescue从句并没有开启新的变量作用域

  * 只处理指定类型异常： `rescue 异常类` 或者结合赋值`rescue 异常类 => ex `， 指定多个类型`rescue 异常类1, 异常类2 => ex `

  * 多个rescue类型从句，应该把子类放在最前面，因为rescue从上往下匹配。

  * resuce 可以作为语句修饰符：`y = some_method_may_raise_exception resuce nil` 此种风格只能处理StandarError, 注意rescue优先级高于赋值运算（和if while 不同）

  * resuce从句如果没有指定要处理的异常类，默认只会捕捉StandardError（及其子类）

    最佳实践：

    * 自定义异常类时，继承 StandardError 或任何其后代子类（越精确越好）。永远不要直接继承 Exception。
    * 永远不要 rescue Exception。如果你想要大范围捕捉异常，直接使用空的 rescue 语句（或者使用 rescue => e 来访问错误对象）

* 异常传播：代码块中的异常会传递给调用处

* retry 可以在rescue中尝试retry以重新执行rescue所在的那段begin end块

* begin end块中的else： else从句在有rescue的begin end块中才有意义，执行到else里表示没有异常（逻辑上等同于把else里的语句放到begin end外）

* ensure: ensure只能出现在rescue和else之后，无论是否有异常，ensure里的代码都会被执行

