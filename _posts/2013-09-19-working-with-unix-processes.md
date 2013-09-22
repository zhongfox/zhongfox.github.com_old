---
layout: post
category : linux
tags : [linux process]
title: 《Working with Unix Processes》读书笔记
---
{% include JB/setup %}

1. **引言**

2. **基础知识**

   系统调用

   Unix 系统内核位于计算机硬件之上，它是与硬件交互的中介。 文件系统进行读/写、在网络上发送数据、分配内存， 以及通过扬声器播放音频。

   程序不可以直接访问内核，程序通过**系统调用**和硬件交互

3. **进程皆有标识**

   ruby 获取pid `Process.pid` 全局常量`$$` 对应系统调用`getpid`

4. **进程皆有父**

   ruby 获得ppid `Process.ppid` 系统调用 `getppid`

5. **进程皆有文件描述符**

   每个进程都有独立的**文件描述符表** 每个表项是由**文件描述符**来索引，执行**文件表**

   **文件表**是打开的文件集合，所有进程共享，表项：(描述符)引用计数，描述符各自文件位置，以及指向v-node指针

   关键思想是：打开的文件是共享的，描述符是不共享的(fork的时候会被复制)，它只存在于其所属的进程之中。当进程结束后会被关闭。每个描述符都有自己的文件位置

   * 在Ruby中，IO类描述了打开的资源。任意一个IO对象都有一个相关联的文件描述符编号。可以使用IO#fileno进行访

   * 标准输入（STDIN）、标准输出（STDOUT）和标准错误（STDERR）的描述符固定是0,1,2，进程总是分配最小的可用描述符

   * Ruby 的IO 类中的不少方法都对应着同名的系统调用。其中包括open(2)、close(2)、read(2)、write(2)、pipe(2)、fsync(2)和stat(2)。

6. **进程皆有资源限制**

   * ruby 中`Process.getrlimit(:NOFILE)` 返回 [软限制(soft limit)，硬限制(hard limit)]

   * 超出软限制会抛出异常，软限制可以修改`Process.setrlimit`，硬限制需要root权限修改

   * 系统调用getrlimit(2)及setrlimit(2)

7. **进程皆有环境**

   所有进程都从其父进程处继承环境变量。环境变量对于特定进程而言是全局性的。

   * 通过bash设置环境变量 `MESSAGE='wing it'ruby -e "puts ENV['MESSAGE']"`

     `RAILS_ENV=production rails server`

   * ruby中通过类hash`ENV` 来设置和读取环境变量

8. **进程皆有参数**

   ruby中使用`ARGV`这个数组来保存命令行参数，支持读写

        # 获取-c 选项的值
        ARGV.include?('-c') && ARGV[ARGV.index('-c') + 1]

9. **进程皆有名**

   ruby中使用全局变量`$PROGRAM_NAME`或者`$0`存储进程名，可读写

   进程之间的通信方式(PIC)：

   1. 基于文件（需要文件系统或者网络）：普通文件，套接字，管道等

   2. 基于进程本身（不需要文件系统和网络）：退出码和进程名称(与命令行中查看你的程序的用户进行通信)

   3. 信号（对于管理脱离终端进程的一种方式）

10. **进程皆有退出码**

    退出码通常用来表明不同的错误，它们其实是一种通信途径.

    按惯例，退出码为0 的进程被认为是顺利结束；其他的退出码则表明出现了错误，不同的退出码代表不同的错误。

    ruby中退出进程:

    * `Kernel#exit(code=1)` 默认返回退出码0

    * `at_exit { puts 'Last!' }`  exit前的回调

    * `Kernel#exit!(code=1)` 默认退出码1，不执行`at_exit`

    * `Kernel#abort(message)` 退出码是1，会将message输出到STDERR，会执行at_exit

    * `raise` 抛出异常，如果没有程序对其处理，以退出码1终止，会执行at_exit

11. **进程皆可衍生**

    * fork衍生的子进程，继承(复制或者copy-no-write)父进程内存中的所有内容(环境变量，文件描述符表, 变量等等)

    * fork执行一次，返回2次，父进程中返回子进程的pid，子进程中返回nil

    * ruby 中对fork传递block，该block只面向子进程

12. **孤儿进程**

    父进程终止了的子进程叫做孤儿进程, 孤儿进程的ppid始终是1（init）

    守护进程是有意为之的孤儿进程

13. **友好的进程**

    Unix系统采用写时复制（copy-on-write，CoW）的方法来克服这个问题。

    顾名思义，CoW 将实际的内存复制操作推迟到了真正需要写入的时候。


14. **进程可待**

    即发即弃（fire and forget）是指fork子进程后，父进程没有wait

    * ruby `Process.wait` 会一直阻塞，直到任意一个子进程退出，返回该子进程的pid, 可以传递pid指定等待该子进程

    * `Process.wait2` 返回的[pid, status],q其中 status 是Process::Status的实例,`status.exitstatus`获得子进程退出码，可用于进程通信

    * `Process.waitpid(pid)` 等待指定pid子进程，传递-1表示任意子进程

    * `Process.waitpid2` 和以上类似

    内核会将已退出的子进程的状态信息加入队列。因此，即便父进程处理每个退出子进程的速度缓慢，当它准备妥当的时候，也总能获取到每个子进程的退出信息。

    如果不存在子进程，wait系列会抛出异常(Errno::ECHILD)。所以最好记录一下到底创建了多少个子进程，以免出现这种异常

    对应系统调用`waitpid`

15. **僵尸进程**

    内核会一直保留已退出的子进程的状态信息,子进程状态结束后信息一直未能被读取，那么它就是一个僵尸进程

    * `Process.detach(pid)` 父进程生成新线程(可否理解成使父进程的主线程异步)等待该pid子进程结束，没有对应系统调用，是用wait实现的

16. **进程皆可获得信号**

    * Unix信号是一种异步的软件形式异常

    * 信号来自何方？信号由内核发送，信号是由一个进程发送到另一个进程，只不过是借用内核作为中介

    * ruby发送信号`kill(signal, pid, ...) → fixnum` pid为零的话代表当前进程

    * `trap( signal ) {| | block } → obj` ruby中注册信号处理程序

      忽略信号：`trap(:INT, "IGNORE")`

      信号处理程序对当前进程是全局性的，trap 返回该信号之前的自定义处理程序(trap returns the previous handler for the given signal) 以下方法用于调用之前的处理程序：

            trap(:INT) { puts 'This is the first signal handler' }
            old_handler = trap(:INT) {
              old_handler.call
                puts 'This is the second handler'
                exit
            }
            sleep # 以便于有时间发送信号

      这种方法不能保留系统的默认行为，不过可以保留其他Ruby代码所定义的处理程序

    * 信号投递是不可靠的，同一类型的信号，在同一时刻只能有一个待处理信号，此时该类型的其他信号会被简单丢弃

      因此，在父进程中用trap处理信号，最好用循环去wait该类型的其他信号，并做好计数

            ......
            trap(:CHLD) do
              # 由于Process.wait 将它获得的数据都加入了队列，因此可以在此进行查询
              #因为我们知道其中一个子进程已经退出了。
              # 我们需要执行一个非阻塞的Process.wait 以确保统计每一个结束的子进程。
              begin
                while pid = Process.wait(-1, Process::WNOHANG)
                  puts pid
                  dead_processes += 1
                  # 一旦所有的子进程统计完毕就退出。
                  exit if dead_processes == child_processes
                end
              rescue Errno::ECHILD
              end
            end
            ......

    * 进程可以在任何时候接收到信号(for 循环甚至sleep), 它可以从一个信号处理程序转到另一个信号处理程序中。它总会执行完所有被调用的信号处理程序中的代码。

    * 对应系统调用：Proesss.kill->kill(2)，Kernel#trap -> sigaction(2) 和 signal(7)

17. **进程皆可互通**

    1. 管道是一个单向**数据流**

       IO.pipe 返回一个包含两个元素的数组，这两个元素皆为IO 对象 `reader, writer = IO.pipe`

       reader 只能读取，writer 只能写入

       Ruby神奇的IO 类是File、TCPSocket、UDPSocket 等的超类 所有这些资源都有一个通用的接口

       `#write` 对IO对象writer.close 将会写入一个EOF

       `#read`将一直阻塞，直到遇到EOF

       `#gets` 读取由行终止符（newline）分隔的String

    2. 套接字对提供的是双向通信。父套接字可以读写子套接字，反之亦然

       套接字使用**消息**(特定协议的分隔符)通信

    系统调用：Ruby 的IO.pipe 对应于pipe(2)，Socket.pair 对应于socketpair(2)。Socket.recv 对应于recv(2)，Socket.send 对应于send(2)

18. **守护进程**

    孤儿进程，后台运行的进程，不受终端用户控制

    * 首个进程`init` pid 1， ppid 0

    * 进程组：每一个进程都属于某个组，每一个组都有唯一的整数id。

      进程组是一个相关进程的集合，通常是父进程与其子进程。

      但是你也可以按照需要将进程分组，只要使用`Process.setpgrp(new_group_id)`来设置进程的组id 即可

      获取进程组id `Process.getpgrp`

      终端接收信号，会将其转发给前台进程组中的所有进程

    * 会话组: 会话组是进程组的集合,如`git log | grep shipped | less`

      终端又用一种特殊的方法来处理会话组：发送给会话组长的信号被转发到该会话中的所有进程组内，然后再被转发到这些进程组中的所有
      进程。

    * 创建守护进程

            def daemonize_app
              if RUBY_VERSION < "1.9"
                exit if fork                     #孤儿进程，主进程退出导致终端返回给用户
                                                 #但是终端和子进程还是有关联（子进程仍然拥有从父进程中继承而来的组id 和会话id）
                Process.setsid                   #设置该孤儿为进程组组长，会话组组长，脱离终端
                exit if fork                     #新衍生出的进程不再是进程组的组长，也不是会话领导,完全脱离终端
                Dir.chdir "/"
                STDIN.reopen "/dev/null"
                STDOUT.reopen "/dev/null", "a"
                STDERR.reopen "/dev/null", "a"
              else
                Process.daemon
              end
            end

    * 某个已经是进程组组长的进程中调用 `Process.setsid`(返回新的会话组id)，则会失败，它只能从子进程中调用

19. **生成终端进程**

    * `exec` 让你将当前进程转变成另外一个进程, 有去无回

      不会关闭任何打开的文件描述符（默认情况下）或是进行内存清理

      我推测父子关系，进程组，会话组关系不会变？？

    * `Kernel#system` 使用fork+exec， 返回值true表示终端命令的退出码是0，否则返回false

    * `Kernel#反引号和%x[]` 返回值是由终端程序的STDOUT 汇集而成的一个字符串。

    * `Process.spawn` 是非阻塞的, 并可以传递环境变量

    * `IO.popen` fork+exec, 然后对新进程使用管道，使之和主进程通信

    * `Open3` 允许同时访问一个生成进程的STDIN、STDOUT 和STDERR

    * 以上的fork+exec都需要1）复制父进程在内存中所有内容2）获得了父进程已打开的所有文件描述符的副本

      第三方gem `posix-spawn`进行了优化,只进行第二步，因此更快

    * 系统调用：Ruby 的Kernel#system 对应于system(3)，Kernel#exec 对应于execve(2)，IO.popen 对应于popen(3)，posix-spawn 使用posix_spawn(2)。

