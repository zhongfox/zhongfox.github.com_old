---
layout: post
categories: [blog, ruby]
tags : [design pattern, ruby, rails]
title: Ruby设计模式学习
---
{% include JB/setup %}

## 前言

* 一个好的编程语言应当全面地整合设计模式, 使它们消亡在代码中, 如c++使得c中的面向对象设计模式消亡, ruby中一句话的设计模式
* ruby 特点:动态语言; 内建代码闭包, 类是真正的对象, 优雅的代码重用系统
* ruby的特点使得代码变得可压缩, 是DRY的应用
* ruby使得你把注意力放在解决实际问题上而不是其他工作中(如迭代器)

---

## 第一章 使用设计模式创建更好的程序

* 软件设计的复杂, 很容易让人忽视重复出现的难点和解决方案的模式
* 把变的和不变的分离
* 针对接口编程, 而不是对实现编程
* 组合优先于继承
  继承的本意: 力图将父类和子类结合(高耦合); 任何超类中没有被仔细隐藏的内部操作都会在子类中曝光
  组合: 低耦合, 更多的可能; 更好的封装性
* 委托
  获得继承的主要优势, 消除继承的副作用, 更大的灵活性
  额外方法调用的性能损耗, 可能需要无聊的代理方法

* 你不会用到它(YAGNI)

---

## 第三章 使用模板方法变换算法


<img width="65%" src="/assets/images/ruby_design_pattern/template.png" />

应用场景: 需要变换算法时. 将不变的在基类中(模板方法), 将变换封装到其下的各个子类中, 基类可以提供一些方法的默认实现(钩子方法), 子类可以根据自己需求选择使用默认实现或者覆盖


* 简单基于继承
* **模板方法**: 父类实现的处理高端流程的具体方法, 子类不进行覆盖, 子类完成其中的具体任务
* 子类的共性是具有**代码片段化**
* **钩子方法** 父类中定义的可被子类重载的非抽象方法, 子类可以:
  * 重载实现不同的任务
  * 简单接收默认值

---

## 第四章 使用策略模式替换算法

<img width="65%" src="/assets/images/ruby_design_pattern/strategy.png" />

应用场景: 把算法提取出来放到独立的对象中

* 基于组合和委托
* 所有策略类对象都有相同的接口
* 模板模式和策略模式比较:
  * 都用于算法变换
  * 模板方法模式使用继承, 策略模式使用组合
* 环境对象和策略对象数据共享的选择:
  * 环境对象向策略对象传递具体数据: 优点数据划分清晰, 缺点可能需要传递较多数据
  * 环境对象向策略对象传递环境对象自身: 优点简化了数据流动, 缺点增加了二者的耦合
* ruby 通过传递代码块可以起到传递策略的效果: 好处是不需要为策略创建特殊的策略类, 局限是只限于简单的接口, 因为代码块只有公共接口call

---

## 第五章 通过观察者保持协调

<img width="65%" src="/assets/images/ruby_design_pattern/observer.png" />

* 主题类(Subject) 引发变更消息的类, 通用接口: `add_observer, delete_observer, notify_observers`
* 观察器(Observer) 想获得变更消息的类
* ruby 标准库Observable: TODO
  * 使用: `require 'observer'` 类中`include Observer`
  * 在调用 `notify_observers`前需要调用`changed` 指明对象已经被修改, 否则`notify_observers`不会有效果
* 可以使用代码块作为观察器, 好处是无需单独创建观察者类, ruby标准库Observable并不支持
* 存在两种通知方式:
  * 观察者**拉**: `observer.update(self)`
  * 主题**推**: `observer.update(self, old_salary, new_salary)` 或者 `observer.update_salary(self, old_salary, new_salary)`
* 注意事项:
  * 需要注意通知观察者的频率和时机
  * 等主题对象进入稳定状态后再通知观察者
* ActiveRecord::Observer TODO

---

## 第六章 使用组合模式将各部分组成整体

<img width="65%" src="/assets/images/ruby_design_pattern/composite.png" />

应用场景: 整体和部门有相似行为(支持相同的接口), 适用于需要一个对象继承链或者对象树

* Component: 组件, 基类, 定义叶子类(部门)和组合类(整体)都必须支持的接口
* Leaf: 叶子类, 代表最简单的任务或者部门
* Composite: 组合类, 是leaf的组合
  除了通用接口外, 还需要支持管理子任务的接口, 如`add_sub_task``remove_sub_task`, 并维护子任务的记录如`@sub_tasks`
  `管理子任务的接口`可以提取到Component和Composite之间的一个类中, 如CompositeTask
  `管理子任务的接口`还可以包括一些迭代操作运算方法, 如`<<` `[]`等, 也可以mixin `Enumerable`实现迭代
* 思考: 叶子对象和组合对象的区别是是否需要处理子节点, 但是有些场景的子节点会动态发展为组合类, 这种情况是否可以完全去掉Leaf类, 都使用Composite, 在`add_sub_task``remove_sub_task`去判断是否存在子任务

  当然如果能确定子节点不会发展为组合节点, Leaf还是有存在的必要性
* 此模式中, 组合节点可以方便的遍历所有叶子节点, 但是叶子节点没法回溯, 可以给叶子节点增加parent方法, 在组合对象`add_sub_task`中设置子节点的parent

---

## 第七章 通过迭代器遍历集合

应用场景: 为外部世界提供访问一组聚合对象的途径, 外部世界无需掌握各个对象的聚合方式和排序方法

* 外部迭代器: '外部'指迭代器是与聚合对象分开的独立对象
* 内部迭代器: 所有迭代都发生在聚合对象内部
* 内外比较:
  * 外部: 1)客户端控制迭代流程; 2) 外部迭代器方便共享; 实例: 两个已排序的数组进行合并排序(客户端需要控制迭代流程)
  * 内部: 1)客户端控制权较少;  2)优势在于简单和代码高清晰度
* 混入Enumerable:
  * 实现each方法
  * 每个元素实现`<=>`方法

---

## 第八章 使用命令模式完成任务

<img width="65%" src="/assets/images/ruby_design_pattern/command.png" />

应用场景: 将要做什么事情(不变)和如何做这个事情(多变)分离, Client 持有Command对象, 要做什么事情时调用Command对象的通用接口(委托), Command可以在运行时更换

* Command: 
  * 有共同接口的类簇, 用于封装不同命令(如何完成具体命令); 场景: 很多状态, 具备多个方法
  * 可以有另一个选择: 代码块(同样可以代表如何完成具体命令); 场景: 简单直接的命令

* 实际应用: 
  * 命令模式+组合模式 实现记录操作命令队列
  * 支持撤销的命令模式: Command支持执行和撤销2个接口, 如`execute` `unexecute`

* 思考: 命令模式和策略模式的比较, 批量命令模式和组合模式的比较

---

## 第九章 使用适配器填补空隙

属于系列模式(一个对象包含在另一个对象中)

<img width="65%" src="/assets/images/ruby_design_pattern/adapter.png" />

* Client 对Target有一定了解(知道有哪些接口)
* Target 代表Client期望的模式接口
* Adapter 代表一个具体的适配器
* Adaptee 被适配对象
* ruby 中进行适配, 除了按照常规的开发一个Adapter外, 还有其他选择: **修改**
  * 修改Adaptee, ruby 可以Open Class
  * 修改具体adaptee对象, 如单件方法

---

## 第十章 通过代理来到对象面前

代理管理对主题的访问, 系列模式

应用场景:

* 保护代理: 控制对象访问, 方便将控制逻辑和核心逻辑分离, 也可以切换控制逻辑
* 远程代理: 提供和位置无关的对象访问途径, 将非核心和核心逻辑分离. RPC系统工作原理
* 虚拟代理: 延迟对象创建, 真正使用到时才进行创建真实对象

<img width="65%" src="/assets/images/ruby_design_pattern/proxy.png" />

* 代理对象(ServiceProxy)存在被代理对象(RealService, 也叫主题)的引用, 并且二者有同样的接口
* ruby中解决`代理苦差事`(即代理要实现主题所有的相同接口): 采用method_missing + 消息发送(send)

---

## 第十一章 使用装饰者改善对象

将功能叠加到基本对象上, 系列模式, 用于可累加的有通用接口的附加功能的动态组合

<img width="65%" src="/assets/images/ruby_design_pattern/decorator.png" />

* 对于多种功能组合的实现选择:
  * 采用继承: 要求我们在设计时就考虑所有的组合可能
  * 采用组合: 可以在运行时建立需要的组合功能

* Component: 压缩模块和装饰者的共同父类, 定义了通用接口
* ConcreteComponent(压缩模块): 实现了基本模块功能的对象, 是装饰链的起点
* Decorator: 装饰者, 包含一个Component的引用, 在递归调用通用接口时, 可以进行自定义预处理
* 压缩模块和装饰者的比较:
  * 压缩模板实现了基本功能, 装饰者实现了扩展功能
  * 都可以作为被装饰者
* 减少Component中的模板方法: ActiveRecord中提供了delegate (TODO)
* ruby中一种装饰方法的实现: 在对象的单件类中采用alias重写需要附加功能的方法; 另一种是对对象extend需要的扩展方法
* `alias_method_chain old_method, new_funcion` 目的是将原方法增加新的装饰功能, 实现:
  * 用户要创建`old_method_with_new_function`方法, 实现组合新功能, 新功能如果要使用旧功能采用`old_method_without_new_function`
  * 将`old_method`改名为`old_method_without_new_function`
  * 将`old_method_with_new_function` 改为 `old_method`

---

## 第十二章 使用单例确保只有一个

* 通用的实现方式是将初始化方法声明为private, 将单例存储与类变量中
* ruby 提供的singleton模块可以方便实现单例模式, 包括: 创建类变量, 初始化单例, 类方法instance, 将new 设为私有
* 单例模式细分为:
  * 勤单例: 类加载时创建单例
  * 惰单例: 类方法instance 初次调用时创建单例
* 其他单例实现:
  * 全局变量
  * class作为单例
  * module作为单例












