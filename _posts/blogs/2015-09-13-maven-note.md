---
layout: post
categories: [blog, java]
tags : [java, maven]
title: Maven
---
{% include JB/setup %}

## 安装与结构

* mac 安装

  使用brew安装后, mvn 大概位置: `/usr/local/Cellar/maven/3.3.3`

      /usr/local/Cellar/maven/3.3.3/
      ▾ bin/
          mvn* [RO]  入口文件, 将JAVA_HOME加上/usr/libexec/java_home, 然后调用libexec/bin/mvn
          mvnDebug* [RO]
          mvnyjp* [RO]
      ▾ libexec/
        ▾ bin/
            m2.conf
            mvn*   真正命令调用文件
            mvnDebug*
            mvnyjp*
        ▾ boot/
            plexus-classworlds-2.5.2.jar
        ▾ conf/
          ▸ logging/
            settings.xml 全局配置文件
            toolchains.xml
        ▸ lib/
        INSTALL_RECEIPT.json
        LICENSE
        NOTICE
        README.txt


* .m2

  * 本地配置: `~/.m2/settings.xml` 该文件包含了用户相关的认证,仓库和其它信息的配置
  * 本地仓库: `~/.m2/repository/` 当你从远程Maven仓库下载依赖的时候,Maven在你本地 仓库存储了这个依赖的一个副本

---

## 使用

* archetype:generate

      mvn archetype:generate \
        -DgroupId=com.di.maven \
        -DartifactId=hello-nerd \
        -DarchetypeArtifactId=maven-archetype-quickstart \
        -Dversion=1.0 \
        -DinteractiveMode=false

  结构:

      .
      ├── pom.xml
      └── src
          ├── main
          │   └── java
          │       └── com
          │           └── di
          │               └── maven
          │                   └── App.java
          └── test
              └── java
                  └── com
                      └── di
                          └── maven
                              └── AppTest.java

  开发和测试的资源文件应该分别位于`src/main/resources`和 `src/test/resources`

* `mvn package` 在工程target目录下打包

      └── target
          ├── classes
          │   └── com
          │       └── di
          │           └── maven
          │               └── App.class
          ├── hello-nerd-1.0-SNAPSHOT.jar
          ├── maven-archiver
          │   └── pom.properties
          ├── maven-status
          │   └── maven-compiler-plugin
          │       ├── compile
          │       │   └── default-compile
          │       │       ├── createdFiles.lst
          │       │       └── inputFiles.lst
          │       └── testCompile
          │           └── default-testCompile
          │               ├── createdFiles.lst
          │               └── inputFiles.lst
          ├── surefire-reports
          │   ├── TEST-com.di.maven.AppTest.xml
          │   └── com.di.maven.AppTest.txt
          └── test-classes
              └── com
                  └── di
                      └── maven
                          └── AppTest.class

  执行: `java -cp target/hello-nerd-1.0-SNAPSHOT.jar com.di.maven.App`

  package 后的jar包并不包括`Main-Class`的声明, 所有无法使用`java -jar`执行, 需要使用`maven-shade-plugin`

        <build>
          <plugins>
            <plugin>
              <groupId>org.apache.maven.plugins</groupId>
              <artifactId>maven-shade-plugin</artifactId>
              <version>2.0</version>
              <configuration>
                <transformers>
                  <transformer implementation = "org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                    <mainClass>com.xxx800.www.fox.App</mainClass>
                  </transformer>
                </transformers>
                <!-- put your configurations here -->
              </configuration>
              <executions>
                <execution>
                  <phase>package</phase>
                  <goals>
                    <goal>shade</goal>
                  </goals>
                </execution>
              </executions>
            </plugin>
          </plugins>
        </build>

* ` mvn install` 安装当前工程的输出文件到本地仓库

  除了 `~/.m2/repository/<groupId>/<artifactId>/<version>/<artifactId>-<version>.<packaging>` 外, 还有些其他文件:

      ├── _remote.repositories
      ├── hello-nerd-1.0-SNAPSHOT.jar
      ├── hello-nerd-1.0-SNAPSHOT.pom
      └── maven-metadata-local.xml

  一个pom项目一个jar包, 里面按照包结构树创建目录树, 一个包下可能有多个class文件

* 跳过单元测试: ` mvn install -Dmaven.test.skip=true`

* Exec 插件

  mvn exec命令可以执行项目中的main函数。

  * 首先需要编译java工程：mvn compile
  * 不存在参数的情况下：`mvn exec:java -Dexec.mainClass="***.Main"`
  * 存在参数：`mvn exec:java -Dexec.mainClass="***.Main" -Dexec.args="arg0 arg1 arg2"`
  * 指定运行时库：`mvn exec:java -Dexec.mainClass="***.Main" -Dexec.classpathScope=runtime`

* 查看项目依赖:

  `mvn dependency:resolve` 所有依赖包

  `mvn dependency:tree` 依赖树


---

## 生命周期


* 在一个生命周期中，运行某个阶段的时候，它之前的所有阶段都会被运行

* 三套独立的生命周期:

  * clean
  * default
  * site

  * 三个生命周期完全独立
  * 每个周期都有一些阶段, 阶段是有序的, 且前后依赖

* clean
  * pre-clean: 执行一些需要在clean之前完成的工作
  * clean:  移除所有上一次构建生成的文件, 会删除target目录
  * post-clean:  执行一些需要在clean之后立刻完成的工作

* default
  * validate
  * generate-sources
  * process-sources
  * generate-resources
  * process-resources 阶段：resources:resources [复制src/main/resources下的所有资源和其它任何配置的资源目录,到输出目录]
  * compile 阶段：compiler:compile [编译src/main/java下的所有源代码和其他任何配置的资源目录,到输出目录]
  * process-classes 阶段：(默认无目标)
  * generate-test-sources
  * generate-test-resources
  * process-test-resources 阶段：resources:testResources
  * test-compile 阶段：compiler:testCompile
  * process-test-classes
  * test 阶段：surefire:test [运行所有的测试并且创建那些捕捉详细测试结果的输出文件。默认情况下,如果有测试失败,这个目标会终止]
  * prepare-package 阶段：(默认无目标)
  * package 阶段：jar:jar [把输出目录打包成JAR文件], 默认采用artifact-version.jar 命名, 输出到target目录下
  * pre-integration-test
  * integration-test
  * post-integration-test
  * verify
  * install
  * deploy

* site
  * pre-site     执行一些需要在生成站点文档之前完成的工作
  * site    生成项目的站点文档
  * post-site     执行一些需要在生成站点文档之后完成的工作，并且为部署做准备
  * site-deploy     将生成的站点文档部署到特定的服务器上

* 相关命令行:

  * `mvn clean` pre-clean, clean
  * `mvn test` default中直到test
  * `mvn clean test` clean生命周期clean, default生命周期install

---

## 坐标

* 坐标: groupId, artifactId, version, packaging, classifier 格式`groupId:artifactId:packaging:version`

  一个实际项目可能会有多个maven项目

  groupId: 定义该maven项目隶属的**实际项目**, 因此通常要包括2各层次: 组织, 当前项目

  artifactId: 定义该项目中的当前maven项目, 通常还会以实际项目名作为前缀

  packaging 可选, 默认值是jar

  classifier 不能直接定义

  约定:

  * 一个实际项目的多个maven通常有相同的groupId, 如果是一起开发, 通常还有相同的version
  * artifactId 通常还需要相同的前缀, 通常是实际项目名
  * module的目录名称, 最好与artifactId (不是强制要求)

* 坐标在pom中的定义:

  * groupId, artifactId, version
  * type 对应坐标中的packaging, 默认jar, 可省
  * scope 依赖范围
  * optional 标记依赖是否可选
  * exclusions: 用来排除依赖传递性

* 文件依赖方式体现在classpath的不同, 有3个classpath: 编译, 测试, 运行

* scope 依赖范围

  如果不声明scope, 默认是compile

  <img src="/assets/images/maven/scope.png" />

* 依赖传递

  第一列是第一依赖, 第一行是第二依赖, 中间交汇处是传递性依赖的scope

  <img src="/assets/images/maven/yilai.png" />

* 依赖调节: 同一个模块, 依赖树中有不同的版本

  * 原则一: 最短路径优先
  * 原则二: 在pom中最先定义的优先

* 依赖管理

  * 传递性依赖
  * 依赖范围(scope): 当一个依赖的范围是test的 时候,说明它在Compiler插件运行compile目标的时候是不可用的。它只有在运 行compiler:testCompile和surefire:test目标的时候才会被加入到classpath中

* 依赖调解

  项目的包依赖树, 存在相同包的不同版本

  * 路径最近者优先
  * 第一声明优先, 即在POM中的顺序优先

---


* 当为项目创建JAR文件的时候,它的依赖不会被捆绑在生成的构件中???

* mvn site TODO

* `mvn test` 执行测试, 会生成测试报告

* 构建时忽略测试失败: 配置`testFailureIgnore`
---

## 插件

* 一个插件有多个目标, 每个目标完成相应功能

* 插件目标与生命周期阶段绑定

  在pom中build/plugins声明:

      <plugin>
         <artifactId>maven-source-plugin</artifactId>
         <version>2.1</version>
         <configuration>
            <attach>true</attach>
         </configuration>
         <executions>
            <execution>               配置一个任务
               <phase>compile</phase> 配置到生命周期的阶段中
               <goals>
                  <goal>jar</goal>    插件的目标
               </goals>
            </execution>
         </executions>
      </plugin>




* Help插件

  * help:system 展示系统属性和环境变量

  * help:active-profiles 列出当前构建中活动的Profile(项目的,用户的,全局的)。
  * help:effective-pom 显示当前构建的实际POM,包含活动的Profile。
  * help:effective-settings 打印出项目的实际settings, 包括从全局的settings和用户级别settings继承的 配置。
  * help:describe 描述插件的属性。它不需要在项目目录下运行。但是你必须提供你想要描述插件 的 groupId 和 artifactId

    插件所有信息: `mvn help:describe -Dplugin=help`

    输出完整的带有参数的目标列表 `mvn help:describe -Dplugin=help -Dfull`

    只输出指定目标(mojo): `mvn help:describe -Dplugin=compiler -Dmojo=compile -Dfull`

---

## 聚合

    <modelVersion>4.0.0</modelVersion>
    <groupId>com.juvenxu.mvnbook.account</groupId> groupId和其他模块的一致
    <artifactId>account-aggregator</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>                     这里必须是pom
    <name>Account Aggregator</name>                可读性的描述
    <modules>
      <module>account-email</module>               各个模块对应的相对目录名
      <module>account-persist</module>             最好目录名和模块的artifactId一致
      <module>account-parent</module>
    </modules>

* 通常聚合模块是在最顶层, 其他模块是其子目录

  也可以让聚合模块和其他模块平级, modules声明中注意调整为相对的路径

* 聚合模块通常没有src

---

## 继承

TODO

---

## 约定


