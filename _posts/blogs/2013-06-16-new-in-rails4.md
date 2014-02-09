---
layout: post
categories: [blog, rails]
tags : [rails, rails4]
title: Rails4里的新东西
---
{% include JB/setup %}

1. ActiveRecord 类方法`all`: 之前该方法查询数据库，返回Array, rails4 将返回`ActiveRecord::Relation`对象，不再会去查询数据库，如果需要返回array调用`all.to_a`

2. `all.load` 引发sql查询，但是返回的却是`ActiveRecord::Relation`对象，在某些希望缓存的场景可能有用

3. `Article.none` 返回一个空的`ActiveRecord::Relation`对象

4. `Article.where.not(name: "Hello")` 生成`!=`sql语句

5. order 支持hash： `Article.order(name: :desc)`

6. `ActiveRecord::Relation`对象再调用生成Relation对象的方法，方法明后增加`!`,  可以使Relation实现改变自身

7. `Article.find_by name: "Hello"` `Article.find_or_create_by name: "Hello"` 和之前版本的`find_by_<attribute>` `find_or_create_by_<attribute>`,新方法避免使用method_missing

8. 要创建一个类似ActiveRecord，但是不存储数据库的类，在类中`include ActiveModel::Model` 即可，可以模仿ActiveRecord添加validation等等

9. turbolinks 

10. 引入 models/concerns

    Rails concern 的作用：

    * 提取公共逻辑代码，使model变瘦

    * 解决多个module的依赖关系，关于依赖关系 <http://ihower.tw/blog/archives/3949>

11. model中的scope第二个参数必须是lambd

12. 新的view helper： `collection_check_boxes` `collection_radio_boxes` `f.date_field`

13. view中的`.ruby`模板文件

14. Cache Digests

### 参考资料

* What's New in Rails 4 <http://railscasts.com/episodes/400-what-s-new-in-rails-4>
