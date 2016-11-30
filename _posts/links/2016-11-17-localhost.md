---
layout: link
category : link
link: http://mp.weixin.qq.com/s?__biz=MzAxOTc0NzExNg==&mid=2665513390&idx=1&sn=bf0715c8693f14cfbf5fd09737fa4845&chksm=80d679edb7a1f0fb30630fa9816cc307445d87827367f1a7ac0271a28e0279171bce9e558d82#rd
title: loopback

---

* 网络协议栈软件会实现一个虚拟的网络接口（可以简单的理解为虚拟的网卡），专门用于loopback 

  * IPv4: 127.0.0.1 到 127.255.255.254 (mac 上貌似只有127.0.0.1 TODO)
  * IPv6: ::1

* loopback 机制:

  操作系统内的网络协不会把loopback的数据包发送给物理的网卡, 而会发送给虚拟的网络接口, looped back到本机IP层的输入队列中, 本机IP层再向上交付

* localhost 是本机主机名
  
  ```
  127.0.0.1 localhost 
  ::1 localhost
  ```

  貌似是系统默认, host文件中可以覆盖

* 在Unix 和 Linux系统中， 通过把loopback 接口命名为 lo 或者 lo0

  centos上:

  ```shell
  % ifconfig
    lo        Link encap:Local Loopback
              inet addr:127.0.0.1  Mask:255.0.0.0
              inet6 addr: ::1/128 Scope:Host
  ```

  macos上:

  ```sh
  % ifconfig
  lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
    options=3<RXCSUM,TXCSUM>
    inet6 ::1 prefixlen 128
    inet 127.0.0.1 netmask 0xff000000   但是为什么127.255.255.254不能ping呢???
    inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
  ```


* 127.255.255.255这是一个广播地址
