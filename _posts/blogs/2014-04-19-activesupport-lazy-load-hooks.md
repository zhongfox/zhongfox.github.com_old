---
layout: post
categories: [blog, rails]
tags : [activesupport, lazy_load_hooks]
title: ActiveSupport 中的 lazy load hooks
---
{% include JB/setup %}

---

`vi ~/.rvm/gems/ruby-2.0.0-p247/gems/activesupport-4.0.0/lib/active_support/lazy_load_hooks.rb`

        module ActiveSupport
          # lazy_load_hooks allows rails to lazily load a lot of components and thus
          # making the app boot faster. Because of this feature now there is no need to
          # require <tt>ActiveRecord::Base</tt> at boot time purely to apply
          # configuration. Instead a hook is registered that applies configuration once
          # <tt>ActiveRecord::Base</tt> is loaded. Here <tt>ActiveRecord::Base</tt> is
          # used as example but this feature can be applied elsewhere too.
          #
          # Here is an example where +on_load+ method is called to register a hook.
          #
          #   initializer 'active_record.initialize_timezone' do
          #     ActiveSupport.on_load(:active_record) do
          #       self.time_zone_aware_attributes = true
          #       self.default_timezone = :utc
          #     end
          #   end
          #
          # When the entirety of +activerecord/lib/active_record/base.rb+ has been
          # evaluated then +run_load_hooks+ is invoked. The very last line of
          # +activerecord/lib/active_record/base.rb+ is:
          #
          #   ActiveSupport.run_load_hooks(:active_record, ActiveRecord::Base)
          @load_hooks = Hash.new { |h,k| h[k] = [] } # 存储注册回调的hash， 结构为：{key1: [[block1, options1], [block2, options2]...], key2: ...}
          @loaded = Hash.new { |h,k| h[k] = [] }     # 存储已调用过的回调，结构为：{key1: [base1, base2...]}

          def self.on_load(name, options = {}, &block) # 这里类似定义了一个方法（回调），方法名是key，方法体是block和options，参数是base
            @loaded[name].each do |base|               # 唯一神奇的地方，多次注册key相同的方法，要把已经执行过的同key方法的base传递到新方法中再次执行
              execute_hook(base, options, block)
            end

            @load_hooks[name] << [block, options] #存储回调，name为hash key标识，valuee是一个数组的数组
          end

          def self.execute_hook(base, options, block) # 执行回调时才指定base，类似传递参数
            if options[:yield]                        # 方法（回调）定义时指定了调用方式：yield还是instance_eval
              block.call(base)
            else
              base.instance_eval(&block)
            end
          end

          def self.run_load_hooks(name, base = Object) # 通过传入标识和可选运行对象来显式调用回调
            @loaded[name] << base                      # 存入已调用的hash
            @load_hooks[name].each do |hook, options|  # 遍历key对应的所有回调并执行
              execute_hook(base, options, hook)
            end
          end
        end
