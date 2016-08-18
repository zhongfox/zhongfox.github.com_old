---
layout: post
categories: [blog, go]
tags : [go, beego]
title: BEEGO 学习
---
{% include JB/setup %}

## 安装

### Bee工具: 

协助快速开发, 包括: 快速创建项目、实现热编译、开发测试以及开发完之后打包发布的一整套从创建、开发到部署的方案

`go get github.com/beego/bee` bee可执行文件默认存放在$GOPATH/bin里面

* `bee new myproject`

        myproject
        ├── conf
        │   └── app.conf
        ├── controllers
        │   └── default.go
        ├── main.go
        ├── models
        ├── routers
        │   └── router.go
        ├── static
        │   ├── css
        │   ├── img
        │   └── js
        ├── tests
        │   └── default_test.go
        └── views
            └── index.tpl

* `bee api myproject` 类似new, 少了static, views, 主要用作api

* `bee run` 

  通过监控文件变化, 实现自动编译重启

  必须在`$GOPATH/src/appname`下执行

  默认编译的可执行文件在项目目录下, 以项目名命名 TODO(编辑过程)

* bee pack

  默认在项目目录下生成`appname.tar.gz`

  其中包含: `conf/  appname* vendor/     views/`

  TODO 貌似项目下的可执行文件会复制, vendor为什么有

  TODO 应该还会有static目录

---

## Controller

* 定义controller:

      type MyController struct {
        beego.Controller
      }

* 定义action:

      func (this *MyController) Get() {
        this.Data["Website"] = "beego.me"  //存储任意类型数据
        this.Data["Email"] = "astaxie@gmail.com"
        this.TplName = "index.tpl"         //设置模板; 如不设置该参数，那么默认找模板目录的 Controller/<方法名>.tpl
      }

* 用户设置了模板之后系统会自动的调用 Render 函数

* 可以不使用模版，直接用 this.Ctx.WriteString 输出字符串

* `beego.Controller` 是controller基类, 实现了以下方法;

  * init
  * Prepare: 子类可以重写实现前置验证之类
  * 七个动词方法, 默认403
  * Finish: 后置操作, 可以用于数据清理, 数据库关闭等操作
  * Render TODO

* 在任意地方提前终止: `this.StopRun()` 终止后Finish不会执行

* 参数获取

  * GetString(key string) string     和`Input().Get(...)`有什么区别?
  * GetStrings(key string) []string
  * GetInt(key string) (int64, error)
  * GetBool(key string) (bool, error)
  * GetFloat(key string) (float64, error)

  参数获取可以利用struct的tag功能直接解析到struct

* 返回json

  >this.Data["json"] = somejson  
  >this.Controller.ServeJSON()

---

## View

* view 默认支持 tpl 和 html后缀

* 静态文件处理

  (默认值)在`beego.Run()`之前通过`StaticDir["/static"] = "static"` URL 前缀和映射的目录

  配置存于`beego.BConfig.WebConfig.StaticDir`, 是一个map, 可以进行修改

  增加资源映射: `beego.SetStaticPath("/down1", "download1")`

---

## 配置

* beego支持 INI(默认)、XML、JSON、YAML配置文件

  默认配置文件: `conf/app.conf`

* 支持配置不同运行模式, 如`[dev]``[prod]`
 
  解析的时候优先解析runmode下的配置，然后解析默认的配置

  获取: `beego.AppConfig.String(“dev::mysqluser”)`

* 配置文件中可以通过`include "文件名"` 引用多个其他文件


* 默认值 空值 TODO  配置(k还是v)不区分大小写?


示例:

    appname = beepkg
    httpaddr = "127.0.0.1"
    httpport = 9090
    runmode ="dev"
    autorender = false
    recoverpanic = false
    viewspath = "myview"

    [dev]
    httpport = 8080
    [prod]
    httpport = 8088
    [test]
    httpport = 8888

---

## 路由

* 基础路由

  * beego.Get(router, beego.FilterFunc)
  * beego.Post(router, beego.FilterFunc)
  * beego.Put(router, beego.FilterFunc)
  * beego.Head(router, beego.FilterFunc)
  * beego.Options(router, beego.FilterFunc)
  * beego.Delete(router, beego.FilterFunc)
  * beego.Any(router, beego.FilterFunc)

* 自定义的handler TODO: `beego.Handler(router, http.Handler)`

* RESTful Controller 路由

  `beego.Router("/admin", &admin.UserController{})`

   Get请求就执行Get方法,Post请求就执行Post方法,如果缺乏对应action方法,将返回`405 Method Not Allowed`

* 正则路由

  类似RESTful Controller 路由

  路由中可以有;

  `?:id` 该参数可选

  `:id` 该参数必要

  `:id([0-9]+` 参数约束

  action中获取正则参数: `this.Ctx.Input.Param(":id")`

* 自定义路由和action对应

  `beego.Router("/",&IndexController{},"httpmethod:funcname")`

  httpmethod可以多个, 用逗号分隔

  `beego.Router("/api",&RestController{},"get,post:ApiFunc")`

  `beego.Router("/simple",&SimpleController{},"get:GetFunc;post:PostFunc")`

  httpmethod `*`：包含以下所有的函数: get/post/put/delete/patch/options/head

* 自动匹配

  `beego.AutoRouter(&controllers.ObjectController{})`

  自动匹配方式: 路由解析: `/:controller/:method`

  除了`/:controller/:method`后续的url将解析到`this.Ctx.Input.Params`中

  > /object/blog/2013/09/12  调用 ObjectController 中的 Blog 方法，参数如下：map[0:2013 1:09 2:12]

  `this.Ctx.Input.Param(":ext")` 获取url后缀(`.json`之类)

* 注解路由

  在controller中注解action, 然后在routes中importcontroller, 自动生成路由

* namespace

  TODO

---

## 进程内监控

* 默认关闭的, 开启: 在配置文件中

  > EnableAdmin = true

  如果想修改监控地址和端口

  > AdminAddr = "localhost"  
    AdminPort = 8088

---

## 应用部署

* 运行模式

  默认是dev, 2种修改方式

  >beego.RunMode = "prod" //代码中

  >runmode = prod //配置文件中

  dev: view会渲染错误; 模板每次重新加载不会缓存; 

* 独立部署: `nohup ./appname &`

* supervisord

  参考: <http://beego.me/docs/deploy/supervisor.md>



---

TODO

* [Go Web 编程](https://github.com/astaxie/build-web-application-with-golang/tree/master/zh)
