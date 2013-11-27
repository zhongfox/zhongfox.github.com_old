---
layout: post
category : rails
tags : [rails, rails guides, layouts, view, render]
title: Layouts and Rendering in Rails
---
{% include JB/setup %}

1. **Overview: How the Pieces Fit Together**

2. **Creating Responses**

   有三种方式创建http response：

   * 调用`render` 创建完整的response发送给浏览器

   * 调用`redirect_to` 发送http跳转状态码给浏览器

   * 调用`head`发送仅有http headers的相应给浏览器

   ####2.1 Rendering by Default: Convention Over Configuration in Action

   如果没有显示调用以上三种方式，将默认render和该action name同名的view 模板

   真实的render操作由` ActionView::TemplateHandlers`完成，view的文件扩展名决定着模板引擎的选择，`.erb`文件的默认模板引擎是ERB，`.builder` 默认引擎Builder

   ####2.2 Using rendering

   `ActionController::Base#render`的可定制性：

   * 指定模板：默认模板，特定模板，文件，内联代码

   * 指定类型：html，文字，json，xml

   * http header： 如content type，http status等

   #####2.2.1 Rendering Nothing

   `render nothing: true` 默认会返回` 200 OK`, 可通过status参数设置

   ajax返回可能可以使用这个，不过使用`head` 更灵活

   #####2.2.2 Rendering an Action's View

   render同一controller的不同action对于的view：`render 该action名`，该方式不会执行目标action的代码，只会执行目标view代码

   #####2.2.3 Rendering an Action's Template from Another Controller

   通过完整路径(相对于app/views) 使用其他controller的view:`render "products/show"`

   其中斜线表明该view属于其他controller，可以通过`template`使之更明确:`render template: "products/show"`

   #####2.2.4 Rendering an Arbitrary File

   Rails 通过最开始的斜线决定去文件系统查找view：

   `render "/u/apps/warehouse_app/current/app/views/products/show"`

   可以通过`file`参数使之明确 `render file: "/u/apps/warehouse_app/current/app/views/products/show"`

   render 文件默认不适用layout，可以添加layout参数强制使用

   #####2.2.5 Wrapping it up

        render :edit
        render action: :edit
        render "edit"
        render "edit.html.erb"
        render action: "edit"
        render action: "edit.html.erb"
        render "books/edit"
        render "books/edit.html.erb"
        render template: "books/edit"
        render template: "books/edit.html.erb"
        render "/path/to/rails/app/views/books/edit"
        render "/path/to/rails/app/views/books/edit.html.erb"
        render file: "/path/to/rails/app/views/books/edit"
        render file: "/path/to/rails/app/views/books/edit.html.erb"

   以上方式的结果可以是一致的，经验法则是使用最简单的方式

   #####2.2.6 Using render with :inline

   `render inline: "<% products.each do |p| %><p><%= p.name %></p><% end %>`

   这种违背MVC原则的方式几乎没有理由使用，inline方式默认使用ERB，可以使用`type`指定其他引擎

   `render inline: "xml.p {'Horrid coding practice!'}", type: :builder`

   #####2.2.7 Rendering Text

   `render text: "OK"` 对于ajax返回比较有用

   text返回默认不会renderlayout，可以使用`layout: true` 显示要求使用layout

   #####2.2.8 Rendering JSON

   `render json: @product` 不需要在对象上调用`to_json`

   #####2.2.9 Rendering XML

   `render xml: @product` 不需要在对象上调用`to_xml`

   #####2.2.10 Rendering Vanilla JavaScript

   `render js: "alert('Hello Rails');"`  MIME type 将会是 ` text/javascript`

   #####2.2.11 Options for render

   * content_type

     该header默认值是`text/html`, (or application/json if you use the :json option, or application/xml for the :xml option.)

     可以通过`content_type`设置

     `render file: filename, content_type: "application/rss"`

   * layout

     指定其他layout `render layout: "special_layout"`

     不使用layout `render layout: false`

   * location

     指定http location header `render xml: photo, location: photo_url(photo)`

   * status

     Rails 在大多数情况自动返回200 status，可以使用status参数设定

     status可以使用状态数值或者对应的symbol来指代[the-status-option](http://guides.rubyonrails.org/layouts_and_rendering.html#the-status-option)

   #####2.2.12 Finding Layouts

   定位当前layout：先在` app/views/layouts` 中查找与当前controller name 同名的layout，如果没有，则使用` app/views/layouts/application.html.erb`

   * Specifying Layouts for Controllers

     使用layout声明在controller里指定其他的layout:`layout "inventory"`，该controller中的所有view将使用特定的layout

     也可以在父controller中进行声明，其子controller将使用声明的layout

   * Choosing Layouts at Runtime

     在controller中声明layput时，使用symbol指代的实例方法。可以在运行时指定layout `layout :products_layout`

     还可以直接用proc `layout Proc.new { |controller| controller.request.xhr? ? "popup" : "application" }`

   * Conditional Layouts

     layout声明可以使用except 和only 指定特定的action

   * Layout Inheritance

     越在后的layout声明越有效

   #####2.2.13 Avoiding Double Render Errors

   确保每个请求只有一个render/redirect_to/head

   ####2.3 Using redirect_to

   `redirect_to photos_url`

   `redirect_to :back` 可以跳转回这个请求的referer

   等价于 `redirect_to(request.env["HTTP_REFERER"])`

   if there is no referrer, ActionController::RedirectBackError will be raised

   #####2.3.1 Getting a Different Redirect Status Code

   redirect_to 默认使用302 临时跳转，可以通过status参数改成永久跳转

   `redirect_to photos_path, status: 301`

   #####2.3.2 The Difference Between render and redirect_to

   在action里render其他view，不会执行对应controller

   redirect_to 多一次浏览器跳转

   ####2.4 Using head To Build Header-Only Responses

   `head 状态码, 可选参数`

   `head :bad_request` `head :created, location: photo_path(@photo)`


3. **Structuring Layouts**

   TODO

   ####3.2 Understanding yield

   通常在layout中yield内容，view主体的内容总是通过匿名的yield返回，可以使用`content_for`定义其他内容主体

   ####3.3 Using the content_for Method

   ####3.4 Using Partials

   partial 文件命名是需要前置下划线，但是使用是不需要。

   没有路径的partial是相对当前view的路径，如`<%= render "menu" %>`

   含有路径的partial相对于`app/views/` 如`<%= render "shared/menu" %>`

   #####3.4.2 Using Partials to Simplify Views

   #####3.4.3 Partial Layouts

   partial默认不会有layout，但是可以强制使用`<%= render partial: "link_area", layout: "graybar" %>`

   注意以上方式，如果传递了layout参数，partial参数是必须的

   #####3.4.4 Passing Local Variables

   可以传递局部变量到partial `<%= render partial: "form", locals: {zone: @zone} %>`

   每个partial有一个和当前partial同名的变量(去掉前置下划线)，默认值是空，修改：

   `<%= render partial: "customer", object: @new_customer %>` 这样在partial`_customer` 中局部变量customer将是@new_customer

   当一个变量的类型和partial名字一致，可以使用简便方法`<%= render @customer %>` 这样会render `_customer`, 且局部变量customer将是@customer

   #####3.4.5 Rendering Collections

   `<%= render partial: "product", collection: @products %>` 会遍历后面的collection去render多次，且每次都有和partial同名的局部变量，值是当前被遍历的元素

   也有简便方法`<%= render @products %>`

   在简便方法中，Rails 通过元素类名决定使用哪个partial，所以还可以这种混合类型：

   `<%= render [customer1, employee1, customer2, employee2] %>`

   集合如果是空的，render返回nil 

   `<%= render(@products) || "There are no products available." %>`

   #####3.4.6 Local Variables

   改变集合元素在partial中默认的变量名称:

   `<%= render partial: "product", collection: @products, as: :item %>`

   集合形式同样可以使用locals指定其他变量 

   `<%= render partial: "products", collection: @products, as: :item, locals: {title: "Products Page"} %>`

   集合形式的partial内会自动维护一个计数器，如`product_counter`，但这种形式在结合as参数的情况无效

   #####3.4.7 Spacer Templates

   `<%= render partial: @products, spacer_template: "product_ruler" %>`

   间隔调用分隔的partial(没有数据传递)，相当有用

   #####3.4.8 Collection Partial Layouts

   集合形式也可以用layout

   `<%= render partial: "product", collection: @products, layout: "special_layout" %>`

   每个元素都会渲染layout，而且计数器在layout中有效

   ####3.5 Using Nested Layouts

   对于那些layout略有不同的情况，可以使用嵌套模板

   在主layout中支持可选的新主体：

   `<%= content_for?(:content) ? yield(:content) : yield %>`

   在个体的layout中yield主体，并进行个性化修改，构造新的content, 最后render主layout

        <% content_for :content do %>
          <div id="right_menu">Right menu items here</div>
          <%= content_for?(:news_content) ? yield(:news_content) : yield %>
        <% end %>
        <%= render template: "layouts/application" %>


### 参考资料

* Layouts and Rendering in Rails <http://guides.rubyonrails.org/layouts_and_rendering.html>
