---
layout: post
categories: [blog, rails]
tags : [rails, rails guides, asset, pipeline]
title: Rails Asset Pipeline
---
{% include JB/setup %}

Asset Pipeline 是一个**合并**、**最小化压缩** js和css的框架,同时也提供了用于编写（js css）资源的其他语言，例如CoffeeScript, Sass 和 ERB

### 配置

从rails 3.1 开始 Rails默认开启 assetr pipeline, 如需关闭

创建app时： `rails new appname --skip-sprockets`

或者

在配置中 `config.assets.enabled = false`

----

###主要功能

1. 合并资源：因为浏览器的并发限制，这个功能在production环境显得特别重要

   实现：Rails自动把原始js和css各种合并为一个（可配置），并加以MD5 fingerprint 为后缀。浏览器缓存该文件，每次原始资源文件修改后，fingerprint 会被修改，以此来是浏览器缓存过期。

2. 最小化压缩资源：对CSS移除多余空白和注释，对于JS会有更复杂的优化过程

3. 提供更高级的语言来编写资源，最后通过预编译来生成普通资源， Sass 生成 CSS, CoffeeScript 生成 JavaScript, ERB 默认支持两者

----

###相关配置

| 配置                                   | development | production | 作用
|:---------------------------------------|:------------|:-----------|:------------------------------------
| config.assets.enabled                  | true        | true       | 开启 asset pipeline
| config.assets.digest                   | false       | true       | 开启 fingerprint
| config.assets.paths                    | ......      | ......     | 追加搜索路径
| config.assets.compress                 | false       | true       | 开启对资源最小化压缩
| config.assets.debug                    | true        | false      | manifest文件中的资源引用分开生产html
| config.assets.prefix                   | /assets     | /assets    | 编译后的资源文件位置前缀，相对/public
| config.assets.initialize_on_precompile | true        | true       | false可以部分加载你的应用程序？？？
| config.assets.precompile               | [Proc, /../]|[Proc, /../]| 预编译数组，可向其追加(rails 3 放在config/environments/production.rb, rails 4 必须放在config/application.rb)
| config.assets.manifest                 | nil         |nil         | 预编译时生成的 manifest.yml文件位置，默认是config.assets.prefix
| config.assets.compile                  | true        |false       | 即时编译，每次编译后不放在config.assets.prefix,而放在rails的缓存系统上

----

###关于 fingerprint

fingerprint技术是使文件名依赖于文件内容，文件名随着文件内容的改变而改变。这样提供一个通过文件名来判断文件是否修改的简单方法。

如果文件名是唯一的且依赖于文件内容，HTTP header可以设置让其在HTTP过程中缓存（CDNs, ISPs，浏览器和其他网络设备）。文件内容修改导致文件名的修改，这叫做缓存破坏（ cache busting）

Rails 采用在文件名后加上文件内容的hash值来作为 fingerprint

fingerprint默认在 production 开启，其他环境关闭，可通过 配置设置：config.assets.digest

----

###使用 Asset Pipeline

1. 未编译的资源放在app/assets目录，production环境不会读取该目录（development会）

2. production环境会预编译app/assets存放至public/assets 

3. public/assets 放置编译过的资源，该目录里的所有资源应该视为静态资源，让web服务器直接读取

**资源组织**

* 项目资源(js images css)位置 app/assets

* 项目库资源位置 lib/assets

* 其他插件资源 vendor/assets

----

**搜索路径**

在manifest文件或者helper(`javascript_include_tag` `stylesheet_link_tag` )中引用资源文件时，默认在以下三个目录查找：

    app/assets/images 
    app/assets/javascripts
    app/assets/stylesheets

在控制台可以通过以下命令查看加载路径：`Rails.application.config.assets.paths`

配置中可以追加加载路径, 如：`config.assets.paths << Rails.root.join("app", "assets", "flash")`

需注意的是：在manifest文件外引用的其他资源文件需要放在**预编译数组**中，这样production才能引用到。

----

**Manifest 文件**

manifest 文件提供若干指令，用于指定要用哪些文件生成单个的css或js。

同时，如果`Rails.application.config.assets.compress`是true的话，还会对生成的文件进行最小化压缩

----

**index 文件**

通常一个资源库中的index文件会作为manifest文件，如：

     lib/assets/library_name/index.js

该文件会使用加载命令来引用该库中的相关文件，app的manifest文件只需如下即可引用该库：

    //= require library_name

----

**资源引用链接**

在开启 pipeline的环境下，可以使用以下helper加载搜索路径下的资源：

    stylesheet_link_tag
    javascript_include_tag 
    image_tag 

* 在`.css.erb` 文件中引用如：`.class { background-image: url(<%= asset_path 'image.png' %>) }`

   it would make sense to have an image in one of the asset load paths, such as app/assets/images/image.png, which would be referenced here. If this image is already available in public/assets as a fingerprinted file, then that path is referenced.

* 在`.css.scss` 文件中： 

    image-url("rails.png") becomes url(/assets/rails.png)
    image-path("rails.png") becomes "/assets/rails.png"
    asset-url("rails.png", image) becomes url(/assets/rails.png)
    asset-path("rails.png", image) becomes "/assets/rails.png"

* 在`.js.erb` 文件中：`{ src: "<%= asset_path('logo.png') %>" }`

* 在 `.js.coffee.erb` 文件中：`$('#logo').attr src: "<%= asset_path('logo.png') %>"`

----

**加载指令**

* 加载指令起始于`//=`

* 加载指令`//= require 文件名` 会在搜索路径中查找并加载相应文件

* 加载子目录资源：如在js的manifest文件中`//= require sub/something` 会引用文件`app/assets/javascripts/sub/something.js`

* 无需指定要加载的文件扩展名，Sprockets 会加载和manifest扩展名相同的资源

* `//= require_tree 目录` 递归地加载该目录下所有的资源文件，目录需要是对于该manifest的相对路径，`.`代表该manifest所在目录

* `//= require_directory 目录` 同上，但是非递归。

* 加载指令从上向下执行，但是require_tree所引入的文件顺序是不确定的，如需要指定顺序引用，那应该先单独引入先决文件，require_tree会自动避免对同一文件多次引用。

* `//= require_self` 该指令貌似只给css用？？ 该指令会将本文件中的css(如果有的话)放置调用require_self的精确位置，如果多次调用，只会在最后一次引用

----

**预编译**

在引用需编译的资源文件时，该文件会经过若干预编译过程

资源文件的扩展名决定了该资源会经过哪预编译过程：依据扩展名从右往左依次处理

----

###开发模式

`config.assets.debug` 决定了是否把manifest文件中的引用分开，在开发模式默认是true，因此

app/assets/javascripts/application.js

    //= require core
    //= require projects
    //= require tickets

将生成html

    <script src="/assets/core.js?body=1" type="text/javascript"></script>
    <script src="/assets/projects.js?body=1" type="text/javascript"></script>
    <script src="/assets/tickets.js?body=1" type="text/javascript"></script>

如果`config.assets.debug = false`, 将生成

    <script src="/assets/application.js" type="text/javascript"></script>

对生成的资源文件首次请求，编译后放置rails的缓存系统上， 将生成`must-revalidate Cache-Control`HTTP header，在资源文件未修改前再次请求，服务器将返回304，资源修改后再次请求，将会被再次编译。

----

####生产模式

在部署到生产环境时，需要对资源进行预编译：

    bundle exec rake assets:precompile

预编译对象：默认匹配器包括 application.js(包含在该文件中的js会被编译吗？), application.css 和所有非 JS/CSS 文件 (会自动包含所有的图像资源)，可对`config.assets.precompile`追加

该rake还会生成manifest.yml文件，所有资源和它们各自的指纹识别列表. 以供 Rails helper 方法使用

manifest 的默认位置是 `config.assets.prefix` (默认为 /assets)指定的位置. 这可以在 `config.assets.manifest` 选项更改, 并且必须指定一个完整的路径

----

** Far-future Expires header**

在nginx中配置缓存header：

    location ~ ^/assets/ {
      expires 1y;
      add_header Cache-Control public;
     
      add_header ETag "";
      break;
    }

**GZip 压缩器**

当文件被预编译时， Sprockets 也会创建一个 gzipped (.gz) 版本的资源文件

nginx 配置使用gzip：

    location ~ ^/(assets)/  {
      root /path/to/public;
      gzip_static on; # to serve pre-gzipped version
      expires max;
      add_header Cache-Control public;
    }

----

###其他

1. 如果在development模式下，public/assets存在资源文件，rails会去读取其中的资源，导致修改app/assets不生效，此时应该清除public下的资源文件: `rake assets:clean`.其实按道理说development下不应该出现public/assets资源，所有应该ignore该资源目录


### 参考资料
* Asset Pipeline <http://guides.rubyonrails.org/asset_pipeline.html>
