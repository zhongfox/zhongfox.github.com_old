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

   * 使用参数`:join_table`指定

   * rails将使用2个关联表(复数)组合一个中间表名，顺序是依照2个关联表的字母顺序


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

   has_one :account, class_name: "MyApplication::Billing::Account"

### 参考资料
* Active Record Associations <http://guides.rubyonrails.org/association_basics.html>
