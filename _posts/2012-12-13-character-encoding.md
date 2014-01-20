---
layout: post
category : sundry
tags : [encoding, share]
title: 编码学习分享
tags : [encoding, share]
---
{% include JB/setup %}


## 名词解释

**字符集(Character set)** 是多个文字/字符的集合, 比如ASCII字符集，Unicode字符集

**字符编码(Character encoding)** 字符集中，每个字符都分配一个编码，称为字符编码， 例如"汉"字的Unicode编码是6C49

**文字编码方式(Character encoding Scheme)** 规定如何传输、保存字符编码, 例如都是用Unicode字符集的UTF-8、UTF-16、UTF-32, "汉"字的在UTF-8中使用3个连续的字节E6 B1 89来表示，但是在UTF-16（Big-Endian）中刚好是2字节6C 49


## 主要编码介绍

###一. ASCII
  （American Standard Code for Information Interchange）美国信息交换标准代码
  
  ASCII码使用指定的7位或8位二进制数组合来表示128或256种可能的字符, ASCII文件是简单的无格式文本文件，可以由任何计算机所识别
  
  7位编码ASCII范围0-127，96个字符和32个控制符号。
  
  8位ascii码的编码128-255中扩展的是一些制表符，是ISO/IEC 8859-1 (ISO-8859-1) 又叫latin-1，在网页编码等各种网络协议中使用
  
  
###二. GB2312

  信息交换用汉字编码字符集, euc-cn, cp936
  
  兼容ASCII， 使用1字节或2字节表示一个字符。
  一个小于127的字符的意义与ASCII相同，但两个大于127的字符连在一起时，就表示一个汉字，前面的一个字节（高字节）从0xA1用到0xF7，后面一个字节（低字节）从0xA1到0xFE
  
**分区表示**

* `GB 2312中对所收汉字进行了"分区"处理，每区含有94个汉字/符号。这种表示方式也称为区位码。`
* `01-09区为特殊符号。`
* `16-55区为一级汉字，按拼音排序。`
* `56-87区为二级汉字，按部首/笔画排序。`
* `10-15区及88-94区则未有编码。`

  "高位字节"使用了0xA1-0xF7(把01-87区的区号加上0xA0)，"低位字节"使用了0xA1-0xFE(把01-94加上 0xA0)。
  由于一级汉字从16区起始，汉字区的"高位字节"的范围是0xB0-0xF7，"低位字节"的范围是0xA1-0xFE，占用的码位是 72\*94=6768。其中有5个空位是D7FA-D7FE。
  例如"啊"字会以两个字节，0xB0（第一个字节） 0xA1（第二个字节）储存。区位码=区字节+位字节（与区位码对比：0xB0=0xA0+16,0xA1=0xA0+1）。
  
###三. GBK

汉字内码扩展规范，向下与 GB2312 编码兼容

字符有一字节和双字节编码，00–7F范围内是一位，和ASCII保持一致。
双字节编码中，总体上说第一字节的范围是81–FE（也就是不含80和FF），第二字节的范围在40–FE（剔除7F一个值）

GB系列编码字节序列都是采用大端法
  
###四. Unicode （Universal Multiple-Octet Coded Character Set）
  
  Unicode 是基于通用字符集（Universal Character Set）的标准来发展，Unicode只是一个符号集, 它只规定了符号的二进制代码, 却没有规定这个二进制代码应该如何存储, 所以Unicode只是编码，不存在多少字节的问题。
  
  Unicode用数字0-0x10FFFF来映射这些字符，最多可以容纳1114112个字符，或者说有1114112个码位。码位就是可以分配给字符的数字。中文范围是4E00-9FBF
  
  **UTF**是指 Unicode Translation Format
  
  UTF-8、UTF-16、UTF-32都是将数字转换到程序数据的编码方案。
  
* UTF-8 可变长度字符编码，也是一种前缀码，使用一至六个字节为每个字符编码，兼容ASCII编码。不存在字节序列问题。
* UTF-16 以固定长度的字节 (2字节) 储存, 无法兼容于ASCII编码，存在字节序问题
* UTF-32 每个字符都使用4字节
  
  
<blockquote><pre><span>
   |  Unicode符号范围      |  UTF-8编码方式
 n |  (十六进制)           | (二进制)
---+-----------------------+------------------------------------------------------
 1 | 0000 0000 - 0000 007F |                                              0xxxxxxx
 2 | 0000 0080 - 0000 07FF |                                     110xxxxx 10xxxxxx
 3 | 0000 0800 - 0000 FFFF |                            1110xxxx 10xxxxxx 10xxxxxx
 4 | 0001 0000 - 0010 FFFF |                   11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
 5 | 0020 0000 - 03FF FFFF |          111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
 6 | 0400 0000 - 7FFF FFFF | 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx

                    表 1. UTF-8的编码规则
</span></pre></blockquote>
  
**Byte Order Mark**
  
  BOM（Byte Order Mark）是一个字符，它表明UNICODE文本的UTF-16,UTF-32的编码字节顺序（高字节低字节顺序）和编码方式（UTF-8,UTF-16,UTF-32， 其中UTF-8编码是字节顺序无关的
  
  Encoding Representation 
  
* UTF-8 EF BB BF 
* UTF-16 Big Endian FE FF 
* UTF-16 Little Endian FF FE 
* UTF-32 Big Endian 00 00 FE FF 
* UTF-32 Little Endian FF FE 00 00
  
###五. ANSI
  
  （American National Standards Institute）美国国家标准学会的标准码
  
  使用 2 个字节来代表一个字符的各种汉字延伸编码方式，称为 ANSI 编码， 不同的国家和地区制定了不同的标准，由此产生了 GB2312, BIG5, JIS 等各自的编码标准。
  
  这些。在简体中文系统下，ANSI 编码代表 GB2312 编码，在日文操作系统下，ANSI 编码代表 JIS 编码。 不同 ANSI 编码之间互不兼容
  
  ANSI编码兼容ASCII，0x00~0x7F之间的字符，依旧是1个字节代表1个字符。使用 0x80~0xFF 范围的 2 个字节来表示 1 个字符
  
  ASCII字符集是与ANSI字符集中的前面128个(0-127)字符相同。
  
**notepad 中 ANSI "联通" 乱码原因：**

"联通"的ANSI（GB2312）编码：

    c1 1100 0001
    aa 1010 1010
    cd 1100 1101
    a8 1010 1000

**结论：**  txt 中保存ANSI编码，当txt文档中一切字符都在 C0≤高字节≤DF 80≤低字节≤BF 这个范围时（误认为是UTF-8），notepad都无法确认文档地格式

## 乱码及其原因

乱码大概有以下几种原因：

* 程序软件把一种字符编码方式的数据按照另一种字符编码方式来表示
* 没有字体
* 变换内码时出错
* 字节顺序错误

**程序如果获取数据的编码？**

几乎所有情况下，文本数据都不附加文字编码方式的信息，软件大体会按一下方式来尝试自动推测数据编码：

* 检查只有在某种字符编码方式下才会出现的字节排列，从而来确定编码方式。（比如notpad中"联通的"乱码， 微软用EF BB BF判定UTF-8）
* 如果不能确定，则按照文字出现的频率来推测

这样并不能100%确定字符编码方式，字符编码方式一旦错了，数据就完全没有意义。即产生乱码

另外有些程序和软件还存在其他确定编码的方式：

* HTTP邮件和经由HTTP传送的文本数据可以指定编码方式，但这是是可选项。而且存在一个先有鸡还是先有蛋的问题。
* XML明确规定未指定编码的xml都是UTF-8编码
* vim会检查文件第一行： `# vi: set fileencoding=utf-8`
* ruby1.9 源文件可以在文件开头指定源编码 `# coding:utf-8`
* Emacs: `# -*- coding: utf=8 -*-`
* 某些软件可以让用户指定编码方式

## 编码应用

### 一．浏览器如何解析HTML字符编码

字符编码信息可以在随文档发送的HTTP响应头信息中指定(HTTP Content-Type header)，也可以在文档的HTML标签中指定(META)。

浏览器根据字符编码信息将字节流转换为显示在浏览器上的字符。如果不知道如何构造一个页面的字符，浏览器自然也不能正确地渲染页面。绝大部分浏览器在开始执行任何JavaScript代码或者绘制页面之前都要缓冲一定数量的字节流，缓冲的同时它们也要查找相关的字符编码设定。

不同浏览器需要缓冲的字节流数量不同，另外如果找不到编码设定，各浏览器默认的编码也不同。但是不管哪一种浏览器，如果在已经缓冲了足够的字节流、开始渲染页面之后才发现指定的编码设定与其默认值不同，都会**导致重新解析文档**并重绘页面。如果编码的变化影响到了外部资源（例如css\js\media），浏览器甚至会重新对资源进行请求。

**最佳实践**

* 通过HTTP头信息或meta标签指定编码`<meta http-equiv="content-type" content="text/html; charset=UTF-8" />`
* 把meta标签放在head区域的最前面
* 始终指定文档类型

  如果没有在头信息或meta标签中指定文档类型（content-type），浏览器就会通过很复杂的算法去"嗅探"文档的类型。这个过程会造成额外的延迟，而且还会带来安全漏洞。
* 务必指定正确的字符编码
  HTTP头信息或meta标签中指定的字符编码设置一定要和编辑HTML文档时的实际字符编码一致，如果同时通过HTTP头信息和Meta标签两种方式指定了字符编码，它们一定要保持一致。否则浏览器发现两者相互矛盾，会造成页面渲染错误或者为了重绘页面而造成额外的延迟。


### 二．URL编码
只有字母和数字`[0-9a-zA-Z]`、一些特殊符号`$-_.+!*'(),` 以及某些保留字，才可以不经过编码直接用于 URL。
  这意味着，如果URL中有汉字，就必须编码后使用。但是麻烦的是url编码是交给应用程序（浏览器）自己决定。这导致"URL编码"成为了一个混乱的领域。

* 网址路径的编码，用的是utf-8编码

>http://zh.wikipedia.org/wiki/春节  
>"春"和"节"的utf-8编码分别是"E6 98 A5"和"E8 8A 82"  
>http请求中 "春节"编码被成了"%E6%98%A5%E8%8A%82"

* 查询字符串的编码，用的是操作系统的默认编码。

>http://www.baidu.com/s?wd=春节  
>"春"和"节"的GB2312编码  
>http请求中 wd=%B4%BA%BD%DA  

* GET和POST方法的编码，用的是网页的编码
* 在Ajax调用中，IE总是采用GB2312编码（操作系统的默认编码），而Firefox总是采用utf-8编码

**最佳实践**

  先用Javascript先对URL编码，然后再向服务器提交，不要给浏览器插手的机会。因为Javascript的输出总是一致的，所以就保证了服务器得到的数据是格式统一的。  
  具体编码规则：除了ASCII字母、数字、标点符号和一些特殊字符以外，对其他所有字符进行编码。在\u0000到\u00ff之间的符号被转成%xx的形式，其余符号被转成%uxxxx的形式  
  相关javascript函数： escape(), encodeURI(), encodeURIComponent()  

###　三．vim 中的编码

Vim 有四个跟字符编码方式有关的选项：

* encoding: Vim 内部使用的字符编码方式(locale决定的)
* fileencoding: Vim 中当前编辑的文件的字符编码方式，Vim 保存文件时也会将文件保存为这种字符编码方式。
* fileencodings: Vim自动探测fileencoding的顺序列表， 启动时会按照它所列出的字符编码方式逐一探测即将打开的文件的字符编码方式，并且将 fileencoding 设置为最终探测到的字符编码方式。 
* termencoding: Vim 所工作的终端 (或者 Windows 的 Console 窗口) 的字符编码方式。默认空值，也就是输出到终端不进行编码转换。

**修正显示编码**： `:e ++enc=cp936`

Vim 的多字符编码方式支持是如何工作的：

1. Vim 启动，根据 .vimrc 中设置的 encoding 的值来设置 buffer、菜单文本、消息文的字符编码方式。 

2. 读取需要编辑的文件，根据 fileencodings 中列出的字符编码方式逐一探测该文件编码方式。并设置 fileencoding 为探测到的，看起来是正确的字符编码方式。 

3. 对比 fileencoding 和 encoding 的值，若不同则调用 iconv 将文件内容转换为encoding 所描述的字符编码方式，并且把转换后的内容放到为此文件开辟的 buffer 里，此时我们就可以开始编辑这个文件了。

4. 编辑完成后保存文件时，再次对比 fileencoding 和 encoding 的值。若不同，再次调用 iconv 将即将保存的 buffer 中的文本转换为 fileencoding 所描述的字符编码方式，并保存到指定的文件中。

### 四. mysql 中的编码
  mysql中有若干关于编码的配置，用`show variables like '%character%';` 可以查询：
  
* `character_set_client` 客户端字符集
* `character_set_connection` 客户端与服务器端连接采用的字符集
* `character_set_database` 数据库采用的字符集， 创建table时的默认编码
* `character_set_filesystem` 
* `character_set_results` SELECT查询返回数据的字符集
* `character_set_server` 服务器的字符集,创建数据库时默认的编码
* `character_set_system` 
* `character_sets_dir` 
  
在php中 `set names 'gbk'` 等同于同时设定了 

    set @@character_set_client = 'gbk'
    set @@character_set_connection = 'gbk'
    set @@character_set_results = 'gbk'

  通常情况将`set names '编码'` 设置得和mysql的`character_set_database`一直，可以避免大部分乱码问题，但是当程序编码(如web页面)和数据库编码不一致时，必须设置`character_set_results`和程序编码一致。
  
解决mysql+web的乱码：
  
1、要保证数据库中存的数据与数据库编码一致，即数据编码与`character_set_database`一致；

2、要保证通讯的字符集与数据库的字符集一致，即`character_set_client`, `character_set_connection`与`character_set_database`一致；

3、要保证SELECT的返回与程序的编码一致，即`character_set_results`与程序编码一致；

4、要保证程序编码与浏览器编码一致，即程序编码与http header 或 meta 标签中charset一致。
  
### 五. CSV 文件乱码原因

* 在windows简体中文环境中，EXCEL打开CSV默认是ANSI编码，如果CSV文件的编码方式为utf-8等编码就可能出现乱码。
* WPS既支持ANSI编码也支持utf-8编码的CSV。

### 六. RUBY中的编码

一段RUBY代码在最底层就是一串字符串。默认情况下，RUBY解释器假定RUBY源代码是采用ASCII进行编码，但RUBY程序并不是必须采用ASCII编码，RUBY解释器必须知道源文件采用的编码，才能正确的将文件中的字节流解释成字符。

* 在ruby1.8里，字符串是一个**字节序列**, 字符串的每个字节都被假定表示一个ASCII字符，字符串中的单元不是字符而是**数字**，即实际的字节值或字符编码值。

* 在ruby1.9中，字符串是**字符序列**，字符串的单元是**字符**，每个字符串有**编码方式**，它指定了字符串的字节和字节所代表的字符串之间对应的关系。

####ruby1.9中编码的一些新特性

1.9最重要的变化之一是支持多字节编码。

* 编码方式（对于字符串）：1.9中字符串是带有的字符序列，编码方式不兼容的字符串连接会抛出异常（可以通过Encoding.compatible?来测试是否兼容）
* 源编码（对于ruby源文件）： ruby解释器解释ruby源文件的编码，可以通过编码注释指定，一个ruby程序各个源文件可以有不同的源编码, 在ruby1.9文件开头添加 `# coding:指定编码` （编码注释）可以指定文件源编码
* 默认外部编码（对于ruby进程）： 是ruby从文件或流中读取内容采用的默认编码，对于ruby进程是全局的，通常是基于电脑的区域设置来进行设定的。默认外部编码并不改变字符串字面值的编码方式。
* 对于1.9中流：每个IO对象有2个关联编码的方式，`external_encoding(外部编码)`和 `internal_encoding(内部编码)`<br/>
  外部编码是指文件中文本的编码方式<br/>
  内部编码是指ruby表示文本的编码方式<br/>
  读入流的时候，ruby将从外部编码转换为内部编码，输出流的时候，则从内部编码转换为外部编码<br/>
  可以用set_encoding设定流对象的这2个编码，如`f.set_encoding("iso-8859-1", "utf-8")`<br/>
  或者在打开文件的时候指定, 如`File.open("data.txt", "r:utf-8")` `File.open("data.txt", "a:utf-8")` `File.open("data.txt", "r:iso-8859-1:utf-8")`


ruby1.9中String相关的函数：

    #length 或 #size 返回字符数
    #bytesize 返回字节数
    #encoding 返回字符串编码方式，通常一个字符串字面值的编码方式是基于其所在的源文件（但并不总一致）
    #force_encoding(某种编码方式) 设置字符串编码方式，该方法没有进行字符转换，字符串底层字节没有变化，只是ruby对它的解释发生了变化
    #encode(某种编码方式) 返回与调用者含义相同的字符序列，但是编码方式不同，底层字节改变

Rails 中：

    #CGI::escape(message.encode('GBK')) 把message转为GBK
  
## 参考资料
* 字节序大端小端 <http://hi.baidu.com/dpfei1603/item/6e16ffd1a6646ebd33db90e9>
* browser performance issues with charsets <http://zoompf.com/2009/12/browser-performance-issues-with-charsets>
* html中字符编码的确定算法 <http://blog.csdn.net/dlmu2001/article/details/6005040>
* URL汉字编码问题 <http://leowzy.iteye.com/blog/794464>
* js 中 escape, encodeURI, encodeURIComponent区别 <http://www.cnblogs.com/qiantuwuliang/archive/2009/07/19/1526687.html>
* VIM中的编码 <http://www.cnblogs.com/joeblackzqq/archive/2011/04/11/2012008.html>
