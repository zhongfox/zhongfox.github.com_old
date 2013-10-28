---
layout: post
category : mysql
tags : [mysql]
title: Mysql 点滴
---
{% include JB/setup %}


###参数

* 参数格式：

  * -h 主机名 or --host 主机名 | 可以有空格 | 默认值 localhost

  * -u 用户名 or --user 用户名 | 可以有空格 | 默认值 当前login用户

  * -p 密码 or --password 密码 | 不可以有空格 | 默认值 无

* `mysql [-h主机名] -u用户名 -p密码` 如果密码省略，将会提示输入，三个输入前都可以有空格, 主机名默认是localhost

* mysql 在输入库名表名和字段名时会响应tab键自动补全，这会让启动相对较慢，在启动时加上参数-A（--skip-auto-rehash）禁用此特性

* 在shell执行单条mysql语句 `可成功连接的mysql 库名 -e "select count(*) from deals;"`

* 执行单条mysql语句不显示heading `可成功连接的mysql 库名 --skip-column-names -e "select count(*) from deals;"`   改参数可以换成-ss，改参数必须在-e前面

* 快捷键（mysql 和 bash 通用）： `^a` 光标到最前面 `^e` 光标到最后面  `^d` 删除光标处字符 `^u` 删除从光标位置到开始位置所有字符

* `\G` 每个字段横向排列  `\g` 查询语句终结符等同于分号 `\c`  取消查询

----

###变量

* 5.0 之后用户变量不区分大小写

* `select @var = some from ...` 如果返回的是多行值，@var只会记住最后一个值，如果返回任何行，赋值不会发生，@var会保持原值。

* `set @var := 常量` 赋常量需要用set， :=可以直接用=, set还可以接select：`set @var = select some from ...`

* 在select中修改并返回变量，类似一个循环（可以想象成select的每行是顺序执行）`set @n:=0;select @n:=@n+1 as rownum from deals limit 10;`


* `GRANT ALL ON 库名.* TO '用户名'@'localhost' [IDENTIFIED BY '密码']` 新建用户名，或者对已有用户给予指定的库权限

  关于GRANT更多信息参考 [Grant命令](http://www.cnblogs.com/hcbin/archive/2010/04/23/1718379.html)


----

###函数

* 保存`AUTO_INCREMENT`的值： `select @last_id := LAST_INSERT_ID()`

* `IF(条件， true的话，false的话)` 比如： `select IF(id is null, 'Unknown', id) ....`

* `IFNULL(被检查的值， 如果前值是NULL的话...)` 如果被检查的值不是NULL则直接返回，这可用于避免某值显示为null

* `RAND()` 返回在范围0到1.0内的随机浮点值

* 在第一条sql中保留where查出的总条数（忽略limit）存于`SQL_CALC_FOUND_ROWS`, 然后在之后可以用函数`FOUND_ROWS`获取：

        select SQL_CALC_FOUND_ROWS  id, user_name from orders limit 10;
        select FOUND_ROWS();

* `DATABASE()` 返回当前连接数据库名，如果未连接任何数据库，返回NULL

* `INET_ATON(字符串)`  转为IP数字 `INET_NTOA(数字)` 转为IP字符串

* `CRC32('..')` 计算循环冗余码校验值并返回一个 32比特无符号值。若参数为NULL ，则结果为 NULL

----

###表

1. 查看表信息

    * `describe 表名` `desc 表名`:

        Field字段名  Type类型 Null可空否 Key有点复杂哇 Default默认值 Extra其他比如auto_increment

        关于Key，网上找来的：

        1. 如果Key是空的, 那么该列值的可以重复, 表示该列没有索引, 或者是一个非唯一的复合索引的非前导列
        2. 如果Key是PRI,  那么该列是主键的组成部分
        3. 如果Key是UNI,  那么该列是一个唯一值索引的第一列(前导列),并别不能含有空值(NULL)
        4. 如果Key是MUL,  那么该列的值可以重复, 该列是一个非唯一索引的前导列(第一列)或者是一个唯一性索引的组成部分但是可以含有空值NULL

        如果对于一个列的定义，同时满足上述4种情况的多种，比如一个列既是PRI,又是UNI
        那么"desc 表名"的时候，显示的Key值按照优先级来显示 PRI->UNI->MUL
        那么此时，显示PRI

        一个唯一性索引列可以显示为PRI,并且该列不能含有空值，同时该表没有主键

        一个唯一性索引列可以显示为MUL, 如果多列构成了一个唯一性复合索引
        因为虽然索引的多列组合是唯一的，比如ID+NAME是唯一的，但是没一个单独的列依然可以有重复的值
        只要ID+NAME是唯一的即可

    * `show create table 表名` 展示：Table（表名） 和 Create Table（建表语句）

2. 表复制

    * 复制表结构，包括主键索引等（结构完全复制）但没有数据：`create table new_table like old_table`

    * 复制表数据，不同步主键索引等，只是拷贝数据： `create table new_table as (select * from old_table)`

    * (??是不是和上面一样??) `create table new_table select * from old_table`

    * 接第二条，可以只同步某些字段，并改掉字段名, 并可以选择某些数据同步：`create table new_table as (select col1, col2 as new_col2 from old_table where ...)`

    * 接第二条，还可以加入新的字段：`create table new_table (new_col...) as (select * from old_table)`

----

###临时表

* 创建临时表 `create temporary table table_name (col...)`

* 临时表可以和普通表重名，在临时表的生命周期内，它将屏蔽同名的普通表

* 在使用持久连接或者连接池技术中，为防止上次sql有没删除的临时表，最好：`drop temporary table if exists 临时表表名`
###排序

* 如果不指定排序，mysql返回的顺序是随机的

----

###文件

* `mysqldump -h 主机名 -u 用户名 -p[密码] 库名 > /tmp/文件名.sql`  备份数据库

* 运行sql文件：

  1. `可以成功连接的mysql 库名 < sql批处理文件`

  2. 在mysql会话中： `source sql批处理文件` `\. sql批处理文件`

----

###索引

* 查看某表的索引： `show index from deals;` 或者 `show keys from deals;`

    Table 表的名称

    Non_unique 如果索引不能包括重复词，则为0。如果可以，则为1.(对于联合索引，该索引的所有列按一个整体来看)

    Key_name 索引的名称(联合索引会有好几行)

    Seq_in_index 索引中的列序列号，从1开始（联合索引的顺序）

    Column_name 列名称

    Collation 列以什么方式存储在索引中。在MySQLSHOW INDEX语法中，有值 A 升序或 NULL 无分类

    Cardinality 索引中唯一值的数目的估计值

    Sub_part 被编入索引的字符的数目。如果整列被编入索引，则为NULL

    Packed 指示关键字如何被压缩。如果没有被压缩，则为NULL ？？

    Null 如果列含有NULL，则含有YES。如果没有，则该列含有NO

    Index_type 索引类型（BTREE, FULLTEXT, HASH, RTREE）

    Comment 评注 ？？

----

###数据库状态

* `show [full] processlist` 查看链接数

* `show status like 'last_query_cost'` 查看上次查询开销（对4kb页面随机读取的次数）

----

###元数据

**数据库 INFORMATION_SCHEMA **


####SCHEMATA表

所有数据库的信息。是`show databases`的结果取之此表:

CATALOG_NAME SCHEMA_NAME数据库名   DEFAULT_CHARACTER_SET_NAME DEFAULT_COLLATION_NAME SQL_PATH


####TABLES表

提供了关于数据库中的表的信息（包括视图）。详细表述了某个表属于哪个schema，表类型，表引擎，创建时间等信息。`show tables from [schemaname]`的结果取之此表。

TABLE_CATALOG
TABLE_SCHEMA 所属数据库
TABLE_NAME 表名
TABLE_TYPE
ENGINE
VERSION
ROW_FORMAT
TABLE_ROWS
AVG_ROW_LENGTH
DATA_LENGTH
MAX_DATA_LENGTH
INDEX_LENGTH
DATA_FREE
AUTO_INCREMENT
CREATE_TIME
UPDATE_TIME
CHECK_TIME
TABLE_COLLATION
CHECKSUM
CREATE_OPTIONS
TABLE_COMMENT

####COLUMNS表

提供了表中的列信息。详细表述了某张表的所有列以及每个列的信息。是`show columns from schemaname.tablename [like '某个字段']` `desc schemaname.tablename`的结果取之此表。

`show full columns from 表名` 可以查看字段的字符编码

TABLE_CATALOG
TABLE_SCHEMA 所属数据库
TABLE_NAME 所属表
COLUMN_NAME 字段名
ORDINAL_POSITION
COLUMN_DEFAULT
IS_NULLABLE
DATA_TYPE
CHARACTER_MAXIMUM_LENGTH
CHARACTER_OCTET_LENGTH
NUMERIC_PRECISION
NUMERIC_SCALE
CHARACTER_SET_NAME
COLLATION_NAME
COLUMN_TYPE
COLUMN_KEY
EXTRA
PRIVILEGES
COLUMN_COMMENT

----

### Mysql双主自增长冲突处理

方案是设置不同的自增长量，一般是奇偶分开：

`auto_increment_increment`和`auto_increment_offset`用于主服务器－主服务器（master-to-master）复制，并可以用来控制AUTO_INCREMENT列的操作。两个变量均可以设置为全局或局部变量

auto_increment_increment控制列中的值的增量值

auto_increment_offset确定AUTO_INCREMENT列值的起点

查看全局配置：`SHOW VARIABLES LIKE 'auto_inc%'`

A：my.cnf上加入参数

        auto_increment_offset = 1
        auto_increment_increment = 2

这样A的auto_increment字段产生的数值是：1, 3, 5, 7, …等奇数ID了

B：my.cnf上加入参数

        auto_increment_offset = 2
        auto_increment_increment = 2

这样B的auto_increment字段产生的数值是：2, 4, 6, 8, …等偶数ID了


----

###其他

* limit字句也可以用于update和delete


