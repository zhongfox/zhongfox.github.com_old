---
layout: post
category : rails
tags : [rails, rails guides, associations]
title: Rails associations
---
{% include JB/setup %}

association 是2个Active Record 模型之间的关联。

1. belongs_to

   一对`多`

   一对`一`

   声明中对方model使用单数

   声明`belongs_to`的一方应该含有对方的外键

   该model的migrate中使用`t.belongs_to :other_model` 也必须是单数

   ![belongs_to](http://guides.rubyonrails.org/images/belongs_to.png)

2. has_one

   `一`对一

   声明中对方model使用单数

   ![has_one](http://guides.rubyonrails.org/images/has_one.png)

3. has_many

   `一`对多

   声明中对方model使用复数

   ![has_many](http://guides.rubyonrails.org/images/has_many.png)

4. has_many :through

   1) 一对多, 一对多转化成 `多`对`多`

   声明中对方model使用复数, through对应的中间model也是复数

   需要一个中间model(中间表，含有2个外键)

   中间表的migrate需要声明2个外键`t.belongs_to`

   ![has_many :through](http://guides.rubyonrails.org/images/has_many_through.png)

   2) 一对多, 多对多 转化成 `一`对多

            class Document < ActiveRecord::Base
              has_many :sections
              has_many :paragraphs, through: :sections
            end

            class Section < ActiveRecord::Base
              belongs_to :document
              has_many :paragraphs
            end

            class Paragraph < ActiveRecord::Base
              belongs_to :section
            end

            @document.paragraphs

5. has_one :through

   一对一, 一对一 转化成 `一`对一

   ![has_one :through](http://guides.rubyonrails.org/images/has_one_through.png)

6. has_and_belongs_to_many

   一对多, 一对多转化成 `多`对`多`

   结构和`has_many :through`完全一样, 只是隐藏中间表

   该关联表不能有id主键`create_table :xxx_xxxs, id: false do |t|`

   **如何确定关联表**：

   If the default name of the join table, based on lexical ordering, is not what you want, you can use the :join_table option to override the default

   * rails将使用2个关联表(复数)组合一个中间表名，顺序是依照2个关联表的字母顺序

   * 使用参数`:join_table`指定

   ![has_and_belongs_to_many](http://guides.rubyonrails.org/images/habtm.png)

7. 选择`belongs_to`和`has_one`

   两者都可用于一对一的任何一方，`belongs_to`用于含有外键的一方

   语义的区别：谁拥有谁，谁属于谁

8. 选择`has_many :through` 和 `has_and_belongs_to_many`

   使用`has_many :through`: 如果需要把中间model作为独立的实体交互，或者中间model含有validation，callbacks等，或者中间model含有其他属性

   使用`has_and_belongs_to_many` 其他情况下，以达到使用简单

9. Polymorphic

   一对`一` 或者 一对`多` 的从属一方可以`belongs_to` 多个model

   多态的从属模型需要一个 XXX_type字段表示从属于那个model，有2种方式表示：

        t.integer :imageable_id
        t.string  :imageable_type #TODO这里面存的是什么？
        或者直接：
        t.references :imageable, polymorphic: true
        或者直接：
        t.belongs_to :imageable, polymorphic: true

   ![Polymorphic](http://guides.rubyonrails.org/images/polymorphic.png)

10. 自举关联

    指定相应的`class_name`和`foreign_key`

        class Employee < ActiveRecord::Base
          has_many :subordinates, class_name: "Employee",
                                  foreign_key: "manager_id"

          belongs_to :manager, class_name: "Employee"
        end

        @employee.subordinates
        @employee.manager

----

### Tips, Tricks, and Warnings

1. association 方法内建缓存，多次调用将不会重复查询，需要reload结果，可以传递true为方法的参数以实现

2. 关联关系查找class默认只在本class当前的命名空间下，如果想跨越module，使用`class_name`参数指定：

   `has_one :account, class_name: "MyApplication::Billing::Account"`

3. Updating the Schema

   需要确保有合适的数据表结构来支持关联关系

   * `belongs_to`  一方数据表需要存外键

   * `has_and_belongs_to_many ` 关系需要有合适的中间表(表名首先由2表字母顺序决定，可以使用join_table参数强制设定)

  * Controlling Association Scope

  * Bi-directional Associations

    通过反身代词设定双向关联关系，以解决对同一(数据库)数据不同引用，一方修改，但2边都没刷新，造成的数据不一致

    反身代词有诸多限制：对`:through` `:polymorphic` `:as` 关联无效 For belongs_to associations, has_many inverse associations are ignored.

        问题：
        c = Customer.first
        o = c.orders.first
        c.first_name == o.customer.first_name # => true
        c.first_name = 'Manny'
        c.first_name == o.customer.first_name # => false
        解决：
        class Customer < ActiveRecord::Base
          has_many :orders, inverse_of: :customer
        end

        class Order < ActiveRecord::Base
          belongs_to :customer, inverse_of: :orders
        end
        这样内存里对c的引用只有一份

---

### Detailed Association Reference

1. 关联对象 **belongs_to** 被关联对象

   **Methods Added by belongs_to**

   * association(force_reload = false)

   * association=(associate)

     设置关联关系，但是不保存

   * build_association(attributes = {})

     使用传入参数创建一个被关联对象，但是没有保存, 当关联对象save时，被关联对象才会被保存

   * create_association(attributes = {})

     和`build_association`类似，但是被关联对象会被保存

   **Options for belongs_to**

   * :autosave

     没搞懂
     If you set the :autosave option to true, Rails will save any loaded members and destroy members that are marked for destruction whenever you save the parent object

   * :class_name

   * :counter_cache

     这是为了方便查询关联对象的数量，方式：

     关联对象声明时设置`counter_cache: true` 被关联对象数据表保证有`关联对象复数_count`字段
     关联对象声明时设置可以配置被关联对象的特定字段名，如`belongs_to :customer, counter_cache: :count_of_orders`

     Rails会保证更新cache value，当调用`被关联对象.关联对象复数.size `时会返回该值

     Rails 还会在counter_cache字段上调用`attr_readonly`让其只可读

     [更多细节](http://stackoverflow.com/questions/9403577/rails-counter-cache-not-updating-correctly#answers-header)

   * :dependent

     `destroy`: 每个被关联对象将调用destroy方法，回调等会被执行

     `delete`: 个被关联对象将直接被sql删掉

     `restrict`: 如果存在任何被关联对象，将抛出异常`ActiveRecord::DeleteRestrictionError`

     如果`belongs_to `是进行的一对多关联，不应该有dependent设置，原因很明显

   * :foreign_key
   * :inverse_of
   * :polymorphic
   * :touch

     该参数的目的是，当关联对象save/destroy时，自动更新被关联对象的`updated_at`或者`updated_on`(touch: true)

     也可以设置要更新的时间字段`belongs_to :customer, touch: :orders_updated_at`

   * :validate

     该值默认是false，如果设置成true，在关联对象被保存时，将验证被关联对象的有效性。

   **Scopes for belongs_to**

   可以传递查询的scope，定制关联查询，如

   `belongs_to :customer, -> { where active: true }, dependent: :destroy`

   可以传递标准的activerecord查询，重点需了解以下几种

   * where
   * includes 实现急迫加载，消除n+1
   * readonly 通过关联查出来的对象，不能被修改
   * select 默认rails会查出被关联对象的所有字段，可以使用select指定

   **Do Any Associated Objects Exist?**

   在被关联对象上调用`nil?`判断其是否存在

2. 关联对象 **has_one** 被关联对象

   该关系表明被关联对象有外键

   **Methods Added by has_one**

   * association(force_reload = false)

   * association=(associate)

     设置关联关系，被关联对象的外键会被修改，**是否会被保存依赖关联对象是否已保存**（见下面When are Objects Saved?）

   * build_association(attributes = {})

     使用传入参数创建一个被关联对象，但是没有保存, 当关联对象save时，被关联对象才会被保存

   * create_association(attributes = {})

     和`build_association`类似，但是被关联对象会被保存

   **Options for has_one**

   * :as

     as 以实现多态

   * :autosave

     不明觉厉

   * :class_name

   * :dependent

     :destroy 被关联对象调用destroy

     :delete 被关联对象直接sql删除，callbacks 不执行

     :nullify 外键置为 NULL. Callbacks 不执行

     :restrict_with_exception 如果存在被关联对象，抛出异常

     :restrict_with_error causes an error to be added to the owner if there is an associated object

   * :foreign_key

     设定被关联对象数据表的外键

   * :inverse_of

     设置反身代词

   * :primary_key

     这个是设置关联对象的主键(因为被关联对象要通过外键找到关联对象的主键)

   * :source

     指定` has_one :through `的中间关联对象的名称

   * :source_type

     对`has_one :through` 加上 association  有用

   * :through

     `has_one :through `

   * :validate

     如果设置为true 当关联对象被save，被关联对象会被验证。该值默认是false

   **Scopes for has_one**

   和belongs_to的一样

   **Do Any Associated Objects Exist?**

   使用`nil?`

   ** When are Objects Saved?**

   `association=`:

   如果关联对象以保存：被关联对象更新外键且自动保存

   如果关联对象是未保存对象，被关联对象被设置外键但是不保存，当关联对象被保存时，被关联对象才被保存

   如果任何对象的验证不通过，则保存被取消

3. 关联对象**has_many**被关联对象

   该关系表示被关联对象数据表有外键

   **Methods Added by has_many**

   * collection(force_reload = false)

     如果为空返回空数组

   * `collection<<(object, ...)`

     添加若干个被关联对象，被关联对象设置上外键，是否保存依赖关联对象是否是已经保存

   * collection.delete(object, ...)

     把被关联对象的外键置为NULL，或者根据`dependent` 决定删除被关联对象

   * collection.destroy(object, ...)

     在被关联对象上调用destroy，会忽略参数`dependent`

   * collection=objects

     这会是被关联集合只剩objects中的对象，通过inster和delete对象来实现

   * collection_singular_ids

     该方法获得所有被关联对象id的数组，如`@order_ids = @customer.order_ids`

   * collection_singular_ids=ids

     通过赋被关联对象id数组，设定被关联对象，类似`collection=objects` 会通过增删对象实现

   * collection.clear

     移除所有被关联对象，实现依赖dependent参数：destroy：各自调用destroy，delete_all：用sql直接删除，其他情况设置外键为NULL

   * collection.empty?

     见名知义

   * collection.size

   * collection.find(...)

     和`ActiveRecord::Base.find`一致

   * collection.where(...)

     基于被关联对象进行 loaded lazily查询

   * collection.exists?(...)

     和`ActiveRecord::Base.exists?.` 一致

   * collection.build(attributes = {}, ...)

     传入多个被关联对象属性hash，将会返回初始化后的被关联对象，并设置外键，但是没有保存

   * collection.create(attributes = {})

     类似`collection.build` 但被关联对象会被保存


   **Options for has_many**

   * :as

     用于多态

   * :autosave

     不明觉厉

   * :class_name

   * :dependent

     destroy delete_all nullify restrict_with_exception restrict_with_error

   * :foreign_key

   * :inverse_of

   * :primary_key
   * :source
   * :source_type
   * :through
   * :validate

   **Scopes for has_many**

   You can use any of the standard querying methods inside the scope block. The following ones are discussed below:

  * where

    对where传递hash参数，不仅会作用于查询被关联对象，还会自动添加到创建被关联对象，如build 和create

    不清楚以上关系有无这个特性，TODO

  * extending
  * group
  * includes
  * limit
  * offset
  * order
  * readonly
  * select
  * uniq

### 其他补充

* 对被关联关系调用count/length/size 的区别

  * count：不管被关联对象是否加载，一定执行`select count...`sql

  * length: 如果被关联对象`loaded?==false` 会执行`select * ...`sql去查询(之后loaded将是true); 如果`loaded?==true` 不会查询

  * size: 如果`loaded?==fasle` 会执行`select count...`, 如果`loaded?==true` 不会查询, 总之size更高效

### 参考资料
* Active Record Associations <http://guides.rubyonrails.org/association_basics.html>
