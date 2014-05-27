---
layout: post
categories: [blog, rails]
tags : [actionpack]
title: rails 中的actionpack
---
{% include JB/setup %}

---

### 调用栈

对学习actionpack不知从何下手，干脆追踪调用栈：在一个action中`puts caller`:

    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/implicit_render.rb:4:in `send_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/abstract_controller/base.rb:189:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/rendering.rb:10:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/abstract_controller/callbacks.rb:18:in `block in process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/callbacks.rb:413:in `_run__3010998926059190796__process_action__callbacks'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/callbacks.rb:80:in `run_callbacks'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/abstract_controller/callbacks.rb:17:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/rescue.rb:29:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/instrumentation.rb:31:in `block in process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/notifications.rb:159:in `block in instrument'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/notifications/instrumenter.rb:20:in `instrument'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/notifications.rb:159:in `instrument'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/instrumentation.rb:30:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/params_wrapper.rb:245:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activerecord-4.0.0/lib/active_record/railties/controller_runtime.rb:18:in `process_action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/abstract_controller/base.rb:136:in `process'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/abstract_controller/rendering.rb:44:in `process'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal.rb:195:in `dispatch'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal/rack_delegation.rb:13:in `dispatch'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_controller/metal.rb:231:in `block in action'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/routing/route_set.rb:80:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/routing/route_set.rb:80:in `dispatch'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/routing/route_set.rb:48:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/journey/router.rb:71:in `block in call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/journey/router.rb:59:in `each'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/journey/router.rb:59:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/routing/route_set.rb:655:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/etag.rb:23:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/conditionalget.rb:25:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/head.rb:11:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/params_parser.rb:27:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/flash.rb:241:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/session/abstract/id.rb:225:in `context'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/session/abstract/id.rb:220:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/cookies.rb:486:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activerecord-4.0.0/lib/active_record/query_cache.rb:36:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activerecord-4.0.0/lib/active_record/connection_adapters/abstract/connection_pool.rb:626:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activerecord-4.0.0/lib/active_record/migration.rb:369:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/callbacks.rb:29:in `block in call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/callbacks.rb:373:in `_run__491476649788470215__call__callbacks'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/callbacks.rb:80:in `run_callbacks'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/callbacks.rb:27:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/reloader.rb:64:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/remote_ip.rb:76:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/debug_exceptions.rb:17:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/show_exceptions.rb:30:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/rack/logger.rb:38:in `call_app'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/rack/logger.rb:21:in `block in call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/tagged_logging.rb:67:in `block in tagged'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/tagged_logging.rb:25:in `tagged'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/tagged_logging.rb:67:in `tagged'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/rack/logger.rb:21:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/request_id.rb:21:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/methodoverride.rb:21:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/runtime.rb:17:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/cache/strategy/local_cache.rb:83:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/lock.rb:17:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/actionpack-4.0.0/lib/action_dispatch/middleware/static.rb:64:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/engine.rb:511:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/application.rb:98:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/lock.rb:17:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/content_length.rb:14:in `call'
    /Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/rack-1.5.2/lib/rack/handler/webrick.rb:60:in `service'
    /Users/zhonghua/.rvm/rubies/ruby-2.0.0-p247/lib/ruby/2.0.0/webrick/httpserver.rb:138:in `service'
    /Users/zhonghua/.rvm/rubies/ruby-2.0.0-p247/lib/ruby/2.0.0/webrick/httpserver.rb:94:in `run'
    /Users/zhonghua/.rvm/rubies/ruby-2.0.0-p247/lib/ruby/2.0.0/webrick/server.rb:295:in `block in start_thread'

---

### 分解

1. `/Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/application.rb:98:in 'call'`

        def call(env)
          env["ORIGINAL_FULLPATH"] = build_original_fullpath(env)
          env["ORIGINAL_SCRIPT_NAME"] = env["SCRIPT_NAME"]

          super(env)
        end

2. `/Users/zhonghua/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/engine.rb:511:in 'call'`

        def call(env)
          env.merge!(env_config)
          if env['SCRIPT_NAME']
            env.merge! "ROUTES_#{routes.object_id}_SCRIPT_NAME" => env['SCRIPT_NAME'].dup
          end
          app.call(env)
        end

   app 是`config.middleware`(ActionDispatch::MiddlewareStack对象), 也就是一层层地call下去

3. 接着对中间件依次call

        rake middleware
        use ActionDispatch::Static
        use Rack::Lock
        use #<ActiveSupport::Cache::Strategy::LocalCache::Middleware:0x007fb3d28be1a0>
        use Rack::Runtime
        use Rack::MethodOverride
        use ActionDispatch::RequestId
        use Rails::Rack::Logger
        use ActionDispatch::ShowExceptions
        use ActionDispatch::DebugExceptions
        use ActionDispatch::RemoteIp
        use ActionDispatch::Reloader
        use ActionDispatch::Callbacks
        use ActiveRecord::Migration::CheckPending
        use ActiveRecord::ConnectionAdapters::ConnectionManagement
        use ActiveRecord::QueryCache
        use ActionDispatch::Cookies
        use ActionDispatch::Session::CookieStore
        use ActionDispatch::Flash
        use ActionDispatch::ParamsParser
        use Rack::Head
        use Rack::ConditionalGet
        use Rack::ETag
        run R4test::Application.routes

4. 主要中间件作用：

  * ActionDispatch::Static

    如果`config.serve_static_assets`是true，rails进行静态资源提供

        def call(env)
          case env['REQUEST_METHOD']
          when 'GET', 'HEAD'
            path = env['PATH_INFO'].chomp('/')
            if match = @file_handler.match?(path)
              env["PATH_INFO"] = match
              return @file_handler.call(env)   #如果找到了，直接返回了，不会到下一个rack里去，所以不受下面的Rack::Lock影响
            end
          end

          @app.call(env) #如果找不到，会到下一个rack里去
        end

  * Rack::Lock

    通过mutex.lock 对后续rack调用加锁，这是rails4中默认的，可以通过`config.threadsafe!` 去掉这个rack，开启多线程模式（也要应用服务器支持多线程如puma是多线程，但是webrick不是）。但是要保证所有代码是线程安全的。

        def call(env)
          old, env[FLAG] = env[FLAG], false
          @mutex.lock
          response = @app.call(env)
          body = BodyProxy.new(response[2]) { @mutex.unlock }
          response[2] = body
          response
        ensure
          @mutex.unlock unless body
          env[FLAG] = old
        end

  * Rack::Runtime

    添加一个header X-Runtime，用于记录响应时间

        def call(env)
          start_time = Time.now                  # 开始时间
          status, headers, body = @app.call(env)
          request_time = Time.now - start_time   # 结束时间

          if !headers.has_key?(@header_name)
            headers[@header_name] = "%0.6f" % request_time
          end

          [status, headers, body]
        end

  * Rack::MethodOverride

    使用post传递过来的参数中的`_method` 覆盖env["REQUEST_METHOD"]

        HTTP_METHODS = %w(GET HEAD PUT POST DELETE OPTIONS PATCH)

        METHOD_OVERRIDE_PARAM_KEY = "_method".freeze
        HTTP_METHOD_OVERRIDE_HEADER = "HTTP_X_HTTP_METHOD_OVERRIDE".freeze

        def initialize(app)
          @app = app
        end

        def call(env)
          if env["REQUEST_METHOD"] == "POST"
            method = method_override(env)
            if HTTP_METHODS.include?(method)
              env["rack.methodoverride.original_method"] = env["REQUEST_METHOD"]
              env["REQUEST_METHOD"] = method
            end
          end

          @app.call(env)
        end

        def method_override(env)
          req = Request.new(env)
            # POST方法获得请求中传递过来的数据， support both application/x-www-form-urlencoded and multipart/form-data
            # form 表单的enctype 默认是前者，后者既可以发送文本数据，也支持二进制数据上载，使用多媒体传输协议
          method = req.POST[METHOD_OVERRIDE_PARAM_KEY] || 
            env[HTTP_METHOD_OVERRIDE_HEADER]
          method.to_s.upcase
        end

  * ActionDispatch::RequestId

    生成`env["action_dispatch.request_id"]`，之后可以通过`ActionDispatch::Request#uuid` 获得，并通过`X-Request-Id`header返回给client

    生成规则：基于请求 X-Request-Id header 或者 随机uuid

  * Rails::Rack::Logger

  * ActionDispatch::ShowExceptions

  * ActionDispatch::DebugExceptions

