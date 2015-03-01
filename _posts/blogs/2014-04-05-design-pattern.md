---
layout: post
categories: [blog, java]
tags : [design pattern, java]
title: 设计模式学习
---
{% include JB/setup %}

### 设计模式基础

设计模式中的关系：

1. IS-A 使用继承

2. HAS-A 使用组合

3. IMPLEMENTS 使用接口

其他:

1. 当你直接实例化一个对象时, 就是在依赖它的具体类

---

### 原则

1. [Don't Repeat Yourself](id:rule_1)

2. [封装变化](id:rule_2)

   找出应用中可能需要变化之处，把他们独立出来，不要和那些不需要变化的代码混在一起

   把会变化的代码封装起来（抽象）

   结果的好处是系统中变化的部分不会影响其他部分，系统变得更有弹性

3. [多用组合，少用继承](id:rule_3)

   组合可以实现更多的可能性，能适应更多的细节，因此代码更有弹性

4. [针对接口编程，不是针对实现编程](id:ruby_4)

   接口是对继承思想中相同或者不同继承链中相似行为的再一次抽象

   针对接口编程，真正的意思是针对超类（抽象类或者接口类型）编程，延迟绑定

   要面向抽象编程，延迟面向细节编程

5. [为交互对象之间的松耦合设计而努力](id:ruby_5)

6. [类应该对扩展开放，对修改关闭](id:ruby_6)

   在不修改现有代码的情况下（避免引入bug），就可以实现新的行为和需求（我知道这一定会发生的）

   在选择应用开发-关闭原则时要小心：每个地方都这样用是一种浪费，也没有必要，还会导致代码变得复杂且难以理解

   我们需要把注意力集中在设计中最有可能改变的地方

7. [要依赖抽象,不要依赖具体类](id:ruby_7)

   不能让高层组件依赖底层组件, 而且, 不管是高层还是底层组价, 都应该依赖于抽象

   **高层组件**是指, 有其他底层组件定义其行为的类, 如工厂方法模式中的Creator类,因为他的anOperation依赖Product(底层组件)的行为

   在组合中很常见, 尽量使用被组合类的抽象类

---

### State 状态模式

<img src="/assets/images/design_pattern/state.png" />

* 定义：运行对象在内部状态改变时改变它的行为，对象看起来好像修改了它的类

* 适用场景：Context 类中持有不同的状态，Context的某些行为随着状态的不同而不同，行为也可以改变状态

* 不好的设计：在Context的各个行为中对状态进行判断，执行不同的代码

  * 太多相似的（对状态判断）代码 [DRY](#rule_1)
  * 添加新的状态，需要修改的地方太多（每个行为中要增加一个if 判断） [对修改关闭](#ruby_6)

* 使用State模式

  * 创建State（抽象类或者接口）：对不同的状态使用一个子类代表
  * Context和State相互组合，Context持有一个State基类的引用，State也有Context的引用 [多用组合，少用继承](#rule_3)
  * Context把所有和状态相关的行为委托到State基类引用（Context类中的行为统一委托给了State类，新加状态或者修改行为状态关系都抽象到了State类）[对修改关闭](#ruby_6)
  * 具体的State子类来实现行为，并可以在行为中修改Context的引用的State
  * 移除了容易产生问题的if语句

---

### Strategy ['strætɪdʒɪ] 策略模式

<img src="/assets/images/design_pattern/strategy.jpg" />

* 定义：定义了算法簇，分别封装，让他们可以互相替换，此模式让算法变化独立于使用算法的客户

* 使用场景：Client类的继承链中某些行为在各个子类中差异性较大（甚至或有或无），或者行为经常发生变化

* 不好的设计：在Client类中的差异性动态行为完全依赖子类去控制 (如模板方法模式)

  * 经常变化的代码（策略）散落到继承链中各个地方 [封装变化](#rule_2)
  * 某些子类之间相似代码太多 [DRY](#rule_1)

* 使用Strategy模式

  * 把Client类中的差异性动态行为提取为算法簇类 [封装变化](#rule_2)  算法簇类以抽象类或者接口开始
  * Client基类中声明实例变量类型为算法簇基类类型 [多用组合，少用继承](#rule_3)
  * Client基类中把相关方法都委托给算法簇基类类型实例变量 [针对接口编程，不是针对实现编程](#ruby_4)
  * Client子类实例化时可以指定想要的算法簇，并且在生命周期中可以随时改变算法簇

---

### Observer 观察者模式

<img src="/assets/images/design_pattern/observer.jpg" />

* 定义：定义了对象之间的一对多依赖，当一个对象（subject）改变状态时，它的所有依赖者（observer）都会收到通知并自动更新

* 使用场景：

* 不好的设计：状态改变和其依赖对象耦合在一起，当有新增/删除依赖对象时，要修改subject代码 没有做到[封装变化](#rule_2)

* 使用Observer模式：

  * 定义Subject接口（#registerObserver #removeObserver #notifyObservers）内部有存储observers的列表，新增observer时，subject代码不需要修改 [封装变化](#rule_2)
  * 定义接口Observer（#update）update是observers接收消息的统一接口
  * 具体subject扩展实现Subject接口，具体observer扩展实现Observer接口
  * 当subject状态变化时，进行一对多的主动推送(#notifyObservers) [为交互对象之间的松耦合设计而努力](id:ruby_5)

* 有2种不同的观察者模式：

  * subject主动推送：当subject状态改变时，主动推送所有状态

    observers们要有统一的数据接口（#update）

  * observer拉取：当subject状态改变时，向observers推送空通知，observers再自行主动拉取想要的状态更新

    observers要知道自己要拉取的具体数据

---

### Decorator 装饰者模式

<img src="/assets/images/design_pattern/decorator.jpg" />

* 定义：动态地将责任附加到对象（concrete component）上，若要扩展功能，Decorator提供了比继承更有弹性的替代方案

* 使用场景：

* 不好的设计：使用诸多子类进行继承，各个子类中独立实现复杂而且相关的功能

* 使用Decorator

  * 具体组件（ConcreteComponent）和Decorator拥有同一个父类 component

    目的是ConcreteComponent和Decorator有同样的类型（装饰者也会成为被装饰者），而不是为了得到同样的行为

    新行为来自装饰者和组件的组合

  * decorators有共同的接口：decorator里组合了一个被装饰者，可以迭代地用多个装饰者包装一个对象
  * 具体组件（ConcreteComponent）最为最原始被装饰者被包裹在最内层
  * 装饰者可以在所委托的被装饰者的行为之前或者之后添加自己的行为
  * 装饰者的使用是一个嵌套调用的过程
  * 一旦经过装饰者，组件类型就会发生改变，所有装饰者模式不适用于那些依赖组件具体类型的场景

---

### Factory 工厂模式

1. 简单工厂

   <img src="/assets/images/design_pattern/simple_factory.jpg" />

   * 不好的设计: 在使用pizza时, 用if-else选择具体的pizza实现(new方法) [对修改关闭](#ruby_6)

   * 使用简单工厂:

     * 将if-else提取到SimpleSomeClassFactory#CreateSomeClass中(叫做工厂方法, 也有用静态方法的情况), 这样虽然解决不了[对修改关闭](#ruby_6), 但至少这部分代码可以公用出来

     * SimplePizzaFactory 是唯一用到具体pizza类的地方

2. 工厂方法模式

   <img src="/assets/images/design_pattern/factory_method.png" />

   * 定义: 定义了一个创建对象的接口(可能是抽象基类中的抽象方法), 但由子类决定要实例化哪一个, 工厂方法把类的实例化退出到子类

   * 使用Factory Method:

     * 有2条继承线: 创建者类(Creator)和产品类(Product)
     * 创建者基类中factoryMethod是抽象方法, 具体实现又子类完成; anOperation是使用Product的方法(基类定了了一个使用框架, 但是具体使用哪个又子类决定)
     * 产品类的继承线协助创建者类完成使用框架(因为所有产品子类都共同的一些实现)
     * 创建者在使用产品时(anOperation), 不必知道是在使用哪种具体的对象, 实现了**解耦**, 其他使用Product的地方也是一样, 实现了[针对接口(这里是抽象类)编程，不是针对实现编程](#ruby_4)
     * 高层组件(Creator)原来依赖底层组件(各个Product子类), 现在高层组件(Creator)和底层组件都只依赖抽象类Product [依赖倒置](#ruby_7)
