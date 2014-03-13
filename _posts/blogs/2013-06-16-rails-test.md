---
layout: post
categories: [blog, rails]
tags : [rails, test, rspec, factory_girl, capybara]
title: 使用Rspec进行Rails单元测试
---
{% include JB/setup %}


以下是我们使用的rails测试gem组合：

    group :development do
      gem "rspec-rails"
      gem 'factory_girl_rails'
    end

    group :test do
      gem "rspec-rails"
      gem 'factory_girl_rails'
      gem 'shoulda-matchers'
      gem 'webmock'
      gem 'database_cleaner'
      gem 'capybara'
    end

`rspec-rails` 会添加如下gem：

    rspec rspec-core
    rspec-expectations
    rspec-mocks
    rspec-rails

`factory_girl_rails` 会添加如下gem：

    factory_girl
    factory_girl_rails

----

### rspec rspec-rails

<https://github.com/rspec/rspec-rails>
<http://lmws.net/describe-vs-context-in-rspec>
[Built-in Matchers](https://www.relishapp.com/rspec/rspec-expectations/docs/built-in-matchers)


1. `rails g rspec:install` rspec 需要包含在development分组，因为rspec要扩展若干generator以生成rspec测试

    create  .rspec
    create  spec
    create  spec/spec_helper.rb


2. `rake db:migrate && rake db:test:prepare` migrate将更新`db/schema.rb`,`db:test:prepare`将该文件加载到测试数据库

3. 使用事务来回滚测试数据：

   `spec/spec_helper.rb`中的配置： `config.use_transactional_fixtures = true` 使每个测试都使用transaction，每个测试结束后通过rollback清除数据库

    `before(:each)` 里的操作每个测试会运行，运行结束会回滚

    `before(:all)` 里的操作在整个测试运行前执行，不在事务内，所以需要注意：

    * 应该在`after(:all)`中清除在before all中的数据插入

    * 应该在`before(:each)` 中relaod 在before all中生成的对象

4. 在项目目录下使用文件`.rspec` 来配置rspec选项，如`--color`

----

### rspec-mocks

<https://github.com/rspec/rspec-mocks>

1. 想在`rails c test` 中测试的话，执行`require 'rspec/mocks/standalone'`

2. `Test Doubles` 测试对象？ `book = double("book")`

3. Use before(:each), not before(:all),因为每个test样本结束，stubs 和 mocks 都会被清除

3. 在double或者真实对象上mock方法和返回

        #用block指定返回
        allow(book).to receive(:title) { "The RSpec Book" }
        #用and_return指定返回
        allow(book).to receive(:title).and_return("The RSpec Book")
        #生成double的同时mock方法和返回
        book = double("book", :title => "The RSpec Book")
        #不要name的double
        double(:foo => 'bar')
        order.calculate_total_price(double(:price => 1.99),double(:price => 2.99))
        #轮流返回值
        allow(die).to receive(:roll).and_return(1,2,3)

4. 在测试结束前期望某个对象收到指定的message

        #期望测试对象将会接收指定消息
        expect(double_or_real_obect).to receive(:validate) { "02134" }
        #期望测试对象已经接收到指定消息
        expect(invitation).to have_received(:accept)
        #并指定参数
        expect(obj).to have_received(:accept).with(mailer)
        .with(no_args())
        .with(any_args())
        .with(1, kind_of(Numeric), "b")
        .with(1, /abc/, "b") ......
        #指定接收次数
        expect(obj).to have_received(:accept).twice
        .exactly(n).times
        .at_least(:once)
        .at_least(n).times
        .at_most(:twice)
        .any_number_of_times
        #期望不接收
        expect(obj).to_not have_received(:accept).with(mailer)
        #期望严格按照期望顺序接收消息
        expect(double).to receive(:msg).ordered
        #返回值期望
        expect(double).to receive(:msg).and_return(value)
        .and_return(value1, value2, value3)
        .and_raise(error)
        .and_throw(:msg)

----

### factory_girl factory_girl_rails

<https://github.com/thoughtbot/factory_girl/blob/master/GETTING_STARTED.md>


1. 默认的factories 目录是test/factories， 当generator的测试框架（test_framework ）是:rspec后，该目录将是`spec/factories`

----

### shoulda-matchers

<https://github.com/thoughtbot/shoulda-matchers>
<http://rubydoc.info/github/thoughtbot/shoulda-matchers/master/frames>

1. associations：

        it { should belong_to(:user) }
        it { should have_many(:tags).through(:taggings) }
        it { should have_many(:posts) }

2. validations:

        it { should validate_uniqueness_of(:title) }
        it { should validate_uniqueness_of(:title).scoped_to(:user_id, :category_id) }
        it { should validate_presence_of(:body).with_message(/wtf/) }
        it { should validate_presence_of(:title) }
        it { should validate_numericality_of(:user_id) }
        it { should ensure_inclusion_of(:status).in_array(['draft', 'public']) }
        it { should validate_format_of(:attr).not_with('1234') }
        it { should validate_format_of(:attr).with('1234') }

3. mass assignments:

        it { should_not allow_value("blah").for(:email) }
        it { should allow_value("a@b.com").for(:email) }
        it { should ensure_inclusion_of(:age).in_range(1..100) }
        it { should_not allow_mass_assignment_of(:password) }

4. controller:

        it { should respond_with(:success) } # 200, 301, 404, 500 or its symbolic equivalent :success, :redirect, :missing, :error

### webmock

<https://github.com/bblimke/webmock>

1. 在`spec/spec_helper.rb`中添加`require 'webmock/rspec'`

2. 

### capybara

<https://github.com/jnicklas/capybara>

1. 在`spec/spec_helper.rb`中 `require 'capybara/rspec'`

2. test case应该放置于`spec/features`

3. 默认驱动是:rack_test，不支持js，也不支持在本Rack app以外的http资源

   最佳实践是保留使用默认驱动是:rack_test，在需要js测试的时候：

   `:js => true` 切换到`Capybara.javascript_driver `  默认使用`:selenium`, 可指定`:driver`切换

        describe 'some stuff which requires js', :js => true do
          it 'will use the default js driver'
          it 'will switch to one specific driver', :driver => :webkit
        end

   或者

        Capybara.current_driver = :webkit # temporarily select different driver
        ... tests ...
        Capybara.use_default_driver       # switch back to default driver

4. 别名：

        feature == describe ..., :type => :feature
        background == before
        scenario == it
        given/given! == let/let!


### 测试

1. `bundle exec rake spec` 

   <http://www.ultrasaurus.com/2011/05/what-exactly-does-rake-spec-do/>

   Execute db:abort_if_pending_migrations 检查development数据库是否有pending的migrate

   Execute db:test:prepare 先检查开发模式有无pending migrate, 如果有，则停止并且提示，如果没有，则 `test:clone_structure` 或者 `test:load`

   Execute db:test:purge 清空测试数据库

   Execute db:test:load 从schema.rb加载数据结构重新构建测试库

   Execute db:schema:load 貌似也是从从schema.rb加载到当前库（为什么要这部？）

   Execute spec
