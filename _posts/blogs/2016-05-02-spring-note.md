---
layout: post
categories: [blog, java]
tags : [java, spring]
title: Spring学习笔记
---
{% include JB/setup %}


## 装配Bean

### 自动装配

* spring 从2个角度实现自动装配

  * 组件扫描
  * 自动装配

* 组件扫描默认不开启, 需要手动开启

  可以在配置类上, 使用注解@ComponentScan, 默认开启与配置类同包下的所有类的扫描

  或指定需要组件扫描的包: `@ComponentScan("otherpackagename")`或者`@ComponentScan(basePackages={"p1", "p2"})`

  还可以指定包中的某一类或接口: ``@ComponentScan(basePackages={P1.class, P2.class}`

* @Autowired 实现自动装配 (依赖注入)

### java代码装配(显示配置)

* 在配置类中用方法定义来声明bean(对比自动装配, 是@ComponentScan + @Component 2个功能)

  `@Bean public 类型 方法名 {实现细节}` => `@Bean public bean的类型 bean的id {实现细节}`

  bean id 还可以通过 `@Bean(name="somename")`指定

* 在上面`实现细节`中, 可能当前bean还依赖其他bean, 需要实现依赖注入, 2中方案:

  * 同配置文件中的bean函数的调用
  * 配置当前bean, 把依赖的bean作为参数传递过来

  显示配置比自动装配麻烦体现在这里, 自动装配中没有显示的`实现细节`

### 相关注解

  * @Component: 类

    声明类是组件类, 可以被用于其他bean组装
    bean自动获得的id是类首字母变小写, 也可以重新指定id: `@Component("someid")`

  * @ComponentScan: 类

    启动组件扫描

  * @Configuration: 类

    声明配置类, 用于包含bean如何创建的细节

  * @ContextConfiguration(classes=CDPlayerConfig.class) : 类

    声明需要加载的配置类?

  * @Autowired: 属性, 构函, setter函数

    声明为自动装配, 所在bean生成时, 会自动尽量满足此声明属性的生成

  * @Bean: 配置类中代表bean的方法

    在配置类中声明一个Bean

---

## 高级装配

TODO
