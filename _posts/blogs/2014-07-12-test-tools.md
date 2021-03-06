---
layout: post
categories: [blog, tool]
tags : [test, tools]
title: 常用测试和调试工具
---
{% include JB/setup %}

---

## ab

#### 安装

* ubuntu: `apt-get install apache2-utils`

#### 参数

* -n 总的请求数
* -c 次同时并发的请求数 `总的请求数(n)=次数*一次并发数(c)`
* -t 执行多少秒的测试, -n自动设置为5000, 但是测试时可能超过这个数量
* -C 添加cookie `-C "_t8s=myt8scookie;ppinf=myppinfcookie"`
* -r Don't exit on socket receive errors
* post

  需要吧-d 后面的json数据放在一个文件里，比如建立一个文件`post_data.txt`，放入：

    {"abc":"csds","appId": "sds"}

  然后用-p参数解析并发送这个json数据：`ab -n 100 -c 10 -p post_data.txt -T 'application/json' http://localhost:8083/query`

#### 输出分析

* Document Path: 文档路径
* Document Length: 单个htpp报文**正文**长度

* Concurrency Level: 并发级别, 即-c
* Time taken for tests: 测试完成总耗时
* Complete requests: 成功的请求数
* Failed requests: 失败的请求数
* Write errors: 写入过程错误数(连接断开)
* Total transferred: 总报文大小
* HTML transferred:  总报文**正文**大小
* Requests per second: 服务器每秒处理请求数量 (成功的请求总数/Time taken for tests) 通常叫做RPS 或者 QPS
* Time per request: 一组并发完成的时间(Time taken for tests / (成功的请求总数/并发数))
* Time per request: 单个请求完成的平均时间(Time taken for tests / 成功的请求总数)
* Transfer rate: 传输率, 受带宽影响(Total transferred/Time taken for tests)
* Connection Times:连接耗时情况
* Percentage of the requests served within a certain time: 请求响应分布, 是Time per request的实际分布

#### 问题：

* 非并发时，是上一个请求完了再处理下一个吗
* 请求响应分布 貌似是是组完成分布, 并发大时, 这个上升明显

---

## telnet

telnet 是基于tcp协议的一个应用层通信协议, 默认端口23, 主要用于进行远程登录，也给黑客们提供了又一种入侵手段和后门

另外一个用途是测试指定ip端口是否开启`telnet 127.0.0.1 22`

telnet server 配置 TODO

#### telnet 和memcache交互

* `telnet 127.0.0.1 11211`
* telnet请求命令格式 `<command name> <key> <flags> <exptime> <bytes>\r\n <data block>\r\n`
* set 表示按照相应的<key>存储该数据，没有的时候增加，有的覆盖。
  
  set `set abc 5 0 3回车123` abc为key, flag为5, 0代表不过期, 3字节, 换行后输入数据需要是3字节

* add 表示按照相应的<key>添加该数据,但是如果该<key>已经存在则会操作失败。
* replace 表示按照相应的<key>替换数据,但是如果该<key>不存在则操作失败
* delete <key>
* flush_all 清空所有键值, 只是将所有的items标记为expired，因此这时memcache依旧占用所有内存
* quit 退出, 断开tcp
  * memcached 默认没有添加日志文件, 可以在启动时添加参数: ` -vv >> /tmp/memcached.log 2>&1`
  代表把-vv的输出重定向到/tmp/memcached.log 文件中
  `2>&1`的意思是把错误日志也一起写入到该文件中

---

## nc

NetCat，在网络工具中有“瑞士军刀”美誉

#### 参数


* -l 监听将要到来的连接, 而不是已经建立好的连接
* -p source_port 监听端口
* -w Connections which cannot be established or are idle timeout after timeout seconds

  也就是对于已经连接号的tcp, 超过设定的秒数没有新的内容传输, 连接自动断掉

  -w 对 -l无效, 应该是服务器端要一直连接的意思

* -v verbose 输出

* -z 只扫描端口, 不发送数据, 不可和-l使用

#### 示例

* 传输文件:

  * 服务器开启tcp等待请求到来, 并重定向请求内容: `nc -lp 9999 > test.js`
  * 客户端连接请求,并用文件作为输入 `nc -w 1 127.0.0.1 9999 < test.js`

* 端口扫描 `nc -v -w 1 192.168.228.222 -z 1-1000`

* 聊天：服务端 `nc -lp 1234`, 客户端` nc 192.168.100.123 1234`

* 模拟HTTP Headers

      $nc www.linuxfly.org 80
      GET / HTTP/1.1
      Host: ispconfig.org
      Referrer: mypage.com
      User-Agent: my-browser

  最后有空行(http报文格式)

---

## netstat

* Active Internet connections(有源TCP连接)

  * Proto 协议
  * Recv-Q 接收队列
  * Send-Q 发送队列
  * Local Address 本地地址
  * Foreign Address 远端地址
  * (state) 状态(TODO)

* Active UNIX domain sockets(有源Unix域套接口, 只能用于本机通信)

### 参数

* -a (all) 显示所有状态，包括LISTEN(默认不显示LISTEN)
* -t (tcp)仅显示tcp相关选项
* -u (udp)仅显示udp相关选项
* -x socket
* -n 拒绝显示别名，能显示数字的全部转化成数字 (加上会快很多)

### 实例

* 查看端口tcp连接:

  `netstat -nat | grep 9530`

  `netstat -nat | grep 9530 |  wc -l`

---

## lsof（list open files)

### 输出

* COMMAND 进程的名称
* PID
* USER
* FD 文件描述符
  * cwd: 程序的当前工作目录, 应用程序启动的目录
  * txt: 类型的文件是程序代码，如应用程序二进制文件本身或共享库
  * 数字+标识: 如`10u` R 只读, w 只写, u 读写
* TYPE
  * REG: 普通文件 
  * DIR: 目录
  * CHR: 字符设备
  * BLK: 块设备
  * UNIX:
  * FIFO:
  * IPv4:
* DEVICE: 指定磁盘的名称
* SIZE: 文件的大小
* NODE: 索引节点
* NAME: 打开文件的确切名称

### 使用实例

* lsof -i 用以显示符合条件的进程情况

  -i[46] [protocol][@hostname|hostaddr][:service|port]

---

## 其他

* wget

* [curl](/blog/linux/2013/07/05/curl-note/)
