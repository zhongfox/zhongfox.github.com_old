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

### FactoryGirl

<https://github.com/thoughtbot/factory_girl/blob/master/GETTING_STARTED.md>

* Lazy Attributes: 值放在`{}` 中的值会懒惰求职

* Aliases： `factory :user, aliases: [:author, :commenter] do`

* Dependent Attributes:

        factory :user do
          first_name "Joe"
          last_name  "Blow"
          email { "#{first_name}.#{last_name}@example.com".downcase } #使用其他属性组合
        end

        create(:user, last_name: "Doe").email

* override： `create(:user, last_name: "Doe").email`  #创建时可以用可选hash键值对覆盖定义的默认值

* Transient Attributes 使用可选hash传递参数，来控制内部键值对逻辑

        factory :user do
          ignore do                 # 这里的键值对被ignore，里面的键值对看成是后面用到的变量
            rockstar true
            upcased  false
          end

          name  { "John Doe#{" - Rockstar" if rockstar}" }  #使用变量
          email { "#{name.downcase}@example.com" }

          after(:create) do |user, evaluator|               #如果在回调里也需要用到变量，要定义第二block参数evaluator
            user.name.upcase! if evaluator.upcased          #回调中使用变量
          end
        end

        create(:user, upcased: true).name                   #传递变量

        #=> "JOHN DOE - ROCKSTAR"

* Associations

  一对一的关联创建：

  * 如果factory name 和association name一致：

        factory :post do
          author
        end

  * 不一致的话

        factory :post do
          association :author, factory: :user, last_name: "Writely" #以固定association为键，指定factory名，可选hash传入关联的属性
        end

  关联关系默认都会被`create` 不管上层是create还是build

  如果要指定用build的话

        factory :post do
          association :author, factory: :user, strategy: :build
        end

  对一对多的关系(使用回调)：

        FactoryGirl.define do

          # post factory with a `belongs_to` association for the user
          factory :post do
            title "Through the Looking Glass"
            user
          end

          # user factory without associated posts
          factory :user do
            name "John Doe"

            # user_with_posts will create post data after the user has been created
            factory :user_with_posts do
              # posts_count is declared as an ignored attribute and available in
              # attributes on the factory, as well as the callback via the evaluator
              ignore do
                posts_count 5
              end

              # the after(:create) yields two values; the user instance itself and the
              # evaluator, which stores all values from the factory, including ignored
              # attributes; `create_list`'s second argument is the number of records
              # to create and we make sure the user is associated properly to the post
              after(:create) do |user, evaluator|
                create_list(:post, evaluator.posts_count, user: user)
              end
            end
          end
        end

* Inheritance

        factory :post do
          title "A title"

          factory :approved_post do
            approved true
          end
        end

  或者指定parent

        factory :approved_post, parent: :post do
          approved true
        end

* Sequences

  * 全局定义

        # Defines a new sequence
        FactoryGirl.define do
          sequence :email do |n|
            "person#{n}@example.com"
          end
        end

        generate :email
        # => "person1@example.com"

        generate :email
        # => "person2@example.com"

  * 内联序列

        factory :user do
          sequence(:email) { |n| "person#{n}@example.com" }
        end

* Traits 面向方向编程

        trait :month_long_publishing do
          start_at { 1.month.ago }
          end_at   { Time.now }
        end

        factory :week_long_published_story,    traits: [:published, :week_long_publishing] #可以用traits定义多种factory

  * Traits 也可以作为其他factory的属性

        factory :week_long_published_story_with_title, parent: :story do
          published
          week_long_published_story #这是一个traits
          title { "Publishing that was started at #{start_at}" }
        end

  * 当然还可以用于创建实例： `create(:user, :admin, :male, name: "Jon Snow")` :admin 和  :male 是Traits

    这对`build, build_stubbed, attributes_for, and create`都适用，只是要注意对`create_list and build_list` 第二个参数是个数：

    `create_list(:user, 3, :admin, :male, name: "Jon Snow")`

  * 用在关联里`association :user, :admin, name: 'John Doe'`

  * trait 中还可以使用trait

* Callbacks

  * after(:build) - called after a factory is built (via FactoryGirl.build, FactoryGirl.create)
  * before(:create) - called before a factory is saved (via FactoryGirl.create)
  * after(:create) - called after a factory is saved (via FactoryGirl.create)
  * after(:stub) - called after a factory is stubbed (via FactoryGirl.build_stubbed)

* Building or Creating Multiple Records

        built_users   = build_list(:user, 25)
        created_users = create_list(:user, 25)
        built_users   = build_pair(:user) # array of two built users
        created_users = create_pair(:user) # array of two created users

        twenty_year_olds = build_list(:user, 25, date_of_birth: 20.years.ago) #覆盖默认属性

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
