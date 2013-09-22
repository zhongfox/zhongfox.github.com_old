---
layout: post
category : rails
title: Rails Security
tags : [rails, rails guides, security]
---
{% include JB/setup %}

本文主要选译自[Ruby On Rails Security Guide](http://guides.ruby-china.org/security.html)

## 1 简介

## 2 Sessions

### 2.1 什么是Sessions

HTTP是无状态协议，Session使之成为有状态的。

Rails会为每个访问应用的新用户创建session，为已经使用了应用的用户加载已存在的session。

session通常是包含session id（通常是32个字符的字符串）的一个hash，发到客户端的每个cookie都包含了session id。**???** 浏览器也会在每个请求中带上这些cookie，在rails中可以使用`session`方法来读写session。

### 2.2 Session id

session id 是 32字节的MD5值。

session id 由一个随机字符串的哈希值组成。这个随机字符串是当前时间，一个介于0和1之间的数字，ruby解释器的进程id（也是个随机数）和一个常量字符串。时至今日暴力破解rails的session id并不太现实。但是从理论上来讲，是有可能出现冲撞。

### 2.3 Session 劫持

盗取用户的session id，从而以受害者的名义访问网络应用。

许多网站都提供用户名密码的认证（authentication）机制，初次认证后的每次请求都无需再次认证，存在cookie中的session id起到识别session的作用。

所以说cookie提供了临时认证的作用。持有用户cookie而劫持session很可能造成验证后果。这里有几种劫持方式及其对策：

* 在一个不安全的网络中嗅探cookie，特别是不加密的无线局域网，所以说不要去星巴克里工作呢，对于开发者来说，这意味着你最好提供SSL连接，Rails中可以在confi文件中加入`config.force_ssl = true` 来强制使用SSL。

* 在公共终端（网吧啥的）大多数用户不会清除cookie，So...，所以开发者最好为用户提供一个显眼的log-out按钮

* 会话确定（session fixation）：不同于以上攻击者劫持未知的cookie，会话确定是让用户使用攻击者已知的session标示。

### 2.4 Session 指导方针

* 不要在session里存储大的对象，只存对象id。这避免了数据同步（数据或者数据结构改变）的问题，以防止客户端cookie撑爆

* 关键/敏感数据不应该存储在session里，如果用户清空缓存或者关闭浏览器，这些数据(未存储的)就会丢失。并且用户也会在客户端读取这些关键/敏感数据。

### 2.5 Session 存储

Rails提供了几种session存储机制，其中最重要的是`ActiveRecord::SessionStore` `ActionDispatch::Session::CookieStore`

`ActiveRecord::SessionStore` 是把session id及session hash存于数据库，每次请求都会进行数据库的存取，这种方式在性能和维护成本上都优于文件存储。

`ActionDispatch::Session::CookieStore` 将session的hash存于客户端，服务器端从cookie中提取session的hash（**and eliminates the need for a session id？？？？**） 这加快了应用的访问速度，但是会有些隐患：

* cookies 限制4kB的大小，通常存储诸如用户id之类的数据是够了。

* 客户端可以看到session里的所有东西，因为session里的数据是基于Base64编码，但是没有加密，所以不要在session里存储机密数据，而且为了防止session篡改，使用服务器secret生成的摘要需要加在会话cookie尾部。

所以会话存储的安全性依赖于secret以及摘要算法（SHA512）所以不要使用诸如单词这种简单的secret，最好是大于30个字符。

Rails中可以在配置文件中配置secret_token `MyAppName::Application.config.secret_token = '...'` TODO{Rails::Application::Configuration}

### 2.6 基于cookie的session之重放攻击（Replay Attacks）

攻击举例：

* 用户持有一个额度的信用额，存于session之中（bad idea， just for example）

* 用户使用一定信用额买了些东西

* 减少后的信用存于他的session里

* 用户在买之前保存了他的信用额的相关cookie，买之后将其重新放置于当前cookie中

* OMG，信用回来了，继续买！

在session里放置一个用于认证的随机值可以解决重放攻击。这个随机值只能一次有效，而且服务端需要一直追踪这个值。如果有多台应用服务器这将变得更麻烦。如果把认证随机值存于数据库，这又会使得CookieStore变得毫无意义（CookieStore就是为了避免每次请求访问数据库）

当然最好的方式就是不要在session里存储这些关键数据，而应该存于数据库，session里只存已登录用户的id。

### 2.7 Session 确定（Session Fixation）

除了盗取用户的session id，攻击者也可能让用户使用一个攻击者已知的session id，这叫做 Session 确定。

这种攻击方式致力于确定一个攻击者已知的用户session id，然后强迫用户浏览器使用这个id。大致的攻击过程：

1. 攻击值创建一个有效的session id：他访问网站的登陆页面，从cookie中获取session id。（**攻击者并没登陆，未登录的用户也会获取一个session id**）

2. 攻击值持续维护这个session id 不过期，session的过期时间会极大的限制这种攻击的时间范围，不过攻击值可以反复访问网站来保持session不过期。

3. 攻击者迫使用户浏览器使用这个session id，因为cookie不能跨域修改， 所有需要借助XSS以运行攻击者的js，如`<script>document.cookie="_session_id=16d5b78abb28e3d6206b60f22a03c8d9";</script>`

4. 攻击者诱导受害者通过访问页面注入js。用户session is将被改为攻击值维护的id。

5. 因为这个session id还未登陆，网站要求用户登陆并验证通过（**登陆成功后网站并没有更换session id**）

6. 从现在开始，受害者和攻击者共用一个session，session是有效的但是受害者却对攻击毫不知情。

### 2.8 Session 确定 -- 对策

只需一行代码搞定session确定

最有效的方式是在每次成功登陆后，发放一个新的session标识，并废弃旧的，这样攻击者将无法使用session确定，这是防范session劫持的好办法，在Rails中重新生成session：`reset_session`

另一个对策是将用户特性保存于session中，每次请求进行验证，用户特性有请求ip，用户浏览器名称等。

### 2.9 Session 过期

不过期的session将会延长可能的攻击时间范围，如跨站请求伪造（CSRF）session劫持和session确定

一种做法是将过期的时间戳设置在带有session id的cookie里，但是用户可以修改这类cookie，所以在服务器端过期session跟安全。

## 3 跨站请求伪造 CSRF

这个攻击方法包含恶意代码或是一个用户信任的已验证的web应用页面的链接。如果session没有过期，攻击者就可能执行未授权的命令

大多是Rails应用使用于cookie的session，要么把session id 存于cookie并在服务器端有对应的session hash，要么把整个session hash存于客户端，对于任何一种的客户端请求，只要domain匹配，都会自动带上cookie，但是有争议的是，来自于不同域名的站点的请求(**请求的referer**)，也会发送这个cookie。来看这个例子：

* Bob浏览了一个留言板和一个由攻击者制作的html标签内容。这个元素引用的是一个bob的项目管理应用程序里的命令，而不是一个图片。

* `<img src="http://www.webapp.com/project/1/destroy">`

* Bob 在  www.webapp.com 的session一直没断

* Bob在查看这个post时，浏览器会自动请求这个图片的src试图加载图片，这个请求自动带上了Bob未过期的cookie

* www.webapp.com 接收到请求，认定请求有效，执行删除操作

* 可怜的Bob在N天后才发现了他的一个项目不见了

很重要的是，要明白，这种有害的image或者链接并不一定位于该网站应用域名下，可以是任何地方，论坛博客邮件等等(**浏览器自动带cookie只认domain不管referer**)

### 3.1 CSRF 对策

首先，严格按照W3C要求，正确的使用GET和POST。其次，在非GET请求中带上一个验证的token能避免网站遭受CSRF攻击。

#### 使用 GET 如果

* 请求如果一个问题（比如查询 搜索等）

#### 使用 POST 如果

* 交互更像一种命令，或者

* 交互改变了资源的状态，或者

* 用户对这个交互负责

如果你的应用是RESTful的，你可能还习惯使用一些其他的动词，如PUT或者DELETE，但是大多数浏览器不支持这些，只支持GET和POST。rails用隐藏的`_method`来处理。

POST也可以自动发起，比如在html中给啊标签加上onclick属性。

或者在image标签中加上onmouseover属性。

还有些其他的攻击可能，包括在后台使用ajax攻击，解决方案是在非post的方法中加入一个安全token，服务器会核对每个收到的token。Rails2及更高的版本中，使用以下代码来添加token：

`protect_from_forgery :secret => "123456789012345678901234567890..."`

在Rails生成的所有form和ajax中(**csrf_meta_tag 生成name为csrf-token的meta，这个值为js使用，如ajax**), 自动生成的token是通过当前session和服务器的secret来计算出来的。** You won’t need the secret, if you use CookieStorage as session storage.??** 如果token不匹配，session会被重置。**Rails 2 会报错，Rails3只会有警告 Can't verify CSRF token authenticity**

跨站脚本（XSS）漏洞绕过所有的CSRF保护。XSS可以让攻击者访问页面的所有元素，所以他可以从一个表单里读取CSRF Security token  或者直接提交表单.

## 4 重定向和文件

### 4.1 重定向

重定向是被低估的攻击点，不仅是攻击者可以讲用户重定向到陷阱网站，也可以创造一个完备的攻击环境。

只要运行用户传参到url进行跳转，就容易受到攻击。最明显的攻击是跳转到看起来像真正站点的虚假站点。所谓的钓鱼攻击就是在邮件里加上一个可疑的链接

下面是一个旧链接跳转的例子：

    def legacy
      redirect_to(params.update(:action=>'main'))
    end

期望是跳转到main，但是可以被这样攻击：

`/www.example.com/site/legacy?param1=xy&param2=23&host=www.attacker.com`

在url末端的host不易被发现， 一个简单的对策是过滤参数。

如果是跳转到一个硬编码的url，最好用一个正则确认一下是在白名单里。

#### 4.1.1 自载XSS（Self-contained XSS）

......

### 4.2 文件上传

## 5 内联网和管理安全

## 6 Mass Assignment

没有任何包含措施的  `Model.new(params[:model])`使得攻击者可以设置任何数据库字段

大量复制让你不必单独为每个字段赋值，只要传入一个hash到new方法，或者`assign_attributes= a hash `就可以设置模型的各个键值。但是问题是攻击者可以很容易传入你在新建时并不想设置的字段（如果管理权限等）

易受攻击的并不仅仅是数据库字段，还包括任何未保护的setter方法（通过 ` attributes= `）,实际上攻击点设置还殃及嵌套的大量赋值(`accepts_nested_attributes_for `)

### 6.1 对策

有2个方法：

* `attr_protected` 在这个列表中的属性将不允许大量赋值，一个可选的as参数指定role，即可以有不同的赋值保护规则，主要用在使用`assign_attributes`时，如：

  `customer.assign_attributes({ "name" => "David", "credit_rating" => "Excellent", :last_login => 1.day.ago }, :as => :admin)`

* `attr_accessible` 更好的办法是使用这个白名单，同样支持as参数。

当然还是可以单独给一个受保护的属性赋值。

使用`attributes= ` 赋值时，默认用role是:default,要使用不同的role需要使用assign_attributes,还可以使用:without_protection来绕过赋值保护如

`@user.assign_attributes({ :name => 'Josh', :is_admin => true }, :without_protection => true)`

new, create, create!, update_attributes, 和 update_attributes!  这些方法都遵循赋值保护，同样也支持as参数或者without_protection参数。

可以使用以下配置强制所有模型定义白名单：

`config.active_record.whitelist_attributes = true`

## 7 用户管理

## 8 注入

注入是一种向web应用注入并运行可疑代码或参数的攻击方式，典型的是跨站脚本攻击（XSS）和sql注入

### 8.1 白名单 VS 黑名单

消毒，保护，验证，白名单优于黑名单

有些场景无法使用白名单，比如垃圾邮件过滤，以下是优先考虑白名单的场景：

* before_filter 优选 :only => [...] 而不是 :except => [...] 这样新加一个action不用担心忘记修改filter

* 优选attr_accessible 而不是 attr_protected，详见上述

* `Allow <strong> instead of removing <script> against Cross-Site Scripting (XSS). See below for details`

* 不要试图修正黑名单的输入：

  * 这样有可能被攻击：`<sc<script>ript>".gsub("<script>", "")`

  * 直接拒绝不合法的输入

### 8.2 SQL 注入

多亏了一些聪明的方法，sql注入在Rails中已经不是一个棘手的问题，但sql注入是一种常见且毁灭性的的攻击，所有理解这玩意相当重要。

#### 8.2.1 简介

SQL 注入旨在通过操作web应用参数来扰乱数据库查询，通常的目的是绕过认证，或者非法读数据。看例子：

`Project.where("name = '#{params[:name]}'")`

如果用户输入  `' OR 1 ...` 生成的查询是：

`SELECT * FROM projects WHERE name = '' OR 1 ...`

结果是条件是true，显示出所有的数据。

#### 8.2.2 绕过认证

下面是一个典型的Rails用户认证查询：

`User.first("login = '#{params[:name]}' AND password = '#{params[:password]}'")`

如果用户输入` ' OR '1'='1 ` 为用户名， `' OR '2'>'1`为密码， 生成的sql为

`SELECT * FROM users WHERE login = '' OR '1'='1' AND password = '' OR '2'>'1' LIMIT 1`

这会查到数据库的第一条记录且认证通过。

#### 8.2.3 未授权读

Sql中的UNION会返回多条sql的查询结果集，看看攻击者如何利用这一点：

对于 `Project.where("name = '#{params[:name]}'")`

如果注入以下sql： `') UNION SELECT id,login AS name,password AS description,1,1,1 FROM users --`

最终生成的sql为：

    SELECT * FROM projects WHERE (name = '') UNION
    SELECT id,login AS name,password AS description,1,1,1 FROM users --'

最终结果读到了users表，但愿这个users表的密码是经过加密的，select中多个1是为了满足UNION中多个sql必须返回同样的字段的要求。

#### 8.2.4 对策

Rails 有内置的sql特殊字符过滤: 单引号，双引号，NULL 和换行符，当使用`Model.find(id) or Model.find_by_some thing(something)`会自动应用这些过滤对策，但是对于SQL片段，特别是在conditions片段里（where(...)）或者connection.execute() 和Model里的Model.find_by_sql()， 只能手动调用。

除了直接传sql语句到condition，还可以传数组看自动消毒有风险的sql。

`Model.where("login = ? AND password = ?", entered_user_name, entered_password).first`

还可以传递一个hash： `Model.where(:login => entered_user_name, :password => entered_password)`

数组和hash形式的自动消毒只适用于模型，需要的时候可以在任何地方调用`sanitize_sql()`，在使用外部传入的sql时，一定要有考虑安全问题的习惯。

### 8.3 跨域脚本 XSS

最广泛，也是毁灭性最大之一的攻击。Rails提供了一些helper来阻止这类攻击。

#### 8.3.1 入口点

#### 8.3.2 HTML/JavaScript 注入

最常见的XSS语言是客户端的js，所以转义用户输入至关重要。

最简单的测试XSS： `<script>alert('Hello');</script>` 

如果试图回显这段用户输入，将会执行alert（**IE和chrome拒接执行，ff中招**）

下面2种也差不多，只是不很常见：

    <img src=javascript:alert('Hello')>
    <table background="javascript:alert('Hello')">




















