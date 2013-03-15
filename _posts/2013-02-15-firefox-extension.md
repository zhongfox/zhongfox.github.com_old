---
layout: post
category : front-end
title: firefox 扩展开发分享
tags : [firefox extension, share]
---
{% include JB/setup %}


## 名词解释

**firefox扩展（Extensions）** 扩展是能够给Mozilla增加一些新功能的附加软件。 

**firefox插件（Plugins）** 是允许网站向你提供内容并在浏览器中显示的程序。

通俗的讲,扩展基于Firefox本身增加的一些实用功能,而插件则是在Firefox之外独立编写的程序,用于显示网页中的特定内容如Flash、视频和Java 等.

准确理解扩展和插件的区别是很重要的.因为扩展是Firefox自身的功能,与操作系统无关,而插件却是独立的程序,在不同平台下的安装包也截然不同.

Firefox及其扩展都是基于当前网络开发广泛使用的技术。其结构与使用在网页中的动态HTML和windows中使用的HTML应用程序是相似的。如果你有开发动态HTML的经验，你就会发现学习开发firefox扩展的技术会相对的轻松。

----

##开发过程中使用到的技术

* JavaScript
* HTML
* css
* XML
* XUL

----

##Firefox扩展结构

典型的扩展结构：

* install.rdf 
* chrome.manifest
* content/
    * xul文件和js文件
* skin/
    * css文件图片等
* locale/
    * dtd文件

也可以把content，skin，locale文件夹放在chrome文件夹里

**install.rdf**用于存储扩展相关的一些配置信息


    <?xml version="1.0"?>
    <RDF:RDF xmlns:em="http://www.mozilla.org/2004/em-rdf#"
             xmlns:NC="http://home.netscape.com/NC-rdf#"
             xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

      <!--id Firefox的ID，这个值不能改变。必填。 -->
      <!--minVersion 指明能使用该扩展的Firefox最低版本。这里是指1.5。必填。-->
      <!--maxVersion 指明能使用该扩展的Firefox最高版本。必填 -->
      <RDF:Description RDF:about="rdf:#$I8yfp"
                       em:id="{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"
                       em:minVersion="1.5"
                       em:maxVersion="17.0.*" />

      <!--id 指出扩展的ID。该ID应该是一个Email格式的字符串，或者是一个GUID。注意，使用Email的作用是保证该ID的唯一性，并不要求这个Email地址是有效的。必填。-->
      <!--name 扩展名字。必填。 --> 
      <!--version 指出扩展的版本号。必填。 --> 
      <!--creator 扩展作者。选填。 --> 
      <!--description 扩展的描述。这里的描述将出现在Firefox的工具-附加组件的描述栏。选填。 --> 
      <!--homepageURL 扩展主页的URL。选填。 --> 
      <RDF:Description RDF:about="urn:mozilla:install-manifest"
                       em:id="zhongfox@gmail.com"
                       em:name="tuan800 auto login"
                       em:version="1.0"
                       em:creator="zhongfox"
                       em:description="auto login for tuan800 daigou"
                       em:homepageURL="http://www.tuan800.com/">
        <em:targetApplication RDF:resource="rdf:#$I8yfp"/>
      </RDF:Description>
    </RDF:RDF>

**chrome.manifest** 的作用是注册chrome（告诉firefox在哪里去找chrome） 要了解该文件的作用，需要先了解在firefox中什么是chrome

**chrome**指的是应用程序窗口的内容区域之外的用户界面元素的集合，这些用户界面元素包括工具条，菜单，进度条和窗口的标题栏等。

**chrome协议** 类似http://协议是用来请求web资源，chrome://协议用来请求chrome, 我们可以在firefox的地址栏通过chrome协议访问任何chrome资源，大部分资源会以文本文件显示，但是XUL文件会被执行，正如你在浏览器窗口上正常看到的一样。

常见的 firefox chrome : <http://kb.mozillazine.org/Dev_:_Firefox_Chrome_URLs>

Chrome 提供者能为特定的窗口类型（如浏览器窗口）提供 chrome。有三种基本的 chrome 提供者：

* 内容（Content）：通常是 XUL 文件。
* 区域（Locale） ：存放本地化信息。
* 皮肤（Skin）：描述 chrome 的外观。通常包含 CSS 和图像文件。

firefox通过Chrome URIs来存取这些文件，比如`chrome://browser/content/browser.xul`是浏览器的主界面。

Hello World的chrome.manifest

    content   xulschoolhello              content/
    skin      xulschoolhello  classic/1.0 skin/
    locale    xulschoolhello  en-US       locale/en-US/

    overlay chrome://browser/content/browser.xul  chrome://xulschoolhello/content/browserOverlay.xul

该文件看起来像是空格分隔的表格，但是使之对其的空格不是必须的。
前面三行是对提供者的注册,第一个单词（content,skin,locale）是声明的提供者，第二个是扩展的包名，skin和locale有第三个值来指定多个skin或者多个locale中的其中一个。默认会有一个classic/1.0的skin。最后的参数是指定chrome的位置。

现在我们可以用chrome协议在firefox中加载Hello World的xul：`chrome://xulschoolhello/content/browserOverlay.xul`

可以在该文件中配置操作系统类别来选择不同的skin，如：

    skin      xulschoolhello  classic/1.0 skin/unix/
    skin      xulschoolhello  classic/1.0 skin/mac/ os=Darwin
    skin      xulschoolhello  classic/1.0 skin/win/ os=WinNT

----

##XUL简介

**XUL** (XML User Interface Language) 是为了支持Mozilla系列的应用程序（如Mozilla Firefox和Mozilla Thunderbird）而开发的使用者界面标示语言。顾名思义，它是一种应用XML来描述使用者界面的标示语言。

虽然XUL并不是一种公开的标准，但它重用了许多现有的标准和技术，包括CSS、JavaScript、DTD和RDF等。

XUL是受HTML的启发，他们有很多一样的tag，但是XUL吸取了很多在HTML演进中的教训，所有XUL能构建更丰富的用户界面，或者至少是更容易！

XUL通常用于定义2中东西：窗口（window）和覆盖（overlay）

这是firefox下载的窗口： `chrome://mozapps/content/downloads/downloads.xul`

XUL文件的根元素是window或者overlay, 根元素需要有2个属性id和xmlns，如` id="some-unique-id"
  xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"` id是唯一标示，xmlns是命名空间，表明这个window/overlay里的所有元素都是xul，window/overlay里混合了html或者svg，命名空间需要相应改变。

**窗口（window）** 就是我们看到的一个独立的浏览器窗口。

使用firebug可以观察firefox主窗口的结构： `chrome://browser/content/browser.xul`

也可以用常规的js打开一个chrome窗口: `window.open("chrome://browser/content/places/places.xul", "bmarks", "chrome,width=600,height=300");` 可以在错误控制台执行这句js。

另一种打开窗口的方式是在开始中输入`firefox -chrome chrome://browser/content/places/places.xul`


**覆盖（overlay）** 是对已有的窗口的扩展，通常是添加或者替换某些界面元素。

overlay里可以有自己的样式文件，js文件和DTD文件，如引用一个js： `<script type="application/x-javascript" src="chrome://xulschoolhello/content/browserOverlay.js" />`

1. 在manifest中添加一个overlay：

   Hello World的chrome.manifest的最后一行定义了一个overlay：

   `overlay chrome://browser/content/browser.xul  chrome://xulschoolhello/content/browserOverlay.xul`。

   这行的含义是在浏览器的主窗口上加载Hello World的browserOverlay.xul, 我们可以在任何窗口中添加overlay，但是最普遍的做法是在主窗口上添加。

2. 在一个XUL中添加一个overlay：

   可以在一个XUL文件中添加一个overlay，这个XUL可能是是一个窗口，也可能也是一个overlay，通常会放在对DTD文件的引用前面。引用overlay例子： `<?xul-overlay href="chrome://findfile/content/helpoverlay.xul"?>`


overlay标签里的首层元素，如果带有id，那么这些元素是挂载点，这意味着写在这个元素里的所有元素，都会被添加到window中这个id指定的已存在元素里。如果这个id对应的元素不存在，这个挂载点会被忽略。

如果想删掉一个已存在的节点，可以在这个节点上添加属性`removeelement="true"`, 如

    <menupopup id="help-popup">
      <menuitem removeelement="true" id="help-about">
    </menupopup>

更多 overlay 内容，请参考<https://developer.mozilla.org/en-US/docs/XUL/Tutorial/Overlays?redirectlocale=en-US&redirectslug=XUL_Tutorial%2FOverlays>

----

##开发环境

#### Firefox在windows下的相关文件

**Firefox配置文件（profiles）** 配置文件相当于一个独立的firefox环境，同一台机器的firefox可以有多个配置文件

开发扩展时, 使用多个profiles的**好处：** 每个配置有独立的书签，下载，访问历史，会话以及扩展

* profiles.ini `C:\Users\{用户名}\AppData\Roaming\Mozilla\Firefox\profiles.ini`
* Profiles 目录: `C:\Users\{用户名}\AppData\Roaming\Mozilla\Firefox\Profiles`
* profile(s) `C:\Users\{用户名}\AppData\Roaming\Mozilla\Firefox\Profiles\{profile名}`
* 扩展目录：`C:\Users\{用户名}\AppData\Roaming\Mozilla\Firefox\Profiles\{profile名}\extensions`

#### 新建开发profile

如果你想将日常使用的Firefox浏览环境与你的开发环境分开，最好另外设置一个profile进行开发。

创建步骤：

1. 关闭firefox。在开始菜单搜索中输入`Firefox.exe -P`启动 Firefox Profile Manager
2. 选择"Create Profile"
3. 点击"Next"
4. 输入想要创建的profile的名字
5. 点击"Finish"
6. 取消选择"Don't ask at startup"
7. 启动firefox

创建之后，可以在开始菜单中使用`firefox.exe -P <profile name> -no-remote` 打开指定的profile，也可以在Profile Manager中选择。

更详细步骤请参考[How to Create and Run Multiple Profiles Firefox](http://www.sevenforums.com/tutorials/208070-firefox-create-run-multiple-profiles.html)

#### 修改开发配置

在地址栏输入about:config可以打开 Firefox 的参数设置页面。按照如下的设置修改参数使得调试更加容易：

    javascript.options.showInConsole = true //把 JavaScript 的出错信息显示在错误控制台 (没看到效果，console2用起来比较方便)   
    nglayout.debug.disable_xul_cache = true //禁用 XUL 缓存，使得对窗口和对话框的修改不需要重新加载 XUL 文件 (重启一个窗体后有效, xul 和js都会重新加载)   
    browser.dom.window.dump.enabled = true //允许使用 dump() 语句向标准控制台输出信息(无法使用)   
    javascript.options.strict = true //在错误控制台中启用严格的 JavaScript 警告信息   

配置修改保存到相应profile目录下的 prefs.js里

#### 好用的开发扩展

* firebug 不解释
* console2 可以方便查看扩展中的js错误
* Web Developer 很多实用的开发工具集,比如cookie控制等
* Extension Developer's Extension （Developer Assistant）帮助开发扩展的扩展，诸如XUL Editor等工具非常好用
* Restartless Restart 一键重启firefox
* Live HTTP headers 能看到从扩展里发出的请求
* Remote XUL Manager 用于加载远程（以及本地）的XUL， 这个功能是在firefox4以后被去除的，可以编辑白名单，本地调试必备


----

## 参考资料

* XUL School <https://developer.mozilla.org/en-US/docs/XUL/School_tutorial?redirectlocale=en-US&redirectslug=XUL_School>
* XUL tutorial <https://developer.mozilla.org/en-US/docs/XUL/Tutorial>
* Hello World 扩展<https://developer.mozilla.org/@api/deki/files/5139/=xulschoolhello1.xpi>
