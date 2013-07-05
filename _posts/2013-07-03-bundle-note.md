---
layout: post
category : rails
tags : [rails, bundle, Gemfile, gem]
title: Bundle小记
---
{% include JB/setup %}

### Gem
1. `gem install`

   * `gem install gemname` 从本地或远程服务器

   * `gem install gemname --remote` 从远程服务器

   * `gem install gemname --version "操作符 0.4.14"` 指定版本
   
     操作符可以是`= != > < >= <= ~>`操作符默认将是`=`

     `~>` 将允许版本号的最后一位数字增长，而其他位数不增长

2. 默认不安装文档：在用户主目录新建`.gemrc` 内容 ` gem: --no-ri --no-rdoc`

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

12. `bundle install --deployment` TODO?

13. 使用capistrano部署自动bundle：`require 'bundler/capistrano'` 将会在任务`cap deploy` 中自动添加 ` bundle install`


### 参考资料

* Bundler <http://bundler.io/>
