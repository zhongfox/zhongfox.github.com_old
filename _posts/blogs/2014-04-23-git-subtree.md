---
layout: post
categories: [blog, git]
title: Git subtree
tags : [git]
---
{% include JB/setup %}

### git subtree

git subtree是一条git子命令，本质上subtree是一种合并策略, 要求git版本大于1.8

安装<http://engineeredweb.com/blog/how-to-install-git-subtree/>

---

### 使用场景：

* 主git项目的子目录用子git项目来填充，可以执行特定的填充分支

* 子git项目在其他多个项目中共享

* 主git项目可以push或者pull子git项目

---

### 使用

1. 主项目添加子git源：

   `git remote add -f <子仓库名> <子仓库地址>`

   如 `git remote add -f mysub file:///Users/zhonghua/code/work/gittest/sub.git`

   这时候主项目调用`git remote -v` 会看到新加了一个源：

        mysub file:///Users/zhonghua/code/work/gittest/sub.git (fetch)
        mysub file:///Users/zhonghua/code/work/gittest/sub.git (push)
        origin  /Users/zhonghua/code/work/gittest/main.git (fetch)
        origin  /Users/zhonghua/code/work/gittest/main.git (push)


2. 主项目建立和子项目subtree关联

   `git subtree add --prefix=<子目录名> <子仓库名> <分支> --squash`

   如`git subtree add --prefix=mysub mysub master --squash`

   `--squash`意思是把subtree的改动合并成一次commit，这样就不用拉取子项目完整的历史记录。

   这个会在主项目中新建目录`mysub/` 并拉去子项目的指定分支(master)到mysub目录

3. 主项目pull子项目

   `git subtree pull --prefix=<子目录名> <源> <分支> --squash`

   如`git subtree pull --prefix=mysub mysub master --squash` (如果当前子项目分支不是master，会自动切换)

   如果使用新的分支，可能需要先使用`git fetch <源> <分支>` 如 `git fetch mysub develop `

4. 主项目push子项目

   `git subtree push --prefix=<子目录名> <源> 分支`

   如 `git subtree push --prefix=mysub mysub master`

   之后，主项目可以再次push自己（应该是必须的吧？）

---

### TODO

* 各个步骤的log
* 主项目push子项目，然后主项目还可以再次push自己
* 主项目可以查看子项目当前分支名吗？

---

### 参考资料

* <http://aoxuis.me/posts/2013/08/07/git-subtree>
