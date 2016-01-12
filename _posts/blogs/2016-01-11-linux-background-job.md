---
layout: post
categories: [blog, linux]
tags : [linux]
title: Linux 后台任务总结
---
{% include JB/setup %}

## 基础概念

* 进程组（process group）

  一个或多个进程的集合，每一个进程组有唯一一个进程组ID，即组长进程的ID

  进程组生存期: 进程组创建到最后一个进程离开(终止或转移到另一个进程组)

* 组长进程

  其进程组ID==其进程ID

  组长进程可以创建一个进程组，创建该进程组中的进程，然后终止

  只要进程组中有一个进程存在，进程组就存在，与组长进程是否终止无关

* 会话期（session）

  一个或多个进程组的集合

  有唯一一个会话期**首进程（session leader）**。会话期ID为首进程的ID

　开始于用户登录, 终止与用户退出. 此期间所有进程都属于这个会话期

  会话期可以有一个单独的控制终端（controlling terminal, 控制终端通常是创建进程的登录终端

  与控制终端连接的会话期首进程叫做**控制进程（controlling process）**

  会话可以包含多个进程组。这些进程组共享一个控制终端

* 前台进程/后台进程

  当前与终端交互的进程称为前台进程组, 其余进程组称为后台进程组

* 终端关闭导致进程退出过程

  不论前后台任务, 都和终端绑定, 终端退出, 终端将向关联的前后台进程发送SIGHUP信号

---

## 后台执行模式

### 守护进程

* 独立的进程组, 不受终端影响
* 屏蔽终端信号

### 后台执行 &

* 终端关闭, 后台进程会被SIGHUP终止
* 可以在当前终端中使用jobs查看, 并被fg转换为前台任务

### nohub

* 不受终端关闭影响, 忽略所有SIGHUP信号
* 默认地程序运行的输出信息放到当前文件夹的 nohup.out 文件中去
* 加不加&并不会影响这个命令, 只是让程序 前台或者后台运行而已
* 加上& 可以在当前终端中使用jobs查看, 并被fg转换为前台任务
* nohup启动的程序在进程执行完毕就退出

### screen

#### screen会话

screen会话状态:

* Attached: 终端相连, 用户可见
* Detached: 任务在后台执行

一个会话里可以有多个窗口

命令:

* 创建一个会话: `screen`
* 创建一个命名会话: `screen -S screen_name`
* 创建时启动任务: `screen vi david.txt`
* 查看本机的screen: `screen -ls`: `screen_id.screen_name (Attached/Detached)`
* 分离会话: `screen -d screen_name/screen_id`, 但会话中的任务会继续执行
* 恢复会话: `screen -r screen_name/screen_id` 不能重复恢复
* exit: screen会话会退出消失

#### screen窗口

* exit: 关闭当前窗口, 返回上一个窗口, 如果没有其他窗口, screen会话会退出消失
* Ctrl+a A ：重命名当前窗口
* Ctrl+a c ：在当前screen会话中创建窗口
* Ctrl+a d  : 效果与screen -d相同，分离当前会话
* Ctrl+a w ：显示当前会话中的窗口列表，显示在标题栏中
* Ctrl+a n ：切换到下一个窗口
* Ctrl+a p ：切换到上一个窗口
* Ctrl+a 0-9 ：在第0个窗口和第9个窗口之间切换

#### 会话共享
TODO

#### 分屏
TODO

---

## 关于ps的一些笔记

* ps + grep 希望保留首行:

  * `ps -ef | { head -1; grep top; }` 适用`-ef` (为什么aux不行呢)
  * `ps aux  | grep -E "PID|top"` 适用 `-ef` 和 `aux`

* `-ef` `aux` `-xj` 首行区别

  * `aux`: `USER  PID  %CPU %MEM      VSZ    RSS   TT  STAT STARTED      TIME COMMAND`
  * `-ef`: 可以看到父ID `UID   PID  PPID   C STIME   TTY TIME CMD`
  * `-xj`: 可以看到进程组id `USER       PID  PPID  PGID   SESS JOBC STAT   TT       TIME COMMAND`

---

## 参考资料

* <http://www.aichengxu.com/view/12417>
* <http://www.cnblogs.com/kapok/archive/2005/11/23/283108.html>
* <http://www.osetc.com/archives/466.html>
