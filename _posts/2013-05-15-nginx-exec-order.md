---
layout: post
category : server side
tags : [nginx, command]
title: nginx 配置指令的执行顺序
---
{% include JB/setup %}

* Nginx 的请求处理阶段共有11个:
  1. post-read

  2. server-rewrite ngx_rewrite 模块的配置指令直接书写在 server 配置块中时，基本上都是运行在 server-rewrite 阶段

  3. find-config 完成了当前请求与 location 的配对。在此阶段之前，请求并没有与任何 location 配置块相关联

  4. **rewrite**  set, ngx_set_misc 的 set_unescape_uri, ngx_lua 的  rewrite_by_lua 和 set_by_lua(在 rewrite 阶段的末尾), ngx_headers_more 提供了一系列配置指令，用于操纵当前请求的请求头和响应头。其中有一条名叫 more_set_input_headers 的指令可以在 rewrite 阶段改写指定的请求头（或者在请求头不存在时自动创建）。这条指令总是运行在 rewrite 阶段的末尾.

  5. post-rewrite

  6. preaccess

  7. **access** 多是执行访问控制性质的任务，比如检查用户的访问权限，检查用户的来源 IP 地址是否合法,如标准模块 ngx_access 提供的 allow 和 deny， ngx_access 模块还支持所谓的CIDR 记法来表示一个网段，例如 169.200.179.4/24 . access_by_lua

  8. post-access

  9. try-files

  10. **content** 这个阶段的配置指令一般都肩负着生成"内容"（content）并输出 HTTP 响应的使使命。echo echo_exec proxy_pass  echo_before_body 和 echo_after_body (这两个属于特殊的 输出过滤器 )

  11. log

  

* Nginx 各个模块提供的配置指令一般只会注册并运行在其中的某一个处理阶段，为了避免阅读配置时的混乱，我们应该总是让指令的书写顺序和它们的实际执行顺序保持一致

* 在 rewrite 和 access 这两个阶段，多个模块的配置指令可以同时使用，譬如上例中的 set 指令和 rewrite_by_lua 指令同处 rewrite 阶段，而 deny 指令和 access_by_lua 指令则同处 access 阶段。但不幸的是，这通常不适用于 content 阶段。 绝大多数 Nginx 模块在向 content 阶段注册配置指令时，本质上是在当前的 location 配置块中注册所谓的"内容处理程序"（content handler）。每一个 location 只能有一个"内容处理程序"，因此，当在 location 中同时使用多个模块的 content 阶段指令时，只有其中一个模块能成功注册"内容处理程序"。 具体哪一个模块的指令会胜出是不确定的.所以我们应当避免在同一个 location 中使用多个模块的 content 阶段指令。

* 并非所有模块的指令都支持在同一个 location 中被使用多次(echo 可以  content_by_lua不行)

###静态资源服务模块

* 当一个 location 中未使用任何 content 阶段的指令，即没有模块注册"内容处理程序"时， 当前请求的 URI 映射到文件系统的**静态资源服务模块**。当存在"内容处理程序"时，这些静态资源服务模块并不会起作用；反之，请求的处理权就会自动落到这些模块上。

* 静态资源服务模块,按照它们在 content 阶段的运行顺序，依次是 ngx_index 模块， ngx_autoindex 模块，以及 ngx_static 模块

* ngx_index 和 ngx_autoindex 模块都只会作用于那些 URI 以 / 结尾的请求，例如请求 GET /cats/，而对于不以 / 结尾的请求则会直接忽略，同时把处理权移交给 content 阶段的下一个模块。而 ngx_static 模块则刚好相反，直接忽略那些 URI 以 / 结尾的请求


### 参考资料
* agentzh 的 Nginx 教程 <http://agentzh.org/misc/nginx/agentzh-nginx-tutorials-zhcn.html>
