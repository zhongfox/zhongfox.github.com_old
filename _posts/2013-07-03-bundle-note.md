---
layout: post
category : rails
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

9. 列出当前ruby的所有gemset`rvm gemset list`

   列出所有ruby的所有gemset`rvm gemset list_all`

10. `gem list` 显示当前gemset里的所有gem

    `gem list [gemname]` 显示当前gemset里的指定gem

11. `rvm --create --ruby-version use ruby-2.0.0-p195` 在项目里创建`.ruby-version` 文件来管理ruby和gemset

### Gem

1. `gem install`

   * `gem install gemname` 从本地或远程服务器

   * `gem install gemname --remote` 从远程服务器

   * `gem install gemname --version "操作符 0.4.14"` 指定版本
   
     操作符可以是`= != > < >= <= ~>`操作符默认将是`=`

     `~>` 将允许版本号的最后一位数字增长，而其他位数不增长

2. `gem uninstall gemname -v 版本号`

2. 默认不安装文档：在用户主目录新建`.gemrc` 内容 ` gem: --no-ri --no-rdoc`

3. 在rails console中列出当前项目使用的gem和路径

        Gem.loaded_specs.values.each { |g| puts g.full_gem_path };nil

4. gem source

   修改gem soure会修改~/.gemrc 文件

   * -a, --add SOURCE_URI             Add source
   * -l, --list                       List sources
   * -r, --remove SOURCE_URI          Remove source
   * -c, --clear-all                  Remove all sources (clear the cache)
   * -u, --update                     Update source cache

### Bundle

1. `bundle init` 在当前目录新建Gemfile

2. 在Gemfile中指定ruby版本: `ruby '1.9.3'` 

3. `gem 'thin',  '~>1.1'` 指定版本，操作符使用和gem install一致

4. 通过git指定gem source

        gem 'nokogiri', :git => 'git://github.com/tenderlove/nokogiri.git', :branch => '1.4'

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


### 参考资料

* Bundler <http://bundler.io/>
