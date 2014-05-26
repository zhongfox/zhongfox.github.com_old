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

3.接着对中间件依次call

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
