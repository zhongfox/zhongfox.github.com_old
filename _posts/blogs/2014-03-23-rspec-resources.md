---
layout: post
categories: [blog, rails]
tags : [rspec, test]
title: Rspec 相关资源学习
---
{% include JB/setup %}

Rspec 的一些相关技术，如mock shoulda 等，并非rspec自带，而是由一些相关gem提供。没有分清来源并系统学习，导致经常遇到问题不知从何查起，这里总结了几个常用的gem

rspec 会安装3个gem：

`gem install rspec`   # for rspec-core, rspec-expectations, rspec-mocks

### rspec-mocks

<https://github.com/rspec/rspec-mocks>

`gem install rspec-mocks` 

看了不少资料，还是没有分清mock和stub的区别，期望有一天我会明白，现在姑且混为一谈

* double 是在测试中代替其他对象的对象, double一般分2中：

  * 普通double 和 现有的对象，类没有任何关系，存在的目的只是在其上mock各种方法，以代替其他对象
  * `Verifying doubles` 3.0.0.beta1 / 2013-11-07 以后提供的，会做一些验证TODO

* 创建double

  * `book = double("book", :title => "The RSpec Book")` 第一个参数是name， 后面的hash是mock得方法及返回
  * 也可以分开写：`book = double("book"); allow(book).to receive(:title) { "The RSpec Book" }`
  * 还可以没有name `double(:foo => 'bar')`

* mock方法和返回值

  * `allow(book).to receive(:title) { "The RSpec Book" }`
  * `allow(book).to receive(:title).and_return("The RSpec Book")`

* 设置多个返回值，以循环返回 `allow(die).to receive(:roll).and_return(1, 2, 3)`

* 在一个测试用例中期望对象指定的方法被调用`expect(validator).to receive(:validate) { "02134" }`

* have_received 同上，貌似只能期望mock的方法

* 期望方法调用时还可以指定期望的参数 

  `expect(double).to receive(:msg).with("A", 1, 3)`

  `expect(double).to receive(:msg).with(no_args())`

  <https://github.com/rspec/rspec-mocks#argument-matchers>

* 期望方法调用的次数 <https://github.com/rspec/rspec-mocks#receive-counts>

* 期望方法调用的顺序 <https://github.com/rspec/rspec-mocks#ordering>

* 关于设置返回值 <https://github.com/rspec/rspec-mocks#setting-responses>

* 另外 Factory Girl 提供的 `build_stubbed`方法 `build_stubbed(:contact, firstname: 'Lawrence', lastname: 'Smith')`, 个人感觉直接用Factory Girl的build即可

---

### database_cleaner

`gem install database_cleaner`

<https://github.com/bmabey/database_cleaner>


其实rspec自带了[事务机制](https://relishapp.com/rspec/rspec-rails/docs/transactions)

在`spec/spec_helper.rb`的这句话`config.use_transactional_fixtures = true` 就是指定让每个测试使用事务回滚。


---

### rspec-expectations 

`gem install rspec-expectations`

<rspec-expectations https://github.com/rspec/rspec-expectations>

---

### shoulda-matchers

`gem install shoulda-matchers`

<https://github.com/thoughtbot/shoulda-matchers>
