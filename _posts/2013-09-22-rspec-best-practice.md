---
layout: post
category : rails
tags : [rspec, rails, test]
title: Rspec 代码规范和最佳实践
---
{% include JB/setup %}

## 测试环境

`Gemfile`

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

    rspec
    rspec-core
    rspec-expectations # 提供 should， should_not 和许多内建matcher
    rspec-mocks
    rspec-rails

`factory_girl_rails` 会添加如下gem：

      factory_girl
      factory_girl_rails

---

## 测试规范

### Model 测试

**测试文件所在目录**：`spec/models/`

**测试覆盖**：

* 所有的 ActiveRecord model 需要一个对应的模型测试文件

* validations

* associations

* constants

* class method

* instance method

**测试规范**

1. 实例方法测试， 传入标识应该是“#实例方法名称” 如 `it "#published?"`

2. 类方法测试， 传入标识应该是“.类方法名称” 如 `it ".list_deals"`

**代码示例**

        describe Job do
          describe "validations" do
            it { should validate_numericality_of(:amount).only_integer }
            it { should validate_presence_of(:city_id) }
          end

          describe "associations" do
            it { should belong_to(:category) }
          end

          describe "mass assignments" do
            it { should_not allow_mass_assignment_of(:password) }
          end

          describe "constants" do
            it { Job::Cities.should be_frozen }
            it { SomeConstant.should eq(123)  }
            end
          end

          describe "class method" do
            it ".some_class_method" do
              ......
            end
            ....
          end

          describe "instance method" do
            it "#published?" do
              FactoryGirl.create(:published_job).should be_published
            end

            ....
          end

        end

---

### Controller 测试

**测试文件所在目录**：`spec/controllers/`

**测试覆盖**：

* 所有前后台的controllers，都需要一个对应的控制器测试文件

* 每一个action需要一个describe块

* 在action的每一个出口，至少需要一个it覆盖

* `respond_with` 测试返回状态码

* `render_template` 测试render的template

* `assigns(...)` 测试实例变量

**测试规范**

1. 每个action的测试块，传入标识应该是“http动词 action名称”，列如`describe "POST create"`

**代码示例**

        ...
        describe "POST create" do
          describe "with valid params" do
            it "creates a new Student" do
              expect {
                post :create, {:student => valid_attributes}, valid_session
              }.to change(Student, :count).by(1)
            end

            it "assigns a newly created student as @student" do
              post :create, {:student => valid_attributes}, valid_session
              assigns(:student).should be_a(Student)
              assigns(:student).should be_persisted
            end

            it "redirects to the created student" do
              post :create, {:student => valid_attributes}, valid_session
              response.should redirect_to(Student.last)
            end
          end

          describe "with invalid params" do
            it "assigns a newly created but unsaved student as @student" do
              # Trigger the behavior that occurs when invalid params are submitted
              Student.any_instance.stub(:save).and_return(false)
              post :create, {:student => { "name" => "invalid value" }}, valid_session
              assigns(:student).should be_a_new(Student)
            end

            it "re-renders the 'new' template" do
              # Trigger the behavior that occurs when invalid params are submitted
              Student.any_instance.stub(:save).and_return(false)
              post :create, {:student => { "name" => "invalid value" }}, valid_session
              response.should render_template("new")
            end
          end
        end

---

### Requests 测试

**测试文件所在目录**：`spec/requests/`

**测试覆盖**：

* 前台页面如果有跳转的，需要对应的请求测试文件

* `response.status` 测试返回状态码

* `response.should redirect_to` 测试跳转

**测试规范**

1. 每个action的测试块，传入标识应该是“http动词 action名称”，列如`describe "Get index"`

---

### Routing 测试

**测试文件所在目录**：`spec/routing/`

**测试覆盖**：

* 所有前后台的controllers，都需要一个对应的路由测试文件

* 使用it覆盖每一个路由

**测试规范**

1. 每个路由测试块，传入标识应该是“routes to #action名称”，列如`it "routes to #edit"`

**代码示例**

        describe StudentsController do
          describe "routing" do

            it "routes to #index" do
              get("/students").should route_to("students#index")
            end

            it "routes to #new" do
              get("/students/new").should route_to("students#new")
            end

            it "routes to #show" do
              get("/students/1").should route_to("students#show", :id => "1")
            end

            it "routes to #edit" do
              get("/students/1/edit").should route_to("students#edit", :id => "1")
            end

            it "routes to #create" do
              post("/students").should route_to("students#create")
            end

            it "routes to #update" do
              put("/students/1").should route_to("students#update", :id => "1")
            end

            it "routes to #destroy" do
              delete("/students/1").should route_to("students#destroy", :id => "1")
            end

          end
        end

---

### 集成测试

**测试文件所在目录**：`spec/features/`

**测试覆盖**：

* 所有前台的controllers，都需要一个对应的集成测试文件

* 使用it覆盖所有的get请求

* 使用`page.should have_title`测试title

* 使用`page.should have_content(...)` 测试关键内容

* 使用`click_link('...')`测试关键链接

**测试规范**

1. 每个路由测试块，传入标识应该是“routes to #action名称”，列如`it "routes to #edit"`

**代码示例**

        describe "front_controller" do
          it "#index" do
            visit '/'
            page.should have_title('招聘首页')
            page.should have_content('职位搜索')
          end

          it "#brand" do
            visit '/brand'
            page.should have_title('招聘入口')
            click_link('点击进入')
            expect(page).to have_title('招聘首页')
          end

        end

---

### Helper 测试

**测试文件所在目录**：`spec/helpers/`

**测试覆盖**：

* 所有前台的controllers，都需要一个对应的helper测试文件

* 测试关键helper即可

----

## 最佳实践

目的： 使rspec测试结构清晰，容易维护，可读性强。

1. 正确的描述（describe）

   * 最外层的descibe应该和所测试的model，controller，helper等对应的class/module名称一致

   * 测试类方法应该是`descibe "#class_method"`

   * 测试实例方法应该是`descibe ".class_method"`

   * 分情况测试时使用context：`context "当...情况下..."`


2. 在有明确测试对象时，尽量使用`expect`，代替`should should_not` 如：

        expect(some object or block).to some_matcher     #代替 should
        expect(some object or block).to_not some_matcher #代替 should_not

   详细内容请点击[should and should_not syntax](https://github.com/rspec/rspec-expectations/blob/master/Should.md)

3. 每个it里只有一个断言，这样每个断言对应一个描述，增强可读性：

        it 'creates a new user' do
          User.count.should == @count + 1
        end

        it 'sets a flash message' do
          flash[:notice].should be
        end



3. 使用谓词构造动态的matcher，已到达更好的易读性（更贴近自然语言）：

        expect(actual).to be_xxx         # passes if actual.xxx?
        expect(actual).to have_xxx(:arg) # passes if actual.has_xxx?(:arg)

   猛烈点击[Predicate matchers](https://www.relishapp.com/rspec/rspec-expectations/v/2-3/docs/built-in-matchers/predicate-matchers)

4. 使用`subject`来指定多个测试中的固定测试对象，避免反复引用：

        subject { @user.address }
        it { should be_valid }
        it { should be... }

5. 正确区别使用`describe`和`context`

   context是describe都定义了一个`example group`, 其中可以定义若干example（使用it/specify）,也可以嵌套其他的`example group`

   context是describe的别名，也就是他们没有功能上的区别，区别是语义上的：

   `describe`是对测试功能模块的划分

   `context`是对同一个功能模块对不同情况下的划分

   猛烈点击获得更详细的论述[describe vs. context in rspec](http://lmws.net/describe-vs-context-in-rspec)

   另外测试加上nested参数可以使输出嵌套：如 `bundle exec rspec spec/models/job_spec.rb -cf nested`

6. 注重边界测试和无效值测试：

        describe "#month_in_english(month_id)" do
          context "when valid" do
            it "should return 'January' for 1" # lower boundary
            it "should return 'March' for 3"
            it "should return 'December' for 12" # upper boundary
          context "when invalid" do
            it "should return nil for 0"
            it "should return nil for 13"
          end
        end

7. 慎用`before :all` 因为`before :all` 里的操作不在事务里，所有需要在`after :all`中手动清除在`before :all`里创建的数据

8. 容易引起误解的`before {...}`，该结构没有传递`all`或`each`，其实它实现的是each，常用作外围的before each(也是在事务里)，但是经常被误认为是before all

   嵌套before和after的执行顺序：

        outer before all
        inner before all
        outer before each
        inner before each
        testing....
        inner after each
        outer after each
        inner after all
        outer after all

   这里有个测试的例子[Rspec Gotchas: before, after, all, and each](http://www.wulftone.com/2012/01/22/rspec-gotchas-before-after-all-and-each/)

9. 不要过度mock


##其他技巧/笔记

1. 使用`its`进行属性测试，传递symbol或者字符串代表属性，可以表示嵌套属性测试 [Attribute of subject](https://www.relishapp.com/rspec/rspec-core/v/2-4/docs/subject/attribute-of-subject)

2. 如果最顶层是一个class，测试对象将（**隐式**）为该class的一个实例，可以用方法`subject`获取，同样可以用subject方法（**显示**）指定当前测试对象[Subject](https://www.relishapp.com/rspec/rspec-core/v/2-4/docs/subject)

   该顶层class可以通过方法` described_class()`活动[Described class](https://www.relishapp.com/rspec/rspec-core/v/2-4/docs/metadata/described-class)

3. `specify`  `it`  `example` 是别名关系，区别仅仅是语义上的：

        describe Array do
          describe "with 3 items" do
            before { @arr = [1, 2, 3] }
            specify { @arr.should_not be_empty } #明确指定了测试对象
          end

          describe "with 3 items" do
            subject { [1, 2, 3] }
            it { should_not be_empty }  #使用隐式的测试对象
          end
        end

4. Let 和 let!

   这2个helper都用于实现memoized： 第一次调用的结果会被缓存起来，之后的调用将会使用该结果。

   二者的区别：

   `let` 是延迟执行（lazy-evaluated），当第一次显示调用是才会执行

   `let!` 在每个用例的`before each`中自动调用

   [Let and let!](https://www.relishapp.com/rspec/rspec-core/v/2-4/docs/helper-methods/let-and-let)


5. 共享用例组（Shared example group）用于提取多个group之间要测试的通用的行为. [Shared example group](https://www.relishapp.com/rspec/rspec-core/v/2-4/docs/example-groups/shared-example-group)

6. rspec提供了大量内建matchers：[Built in matchers](https://www.relishapp.com/rspec/rspec-expectations/v/2-14/docs/built-in-matchers)

7. mock 常量：`stub_const("SomeNameSpace::Myconstant", 123)`

8. rspec 中使用jbuilder，默认不会render view，需要手动`render_views` [Why is JBuilder not returning a response body](http://stackoverflow.com/questions/9965945/why-is-jbuilder-not-returning-a-response-body-in-json-when-testing-rspec)

----

###参考资料：

<https://www.relishapp.com/rspec/>

<http://www.wulftone.com/2012/01/22/rspec-gotchas-before-after-all-and-each/>

<http://kpumuk.info/ruby-on-rails/my-top-7-rspec-best-practices/>

<http://eggsonbread.com/2010/03/28/my-rspec-best-practices-and-tips/>

<http://blog.carbonfive.com/2010/10/21/rspec-best-practices/>

test
