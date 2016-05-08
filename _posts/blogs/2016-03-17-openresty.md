---
layout: post
categories: [blog, lua]
tags : [lua, openresty]
title: Openresty Note
---
{% include JB/setup %}

---

## 变量

* ngx.var: nginx变量，如果要赋值如ngx.var.b = 2，此变量必须提前声明；另外对于nginx location中使用正则捕获的捕获组可以使用ngx.var[捕获组数字]获取

* `NGX_LUA`的三种变量范围

  * 进程之间共享: `lua_shared_dict`

  * 进程内: Lua源码中声明为全局变量, 进程内所有请求共享

    有两个前提条件，一是ngx_lua使用LuaJIT编译，二是声明全局变量的模块是require引用。LuaJIT会缓存模块中的全局变量

    测试结论: 入口文件中的非require赋值的全局变量, 每次会重新生成, 和其他子模块中的全局变量没有关系

  * 每请求: 请求相关的局部变量, 以及`ngx.ctx`

* require 的module是VM共享的, 也就是每个worker都有独立的一份, 每个worker中所有请求共享

  通常不要把请求相关的数据关联到require的module中

* `ngx.ctx`

  在特定一次请求中有效, 在该请求的所有阶段共享

  子请求和主请求不共享, 完全独立

  内部跳转会抹去主请求的`ngx.ctx`, 因此也不共享


* 一些奇怪的东西

  * nginx 中的lua入口文件, 不会保留其中定义的全局变量, 全局变量每次也要重新求值, 因此入口中的全局变量在不同请求间不会共享
  * 即使是在require中定义的全局变量, 在入口文件中, 也只是第一次有效, (感觉应该是入口文件每次执行时, 抹去了该文件中的所有出现的全局变量)
  * require 文件中的全局变量, 在请求之间, 也不会保留; 但是在require 文件本身中, 是一直会保留的
  * 入口文件和被require的文件中, `_G` 是不同的;  这是导致误解的bug!!!!
  * require的值会保留
  * package.path 却是整个nginx共享的, 改动将一直有效, 跨越文件和请求

---

## 缓存

* lua_code_cache

  默认是on, 性能考虑生成环境必须要是on

  off: `*_by_lua_file` 文件以及module缓存都没用, 因为`When turning off, every request served by ngx_lua will run in a separate Lua VM instance`

* [缓存](https://moonbingbing.gitbooks.io/openresty-best-practices/content/ngx_lua/cache.html)

  * ngx shared dict cache

    * 所有worker 共享
    * LRU算法
    * 每次操作都是全局锁, 高并发时worker之间容易引起竞争, 所以单个shared.dict的体积不能过大
    * API丰富

  * Lua lru cache

    * worker内使用, 不会有锁
    * 并且没有shared.dict的体积限制，内存上也更弹性
    * 不同worker之间数据不同享，同一缓存数据可能被冗余存储
    * API比较少

---

## 输出

* ngx.print 异步操作, 立刻返回, 而不用等数据写入系统缓存, 没有换行

* ngx.say 同上, 自带换行
  以上2各都 will always invoke the whole Nginx output body filter chain, 所以在同一请求中, 尽量缓存, 合并调用

* `ngx.log(log_level, ...)` 记录到error.log

* print 等价于 `ngx.log(ngx.NOTICE, ...)`

   * ngx.STDERR
   * ngx.EMERG
   * ngx.ALERT
   * ngx.CRIT
   * ngx.ERR nginx config中默认: `error_log logs/error.log error;`
   * ngx.WARN
   * ngx.NOTICE
   * ngx.INFO
   * ngx.DEBUG

---

## 异步执行

* 尽量使用ngx Lua的库函数，尽量不用Lua的库函数，因为Lua的库都是同步阻塞的

  比如`ngx.sleep(0.1)`只会有进程中协程切换, 而`os.execute("sleep " .. n)`会导致进程休眠

* 可以使用`ngx.timer.at(delay, handler, other_args)`执行定时任务, 类似js setTimeout

* ngx.eof() 即时关闭连接，把数据返回给终端, 后面的代码会继续执行

  不能任性的把阻塞的操作加入代码，即使在ngx.eof()之后。 虽然已经返回了终端的请求，但是，nginx的worker还在被你占用

---

* 在redis的操作中, 返回值nil是用`ngx.null`表示, 目的是`把"查询为空”和“未定义”区分开来`

  因此获取判断分两级: 执行是否成功, key是否存在:

      local res, err = red:get("dog")
      if not res then
          ngx.say("failed to get dog: ", err)
          return
      end

      if res == ngx.null then
          ngx.say("dog not found.")
          return
      end

  为什么需要`ngx.null` 呢, 参见: <http://www.pureage.info/2013/09/02/125.html>

* `io.popen` 可能造成`Interrupted system call`

  <https://groups.google.com/forum/#!topic/openresty/BO1_Geg5xxY>

  调用close可以减少这种情况, 不过不能避免, 可以考虑pcall重试

* JIT

  * 原生LUA解释器: Lua 代码是只能在 Lua 虚拟机中运行
  * JIT: ua 代码直接解释成 CPU 可以执行的指令
  * JIT还提供了FFI:  allows calling external C functions and using C data structures from pure Lua code

  查询哪些API是JIT编译支持的: <http://wiki.luajit.org/NYI>

* [cosocket](https://moonbingbing.gitbooks.io/openresty-best-practices/content/ngx_lua/whats_cosocket.html)

  * 异步
  * 非阻塞
  * 全双工

---

## 参考资料

* [OpenResty最佳实践](http://moonbingbing.gitbooks.io/openresty-best-practices/content/index.html)
* [nginx 执行阶段和lua指令挂载阶段关系](http://www.mrhaoting.com/?p=157)
