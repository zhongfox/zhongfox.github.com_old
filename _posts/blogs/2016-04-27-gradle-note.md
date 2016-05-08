---
layout: post
categories: [blog, java]
tags : [java, maven, gradle]
title: Gradle
---
{% include JB/setup %}


## Task

* 快捷定义

      task hello << {
          println 'Hello world!'
      }

  `<<`等同doLast

  `task(hello)` `task('hello')` 字符串可选

  还可以 `tasks.create(name: 'hello') ...`

  还有 `task myCopy(type: Copy)`

* Task Type

  TODO

* 定义依赖

      task intro(dependsOn: hello) << ...
      task0.dependsOn task2, task3

  依赖的任务可以定义在后面

* 加入行为

  task hello << { ...
  task hello.doFirst { ...
  task hello.doLast { ...
  hello << { ...

* 短标记

 `$` 可以访问一个存在的任务, 貌似只能放字符串里, 类似字符串内插

  `println "Greetings from the $hello.name task."`

* 定义默认任务

  `defaultTasks 'clean', 'run'`

  直接使用`gradle -q` 执行

* 定位task

  * 属性形式 `project.hello`

  * 集合形式 `tasks['hello']`

  * 路径形式 `tasks.getByPath('hello')`

* 任务配置

  TODO

---

## Project

* project标准属性:

  project, name, path, description, projectDir, buildDir, group version, ant


---

## Plugin

* 插件通过`apply` 声明, 进行使用

* Build Init plugin 自动被apply

  init 插件文档: <https://docs.gradle.org/current/userguide/build_init_plugin.html>

* 局部变量定义 `def dest = "dest"`


---

## Build Scripts

* gradle 自动创建type 为Project 的对象 project
* 任何未定义的方法/属性, 都代理到了project
* 可以在对象的ext上增加自定义属性

---

## Java Plugin

<img src="/assets/images/gradle/javaPluginTasks.png" />

<https://docs.gradle.org/current/userguide/java_plugin.html>

## 参考

* [Gradle User Guide](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle User Guide 中文版](http://wiki.jikexueyuan.com/project/GradleUserGuide-Wiki/)
