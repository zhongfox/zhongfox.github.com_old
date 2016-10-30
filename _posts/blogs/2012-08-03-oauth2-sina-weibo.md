---
layout: post
categories: [blog, server]
tags : [rails, share, oauth2]
title: 基于oauth2的新浪微博app开发
---

## OAUTH协议简介
1. OAUTH协议为**用户资源的授权**提供了一个安全的、开放而又简易的标准。
2. 与以往的授权方式不同之处是OAUTH的授权不会使第三方触及到用户的帐号信息（如用户名与密码），即第三方无需使用用户的用户名与密码就可以申请获得该用户资源的授权，因此OAUTH是**安全**的。
3. OAUTH协议为用户资源的授权提供了一个安全的、开放而又简易的标准。同时，任何第三方都可以使用OAUTH认证服务，任何服务提供商都可以实现自身的OAUTH认证服务，因而OAUTH是**开放**的。业界提供了OAUTH的多种实现如PHP、JavaScript，Java，Ruby等各种语言开发包，大大节约了程序员的时间，因而OAUTH是简易的。目前互联网很多服务如Open API，很多大公司如Google，Yahoo，Microsoft等都提供了OAUTH认证服务，这些都足以说明OAUTH标准逐渐成为开放资源授权的标准。

## OAUTH协议的特点
1. **简单**：不管是OAUTH服务提供者还是应用开发者，都很容易于理解与使用；
2. **安全**：没有涉及到用户密钥等信息，更安全更灵活；
3. **开放**：任何服务提供商都可以实现OAUTH，任何软件开发商都可以使用OAUTH；

## 认证和授权过程
在认证和授权的过程中涉及的三方包括：

1. 服务提供方，用户使用服务提供方来存储受保护的资源，如照片，视频，联系人列表。

2. 用户，存放在服务提供方的受保护的资源的拥有者。

3. 客户端，要访问服务提供方资源的第三方应用，通常是网站，如提供照片打印服务的网站。在认证过程之前，客户端要向服务提供者申请客户端标识。

使用OAuth进行认证和授权的过程如下所示:

O. 用户访问客户端的网站，想操作用户存放在服务提供方的资源。  
A. 客户端将用户引导至服务提供方的授权页面请求用户授权。在这个过程中将客户端的回调连接发送给服务提供方。  
B. 用户授权该客户端访问所请求的资源。授权成功后，服务提供方引导用户返回客户端的网页，并返回授权码(authorization code)  
C. 客户端根据授权码从服务提供方那里获取访问令牌。  
D. 服务提供方根据授权码和用户的授权情况授予客户端访问令牌(access token)。  
E. 客户端使用获取的访问令牌访问存放在服务提供方上的受保护的资源。  
F. 服务提供方返回受保护的资源。  
## 新浪OAUTH授权基本流程
<img src="http://www.sinaimg.cn/blog/developer/wiki/oAuth2_01.gif" alt="oAuth2_01.gif">

## gem doorkeeper使用
* `Gemfile gem 'doorkeeper'`
* `bundle`
* `rails g doorkeeper:install`
* `config/initializers/doorkeeper.rb and configure resource_owner_authenticator block:
User.find_by_id(session[:user_id]) || redirect_to(routes.login_url)`
* `rake db:migrate`
* 重启并login

tasks模型增加action

    doorkeeper_for :tasksjson
    def tasksjson
        respond_to do |format|
            format.html { render json: @tasks }
        end
    end
    
* 新路由 `get 'tasksjson', to: "tasks#tasksjson"`
* 授权地址oauth/authorize
* 创建新app地址 oauth/applications, app地址 http://demo.com:3001/hui800/index

## gem oauth2使用
* `gem 'oauth2'`
* `bundle`

控制器代码

    class Hui800Controller < ApplicationController
        API_KEY = '...'
        API_SECRET = '...'
        REDIRECT_URI = 'http://demo.com:3001/hui800/index'
        SINA_WEIBO = "http://192.168.100.97:3000/" #"http://demo.com:3000/"
        
        before_filter :authorize?
        
        def index
        end
        
    private

        def client
            @client ||= OAuth2::Client.new(API_KEY, API_SECRET, site: SINA_WEIBO)
        end

        def authorize?
            if params[:code].present? # 接收授权
                access_token = client.auth_code.get_token(params[:code].to_s, redirect_uri: REDIRECT_URI)
                session[:access_token] = access_token.token
                puts "access_token.token #{access_token.token}"
                return true
            end
            
            if session[:access_token] # 已经获得授权
                puts "session[:access_token] #{session[:access_token]}"
                return true
            else # 还未授权，跳转至授权页面
                authorize_url = client.auth_code.authorize_url(redirect_uri: REDIRECT_URI)
                puts "authorize_url: #{authorize_url}"
                redirect_to authorize_url
                return false
            end
        end
     
    end


## 参考资料
* oauth官网 <http://oauth.net/>
* sina微博app开发指南 <http://open.weibo.com/wiki/站内应用开发指南>
* oauth2介绍 <http://open.weibo.com/wiki/Oauth2>
* 视频 <http://railscasts.com/episodes/353-oauth-with-doorkeeper>
* doorkeeper <https://github.com/applicake/doorkeeper>
* oauth2 <https://github.com/intridea/oauth2>

