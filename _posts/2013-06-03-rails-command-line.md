---
layout: post
category : rails
tags : [rails, rails guides, command, rake]
title: Rails 命令行
---
{% include JB/setup %}

### 常用的rails命令

* rails console

* rails server

* rake

* rails generate

* rails dbconsole

* rails new app_name

----

### Rails Command Line

  * rails new 项目名称

    可以添加SCM 和数据库选项：`rails new . --git --database=postgresql`， 但必须先手动创建项目目录，并git init

    SCM选项有什么好处？数据库选项会自动配置database.yml文件

  * rails console = rails c

    * rails c --sandbox 沙箱模式 不会修改数据

    用途：
    * 测试代码

    * 读取/修改数据

    * 读取配置

  * rails server = rails s

    * -e 设置运行环境 `rails s -e production`

    * -p 指定端口 `rails s -p 3001`

    * -b 绑定ip

    * -d 以守护进程（daemon）运行

  * rails generate = rails g

    * 使用: rails generate GENERATOR [args] [options]

    * 直接 rails g 可以查看有哪些生成器

  * rails destroy = rails d  是rails generate的逆操作

  * rails dbconsole = rails db 进入配置的数据库命令行

    * `rails db 环境名` 模式名是指test production 等, 默认是develop

    * `rails db -p` 从 database.yml 里获取密码

  * rails runner = rails r 非交互式运行rails代码

    * -e 环境名称

----

### 常用的generator：

1. rails generate assets NAME [options]

   NAME 可以是CamelCased 或者 under_scored，如果需要子目录，可以传递`parent/name`

   将在/assets中生成生成：

   * js文件 如果使用了CoffeeScript将生成coffee文件

   * css文件 如果使用了Sass将生成scss文件


2. rails generate controller NAME [action action] [options]

   NAME 可以是CamelCased 或者 under_scored，如果需要在模块中生成，可以传递`parent_module/controller_name`

   **NAME 通常要自己手动指定复数**

   将生成：

   * controller文件

   * view文件 `-e` 指定模板引擎，默认是erb

   * test文件 `-t` 指定测试框架，默认是test_unit

      `--fixture`指定是否创建测试文件, 传递`--no_--fixture`将其禁止

   * helper文件 `--helper` 指定是否生成helper，默认是true, 传递`--no_helper`将其禁止

   * asset文件 `--assets` 指定是否生成资源文件，默认是true，传递`--no_assets`将其禁止

   * 添加路由

3. rails generate helper NAME [options]

   NAME 可以是CamelCased 或者 under_scored，如果需要在模块中生成，可以传递`parent_module/helper_name`

   将生成：

   * helper文件

   * test文件 `-t` 指定测试框架，默认是test_unit

      `--fixture`指定是否创建测试文件, 传递`--no_--fixture`将其禁止

4. rails generate migration NAME [field[:type][:index] field[:type][:index]] [options]
    #TODO


5. rails generate model NAME [field[:type][:index] field[:type][:index]] [options]

   NAME 可以是CamelCased 或者 under_scored，如果需要在模块中生成，可以传递`e.g. admin/account` 或 `Admin::Account`

   将生成：

   * migrate文件 `--migration`指定是否生成migrate文件，传递`--no_migration`将其禁止

      `--timestamps`指定是否创建`created_at:datetime updated_at:datetime`, 传递`--timestamps`将其禁止

      在类型后面添加`:index`将在migrate中为该列添加索引,`:uniq`将创建唯一索引

   * model文件 `--parent=PARENT`  可以指定其父类

   * test文件 `-t` 指定测试框架，默认是test_unit

      `--fixture`指定是否创建测试文件, 传递`--no_--fixture`将其禁止

6. rails generate scaffold NAME [field[:type][:index] field[:type][:index]] [options]

   NAME需要是单数形式，CamelCased 或 under_scored 均可

   将生成：

   * migrate文件 `--migration`指定是否生成migrate文件，传递`--no_migration`将其禁止

      `--timestamps`指定是否创建`created_at:datetime updated_at:datetime`, 传递`--timestamps`将其禁止

      在类型后面添加`:index`将在migrate中为该列添加索引,`:uniq`将创建唯一索引

   * model文件 `--parent=PARENT`  可以指定其父类

   * controller文件

   * view文件 `-e` 指定模板引擎，默认是erb

   * test文件 `-t` 指定测试框架，默认是test_unit

      `--fixture`指定是否创建测试文件, 传递`--no_--fixture`将其禁止

   * helper文件 `--helper` 指定是否生成helper，默认是true, 传递`--no_helper`将其禁止

   * asset文件 `--assets` 指定是否生成资源文件，默认是true，传递`--no_assets`将其禁止

   * 添加路由

7. rails generate scaffold_controller CreditCard

  基本同上，只是不生成model，不生成migrate，不修改路由，貌似也没有资源文件！

----

### Rake

 大多数rake都可以传入环境名称以指定运行环境, 如 `rake db:migrat RAILS_ENV=production`

  * **rake --tasks** 或者 **rake -T** 查看所有有描述的rake, **rake -t taskname**查看指定task的描述

  * **rake -P** 查看所有rake，不展示描述

  * **rake about** 环境相关信息

  * **rake notes** 搜索.builder .rb .erb .haml  .slim文件中以FIXME, OPTIMIZE， TODO开头的注释

    可以只搜索其中一种注释，如 `rake notes:fixme`

    或者指定一个自定义的注释，如想搜索注释BUG： `rake notes:custom ANNOTATION=BUG`

  * **assets**

    * `rake assets:precompile` 静态资源预编译;

    * `rake assets:clean` 删除已编译的静态资源

  * **rake routes**

    查看现有路由, 可以传入controller以查看指定控制器对于的路由：`CONTROLLER=users rake routes`

  * **rake secret** 生成一个用于session secret的随机值

  * **rake middleware** 查看当前环境使用了哪些中间件

  * **rake stats** 生成代码统计

  * **tmp**

    * ` rake tmp:create` 在tmp下创建目录 sessions, cache, sockets, pids

    * `rake tmp:cache:clear` 清除 tmp/cache.

    * `rake tmp:sessions:clear` 清除 tmp/sessions.

    * `rake tmp:sockets:clear` 清除 tmp/sockets.

    * `rake tmp:clear clears` 清除以上三者

  * **db**

    * `rake db:create` 依据DATABASE_URL 或者 config/database.yml 中Rails.env 环境创建database(development 和test)

      `rake db:create:all` 将创建配置中所有database

    * `rake db:drop` 依据配置删除数据库(development test)

      `rake db:drop:all` 删除配置中所有数据库

    * `rake db:reset` 先drop掉数据库，然后依据schema.rb文件重新生成数据库和表

    * `rake db:migrate` 迁移当前环境的数据库(会调用 db:schema:dump 以更新db/schema.rb)

    * `rake db:migrate VERSION=20080906120000` 使当前数据库迁移到指定的版本号，首先判断指定版本号和当前数据库版本号的顺序，然后视情况执行up(change)或者down

    * `rake db:migrate:up VERSION=20080906120000` 对指定版本号的migrate执行up操作

    * `rake db:migrate:down VERSION=20080906120000` 对指定版本号的migrate执行down操作

    * `rake db:migrate:status` 查看数据库迁移状态

    * `rake db:version` 查看当前migrate版本号

    * `rake db:rollback [STEP=n]` 对最近的n次migrate执行down操作，不传递STEP的话n是1

    * `rake db:schema:dump` 基于当前数据库, 以ruby的形式, 生成db/schema.rb文件

    * `rake db:schema:load`  加载schema.rb 以格式化数据库

    * `rake db:structure:dump` 基于当前数据库, 以sql的形式, 生成db/structure.sql. 可通过参数指定其他文件: DB_STRUCTURE=db/my_structure.sql

    * `rake db:schema:cache:clear`

    * `rake db:schema:cache:dump`

    * `rake db:seed` 加载  db/seeds.rb 文件

    * `rake db:setup` 基本上等于 db:reset + db:create + db:schema:load + db:seed

    * `rake db:test:prepare` 将`db/schema.rb`加载到测试数据库，在这之前会检查`db/schema.rb`是否迁移更新到最新的，如果不是将会有提示
    * `rake db:test:clone` 开发数据库结构会克隆到测试数据库。不过，这个任务不会复制数据库中的数据

----

  **关于 schema 文件**

    有两种以下schema文件，通过配置`config.active_record.schema_format` 为 :sql 或者 :ruby，为项目选择其中一个

    * ruby格式： db/schema.rb

      可以在Active Record支持的数据库上通用

      不能表达外键约束，触发器，存储过程等

    * sql格式： db/structure.sql

      使用特定的数据库sql语言表达，只能在相同的数据库上使用

    schema文件 （而非migrates）是项目当前数据库构造的权威，这2种文件建议禁止手动修改，它们的作用是代表当前数据库的状态

    当需要在另一个项目中部署数据库时，不需要重新执行migrate的所有步骤，只需要简单加载以上某一个文件

    schema文件方便开发者快速检视Active Record 对象的字段属性

----

**对于mysql的migrate**

migration中的integer只能表示signed integers，要使用` t.column :join_ip, 'integer unsigned'`

migration 文件中integer的limit用法：

|:limit      |Numeric Type  |Column Size |Max value
|:-----------|:-------------|:-----------|:-------------
|1           |tinyint       |1 byte      |127
|2           |smallint      |2 bytes     |32767
|3           |mediumint     |3 byte      |8388607
|nil, 4, 11  |int(11)       |4 byte      |2147483647
|5..8        |bigint        |8 byte      |9223372036854775807

### 参考资料
* A Guide to The Rails Command Line <http://guides.rubyonrails.org/command_line.html>
