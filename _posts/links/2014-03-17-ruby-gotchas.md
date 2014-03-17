---
layout: link
category : link
link: http://ruby-china.org/topics/17742
title: Ruby 中那些你绕不过的坑
---

英文原文<http://blog.elpassion.com/ruby-gotchas/>

译文首发<http://zhaowen.me/blog/2014/03/04/ruby-gotchas/>

总结得不错，应该多看几遍

多数 bang! 方法如果什么都没做就会返回 nil，最佳实践 永远不要依赖于内建的 bang! 方法的返回值, 这让我想起了以前用`gsub!`的一个bug
