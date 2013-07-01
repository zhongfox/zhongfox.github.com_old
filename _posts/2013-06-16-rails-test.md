---
layout: post
category : rails
tags : [rails, test, rspec, factory_girl, capybara]
title: 使用Rspec进行Rails单元测试
---
{% include JB/setup %}


以下是我们使用的rails测试gem组合：

    group :development, :test do 
      gem 'debugger' 
      gem "rspec" 
      gem "rspec-rails" 
      gem "factory_girl" 
      gem 'factory_girl_rails' 
    end 
     
    group :test do 
      gem 'shoulda-matchers' 
      gem 'webmock' 
      gem 'database_cleaner' 
      gem 'capybara' 
    end

### rspec rspec-rails

1. `rails g rspec:install` rspec 需要在包含在development，因为rspec要扩展若干generator以生成rspec测试

    create  .rspec
    create  spec
    create  spec/spec_helper.rb


### factory_girl factory_girl_rails

1. 默认的factories 目录是test/factories， 当generator的测试框架（test_framework ）是:rspec后，该目录将是`spec/factories
