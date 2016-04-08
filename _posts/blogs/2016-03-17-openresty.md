---
layout: post
categories: [blog, lua]
tags : [lua, openresty]
title: Openresty Note
---
{% include JB/setup %}

---

* ngx.var: nginx变量，如果要赋值如ngx.var.b = 2，此变量必须提前声明；另外对于nginx location中使用正则捕获的捕获组可以使用ngx.var[捕获组数字]获取

* 一些奇怪的东西

  * nginx 中的lua入口文件, 不会保留其中定义的全局变量, 全局变量每次也要重新求值, 因此入口中的全局变量在不同请求间不会共享
  * 即使是在require中定义的全局变量, 在入口文件中, 也只是第一次有效, (感觉应该是入口文件每次执行时, 抹去了该文件中的所有出现的全局变量)
  * require 文件中的全局变量, 在请求之间, 也不会保留; 但是在require 文件本身中, 是一直会保留的
  * 入口文件和被require的文件中, `_G` 是不同的;  这是导致误解的bug!!!!
  * require的值会保留
  * package.path 却是整个nginx共享的, 改动将一直有效, 跨越文件和请求

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
