---
layout: post
categories: [blog, server]
tags : [nginx]
title: nginx 笔记
---
{% include JB/setup %}

---

TODO:

autoindex  on;


---

## ngx_http_core_module

<http://nginx.org/en/docs/http/ngx_http_core_module.html>

[ngx_http_core_module模块提供的变量](http://www.ttlsa.com/nginx/the-ngx_http_core_module-module-provides-variable/)

* root

  http, server, location, if in location

* alias

  环境: location, 但是还是需要配置root

  使用alias时，目录名后面一定要加"/"

  对于普通匹配, alias会自动把匹配后剩余的path加到alais指定路径的最后面, 忽略参数

  对于正则匹配, alias不会自动追加, 可以在正则中用`()`定义元组, 在alias中用`$1` `$2` 使用

  不能用于命名location里

* root 和 alias 区别

  <http://www.ttlsa.com/nginx/nginx-root_alias-file-path-configuration/>

  root 文件寻找: `root的path + 已经匹配的url + 剩余的url`; 或者就是`root的path + url`

  alias 文件寻找: `alias的path + (去掉匹配的url) 剩余的url`


---

## ngx_http_log_module

<http://nginx.org/en/docs/http/ngx_http_log_module.html>

* `access_log`

  Context:  http, server, location, if in location, `limit_except`

---

## ngx_http_rewrite_module

* if

  `if (condition) { ... }`

  Context:  server, location

  文件及目录匹配，其中：

      -f和!-f用来判断是否存在文件
      -d和!-d用来判断是否存在目录
      -e和!-e用来判断是否存在文件或目录
      -x和!-x用来判断文件是否可执行

  正则匹配有:

  * `~ 正则` `!~ 正则` 区分大小写
  * `~* 正则` `!~* 正则` 不区分大小写

* rewrite regex replacement [flag];

  Context:  server, location, if

  * 在replacement里, 可以使用regex里`()`匹配的内容, 如`$1``$2`
  * 从一个location跳转到另一个location，不过这样的循环最多可以执行10次，超过后nginx将返回500错误
  * 如果替换的字符串以http://开头，请求将被重定向，并且不再执行多余的rewrite指令, 所以即使后面加last, 这里也会是一个跳转, 默认302
  * 如果replacement不匹配nginx配置的任何location，那么将给客户端返回301(永久重定向)或302(临时重定向)的状态码来表示重定向类型。该状态码可以通过第三个参数来明确指定。

  flag:

  * last – 基本上都用这个Flag。
  * break – 中止Rewirte，不在继续匹配
  * redirect – 返回临时重定向的HTTP状态302, url 会有跳转
  * permanent – 返回永久重定向的HTTP状态301, url 会有跳转

  last和break的区别:

  * last： 停止当前这个请求，并根据rewrite匹配的规则重新发起一个请求。新请求又从第一阶段开始执行
  * break：相对last，break并不会重新发起一个请求，只是跳过当前的rewrite阶段，并执行本请求后续的执行阶段


* return

  * return code [text];
  * return code URL;
  * return URL;

  Context:  server, location, if

  text, url 里都可以有参数


---

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

## ngx_http_referer_module

* valid_referers

      location ~* \.(gif|jpg|png|bmp)$ {
          valid_referers none blocked *.ttlsa.com server_names ~\.google\. ~\.baidu\.;
          if ($invalid_referer) {
              return 403;
              #rewrite ^/ http://www.ttlsa.com/403.jpg;
          }
      }

  * nginx会通过查看referer字段和`valid_referers`后面的referer列表进行匹配，如果匹配到了就`invalid_referer`字段值为0 否则设置该值为1
  * none: 用户直接在浏览器打开
  * blocked 代表有referer但是被防火墙或者是代理给去除了



---

## location

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

* `^~`

  后接字符串, 表示以该字符串开头的uri, 如` ^~ /static/ {...`


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

---


* [nginx教程从入门到精通](http://www.ttlsa.com/nginx/nginx-tutorial-from-entry-to-the-master-ttlsa/)
