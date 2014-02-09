---
layout: post
categories: [blog, rails]
tags : [rails, update]
title: Active Record 中的各种update
---
{% include JB/setup %}

Rails 3 在active record上提供了大量的update方法，但是方法名没有完全做到见名知义，因此有必要总结一下，特别要注意的是，需要区分各个方法中，是否执行了validate和callback, 是否是原子性更新

### 预备知识

* `persisted?`

  如果对象已经保存过的，且没有destroy的，返回true，基本上是`new_record?` 的反义词

* `assign_attributes(new_attributes, options = {})`

---

### Active Record 中的各种update

**实例方法**

* `update_attribute(name, value)`

  更新单个字段，更新的时候代码：

        send("#{name}=", value)
        save(:validate => false)

  * validate被跳过
  * callbacks会执行
  * updated_at/updated_on 会被更新
  * 会更新所有的dirty 字段

* `update_attributes(attributes, options = {})`

  首先对active record对象进行一个hash赋值，然后调用save正常保存

        with_transaction_returning_status do
          self.assign_attributes(attributes, options)
          save
        end

  * 会进行mass-assignment 检查（传递`:without_protection => true`可以跳过）
  * 会进行validate，callback等等

* `update_attributes!(attributes, options = {})`

  同update_attribute，只是使用`save!` 保存失败会抛出异常

* `update_column(name, value)`

        raise ActiveRecordError, "can not update on a new record object" unless persisted?
        raw_write_attribute(name, value)
        self.class.update_all({ name => value }, self.class.primary_key => id) == 1

  只对已存在于数据库的记录进行更新单个字段，使用类方法update_all 组装sql, 所以：

  * validate，callback被跳过
  * 只更新一个字段，所以updated_at/updated_on dirty字段都不更新

* `increment(attribute, by = 1)`

  更新没有保存到数据库

        self[attribute] ||= 0
        self[attribute] += by
        self

* `increment!(attribute, by = 1)`

  该方法是**非原子性**的update

        increment(attribute, by).update_attribute(attribute, self[attribute])

**类方法**

* `update_all(updates, conditions = nil, options = {})`

  组装单条sql执行update，所以validate，callback被跳过

  参数updates可以是string，hash，array用于组装set语句

  参数options中可以设置:limit, :order

* `update(id_or_ids, attributes)`

  根据id或者ids，一个一个的找到对象然后调用实例方法`update_attributes`进行更新

  效率不高但是可以每个id的set不一样

  validate和callback都会执行

  最终会返回对象或者对象数组(没法依据返回值判断成功与否)

        if id.is_a?(Array)
          id.each.with_index.map {|one_id, idx| update(one_id, attributes[idx])}
        else
          object = find(id)
          object.update_attributes(attributes)
          object
        end

* `update_counters(id_or_ids, update_hash)`

  用于更新数字字段的**原子操作**方法(最后调用的是update_all)，直接组装sql更新

* `increment_counter(counter_name, id)`

  调用update_counters，对counter_name加一

* `decrement_counter(counter_name, id)`

  调用update_counters，对counter_name减一


