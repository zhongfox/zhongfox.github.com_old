---
layout: post
categories: [blog, ruby]
tags : [rails, ruby, bundle, Gemfile, gem]
title: RVM Gem Bundle小记
---
{% include JB/setup %}

### RVM

1. `rvm list known` 可装ruby版本

2. `rvm list` 已装ruby版本

3. `rvm requirements` 查看安装rvm的前提

4. 指定默认版本 `rvm --default use 1.9.2`

5. 查看当前版本 `ruby -v`

6. 显示默认版本 `rvm list default`

7. 使用默认版本 `rvm default`

8. 显示当前ruby的环境信息 `rvm info`

9. `rvm --create --ruby-version use ruby-2.0.0-p195` 在项目里创建`.ruby-version` 文件来管理ruby和gemset


### gemset

1. 列出当前ruby的所有gemset`rvm gemset list`

   列出所有ruby的所有gemset`rvm gemset list_all`

2. `gem list` 显示当前gemset里的所有gem

    `gem list [gemname]` 显示当前gemset里的指定gem

3. 创建gemset `rvm gemset create zxx800`

4. 使用gemset `rvm gemset use zxx800`

5. 在gemset中安装gem  `gem install rails -v  3.2.13`

### Gem

1. `gem install`

   * `gem install gemname` 从本地或远程服务器

   * `gem install gemname --remote` 从远程服务器

   * `gem install gemname --version "操作符 0.4.14"` 指定版本

      操作符可以是`= != > < >= <= ~>`操作符默认将是`=`

      `~>` 将允许版本号的最后一位数字增长，而其他位数不增长

2. `gem uninstall gemname -v 版本号`

3. 默认不安装文档：在用户主目录新建`.gemrc` 内容 ` gem: --no-ri --no-rdoc`

4. 在rails console中列出当前项目使用的gem和路径

        Gem.loaded_specs.values.each { |g| puts g.full_gem_path };nil

5. gem source

   修改gem soure会修改~/.gemrc 文件

   * -a, --add SOURCE_URI             Add source
   * -l, --list                       List sources
   * -r, --remove SOURCE_URI          Remove source
   * -c, --clear-all                  Remove all sources (clear the cache)
   * -u, --update                     Update source cache

6. 在irb中找到指定gem的路径

        spec = Gem::Specification.find_by_name("cucumber")
        gem_root = spec.gem_dir
        gem_lib = gem_root + "/lib"

7. `gem fetch gemname`  只下载不安装

8. `gem unpack gemname` 解包gem

9. `gem spec gemname`  展示gem信息，gem可以是已安装的，亦可以是本地gem文件

10. `gem environmen` 安装信息

    `INSTALLATION DIRECTORY` gem将被装到哪里, 在此目录下的`gems`目录下


11. gem 是如何加载的:

    RubyGems 覆写了 Ruby 的 require 方法:

        When you call <tt>require 'x'</tt>, this is what happens:
        * If the file can be loaded from the existing Ruby loadpath, it
          is.
        * Otherwise, installed gems are searched for a file that matches.
          If it's found in gem 'y', that gem is activated (added to the
          loadpath).

    `gem(gem_name, *requirements)` 用于激活(added to the loadpath)一个gem

    加载gem机制：

    `require 'gem name'` 时会把 `gem_dir/lib`(.gemspec的`require_paths`决定) 加人`$LOAD_PATH`, 然后执行`gem_dir/lib/gem_name.rb`

### Bundle

1. `bundle init` 在当前目录新建Gemfile

2. 在Gemfile中指定ruby版本: `ruby '1.9.3'`

3. 在Gemfile中使用require:

   `gem 'whenever', :require => false` bundler 会安装此gem，但是不会自动加载，使用时需要手动加载`require "whenever"`。适用于项目里用得比较少的gem

   `gem "whenever", :require=>"whenever_abc"` bundler会安装此gem，会自动加载. bundle会使用`require "whenever_abc"`。适用于gem名字和库名不一致的情况

3. `gem 'thin',  '~>1.1'` 指定版本，操作符使用和gem install一致

4. 通过git指定gem source

        gem 'nokogiri', :git => 'git://github.com/tenderlove/nokogiri.git', :branch => '1.4'

   When you install a gem via :path or :git it will not be listed in gem list and will throw a LoadError if you try to require it directly in irb

5. 从文件系统指定gem source

        gem 'extracted_library', :path => './vendor/extracted_library'

6. 如果gem的主文件和gem名字不一致，需要指定如何require `gem 'rspec', :require => 'spec'`

7. 环境分组：

        gem 'wirble', :group => :development
        gem 'cucumber', :group => [:cucumber, :test]

        group :test, :development do
          gem 'capybara'
          gem 'rspec-rails'
        end

8. 排除指定环境： `bundle install --without test development`

9. 指定gem安装到那里，`bundle install --path vendor/bundle` 后续的bundle操作将会记住这个位置

10. `bundle install --local`不连接远程，从本地cache中获取gem

11. `bundle package` 将所有gem放到`./vendor/cache`

    `bundle package --no-prune` 不移除在`./vendor/cache`已有的gem

12. `bundle install --deployment` 把gem安装到本项目的vendor/bundle

13. 使用capistrano部署自动bundle：`require 'bundler/capistrano'` 将会在任务`cap deploy` 中自动添加 ` bundle install`

14. `bundle show [gemname]` 展示该bundle项目中使用的所有/指定gem

15. `bundle open [gemname]` 打开该gem所在的目录

16. 在非rails项目中使用bundle：

        require 'rubygems'
        require 'bundler/setup'
        # require your gems as usual, 没有自动加载gem，需要手动加载
        require 'nokogiri'

17. 加载bundle后需要加载gem：

    按照分组加载: `Bundler.require(:default, :development)` 加载default和development

    不在任何分组里地gem就是default

    在rails项目里： `Bundler.require(:default, Rails.env)`

---

### deployment 模式

`--deployment` 会开启deployment模式，不要在开发机器开启该模式（it will cause in an error when the Gemfile is modified）

该模式要求：

* A Gemfile.lock is required
* The Gemfile.lock must be up to date
* Gems are installed to vendor/bundle not your default system location

  开发机器共享gems很方便，但是在生成环境，隔离各个项目的gems显得比较重要

  该模式应该会修改config里的path值

### bundle config

* bundle 的config 的优先级：

  1. 本项目 `app/.bundle/config`

  2. 系统, 使用环境变量

  3. 全局 `~/.bundle/config`

* 展示

  `bundle config` 展示当前所有配置(使用那个优先级和当前目录有关, --global 或者 --local无效)

  `bundle config <name>` 展示name的配置

* 设置

  `bundle config <name> <value>`  等同于 `bundle config --global <name> <value>` 将配置 `~/.bundle/config`

  `bundle config --local <name> <value>`  将配置`app/.bundle/config`

  存入配置文件的key将是`BUNDLE_NAME`

* 删除

  `bundle config --delete <name>` 适当加上 -global 或者 --local

* config 值列表

  * path (BUNDLE_PATH)
  * frozen (BUNDLE_FROZEN)
  * without (BUNDLE_WITHOUT)
  * bin (BUNDLE_BIN)
  * gemfile (BUNDLE_GEMFILE)


### 参考资料

* Bundler <http://bundler.io/>

* bundle-config <http://bundler.io/v1.3/man/bundle-config.1.html>

* Ruby Gems 是如何运作的？ <http://zhaowen.me/blog/2014/10/14/how-do-gems-work/>
