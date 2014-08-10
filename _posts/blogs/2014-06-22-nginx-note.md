---
layout: post
categories: [blog, server]
tags : [nginx]
title: nginx 笔记
---
{% include JB/setup %}

---

* alais

  环境: location, 但是还是需要配置root

  对于普通匹配, alais会自动把匹配后剩余的path加到alais指定路径的最后面, 忽略参数

  对于正则匹配, alais不会自动追加, 可以在正则中用`()`定义元组, 在alias中用`$1` `$2` 使用

  不能用于命名location里

* default_type

  环境: http, server, location

  设置默认的MIME类型, http中的content-type头, 如 `default_type text/html;`

* error_page

  环境: http, server, location

      error_page 404 @gotu;
      error_page 502 503 /50x.html;
      error_page 404 = @gotu;
      error_page 404 =200 @gotu; #同时修改状态
      error_page 404 =403 /someotherpage;

* internal

  使用:location

  指明该location只会用于内部跳转使用, 外部不能直接访问

* listen address:port [default_server]

  **如果有address, 先匹配ip, 然后匹配域名(ip优先) 如果匹配不到,会基于请求的端口查找default server**

  127.0.0.1 和 location等价, 但是不和实际ip等价

  **default_server** 每个address:port可以有不同的 `default_server`, `default_server`用于响应域名没有匹配到的请求

  注意nginx自带了一个0.0.0.0:80的default_server `/etc/nginx/sites-available/default`

* server_name

  有以下几种格式(按照测试顺序):

  1. 全域名
  2. 开始使用通配符如: `*.example.com`(不能匹配一级example.com 但可以匹配多级子域名)
  3. 结尾使用通配符如: `www.example.*`
  4. 正则表达式域名: 在域名前加上`~` 如 `~^www\d+\.example\.com$` 可以捕获变量(如域名)在location中使用

  另外

  * 2 和 3 不能同时出现

  * `.example.com` = `*.example.com` + `example.com` 即一级域名和子域名

---

### location

Location block 的基本语法形式是： `location [=|~|~*|^~|@] pattern { ... }`

**普通 location**

* `=`

  全匹配指定的 pattern ，且这里的 pattern 被限制成简单的字符串，不能使用正则表达式

  忽略参数

  对path后置`/`敏感

  是否区分大小写由Nginx server 的系统决定(windows不区分, linux区分)

  如 `= /abc` 与请求`/abc/` `/abc/?x=3`无法匹配, 可以匹配`/abc?x=3` `/abc`

* (None)

  基本同上, 也不能使用正则表达式

  不同的是，匹配那些以指定的 patern 开头的 URI

  如`location /abcd`匹配`/abcde` `/abcd/`


**正则 location**

* `~`

  对大小写敏感，且 pattern 须是正则表达式

  忽略参数

  对path后置`/`敏感

  如 `location ~ ^/abcd$` 匹配 `/abcd` 不匹配`/abcd/` `/ABCD`

* `~*`

  基本同上, 不同的是:不区分大小写

* `!~`和`!~*` 分别为区分大小写不匹配及不区分大小写不匹配

* `@`

  用于定义一个 Location 块，且该块不能被外部 Client 所访问，只能被 Nginx 内部配置指令所访问，比如 `try_files` `error_page`

  定义404命名location:



**匹配规则**

1. `=`

2. `^~` 和 (none) 如果有精确匹配

3. `^~` 前向匹配, 最大前缀匹配（与顺序无关）

4. 正则匹配, 按编辑顺序逐个匹配（与顺序有关）

5. (none)前向匹配, 最大前缀匹配（与顺序无关）
