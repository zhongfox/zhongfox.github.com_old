---
layout: post
category : javascript
tags : [referer]
title: 使用javascript去掉referer
---
{% include JB/setup %}

### HTTP Referer 
HTTP Referer是header的一部分，当浏览器向web服务器发送请求的时候，一般会带上Referer，告诉服务器我是从哪个页面链接过来的，服务器籍此可以获得一些信息用于处理。比如从我主页上链接到一个朋友那里，他的服务器就能够从HTTP Referer中统计出每天有多少用户点击我主页上的链接访问他的网站。

Referer其实应该是英文单词Referrer，不过拼错的人太多了，所以编写标准的人也就将错就错了,所以现在我们看到的http header是**Referer**

----

### Html5中对Referer的特殊处理

在Html中`rel`属性规定当前文档与被链接文档之间的关系

Html5定义了一种新的链接文档关系`noreferrer`, 规定当超链接使用该值时，浏览器不应发送 HTTP referer 头

截止当前，基于WebKit的浏览器，诸如 Safari, MobileSafari and Chrome 都已经支持该特性，但是IE，firefox，Opera等还不支持

----

###使用javascript去掉referer

毛爷爷说，一切顽固的浏览器都是纸老虎，伟大的程序员们提供了诸多的兼容去除/替换referer的办法。

github上有一个比较靠谱的[noreferrer](https://github.com/knu/noreferrer), 我加了点注释

     $.browser.webkit || $.event.add(window, "load", function () { //webkit系列浏览器啥也不做
         //把所有带有rel=noreferrer的链接找出来变量处理
         $("a[href][rel~=noreferrer], area[href][rel~=noreferrer]").each(function () {
             var b, e, c, g, d, f, h;
             b = this;    //b表示当前链接dom对象
             c = b.href;  //保存原始链接
             $.browser.opera ? (b.href = "http://www.google.com/url?q=" + encodeURIComponent(c), b.title || (b.title = "Go to "     + c)) : (d = !1, g = function () { //Opera做了些啥暂不管
                 b.href = "javascript:void(0)"
            }, f = function () {
                b.href = c
            }, $(b).bind("mouseout mouseover focus blur", f).mousedown(function (a) { //鼠标out over focus blue都把链接还原
                a.which === 2 && (d = !0) //鼠标down时，且鼠标中间按下时，把标志d设成true
            }).blur(function () { //blur把标志d设成false
                d = !1
            }).mouseup(function (a) {
                if (!(a.which === 2 && d)) return !0;
                g();
                d = !1;
                setTimeout(function () {
                    alert("Middle clicking on this link is disabled to keep the browser from sending a referrer.");
                    f()
                }, 500);
                return !1
            }), e = "<html><head><meta http-equiv='Refresh' content='0; URL=" + $("<p/>").text(c).html() + "' /></head><body><    /body></html>", $.browser.msie ? $(b).click(function () { //e是一个0秒自动刷新的页面，指向原始链接，但是没搞懂为什么搞个p标签在这里？？
                var a;                             //如果是IE的话
                switch (a = this.target || "_self") {
                case "_self": 
                case window.name:
                    a = window;
                    break;
                default:                           //如果原始链接的目标是本窗口，则在本窗口操作        
                    a = window.open(null, a)       //如果原始链接的目标不是本窗口，则用js open一个空窗口
                }
                a = a.document;
                a.clear();                         //清除窗口的document
                a.write(e);                        //写入上面构造的0秒自动刷新的页面
                a.close();                         //关闭文档使其展示出来
                return !1                          //如果非IE(firefox), 是用的'Data URI scheme'承载0秒自动刷新的页面
            }) : (h = "data:text/html;charset=utf-8," + encodeURIComponent(e), $(b).click(function () { //最后js触发点击
                this.href = h; 
                return !0
            })))
        })
    })

**策略**

1. WebKit系列浏览器使用html5支持的`rel=noreferrer`

2. 对于opera,貌似是跳到google再让它跳转回来

3. 对于其他浏览器，都是跳转到一个0秒自动刷新的页面。该页面跳转功能由meta Refresh来实现，而不是用js，这样在js禁用的浏览器也没问题

   对于如何跳转到该页面，IE和非IE做的事情不一样：

   * 非IE浏览器(firefox)使用了'Data URI scheme'来承载该页面，**页面url为空，不会构造referer header**

   * IE内核浏览器因为不支持'Data URI scheme'，遂使用js open一个新的窗口来实现，**该页面的url为空，因此浏览器也没法构造正确的referer header**

----

虽然代码不过50余行，但是用到了很多不常见的前端技巧：

1. html5新特性`rel=noreferrer`，被WebKit系列浏览器支持

2. 使用meta Refresh 非js方式构建自动刷新页面：`<meta http-equiv="refresh" content="5; url=http://www.to_some_place.com/" />`

3. `document.write` 用得比较多，它可以清除当前浏览器窗口中的所有内容，并输出一行文字。其他的文档操作方式：

   `document.clear` 清除文档内容

   `document.close` close有两个作用：显示已经写入到文档流中但还没有在浏览器窗口中显示的内容、关闭文档流。如果不使用 close() 方法关闭文档流，那么可能会出现下面两种情况：

   浏览器将文档流放在缓存中而没有显示应该输出的内容

   文档流一直打开着，浏览器可能不能显示其他动态的内容

4. Data URI scheme

   不怎么常见的`data URI scheme`是`URI scheme`中的一种，我们常用的`URI scheme`是`http URI scheme`

   `http URI scheme`: 就不介绍了，例子 `<img src="http://www.XXXX.net/files/images/check.png"/>`

   `data URI scheme`: 实例`<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAGElEQVQIW2P4DwcMDAxAfBvMAhEQMYgcACEHG8ELxtbPAAAAAElFTkSuQmCC" />`

   就是把资源内嵌到文档内，scheme：

        data:[<mediatype>][;base64],<data>

   需要知悉的是：

   * data URI scheme 减少了http请求的数量

   * 浏览器不会缓存这种资源

   * IE8以前的版本不支持data URI scheme

   更详细的请猛烈点击[Data_URI_scheme](http://en.wikipedia.org/wiki/Data_URI_scheme)

----

### 参考资料
* noreferrer <https://github.com/knu/noreferrer>
* Data_URI_scheme <http://en.wikipedia.org/wiki/Data_URI_scheme>
