---
layout: link
category : link
link: http://yehudakatz.com/2010/12/16/clarifying-the-roles-of-the-gemspec-and-gemfile/
title: gemspec和gemfile
---

* gemspec和gemfile都和dependency有关

* Gemfile不是rubygems必须的，`.gemspec`是必须的

* gem开发和app开发的区别：

  * gem 不关心dependency gem的来源(依赖的gem只是一个符号，没有指定来源)，app要保证代码在所有机器完全一致

  * gem 开发不能控制deployment，但是app开发可以，app开发使用`Gemfile.lock`写死版本和来源

  * gem 看中的是长期适用（longevity）和灵活（flexibility），而app看中的是代码绝对一致的保证

  * gem 不应该 把 `Gemfile.lock`放在版本库，而app开发应该

    原因在于：`Gemfile.lock` 将会把所有依赖的gem限定确定的版本，但是其实gem 是适用于一定的版本区间的。


* gem的Gemfile应该只包含

        source "http://www.rubygems.org"
        gemspec

* 其中`gemspec` 告诉bundler使用同目录的` .gemspec` 去解决gem的依赖关系

另外可参考 [extract something raw as a gem](https://coderwall.com/p/ckikga/gemfile-and-gemspec)
