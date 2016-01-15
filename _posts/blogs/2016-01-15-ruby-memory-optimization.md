---
layout: post
categories: [blog, ruby]
tags : [ruby, gc, memory]
title: Ruby 内存优化
---
{% include JB/setup %}

这篇文章主要是是15年5月份解决ruby项目内存优化过程中的邮件以及最后的分享, 后面偶尔会找出来参考, 现在整理在博客中, 方便查阅

---

15/5/22 15:24, zhonghua 写道:

在rails项目中, 内存膨胀会造成比较严重的性能问题, A项目中涉及很多数据量较大的表, 内存膨胀的一个主要原因是是实例化了太多的ActiveRecord对象, 如:

这里是我们正在修复的一些内存膨胀代码:

    items = ::Stock::Item.where("stock_items.stored_id = ?", stored_id)   # 这里将实例化大概228461 个AD对象
    skus  = DealSku.where("barcode in (?)", items.map(&:barcode))     # 这里将实例化153919个AD对象

    brands = Brand.zhaoshang_config_brands         #实例化 6629 个Brand AD对象
    brands_arr = brands.inject([]) do |result, brand|
      result << {name: brand.name, id: brand.id}
    end

    where_stmp   = "user_name = '#{params[:filter_created_editor]}' AND action_type_id = #{EditingLog::ACTION_TYPES.index("create")} AND  loggable_type = 'TaoJifenDealBase'"
    loggable_ids = EditingLog.select('loggable_id').where(where_stmp)  # 实例化25962个 EditingLog对象
    ["tao_jifen_deals.id in (?)", loggable_ids.map(&:loggable_id)]


为了方便大家在开发测试中能及时发现此类问题, 在A项目中集成了内存增长, active Record创建分析工具 oink: https://github.com/noahd1/oink/

在开发过程中, rails s 会将本工单对应请求的内存, AD分析记录到单个工单对应的日志里, 比如在开发工单`feature_rm77386_zhonghua_520_oink_script` 时, 会创建一个日志文件:   `log/oink_feature_rm77386_zhonghua_520_oink_script.log`
可以运行一个简单脚本(./script/oink.rb) 进行 分 析, 脚本调用oink进行两项检查:


1. 内存增长在50M以上的单个请求
2. 实例化AD对象超过3000个的单个请求


结果类似下面内容, 请大家在每个工单提测前执行, 并分析超过阈值的请求, 是否存在不合理的内存膨胀. 之后我们将会把此步骤集成到测试流程中.

单 次请求占用内存超过80M:

    ---- MEMORY THRESHOLD ----
    THRESHOLD: 80 MB

    -- SUMMARY --
    Worst Requests:
    1. May 13 09:22:14, 1319104 KB, admin/orders#index
    2. May 13 09:25:02, 1257784 KB, admin/orders#index
    3. May 13 10:16:11, 1255904 KB, admin/orders#index
    4. May 13 10:41:45, 1253600 KB, admin/orders#index
    5. May 13 15:02:19, 1251412 KB, admin/orders#index
    6. May 13 14:24:37, 1190396 KB, admin/orders#index
    7. May 13 09:58:12, 1190364 KB, admin/orders#index
    8. May 13 14:38:07, 1188016 KB, admin/orders#index
    9. May 13 13:20:40, 1188012 KB, admin/orders#index
    10. May 13 13:35:58, 1188012 KB, admin/orders#index

    Worst Actions:
    次 数, 请求
    18, admin/orders#index
    8, admin/ju_deals#index
    3, admin/ju_deals#edit
    1, admin/stock/items#index
    1, admin/pay/accounts#export
    1, admin/zhe_product_monitors#index

    Aggregated Totals:
    Action                              Max    Mean    Min    Total    Number of requests
    admin/orders#index                  1319104    1166615    991408    20999076    18
    admin/ju_deals#index                137488    130671    126260    1045368    8
    admin/pay/accounts#export           1032440    1032440    1032440    1032440    1
    admin/ju_deals#edit                 143148    136700    132672    410100    3
    admin/stock/items#index             131072    131072    131072    131072    1

单 次请求实例化Active Record 对象超过5000个的请求:

    ---- OINK FOR ACTIVERECORD ----
    THRESHOLD: 5000 Active Record objects per request

    -- SUMMARY --
    Worst Requests:
    1. May 13 12:01:48, 406413, admin/pay/accounts#export
    2. May 13 15:02:19, 386976, admin/orders#index
    3. May 13 09:25:02, 385803, admin/orders#index
    4. May 13 14:59:38, 383567, admin/orders#index
    5. May 13 10:41:45, 382481, admin/orders#index
    6. May 13 09:22:14, 382452, admin/orders#index
    7. May 13 13:22:38, 358657, admin/orders#index
    8. May 13 14:14:55, 358463, admin/orders#index
    9. May 13 14:38:07, 358436, admin/orders#index
    10. May 13 14:28:58, 358424, admin/orders#index

    Worst Actions:
    次 数, 请求
    6308, admin/ju_deals#index
    1979, admin/ju_deals#edit
    599, admin/zhaoshang/deals#new
    201, admin/zhaoshang/deals#edit
    67, admin/deals#index
    27, admin/brands#get_all_brands
    27, admin/zhaoshang/deals#commodity_create_list
    24, admin/tao_jifen_deals#index
    18, admin/orders#index
    15, admin/ju_deals#update
    9, admin/zhaoshang/deals#create
    4, admin/zhaoshang/deals#update
    3, admin/ju_deals#new
    3, admin/candidate_deals#edit
    2, admin/stock/ins#index
    1, admin/welcome#index
    1, admin/candidate_deals#update
    1, admin/deals#edit
    1, admin/product_monitors#index
    1, admin/stock/creatables#publish
    1, admin/tb_comments#index
    1, admin/candidate_deals#editing_logs
    1, admin/candidate_deals#index
    1, admin/pay/accounts#export
    1, admin/candidate_deal_comments#comments
    1, admin/stock/items#index

---

2015-06-11 17:05 GMT+08:00 zhonghua 写道

通过一系列的优化, 目前A项目 内存消耗从2~5G 降到了 600~800M, 感谢大家的配合!

推荐一些关于ruby 内存优化相关的文章, 感兴趣的同学可以看看:

* <https://www.airpair.com/ruby-on-rails/performance>  五星推荐, rails/AD 虽然好用,但不是所有场景都适用, 在大数据的场景下, 我们应该如何避免陷入内存膨胀的陷阱
* <https://blog.engineyard.com/2009/thats-not-a-memory-leak-its-bloat>  关于Active record 内存膨胀


ruby GC:

* <http://www.yoniweisbrod.com/three-changes-in-ruby-2-1-0>
* <http://samsaffron.com/archive/2013/11/22/demystifying-the-ruby-gc>

工具:

* <https://github.com/noahd1/oink>
* <https://github.com/ruby-prof/ruby-prof>

书籍:

* <http://patshaughnessy.net/ruby-under-a-microscope> 以前推荐过
* <https://pragprog.com/book/adrpo/ruby-performance-optimization> 没看过, 坐等

---

15/6/22 21:52, zhonghua 写道:

我们使用到的主要优化策略有:

1. 去掉大量使用ActiveRecord的场景
    如优化工单:  76292, 76290等, 有的请求一次性实例化出几十万级别AD对象
    所谓的大量使用, 当然没有一个固定的概念,  我的理解是超过数量级在几千的可能需要优化, 上万的AD操作必须优化.
    优化策略主要包括:
    1. 不要select *
    2. 考虑直接用sql / pluck方法等避免创建AD对象
    3. 添加必要的分页/limit
    4. https://www.airpair.com/ruby-on-rails/performance   这篇文章上说了很多其他优化点

    为什么要避免大量使用AD对象呢, 下面的几篇文章说得很清楚, 主要有以下几点:
    1. AD对象比较占内存, 1G的mysql数据, 实例化为AD对象, 大概要占用2G的内存
    2. 实例化AD对象很慢

2. 使用缓存
   如工单: 76293
   在A项目中, 出于实时性和性能的不重视考虑,  我们很少使用对象/片段缓存, 但是随着后台使用量增加, 功能越来越负责, 对一些关键页面增加缓存设计考虑其实很有必要.
   在web程序设计和优化中, 缓存设计和优化效果是非常明显的.


关于内存优化的其他方面总结:

1. AD对象的优化其实是减少使用ruby对象的一个应用, 其实想想我们为什么要解决内存膨胀, 是因为内存膨胀, GC耗时增加, 应用就慢了. 原因在于ruby 进行GC时, 用户的ruby代码是停止执行的. 也就是这个关系:

    创建对象增加 -> GC频率和时间增长 -> 用户ruby代码执行停顿次数和时间增长 -> 应用变慢
    而AD对象因为功能强大, 设计复杂包含更多的小对象, 因此GC更加耗时
    更多GC细节大家可以阅读ruby-under-a-microscope 这本书最后一章.

2. 知道原因, 那其实能找到哪些地方大量创建AD对象, 我们就成功一半了, oink, ruby-prof 真是很不错的功能.

     另外我们在newrelic也打开了GC profile, 可以在请求中看到GC 的占用百分比等信息, 对比一下A项目前台和后台的GC百分比:

     https://rpm.newrelic.com/accounts/...(敏感信息).../applications/...(敏感信息).../ruby_vms
     https://rpm.newrelic.com/accounts/...(敏感信息).../applications/...(敏感信息).../ruby_vms

    前台GC 时间大概为请求周期的2.5%
    后台GC 时间大概为请求周期的12%

   差距还是挺大的, 以后大家也可以通过newrelic去分析具体请求的GC情况, 我个人感觉超过5%, 那应该需要关注是否优化.

3.  2/8 法则在这里又体现出来了, 20%的请求消耗了80%的资源, 因此我们只要优化这20%的请求, 就可以获得80%的性能提升.

    从结果看, 我们只优化了10个请求, admin 内存占用从 2~5G 降到了0.6~0.8G

4. 不要过早优化

    上面说了这么多, 大家千万不要认为ActiveRecord是魔鬼, ActiveRecord非常好用, 极大地提高了生产力.
    在绝大部分场景我们都应该是AD, 以提高生产力和代码表现力, 我们在应用创建的初期很难预估到应用/数据表今后增长的趋势, 当我们遇到相应性能瓶颈时, 找到性能瓶颈, 这样才是合理的.
    所有, 我们开发/运维同学在遇到因为数据量增长造成的性能问题时, 都不要去抱怨以前的开发同学为什么没有预见性云云, 数据增长, 性能瓶颈只是说明我们在发展.


就这些了, 大家可以补充
