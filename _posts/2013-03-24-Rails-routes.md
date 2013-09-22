---
layout: post
category : rails
title: Rails 路由
tags : [rails, rails guides, routes]
---
{% include JB/setup %}

总觉得rails的routes有些容易混淆的地方，总结一下吧

###一. 复数resources：`resources :students`, 7条路由

            students GET    /students(.:format)                students#index
                     POST   /students(.:format)                students#create
         new_student GET    /students/new(.:format)            students#new
        edit_student GET    /students/:id/edit(.:format)       students#edit
             student GET    /students/:id(.:format)            students#show
                     PUT    /students/:id(.:format)            students#update
                     DELETE /students/:id(.:format)            students#destroy

通过使用helper获得url，需要传入id的方法，至少有三种方式：

* `student_path(1)` 对于这种方式，对于有对个参数的路由，可以传入等量的参数，rails会按需组装好

* `student_path(Student.last)` 对于这种方式，也可以传入等量的ORM对象，rails会按需组装好

* `student_path(id: 1)`

* `url_for(Student.last)` 如果是嵌套资源，还可以传入一个对象数组，rails会组装成合理的路由

  比如`<%= link_to "Ad details", url_for([@magazine, @ad]) %>`,

  更智能的`<%= link_to "Ad details", [@magazine, @ad] %>`

  `<%= link_to "Magazine details", @magazine %>`

还可以同时定义多个资源 `resources :photos, :books, :videos`

###二. 单数resource：`resource :car`, 6条路由，因为没有了index方法

helper和url都使用了单数，但是controller还是复数!

<pre><code>
            car POST   /car(.:format)                     cars#create
        new_car GET    /car/new(.:format)                 cars#new
       edit_car GET    /car/edit(.:format)                cars#edit
                GET    /car(.:format)                     cars#show
                PUT    /car(.:format)                     cars#update
                DELETE /car(.:format)                     cars#destroy
</code></pre>

###三. 使用命名空间

1.  `namespace :admin` 增加helper前缀，增加路由前缀，增加控制器命名空间

            admin_posts GET    /admin/posts(.:format)             admin/posts#index
                        POST   /admin/posts(.:format)             admin/posts#create
         new_admin_post GET    /admin/posts/new(.:format)         admin/posts#new
        edit_admin_post GET    /admin/posts/:id/edit(.:format)    admin/posts#edit
             admin_post GET    /admin/posts/:id(.:format)         admin/posts#show
                        PUT    /admin/posts/:id(.:format)         admin/posts#update
                        DELETE /admin/posts/:id(.:format)         admin/posts#destroy

2.  `scope :module => "admin"` 只增加控制器命名空间, 对于单个resources，等效于`resources :users, :module => "admin"`

            users GET    /users(.:format)                   admin/users#index
                  POST   /users(.:format)                   admin/users#create
         new_user GET    /users/new(.:format)               admin/users#new
        edit_user GET    /users/:id/edit(.:format)          admin/users#edit
             user GET    /users/:id(.:format)               admin/users#show
                  PUT    /users/:id(.:format)               admin/users#update
                  DELETE /users/:id(.:format)               admin/users#destroy

3.  `scope "/admin"`  只增加路由前缀, 对于单个resources， 等效于`resources :posts, :path => "/admin/comments"`

            comments GET    /admin/comments(.:format)          comments#index
                     POST   /admin/comments(.:format)          comments#create
         new_comment GET    /admin/comments/new(.:format)      comments#new
        edit_comment GET    /admin/comments/:id/edit(.:format) comments#edit
             comment GET    /admin/comments/:id(.:format)      comments#show
                     PUT    /admin/comments/:id(.:format)      comments#update
                     DELETE /admin/comments/:id(.:format)      comments#destroy

4.  下面2种是等效的，使用as增加了helper前缀，scope增加了路由前缀，controller没变

        scope 'admin' do
            resources :users, :as => 'admin_users'
        end

        scope "admin", :as => "admin" do
            resources :users
        end      

            admin_users GET    /admin/users(.:format)              users#index
                        POST   /admin/users(.:format)              users#create
         new_admin_user GET    /admin/users/new(.:format)          users#new
        edit_admin_user GET    /admin/users/:id/edit(.:format)     users#edit
             admin_user GET    /admin/users/:id(.:format)          users#show
                        PUT    /admin/users/:id(.:format)          users#update
                        DELETE /admin/users/:id(.:format)          users#destroy

5.  `scope ":username"` 向scope传递symbol会被认为是一个片段参数：

            posts GET    /:username/posts(.:format)          posts#index
                  POST   /:username/posts(.:format)          posts#create
         new_post GET    /:username/posts/new(.:format)      posts#new
        edit_post GET    /:username/posts/:id/edit(.:format) posts#edit
             post GET    /:username/posts/:id(.:format)      posts#show
                  PUT    /:username/posts/:id(.:format)      posts#update
                  DELETE /:username/posts/:id(.:format)      posts#destroy

###四. 嵌套资源 这个对于一对多的资源相当有用：

        class Magazine < ActiveRecord::Base
          has_many :ads
        end
         
        class Ad < ActiveRecord::Base
          belongs_to :magazine
        end

        resources :magazines do
          resources :ads
        end

以上路由除了生成magazine的常规路由外，生成了ads的路由如下, 对所有路由都加上了前缀`/magazines/:magazine_id/`

            magazine_ads GET    /magazines/:magazine_id/ads(.:format)          ads#index
                         POST   /magazines/:magazine_id/ads(.:format)          ads#create
         new_magazine_ad GET    /magazines/:magazine_id/ads/new(.:format)      ads#new
        edit_magazine_ad GET    /magazines/:magazine_id/ads/:id/edit(.:format) ads#edit
             magazine_ad GET    /magazines/:magazine_id/ads/:id(.:format)      ads#show
                         PUT    /magazines/:magazine_id/ads/:id(.:format)      ads#update
                         DELETE /magazines/:magazine_id/ads/:id(.:format)      ads#destroy

###五. 添加自定义的RESTful路由

* 使用member，可以创建一个针对单个ORM对象的路由，如

        resources :students do
          member do
            get 'score'
          end
        end

    这会增加一条路由

        score_student GET    /students/:id/score(.:format)        students#score

    对于单个action，也可以使用`get 'score', :on => :member`

* 使用collection，可以创建一个针对资源整体的路由（无需ORM对象），如

        resources :students do
          collection do
            get 'total_score'
          end
        end

    这会增加一条路由

        total_score_students GET    /students/total_score(.:format)       students#total_score

    对于单个action，也可以使用`get 'total_score', :on => :collection`

###六. 非 Resourceful 路由

* 参数绑定：在自定义路由中的symbol代表着传入的片段参数，片段参数和实际参数(问号后面的参数)一样会出现在params里

  片段的参数默认不支持点，如果需要支持点，可以使用constraint，如：

  `:id => /[^\/]+/ ` 这里的id支持除了斜线的所有字符

  有2个特殊的symbol参数，:controller :action

  比如 `match ':controller(/:action(/:id))'` 如果请求是`/photos/show/1 `，会匹配这条路由，并且调用`PhotosController#show`

  指定默认参数： `get 'students/total_score/(:subject)' => 'students#total_score', defaults: {grade: 50, subject: :ruby}`

  当请求这个路由时，params中会有默认参数grade，但是一点，片段参数会覆盖默认参数，但是实际参数却不会覆盖默认参数，如

  请求`/students/total_score/python?grade=12`，得到的参数是`{"grade"=>50, "subject"=>"python"}`

  还支持这种默认参数 `get '/total_score' => 'students#total_score', foo: :bar`，同样实际参数却不会覆盖默认参数：

  请求`'total_score?foo=123'` 中得到的foo将是bar

* 使用HTTP动词：使用:via可以设定动词，但是对于一个动词显得有点多余：

  `match 'photos/show' => 'photos#show', :via => :get` 

  直接用`get 'photos/show'` 更好，不过对多个动词, :via看起啦就比较靠谱了：

  `match 'photos/show' => 'photos#show', :via => [:get, :post]`

* 使用constraint来约束片段参数：`match 'photos/:id' => 'photos#show', :constraints => { :id => /[A-Z]\d{5}/ }`,还可以使用block来限制多条路由

        constraints(:id => /[A-Z][A-Z][0-9]+/) do
          match 'photos/:id' => 'photos#show  
          match 'photos/:id/edit' => 'photos#edit  
        end

  constraints使用正则表达式，这里的正则表达式不能包括锚点（就是^)，因为参数默认都是使用了（^）限制的

* 使用constraint来约束[Request](http://guides.rubyonrails.org/action_controller_overview.html#the-request-object)对象的任何返回字符串的方法，constraint可以有如下两种方式指定：

        match "photos", :constraints => {:subdomain => "admin"}

        namespace :admin do
          constraints :subdomain => "admin" do
            resources :photos
          end
        end

* 通配符参数:通配符参数用于匹配请求路由中被其他参数瓜分后的剩余部分：

  对于`match 'photos/*other' => 'photos#unknown'`

  `photos/12` 和 `/photos/long/path/to/12` 请求中的params[:other]将是12和long/path/to/12

  通配符参数可以出现多次，也可以在任意位置（当然不能连续出现）

  如请求`zoo/woo/foo/bar/baz` 可以匹配路由 `match '*a/foo/*b' => 'test#index'`

* 重定向：使用redirect可以重用重定向前的片段参数：

        match "/stories/:name" => redirect("/posts/%{name}")

  还可以传一个block，block接收params和可选的request作为参数,通常我们希望保留查询参数`request.query_string`

        match "/stories/:name" => redirect {|params| "/posts/#{params[:name].pluralize}" }
        match "/stories" => redirect {|p, req| "/posts/#{req.subdomain}?#{request.query_string}" }

* 指定root：`root :to => 'pages#main'` root最好在routes文件开始指定，因为通常root是访问量最大的，应该优先匹配。


###七. 个性化的Resourceful路由

1. 指定controller：`resources :photos, :controller => "images"`

2. 指定constraint：`resources :photos, :constraints => {:id => /[A-Z][A-Z][0-9]+/}` 这将约束7条路由中需要id的4条路由的id格式

   也可以使用如下的block形式的constraint：

        constraints(:id => /[A-Z][A-Z][0-9]+/) do
          resources :photos
          resources :accounts
        end

3. 使用as复写自动生成的路由helper： `resources :photos, :as => "images"` 这将把4个helper变成：

   `images_path images_path new_image_path edit_image_path(:id)`

   当然我觉得还是不要干这种事， 因为 convention over configuration

4. 使用only 和except来减少路由：

   `resources :photos, :only => [:index, :show]`

   `resources :photos, :except => :destroy`

###八. 路由测试

查看现有路由： `rake routes`, 可以传入controller以查看指定控制器对于的路由：`CONTROLLER=users rake routes`



## 参考资料
[Rails Routing from the Outside In](http://guides.rubyonrails.org/routing.html)

