---
layout: post
categories: [blog, rails]
tags : [initializable]
title: rails 中的initializer实现
---
{% include JB/setup %}

---

`vi ~/.rvm/gems/ruby-2.0.0-p247/gems/railties-4.0.0/lib/rails/initializable.rb`

Rails::Railtie, Rails::Application::Bootstrap, Rails::Application::Finisher 混入了该模块


    require 'tsort'

    module Rails
      module Initializable
        def self.included(base) #:nodoc:
          base.extend ClassMethods
        end

        class Initializer
          attr_reader :name, :block

          def initialize(name, context, options, &block)
            options[:group] ||= :default
            @name, @context, @options, @block = name, context, options, block
          end

          def before
            @options[:before]
          end

          def after
            @options[:after]
          end

          def belongs_to?(group)
            @options[:group] == group || @options[:group] == :all
          end

          def run(*args)
            @context.instance_exec(*args, &block)
          end

          def bind(context)
            return self if @context
            Initializer.new(@name, context, @options, &block)
          end
        end

        class Collection < Array
          include TSort        #混入拓扑排序模块

          alias :tsort_each_node :each     # 遍历所有节点的方法
          def tsort_each_child(initializer, &block)    #对一个节点遍历所有依赖（前置）
            select { |i| i.before == initializer.name || i.name == initializer.after }.each(&block)
          end

          def +(other)
            Collection.new(to_a + other.to_a)
          end
        end

        def run_initializers(group=:default, *args)
          return if instance_variable_defined?(:@ran)
          initializers.tsort_each do |initializer|
            initializer.run(*args) if initializer.belongs_to?(group)
          end
          @ran = true
        end

        def initializers       # 实际调用时的initializer取自这里，所以initializers也存于实例的实例变量，而且是存了自己所属类的所有父类上的所有initializers
          @initializers ||= self.class.initializers_for(self)
        end

        module ClassMethods
          def initializers
            @initializers ||= Collection.new #存于类的实例变量
          end

          def initializers_chain
            initializers = Collection.new
            ancestors.reverse_each do |klass|               #各个类只存了自己的一部分initializers，但是类的实例存了所有祖先类的所有initializers
              next unless klass.respond_to?(:initializers)
              initializers = initializers + klass.initializers
            end
            initializers
          end

          def initializers_for(binding)
            Collection.new(initializers_chain.map { |i| i.bind(binding) })
          end

          def initializer(name, opts = {}, &blk)  # app/engine/railtie 添加initializer的入口
            raise ArgumentError, "A block must be passed when defining an initializer" unless blk
            opts[:after] ||= initializers.last.name unless initializers.empty? || initializers.find { |i| i.name == opts[:before] } #如果添加前没有依赖，就把新的放到最后一个的后面
            initializers << Initializer.new(name, nil, opts, &blk)  # name相同的initializer多次添加，会存储多个
          end
        end
      end
    end

---

各个层级挂载的initializers:

        irb(main):011:0> Rails.application.initializers.count
        => 89

        irb(main):009:0> Rails::Application::Bootstrap.initializers.count
        => 7
        irb(main):010:0> Rails::Application::Finisher.initializers.count
        => 11

        Rails.application.class.ancestors.map { |a| [a, (a.initializers.count rescue nil)]}
        => [[R4test::Application, 0], [Rails::Railtie::Configurable, nil], [Rails::Application, 0], [Rails::Engine, 10], [Rails::Railtie, 0], [Rails::Initializable, nil], [Object, nil], [PP::ObjectMixin, nil], [ActiveSupport::Dependencies::Loadable, nil], [JSON::Ext::Generator::GeneratorMethods::Object, nil], [Kernel, nil], [BasicObject, nil]]

  Rails::Application实例方法复写了`initializers`

        def initializers #:nodoc:
          Bootstrap.initializers_for(self) +    # count 7
          railties_initializers(super) +        # count 71
          Finisher.initializers_for(self)       # count 11
        end

---

* 拓扑排序

  对一个有向无环图(Directed Acyclic Graph简称DAG)G进行拓扑排序，是将G中所有顶点排成一个线性序列，使得图中任意一对顶点u和v，若边(u,v)∈E(G)，则u在线性序列中出现在v之前

* ruby标准库`require 'tsort'` 用于解决拓扑排序

  混入TSort的类，需要定义以下2个实例方法：

  * `tsort_each_node` 用于遍历所有节点

  * `tsort_each_child` 用于对每个节点，遍历其依赖节点（入度）

        require 'tsort'

        class Hash
          include TSort
          alias tsort_each_node each_key
          def tsort_each_child(node, &block)
            fetch(node).each(&block)
          end
        end

        {1=>[2, 3], 2=>[3], 3=>[], 4=>[]}.tsort #生成拓扑排序
        #=> [3, 2, 1, 4]

        {1=>[2], 2=>[3, 4], 3=>[2], 4=>[]}.strongly_connected_components # 强连接组成，TODO不懂
        #=> [[4], [2, 3], [1]]

* 其他方法

  * `tsort_each`

---

一个典型rails4项目的tsort initializer：


        set_load_path
        set_load_path
        set_load_path
        set_load_path
        set_autoload_paths
        set_autoload_paths
        set_autoload_paths
        set_autoload_paths
        add_routing_paths
        add_routing_paths
        add_routing_paths
        add_routing_paths
        add_locales
        add_locales
        add_locales
        add_locales
        add_view_paths
        add_view_paths
        add_view_paths
        add_view_paths
        load_environment_config
        load_environment_config
        load_environment_config
        load_environment_config
        load_environment_hook
        load_active_support
        set_eager_load
        initialize_logger
        initialize_cache
        initialize_dependency_mechanism
        bootstrap_hook
        active_support.deprecation_behavior
        active_support.initialize_time_zone
        active_support.initialize_beginning_of_week
        active_support.set_configs
        action_dispatch.configure
        active_model.secure_password
        action_view.embed_authenticity_token_in_remote_forms
        action_view.logger
        action_view.set_configs
        action_view.caching
        action_controller.assets_config
        action_controller.set_helpers_path
        action_controller.parameters_config
        action_controller.set_configs
        action_controller.compile_config_methods
        active_record.initialize_timezone
        active_record.logger
        active_record.migration_error
        active_record.check_schema_cache_dump
        active_record.set_configs
        active_record.initialize_database
        active_record.log_runtime
        active_record.set_reloader_hooks
        active_record.add_watchable_files
        action_mailer.logger
        action_mailer.set_configs
        action_mailer.compile_config_methods
        setup_sass
        setup_compression
        rack_mini_profiler.configure_rails_initialization
        append_assets_path
        append_assets_path
        append_assets_path
        append_assets_path
        prepend_helpers_path
        prepend_helpers_path
        prepend_helpers_path
        prepend_helpers_path
        load_config_initializers
        load_config_initializers
        load_config_initializers
        load_config_initializers
        engines_blank_point
        engines_blank_point
        engines_blank_point
        turbolinks
        engines_blank_point
        add_generator_templates
        ensure_autoload_once_paths_as_subset
        add_builtin_route
        build_middleware_stack
        define_main_app_helper
        add_to_prepare_blocks
        run_prepare_callbacks
        eager_load!
        finisher_hook
        set_routes_reloader_hook
        set_clear_dependencies_hook

* 为什么Engine中定义的initializer都会执行4次？

        irb(main):074:0> ::Rails::Engine.subclasses
        => [Coffee::Rails::Engine, Jquery::Rails::Engine, Turbolinks::Engine]
        irb(main):075:0> Rails::Railtie.subclasses #14个
        => [I18n::Railtie, ActiveSupport::Railtie, ActionDispatch::Railtie, ActiveModel::Railtie, ActionView::Railtie, ActionController::Railtie, ActiveRecord::Railtie, ActionMailer::Railtie, Rails::TestUnitRailtie, Sprockets::Railtie, Sass::Rails::Railtie, Jquery::Rails::Railtie, Jbuilder::Railtie, Rack::MiniProfilerRails::Railtie]

  可以看到其实有3个Engine，加上application，总共4个Engine

  在看application如何查找需要执行的initializers：

        def initialize!(group=:default) #:nodoc:
          raise "Application has been already initialized." if @initialized
          run_initializers(group, self)
          @initialized = true
          self
        end

        def initializers #:nodoc:
          Bootstrap.initializers_for(self) +
          railties_initializers(super) +
          Finisher.initializers_for(self)
        end

        def railties_initializers(current) #:nodoc:
          initializers = []
          ordered_railties.each do |r|  获取所有ordered_railties的initializers
            if r == self
              initializers += current
            else
              initializers += r.initializers
            end
          end
          initializers
        end

  ordered_raities 存了所有Railtie（及其子类）的实例

        Rails::application.send(:ordered_railties).map(&:class) #18个
        [I18n::Railtie, ActiveSupport::Railtie, ActionDispatch::Railtie, ActiveModel::Railtie, ActionView::Railtie, ActionController::Railtie, ActiveRecord::Railtie, ActionMailer::Railtie, Rails::TestUnitRailtie, Sprockets::Railtie, Sass::Rails::Railtie, Jquery::Rails::Railtie, Jbuilder::Railtie, Rack::MiniProfilerRails::Railtie, Coffee::Rails::Engine, Jquery::Rails::Engine, Turbolinks::Engine, R4test::Application]


**最终结论**

当application实例运行`initialize!` 时，会查找所有Railtie实例的initializers并执行

而Railtie实例的initializers存于自己的实例变量，这个实例变量（initializers_chain）的查找是通过变量实例的继承链上的类，把类上的所有initializer归于实例自己的initializers。

类本身的initializer是存于类是实例变量，方便类的所有实例共享

___

### Engine 的initializer

    # 把config.autoload_paths + config.eager_load_paths + config.autoload_once_paths + config.paths.load_paths放入$LOAD_PATH
    initializer :set_load_path, before: :bootstrap_hook do
      _all_load_paths.reverse_each do |path|
        $LOAD_PATH.unshift(path) if File.directory?(path)
      end
      $LOAD_PATH.uniq!
    end

    # Set the paths from which Rails will automatically load source files,
    # and the load_once paths.
    #
    # This needs to be an initializer, since it needs to run once
    # per engine and get the engine as a block parameter
    initializer :set_autoload_paths, before: :bootstrap_hook do
      ActiveSupport::Dependencies.autoload_paths.unshift(*_all_autoload_paths)
      ActiveSupport::Dependencies.autoload_once_paths.unshift(*_all_autoload_once_paths)

      # Freeze so future modifications will fail rather than do nothing mysteriously
      config.autoload_paths.freeze
      config.eager_load_paths.freeze
      config.autoload_once_paths.freeze
    end

    initializer :add_routing_paths do |app|
      paths = self.paths["config/routes.rb"].existent

      if routes? || paths.any?
        app.routes_reloader.paths.unshift(*paths)
        app.routes_reloader.route_sets << routes
      end
    end

    # I18n load paths are a special case since the ones added
    # later have higher priority.
    initializer :add_locales do
      config.i18n.railties_load_path.concat(paths["config/locales"].existent)
    end

    initializer :add_view_paths do
      views = paths["app/views"].existent
      unless views.empty?
        ActiveSupport.on_load(:action_controller){ prepend_view_path(views) if respond_to?(:prepend_view_path) }
        ActiveSupport.on_load(:action_mailer){ prepend_view_path(views) }
      end
    end

    # 看看 Engine::Configuration  中path的代码：
    #  paths.add "config/environments", glob: "#{Rails.env}.rb", Path对象的current是config/environments paths也是 config/environments（with）
    # 所以paths["config/environments"] 会得到 config/environments/环境名.rb

    initializer :load_environment_config, before: :load_environment_hook, group: :all do
      paths["config/environments"].existent.each do |environment|
        require environment
      end
    end

    initializer :append_assets_path, group: :all do |app|
      app.config.assets.paths.unshift(*paths["vendor/assets"].existent_directories)
      app.config.assets.paths.unshift(*paths["lib/assets"].existent_directories)
      app.config.assets.paths.unshift(*paths["app/assets"].existent_directories)
    end

    initializer :prepend_helpers_path do |app|
      if !isolated? || (app == self)
        app.config.helpers_paths.unshift(*paths["app/helpers"].existent)
      end
    end

    #加载config/initializers 中所有文件
    initializer :load_config_initializers do
      config.paths["config/initializers"].existent.sort.each do |initializer|
        load(initializer)
      end
    end

    initializer :engines_blank_point do
      # We need this initializer so all extra initializers added in engines are
      # consistently executed after all the initializers above across all engines.
    end




### 参考资料

* <http://www.ruby-doc.org/stdlib-1.9.3/libdoc/tsort/rdoc/TSort.html>
