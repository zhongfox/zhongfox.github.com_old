---
layout: post
categories: [blog, rails]
tags : [rails, activeRecord, transactions]
title: ActiveRecord Transactions
---
{% include JB/setup %}

方法`transaction` 既在ActiveRecord及其子类可用，也在ActiveRecord的实例上可用

        Order.transaction do
          ...
        end

        order.transaction do
          ...
        end

----

transaction 代码块里的ActiveRecord操作对象可以是属于不同class的，因为transaction是针对一个**数据库**连接，而不是针对一个model

        Order.transaction do #也可以用order.transaction 或 deal.transaction
          deal.save!
          order.save!
        end

----

`save` 和 `destroy`引发的sql将自动被transaction包裹，包括validations和`after_*`回调中的所有sql。

`after_commit` 回调将会在transaction 成功提交后触发，所以该回调的sql操作不在上一个事务里

`after_rollback ` 回调将会在transaction回滚时触发，该回调的sql操作也不在上一个事务里

----

transaction 通过捕获块里的异常来决定数据库回滚，异常会向上传播（除了ActiveRecord::Rollback，见下例），所以在块里通常使用会抛出异常的方法(save! create!)：

  下例中，是用的是`save`, 成功返回true，不成功返回false，如果order因为验证没有通过保存失败，但是整个事务却没有回滚，deal却会保存成功！

        Order.transaction do
          deal.save
          order.save       #如果order保存失败，返回false，但是deal会保存成功
        end

  正确的用法

        Order.transaction do
          deal.save!
          order.save!       #如果保存失败会抛出异常，整体ROLLBACK
        end

  create!/create 也是同样道理

----

也可以手动抛出异常：`raise ActiveRecord::Rollback`

  该异常也会引发回滚

        tag1 = Tag.first
        Tag.transaction do
          tag1.save!            #假设保存无异常
          raise ActiveRecord::Rollback
        end

  sql操作将会回滚，生成的sql是

        BEGIN
          ...sql...
        ROLLBACK

但是该异常很大的一个不同是，该异常不会向上传递，请见官网描述：

    ActiveRecord::Transactions::ClassMethods#transaction uses this exception to distinguish a deliberate rollback from other exceptional situations. Normally, raising an exception will cause the transaction method to rollback the database transaction and pass on the exception. But if you raise an ActiveRecord::Rollback exception, then the database transaction will be rolled back, without passing on the exception.

  不向上传递的结果：

        Tag.transaction do
            tag1.save!        #假设保存无异常
            Tag.transaction do
              tag2.save!      #假设保存无异常
              raise ActiveRecord::Rollback
            end
        end

  生成的sql

        BEGIN
          ...sql...
        COMMIT

  结果是tag1和tag2都保存成功了！

  上例也可以看出在ruby中嵌套的transaction在sql中将会按照数据库聚集

  如果要求`ActiveRecord::Rollback`在子事务中回滚，需要加上`(requires_new: true)`(MySQL, PostgreSQL 有效)

        tag1 = Tag.first
        tag2 = Tag.last
        Tag.transaction do
            tag1.save!             #假设保存无异常
            Tag.transaction(requires_new: true) do
              tag2.save!           #假设保存无异常
              raise ActiveRecord::Rollback
            end
        end

  这将生成如下sql：

        BEGIN
          ...tag1 sql...
        SAVEPOINT active_record_1
          ...tag2 sql...
        ROLLBACK TO SAVEPOINT active_record_1
        COMMIT

  结果是tag1保存成功，tag2保存被回滚


----

一个transaction只对单个的数据库有效，一个单独的transaction无法回滚跨库的sql操作，折中的办法是用多个transaction：

    A transaction acts on a single database connection. If you have multiple class-specific databases, the transaction will not protect interaction among them. One workaround is to begin a transaction on each class whose models you alter:

  如下例：

        Order.transaction do          #假设Order和account是属于不同的库
          account.save!               #假设account保存成功
          order.save!                 #假设order保存失败
        end

  将生成sql：

        BEGIN
        BEGIN
        ...account sql...
        COMMIT
        ...order sql...
        ROLLBACK

  结果是account保存成功，order保存失败，没有达到想要的事务效果


  正确的做法是

        Order.transaction do                    #假设Order和OtherDataBase::Account是属于不同的库
          OtherDataBase::Account.transaction do
            order.save!
            account.save!
          end
        end

  上例中如果一个或者多个save!失败，产生的sql将是

        BEGIN
        BEGIN
          ...sql ...
        ROLLBACK
        ROLLBACK

----

在嵌套事务中，如果是手动抛出异常`ActiveRecord::Rollback`,因为该异常不会向上传递，所以外层的transaction不会受到里面的异常影响

        Order.transaction do
          OtherDataBase::Account.transaction do
            order.save!
            raise ActiveRecord::Rollback unless account.save
          end
        end

  上例中如果save!失败，产生的sql将是

        BEGIN
        BEGIN
          ...order sql ...
        ROLLBACK
        COMMIT

  注意上面的ROLLBACK只针对account，结果就是account保存失败了，但是order却保存成功了，没有正确实现事务！

### 参考资料

* Active Record Transactions <http://api.rubyonrails.org/classes/ActiveRecord/Transactions/ClassMethods.html>

这个放着备忘: [Rails 中乐观锁与悲观锁的使用](https://ruby-china.org/topics/28963)
