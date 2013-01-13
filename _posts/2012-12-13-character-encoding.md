---
layout: post
category : sundry
title: 编码学习分享
tags : [encoding, share]
---
{% include JB/setup %}

## 名词解释

**字符集(Character set)** 是多个文字/字符的集合, 比如ASCII字符集，Unicode字符集

**字符编码(Character encoding)** 字符集中，每个字符都分配一个编码，称为字符编码， 例如“汉”字的Unicode编码是6C49

**文字编码方式(Character encoding Scheme)** 规定如何传输、保存字符编码, 例如都是用Unicode字符集的UTF-8、UTF-16、UTF-32, “汉”字的在UTF-8中使用3个连续的字节E6 B1 89来表示，但是在UTF-16（Big-Endian）中刚好是2字节6C 49
