---
layout: post
category : ruby
tags : [linux, tcp, ruby, sockets]
title: 《Working with TCP Sockets》读书笔记
---
{% include JB/setup %}

### 前言

Berkeley套接字API是一种编程API，运作在实际的协议实现之上。它关注的是连接两个端点（endpoint）共享数据，而非处理分组和序列号。

---

### 第1章 建立套接字

* ruby 中使用socket需要`require 'socket'` 其中包括了各种用于TCP套接字、UDP套接字的类，以及必要的基本类型

* 创建socket

        socket = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM)

        socket = Socket.new(:INET6, :STREAM) #借助ruby语法糖

  `Socket::AF_INET` 表示ipv4

  `Socket::SOCK_STREAM` `:STREAM`表示tcp数据流, `Socket::SOCK_DGRAM` UDP数据流报

  `:INET6` 表示ipv6


* 一个socket的ip和port组合必须唯一，同一个port可以有不同ip的socket同时侦听，甚至是一个IPV4, 一个IPV6

---

### 第2章 建立连接

* 创建的socket的角色将是以下2者之一，如果要成功连接，二者缺一不可

  * 发起者（initiator）
  * 侦听者（listener）

---

### 第3章 服务器生命周期

* 服务器socket用于侦听，其生命周期：

  1. 创建
  2. 绑定
  3. 侦听
  4. 接受
  5. 关闭

* 绑定：

  1. 首先用c结构体创建侦听地址: `addr = Socket.pack_sockaddr_in(4481, '0.0.0.0')`

  2. 执行绑定 `socket.bind(addr)`

  **服务器端口使用：**

  1. 不要使用0~1024 之间的端口，这是熟知端口

  2. 不要使用49 000~65 535 之间的端口，这是临时端口

  3. 1025~48 999之间端口的使用是一视同仁的

  **ip使用：**

  * 127.0.0.1 是环回地址，0.0.0.0 是本机所有地址

* 侦听

  `socket.listen(max_pending_count)` 实现侦听,参数是字能够容纳的待处理（pending）的最大连接数

  待处理的连接列表被称作**侦听队列**

  如果侦听队列已满，那么客户端(???为什么是客户端)将会产生Errno::ECONNREFUSED

  `Socket::SOMAXCONN` 可以获知当前所允许的最大的侦听队列长度

  可以使用`server.listen(Socket::SOMAXCONN)`将侦听队列长度设置为允许的最大值


* 接受

  `server.accept` 以阻塞的方式接受连接请求，返回一个数组[connection, Addrinfo]

  connection表示已建立的连接，其实是Socket的实例，这表明每个连接都由一个全新的Socket对象描述，这样服务器套接字就可以保持不变，不停地接受新的连接。

  第二个元素Addrinfo是一个Ruby类，描述了一台主机及其端口号，这里表示客户端的地址

  **连接地址**

  `connection.local_address`  获得连接的本地地址, Addrinfo的实例

  `connection.remote_address` 获得连接的客户端地址, Addrinfo的实例

  accept循环：

        loop do
          connection, _ = server.accept
          # 处理连接。
          connection.close
        end

* 关闭连接

  `connection.close`

  Socket是双向通信，可以只关闭其中一个通道

  关闭写：`connection.close_write`, 会发送一个EOF到套接字的另一端

  关闭读：`connection.close_read`,

  **close 和 close_write/read 区别**

  **连接副本** 可以使用Socket#dup创建文件描述符的副本。这实际上是在操作系统层面上利用dup(2)复制了底层的文件描述符,或者Process.fork的新进程也会出现文件描述符的副本

  close_write和close_read方法在底层都利用了shutdown(2)。同close(2)明显不同的是：即便是存在着连接的副本，shutdown(2)也可以完全关闭该连接的某一部分。

  close不会关闭连接副本

  shutdown只是关闭了通信，Socket的资源并没有回收，所以每个Socket还必须close以结束生命周期

* ruby包装器

        require 'socket'
        server = TCPServer.new(4481)

  以上代码实现了创建，绑定和侦听三个步骤，server是TCPServer的实例，但是接口和Socket基本一致

  明显的不同是 只返回连接，而不返回remote_address

  Ruby默认将侦听队列长度设置为5, 如果需要更长的侦听队列，可以调用TCPServer#listen

        #返回2个server，一个ipv4，一个ipv6
        servers = Socket.tcp_server_sockets(4481)

  连接处理

        require 'socket'
        #创建侦听套接字。
        server = TCPServer.new(4481)
        # 进入无限循环接受并处理连接。
        Socket.accept_loop(server) do |connection|
          # 处理连接。
          connection.close
        end

  连接仍徐结束时手动关闭

  可以向它传递多个侦听套接字, 如 `Socket.accept_loop(servers)`

  Socket.tcp_server_sockets和Socket.accept_loop的合体：

        Socket.tcp_server_loop(4481) do |connection|
          # 处理连接。
          connection.close
        end

---

### 第4章 客户端生命周期

* 客户端是请求的发起者，其生命周期包括：

  1. 创建（和服务器创建一致）
  2. 绑定（客户端如果不bind，将使用临时端口，建议是不显式绑定）
  3. 连接
  4. 关闭

* 连接

        remote_addr = Socket.pack_sockaddr_in(80, 'google.com')
        socket.connect(remote_addr)

  连接超时会抛出异常`Errno::ETIMEDOUT`，超时原因可能是connect一个不存在在端点，或者该server还没有开始accept

* ruby包装

        socket = TCPSocket.new('google.com', 80)

        #等价于
        client = Socket.tcp('google.com', 80)

        #附加连接处理
        Socket.tcp('google.com', 80) do |connection|
          connection.write"GET / HTTP/1.1\r\n"
          connection.close
        end

---

### 第5章 交换数据

TCP/IP数据被编码为分组，分组是有边界的

同时TCP具有**流**的性质，流没有边界的概念，客户端分批发送，服务器也是将其作为一份数据接收。并且次序会有保证

---

### 第6章 套接字读操作

* `connection.read` 简单读取，以EOF标志流结束

        Socket.tcp_server_loop(4481) do |connection|
          # 从连接中读取数据最简单的方法。
          puts connection.read
          # 完成读取之后关闭连接。让客户端知道不用再等待数据返回。
          connection.close
        end


  以下方式的客户端发送数据，tail将不会停止发送数据(不发送EOF)因此管道一直是打开的

  `tail -f /var/log/system.log | nc localhost 4481`

* 设置读取长度 `connection.read(读取长度)`

  凑齐读取长度，或者遇到EOF，read返回

  不足长度且没遇到EOF，仍然不会返回

        Socket.tcp_server_loop(4481) do |connection|
          while data = connection.read(1024) do
            puts data
          end
          connection.close
        end

* 解决read阻塞：

  1. 客户端发送完数据后发送EOF 事件：`connection.close`

  2. 部分读取

     readpartial 并不会阻塞， 而是立刻返回可用的数据。调用readpartial时，你必须传递一个整数作为参数，来指定最大的长度,只要有数据，readpartial就会将其返回，即便是小于最大长度。

     当接收到EOF时，read仅仅是返回，而readpartial则会产生一个EOFError异常

          Socket.tcp_server_loop(4481) do |connection|
            begin
              # 每次读取1024或更少。
              while data = connection.readpartial(1024) do
                puts data
              end
            rescue EOFError
            end
            connection.close
          end

* `read(max_count)` 和 `readpartial(max_count)`的区别

  read 阻塞，只在数据达到max_count或者读到EOF才返回

  readpartial只**在没有任何数据时会阻塞**，当有数据时不阻塞，有数据就返回，一次最多max_count,遇到EOF抛出异常

---

### 第7章 套接字写操作

`connection.write('Welcome!')`

---

### 第8章 缓 冲

**写缓冲**

* 应用程序和实际网络硬件之间有一个写缓冲层

  `write` 返回成功只是说明数据交给了缓冲层，缓冲层可能立即发送，也可能出于性能考虑，进行合并发送

  TCP套接字默认将sync设置为true。这就跳过了Ruby的内部缓冲 否则就又要多出一个缓冲层了

* 该写入多少数据?

  通常情况下，获得最佳性能的方法是一口气写入所有的数据，让内核决定如何对数据进行结合

**读缓冲**

* 每次`read` ruby程序接受的数据量可能大于指定的长度，以备下次read使用

* 该读取多少数据

  如果设置较大，内核需要分配较大内存，造成资源浪费

  如果设置较小，需要读取多次，增加系统调用次数，增大开销

  ruby的各种web server都是用16KB的读取长度

---

### 第9章 第一个客户端/服务器

---

### 第10章 套接字选项

套接字选项是一种配置特定系统下套接字行为的低层手法

因为涉及低层设置，所以Ruby并没有为这方面的系统调用提供便捷的包装器

* 获得一个socket的类型

  1. **SO_TYPE** 区别tcp还是udp

          socket = TCPSocket.new('google.com', 80)
          # 获得一个描述套接字类型的Socket::Option实例。
          opt = socket.getsockopt(Socket::SOL_SOCKET, Socket::SO_TYPE) #返回Socket::Option实例
          # opt = socket.getsockopt(:SOCKET, :TYPE) 使用ruby符号
          # 将描述该选项的整数值同存储在Socket::SOCK_STREAM中的整数值进行比较。
          opt.int == Socket::SOCK_STREAM #=> true
          opt.int == Socket::SOCK_DGRAM #=> false


  2. **SO_REUSE_ADDR**

     TIME_WAIT状态: write后，缓冲区里的数据还未发送完，内核会保持连接以发送数据，此时即处于该状态

     如果关闭一个尚有数据未处理的服务器并立刻将同一个地址绑定到另一个套接字上（ 比如重启服务器）， 则会引发一个Errno::EADDRINUSE

     设置SO_REUSE_ADDR可以绕过这个问题，使你可以绑定到一个处于TIME_WAIT状态的套接字所使用的地址上

          server = TCPServer.new('localhost', 4481)
          server.setsockopt(:SOCKET, :REUSEADDR, true)
          server.getsockopt(:SOCKET, :REUSEADDR) #=> true

     TCPServer.new、Socket.tcp_server_loop及其类似的方法默认都打开了此选项。

---

### 第11章 非阻塞式IO

* `read_nonblock(max_count)` 完全非阻塞读取，和readpartial唯一的不同是read_nonblock在没有数据可读时，抛出Errno::EAGAIN异常，而readpartial会阻塞

        loop do
          begin
            puts connection.read_nonblock(4096)
          rescue Errno::EAGAIN
            retry
          rescue EOFError
            break
          end
        end

  更好的方式是使用优雅的IO.select，它会引起阻塞，直到第一个参数里的Socket可读

        begin
          connection.read_nonblock(4096)
        rescue Errno::EAGAIN
          IO.select([connection])
          retry
        end

* `write_nonblock` 非阻塞式写操作

  write_nonblock的行为和系统调用write(2)一模一样。它尽可能多地写入数据并返回写入的数量。

  和Ruby的write方法不同的是，后者可能会多次调用write(2)写入所有请求的数据。(write会引发阻塞是吗？)

  系统调用write(2)会可能引发阻塞，如果底层的write(2)仍处于阻塞，那你会得到一个Errno::EAGAIN异常
  

        begin
          loop do
            bytes = client.write_nonblock(payload)
            break if bytes >= payload.size
            payload.slice!(0, bytes)
            IO.select(nil, [client])  #没写完就等待可写，然后再写
          end
        rescue Errno::EAGAIN
          IO.select(nil, [client])    #对系统write引发的异常，等待可写，然后再写
          retry
        end

* `accept_nonblock ` 非拥塞式接收

   `accept` 当侦听队列为空会阻塞，`accept_nonblock `会抛出异常Errno::EAGAIN

        loop do
          begin
            connection = server.accept_nonblock
          rescue Errno::EAGAIN
            # 执行其他重要的工作。
            retry
          end
        end

* `connect_nonblock` 非拥塞式连接

  如果connect_nonblock不能立即发起到远程主机的连接，它会在后台继续执行操作并产生Errno::EINPROGRESS

---

### 第12章 连接复用

* `IO.select(for_reading, for_writing, for_writing)`

  三个参数分别是希望从中进行读取的IO对象数组，希望进行写入的IO对象数组,在异常条件下使用的IO对象数组

  它返回一个数组的数组。IO.select返回一个包含了3个元素的嵌套数组，分别对应它的参数列表

  它会阻塞。IO.select是一个同步方法调用, 直到传入的某个IO对象状态发生变化

  IO.select还有第四个参数：一个以秒为单位的超时值。它可以避免IO.select永久地阻塞下, 如果在IO状态发生变化之前就已经超时，那么IO.select会返回nil


        connections = [<TCPSocket>, <TCPSocket>, <TCPSocket>]
          loop do
            # 查询select(2)哪一个连接可以进行读取了。
            ready = IO.select(connections)
            # 从可用连接中进行读取。
            readable_connections = ready[0]
            readable_connections.each do |conn|
              data = conn.readpartial(4096)
              process(data)
          end
        end

* IO.select监视套接字读/写之外的事件

  1. **EOF** 监视的可读Socket接收到EOD，该套接字将作为数组一部分返回，在对其进行读取时，取决于当时所使用的read(2)的版本，可能会得到一个EOFError或nil。

  2. **accept** 

  3. **connect** 

        begin
          #发起到google.com端口80的非阻塞式连接。
          socket.connect_nonblock(remote_addr)
        rescue Errno::EINPROGRESS
          IO.select(nil, [socket]) #阻塞等待连接成功，socket可写
          begin
            socket.connect_nonblock(remote_addr) #再次尝试连接
          rescue Errno::EISCONN #连接已经成功的链接，抛出异常，表明成功
            # 成功！
          rescue Errno::ECONNREFUSED
            # 被远程主机拒绝。
          end
        end

     感觉下面的端口监控代码有问题

* 高性能复用

  IO.select 监视的连接数越多，性能就越差，而且select(2)系统调用受到FD_SETSIZE的限制, 多数系统是1024

  poll(2)系统调用与select(2)略有不同，不过这点不同也仅限于表面而已
 
  。Linux的epoll(2)以及BSD的kqueue(2)系统调用比select(2)和poll(2)效果更好、功能更先进。

---

### 第13章 Nagle算法

每个Ruby Web服务器都禁用了该选项:

`server.setsockopt(Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1)`

---

### 第14章 消息划分

消息划分常见的方式：

1. 使用新行

2. 使用内容长度

   消息发送方先计算出消息的长度，使用pack将其转换成固定宽度的整数，后面跟上消息主体一并发送

---

### 第15章 超 时

* 通过IO.select 超时，可以处理读取超时，接受超时，连接超时

---

### 第16章 DNS查询

MRI的GIL，可以理解阻塞式IO，但是不能理解C语言扩展的DNS查询，所以如果DNS查询长时间阻塞，MRI就不会释放GIL

resolv解决了这个问题：

        require 'resolv' # 库
        require 'resolv-replace' # 猴子修补

---

### 第17章 SSL套接字

TODO

### 第18章 紧急数据

* TCP紧急数据，更多的时候被称作“带外数据”（out-of-band data），

  持将数据推到队列的前端，绕过其他已在传送途中的数据，以便于连接的另一端尽快接收到这些数据。

* `Socket#send(data, flag)`

  不传flag，行为和write一致，flag为`Socket::MSG_OOB`表示紧急数据

* `connection.recv` 

  服务器必须明确接受紧急数据，否则服务器不会注意到紧急数据

        Socket.tcp_server_loop(4481) do |connection|
          # 优先接收紧急数据。
          urgent_data = connection.recv(1, Socket::MSG_OOB)
          data = connection.readpartial(1024)
        end

  如果不存在未处理的紧急数据， 调用connection.recv(1, Socket::MSG_OOB)则会失败，并产生Errno::EINVAL

  TCP实现对于紧急数据仅提供了有限的支持，一次只能发送一个字节的紧急数据。如果你要发送多个字节，那么只有最后一个字节会被视为紧急数据。之前的那些数据会视为普通的TCP数据流。

* IO.select 的第三个参数就是监控带外数据的socket数组

* 对接收方可设置将带外数据放入普通数据中

  `connection.setsockopt :SOCKET, :OOBINLINE, true`

---

### 第19章 网络架构模式

---

### 第20章 串行化

ps. 今天终于把大神Jesse Storimer的三本书看完了，三本书都非常的短小精悍，举一反三。虽然有的章节的理解还是比较粗略，但是这三本书的确是帮助我对进程，线程和Socket的认识有了很大的提高。感觉非常幸运！书中的示例都是ruby写的，推荐给所有ruby程序员，但不局限于此。
