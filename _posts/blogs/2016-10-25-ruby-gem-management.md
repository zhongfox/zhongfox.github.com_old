---
layout: post
categories: [blog, ruby]
tags : [rails, ruby, bundle, Gemfile, gem]
title: Ruby 包管理
---
{% include JB/setup %}

## Kernel#require

年代: 1997

实现:

* load成功返回true, 已经load过得返回false
* 对于绝对路径, 判断是否在`LOADED_FEATURES`, 决定是否load
* 对于非绝对路径, 从`$LOAD_PATH ($:)`中搜索, 判断是否已经在`LOADED_FEATURES`, 决定是否load
* 加载后的文件的绝对路径将加入`$LOADED_FEATURES ($")`, 再次require将不会再次load

遗留问题:

* 如何将第三方库文件加入`LOAD_PATH`, 存在大量不靠谱的粘贴复制

---

## setup.rb

年代: 2000

实现:

* 复制指定文件到指定的目录(`LOAD_PATH`)

遗留问题:

* 库文件缺乏版本控制, 不清楚库文件是否有更新, 如何升级
* 同名库文件冲突, 覆盖, 混合

---

## RubyGems

年代: 2003

实现:

* 覆写了`Kernel#require`, 老的require别名为`gem_original_require`:

  >  源码中的注释:
  When you call <tt>require 'x'</tt>, this is what happens:  
  * If the file can be loaded from the existing Ruby loadpath, it is.  
  * Otherwise, installed gems are searched for a file that matches.  If it's found in gem 'y', that gem is activated (added to the
  loadpath).

  * 先从`LOAD_PATH`中查找
  * 如果`LOAD_PATH`没有, 从`Gem::Specification`中查找, 如果找到, 激活, 并加入`LOAD_PATH`

        Gem.try_activate(path)
        ...
        Gem::Specification.find_by_path path
        ...
        spec.activate
        ...
        activate_dependencies
        ...
        add_self_to_load_path
        ...

* 一键安装与卸载

* 支持同一个包多版本安装

      %gem install rails -v 5.0

      gem "rack", "1.0" # 把那个特定的版本加入 $LOAD_PATHS
      require "rack"

遗留问题:

* 项目的gem 安装没有流程化和自动化, 依赖人工通知
* gem在单机中是共享的, 一个项目中update可能造成另一个项目不可用
* 不带版本的gem install 容易造成不同环境中版本不一致, 缺乏版本控制, 运行环境难以对等重建
* 同一个项目依赖了一个包不同的版本, 只在运行时才能发现(`activation error`)
* 缺乏依赖管理

---

## Bundler

年代: 2009

实现:

* bundle install

  Dependency Graph Resolution, 生成符合Gemfile要求的依赖图, 并且把一个可行解（但不一定是最优解）放入 Gemfile.lock

  下载安装

* bundle exec

  隔离冲突

  会事先把 `$LOAD_PATH` 中多余的东西清理掉让你不会误引用到其他的版本

  修改相关环境变量, 确保 execute a script in the context of the current bundle (the one from your directory's Gemfile)

---

## 参考资料

* <http://bundler.io/>
* <https://jdanger.com/what-does-bundle-exec-do.html>
* <https://ruby-china.org/topics/28453>
