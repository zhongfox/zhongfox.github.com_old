---
layout: post
category : mysql
title: Mysql 架构和索引
tags : [mysql schema index]
---
{% include JB/setup %}

###字段类型选择

   慷慨是不明智的

   在相关的表中使用相同的数据类型，因为可能进行join

   选择标示符：整数通常是最佳选择，尽量避免使用字符串

1. 大致决定数据类型（数字，字符串，时间等）

   * 选择存储更小的类型，选择更简单的类型（如整数优于字符串），选择mysql内建时间类型而不是字符串，选择整数而不是字符串来保存IP

   * **尽量避免使用NULL**：任何包含null值的列都将不会被包含在索引中。即使索引有多列这样之情况下，只要这些列中有一列含有null，该列就会从索引中排除。也就是说如果某列存在空值，即使对该列建索引也不会提高性能。

2. 确定特定类型

   * 数字

     * 整数 tinyint (8bit) smallint (16bit) mediumint (24bit) int (32bit) bigint (24bit)

       **signed** 和 **unsigned** 占用空间一致， 后者把最大值大概扩大了一倍

       整数类型定义宽度( 如 int(10) unsigned )对存储没有影响，只是影响某些交互工具展示

     * 实数 TODO

   * 字符串

     * varchar(字节数) 变长字符串
       
       varchar内容开头用1到2个字节表示实际长度（长度超过255时需要2个字节），因此最大长度不能超过65535

       5.0之后的mysql对其读写都会保留末尾空格

       插入过量会被截断但是不报错

     * char 定长字符串

       对其写，会去掉末尾空格

     * 比较

       * varchar容易产生碎片，char不会

       * 最大长度远大于平均长度的，适用varchar

       * 固定长度，或者最大长度很短的，适用于char

    * binary 和 varbinary：保存二进制字符串，他们保存的是字节而不是字符，填充是\0而不是空格

    * blob 和 text： 不能索引这些类型的完整长度，也不能为排序使用索引

      排序时只按照max_sort_length规定的若干字节排序，或者可以自己指定 order by substring(column, length)

    * enum

      建表时指定该类型： create table table_name (column_name enum('a', 'b', 'c') not null);

      该字段将是1到2个字节（所有最多的枚举数是65535），存储的书数字

      select 出来的字段值将是字符串

      可以将其转为数字： select column_name + 0 ...

      内部排序是按照数字（所以定义的时候应该注意顺序），或者显式指定：order by field(column_name, ('b', 'a', 'c'))

      在建表后需要新增枚举种类只能alter table，所有不适合种类不确定的类型

      优势：节约空间 劣势：join字符串时会较慢（存在转换）

  * 日期和时间

    * year

    * date

    * datetime 8字节存储，和时区无关，1001年到9999年，精度为秒

    * timestamp 4字节，和时区相关，表示从1970年1月1日以来的秒数

    * 通常应该用timestamp，更节约空间

  * BIT TODO

  * SET TODO


