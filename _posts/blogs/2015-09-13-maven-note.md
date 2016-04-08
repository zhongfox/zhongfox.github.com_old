---
layout: post
categories: [blog, java]
tags : [java, maven]
title: Maven
---
{% include JB/setup %}

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

* Help插件

  * help:system 展示系统属性和环境变量

  * help:active-profiles 列出当前构建中活动的Profile(项目的,用户的,全局的)。
  * help:effective-pom 显示当前构建的实际POM,包含活动的Profile。
  * help:effective-settings 打印出项目的实际settings, 包括从全局的settings和用户级别settings继承的 配置。
  * help:describe 描述插件的属性。它不需要在项目目录下运行。但是你必须提供你想要描述插件 的 groupId 和 artifactId

    插件所有信息: `mvn help:describe -Dplugin=help`

    输出完整的带有参数的目标列表 `mvn help:describe -Dplugin=help -Dfull`

    只输出指定目标(mojo): `mvn help:describe -Dplugin=compiler -Dmojo=compile -Dfull`

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

* 跳过单元测试: ` mvn install -Dmaven.test.skip=true`

* 默认生命周期

  process-resources 阶段：resources:resources [复制src/main/resources下的所有资源和其它任何配置的资源目录,到输出目录]

  compile 阶段：compiler:compile [编译src/main/java下的所有源代码和其他任何配置的资源目录,到输出目录]

  process-classes 阶段：(默认无目标)

  process-test-resources 阶段：resources:testResources

  test-compile 阶段：compiler:testCompile

  test 阶段：surefire:test [运行所有的测试并且创建那些捕捉详细测试结果的输出文件。默认情况下,如果有测试失败,这个目标会终止]

  prepare-package 阶段：(默认无目标)

  package 阶段：jar:jar [把输出目录打包成JAR文件], 默认采用artifact-version.jar 命名, 输出到target目录下

* `mvn clean` 删除target目录

* 坐标: groupId, artifactId, version, packaging, classifier 格式`groupId:artifactId:packaging:version`

  一个实际项目可能会有多个maven项目

  groupId: 定义该maven项目隶属的**实际项目**, 因此通常要包括2各层次: 组织, 当前项目

  artifactId: 定义该项目中的当前maven项目, 通常还会以实际项目名作为前缀

  packaging 可选, 默认值是jar

  classifier 不能直接定义

* 依赖管理

  * 传递性依赖
  * 依赖范围(scope): 当一个依赖的范围是test的 时候,说明它在Compiler插件运行compile目标的时候是不可用的。它只有在运 行compiler:testCompile和surefire:test目标的时候才会被加入到classpath中

    如果不声明scope, 默认是compile, 即对主代码和测试代码都有效

* 当为项目创建JAR文件的时候,它的依赖不会被捆绑在生成的构件中???

* mvn site TODO

* `mvn test` 执行测试, 会生成测试报告

* 构建时忽略测试失败: 配置`testFailureIgnore`

* Exec 插件

  mvn exec命令可以执行项目中的main函数。

  * 首先需要编译java工程：mvn compile
  * 不存在参数的情况下：`mvn exec:java -Dexec.mainClass="***.Main"`
  * 存在参数：`mvn exec:java -Dexec.mainClass="***.Main" -Dexec.args="arg0 arg1 arg2"`
  * 指定运行时库：`mvn exec:java -Dexec.mainClass="***.Main" -Dexec.classpathScope=runtime`

* 查看项目依赖:

  `mvn dependency:resolve` 所有依赖包

  `mvn dependency:tree` 依赖树
