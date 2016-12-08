---
layout: link
category : link
link: https://imququ.com/post/host-only-cookie.html 
title: Cookie 的属性

---

* 标准的Set-Cookie Header：

  > Set-Cookie: key=value; path=path; domain=domain; max-age=max-age-in-seconds; expires=date-in-GMTString-format; secure; httponly


* 浏览器通过document.cookie也可以设置Cookie, 只是不能设置httponly

  > document.cookie = "key=value; path=path; domain=domain; max-age=max-age-in-seconds; expires=date-in-GMTString-format; secure";

* max-age作为对expires的补充，现阶段有兼容性问题（IE低版本不支持），所以一般不单独使用

* JS中设置Cookie和HTTP方式相比较，少了对HttpOnly的控制，是因为JS不能读写HttpOnly Cookie

* HostOnly 属性: 这个属性不是通过设置的, 而是在Cookie中不包含Domain属性，或者Domain属性为空，或者Domain属性不合法（不等于页面url中的Domain部分、也不是页面Domain的大域）时为true。此时，我们把这个Cookie称之为HostOnly Cookie

  其实就是Set-Cookie缺少合法的Domain时, 就严格按照请求来源Domain匹配

* secure-only-flag：在Cookie中包含secure属性时为true，表示这个cookie仅在https环境下才能使用

* http-only-flag：在Cookie中包含httponly属性时为true，表示这个cookie不允许通过JS来读写

* persistent-flag：持久化标记，在expiry-time未知的情况下为false，表示这是个session cookie, session cookie 将导致过期时间失效

  cookie分两种:

  * persistent cookie: 持久化到硬盘, 按照expiry-time过期
  * session cookie: 存于内存, 没有过期时间, 浏览器关闭删除.

