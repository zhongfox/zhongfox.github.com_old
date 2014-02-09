---
layout: post
categories: [blog, mysql]
tags : [mysql, schema, index]
title: Mysql 架构和索引
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

### 索引

####索引类型：

* B-Tree索引：除了Archive引擎外都支持

* Hash索引：Memory引擎， 

  可以在其它B-Tree索引上建立自己的Hash索引：增加一列被索引的列（作为Hash的key），该列允许一定得碰撞，需要一个hash函数（如CRC32）,不应该使用强加密函数（如SHA1 MD5等，碰撞低但是费空间，查找速度慢）

* R-Tree索引：MyISAM支持 #TODO

* FULLTEXT： MyISAM支持 #TODO

1. 高性能索引策略

* 隔离列：列不是表达式的一部分，也不在函数之中



### EXPLAIN

1.  id 表示执行顺序，id从大到小，id相同从上往下 

2.  select_type 查询类型

    * SIMPLE：查询中不包含子查询或者UNION

    * PRIMARY 查询中若包含任何复杂的子部分，最外层查询则被标记为PRIMARY

    * SUBQUERY 在SELECT或WHERE列表中包含了子查询，该子查询被标记为SUBQUERY

    * DEPEDENT SUBQUERY 依赖外部查询的子查询

    * DERIVD 在FROM列表中包含的子查询被标记为DERIVED（衍生）

    * UNION RESULT 从UNION表获取结果的SELECT被标记为UNION RESULT

3.  table 记录查询引用的表

4.  TYPE：访问类型，表示MySQL在表中找到所需行的方式

    从最好到最差：

    1. `NULL`：MySQL在优化过程中分解语句，执行时甚至不用访问表或索引, 比如id=-1, min(id) max(id)????#TODO

            select * from deals where id=-1;
            select max(id) from deals;

    2. `system`: 表只有一行记录（等于系统表）。这是 const表连接类型的一个特例,下例中子查询是const，主查询是system：

            select * from ( select * from deals where id=1)t;

    3. `const`: 表中最多只有一行匹配的记录，它在查询一开始的时候就会被读取出来。由于只有一行记录，在余下的优化程序里该行记录的字段值可以被当作是一个恒定值。const表查询起来非常快，因为只要读取一次！const 用于在和 primary key 或unique 索引中有固定值比较的情形

            select * from tbl_name where primary_key=1;
            select * from tbl_name where primary_key_part1=1 and primary_key_part2=2;

    4. `eq_ref`：唯一性索引扫描，对于每个索引键，表中只有一条记录与之匹配。常见于主键或唯一索引扫描。 这是最好的连接类型。它用在**索引所有部分**都用于做连接并且这个索引是一个primary key 或 unique 类型。eq_ref可以用于在进行"="做比较时检索字段。下列先对user_trades全表扫描（ALL）然后对deals唯一索引扫描eq_ref

            select * from deals, user_trades where deals.id=user_trades.deal_id;
            select * from ref_table,other_table where ref_table.key_column_part1=other_table.column and ref_table.key_column_part2=1;

    5. `ref`：非唯一性索引扫描，返回匹配某个单独值的所有行。常见于使用非唯一索引即唯一索引的非唯一前缀进行的查找

    * (唯一或非唯一)组合索引的前一部分：select * from t where unique_or_not_unique_combined_index_1 = 'abc'

    * 非唯一组合或单列索引的全部：select * from t where not_unique_combined_index_1 = 'abc' and not_unique_combined_index_2 = '123'

    * 唯一索引的前缀匹配： 

    6. `ref_or_null`: 这种连接类型类似 ref，不同的是mysql会在检索的时候额外的搜索包含null值的记录

            select * from ref_table where key_column=expr or key_column is null;

    7. `unique_subquery`: in中使用主键查询的子查询

            value in (select primary_key from single_table where some_expr)

    8. `index_subquery`: 这种连接类型类似 unique_subquery。不过它用于在子查询中没有唯一索引的情况下:

            value in (select key_column from single_table where some_expr)

    9. `range`：索引范围扫描，对索引的扫描开始于某一点，返回匹配值域的行，常见于between, <, >, in, like 等的查询

    10 `index`: Full Index Scan，index与ALL区别为index类型只遍历索引树

    11 `ALL`：Full Table Scan， MySQL将遍历全表以找到匹配的行

5. possible_keys 指出MySQL能使用哪个索引在表中找到行，查询涉及到的字段上若存在索引，则该索引将被列出，但不一定被查询使用

6. key 显示MySQL在查询中实际使用的索引，若没有使用索引，显示为NULL

7. key_len 表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度, 此值可以告诉你在联合索引中mysql会真正使用了哪些索引

    key_len显示的值为索引字段的最大可能长度，并非实际使用长度，即key_len是根据表定义计算而得，不是通过表内检索出的

    计算索引长度需要考虑的：

    * 可为空的字段需要1字节标志

    * 变长字段需要额外字节保留长度信息，如varchar需要额外的1~2字节(貌似一直是2个)

    * 同时还需要考虑表所使用的字符集，不同的字符集，gbk编码的为一个字符2个字节，utf8编码的一个字符3个字节

8. ref 显示了哪些字段或者常量被用来和 key配合从表中查询记录出来。

9. rows 表示MySQL根据表统计信息及索引选用情况，估算的找到所需的记录所需要读取的行数

10. extra 其他信息：

    * Using index 该值表示相应的select操作中使用了覆盖索引（Covering Index） 利用索引返回select列表中的字段，而不必根据索引再次读取数据文件

    * Using where

    * Using temporary 表示MySQL需要使用临时表来存储结果集，常见于排序和分组查询

    * Using filesort MySQL中无法利用索引完成的排序操作称为“文件排序”

    * Not exists 使用了早期终结

#### MySQL执行计划的局限
 
* EXPLAIN不会告诉你关于触发器、存储过程的信息或用户自定义函数对查询的影响情况

* EXPLAIN不考虑各种Cache

* EXPLAIN不能显示MySQL在执行查询时所作的优化工作

* 部分统计信息是估算的，并非精确值

* EXPALIN只能解释SELECT操作，其他操作要重写为SELECT后查看执行计划
