---
layout: post
categories: [blog, tool]
tags : [tool, mac, dash]
title: Dash 小记
tagline: 工欲善其事, 必先利其器
---
{% include JB/setup %}

* 下载 docset: `Preferences > Downloads`

  除了Main Docksets外, 左下角还有Third-party sources, 其中包括Go Docsets. [beego](https://godoc.org/github.com/astaxie/beego)的文档就是在这里下载的

* 文档排序 `Preferences > Docsets` 进行拖拉

* Search Profiles TODO

* Docset Keywords

  每个docset默认的搜索关键词在`Preferences > Docsets`可以找到或者修改

  使用: 在主搜索框中输入`关键词:`可以在指定docset中进行搜索

* 页面纲要:

  展示在左下角

  可以通过`CMD+F`进行搜索, 等价于在主搜索框搜索词后输入空格键

  `alt + 上下光标` 可以在纲要中游走

* Dash可以和各种编辑器集成

  其中和vim集成: [dash.vim](https://github.com/rizzatti/dash.vim)

  我通过map F8调用:

  > map <F8> :Dash<cr>

* 全局搜索快捷键

  用于激活Dash, 在Preferences > General 中设置, 我使用alt+空格

* Look Up in Dash

  * 在其他系统中, 如chrome, vim可以通过以下方式查询选中文字: 鼠标右键> Services > Look Up in Dash

  * 系统搜索快捷键: 在 设置>键盘>快捷键>服务中可以设置`Look Up in Dash` 快捷键, 我使用`alt+F` 貌似对某些应用有效, 如chrome

* The "dash://" Custom URL Scheme

  TODO

* In-Page Search

  TODO

* Snippets

  一个片段包括:

  * 缩写: 我使用反引号结尾

  * body

  * body 中的变量

    使用`__变量名__` 输入缩写后, 会有提示输入变量, 重复变量只需要输入一次

    tab键或者回车会提交变量, 切到下一个变量输入

  * 高级占位符 TODO

  Snippet 自动保存

  Snippet搜索最好创建一个`snippets only Search Profile` 避免太多文档干扰

---

## 参考

* [Dash User Guide](https://kapeli.com/dash_guide)
