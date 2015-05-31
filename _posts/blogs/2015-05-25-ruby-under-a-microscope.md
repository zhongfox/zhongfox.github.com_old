---
layout: post
categories: [blog, ruby]
tags : [ruby]
title: Ruby Under a Microscope
tagline: What seems complex from a distance is often quite simple when you look closely enough
---
{% include JB/setup %}

## 1. TOKENIZATION AND PARSING

<img width="80%" src="/assets/images/ruby_under_a_microscope/overview.png" />

* 执行代码前三个遍历: Tokenize, Parse, Compile

---

### Tokenize

<img width="80%" src="/assets/images/ruby_under_a_microscope/before-tokenize.png" />
<img width="80%" src="/assets/images/ruby_under_a_microscope/after-tokenize.png" />

* Tokens: The Words That Make Up the Ruby Language
* `tINTEGER` 数字字面量
* `tIDENTIFIER` 非保留字, 可用作变量名, 方法名, 类名
* `keyword_do` 保留ruby关键字, 不可以作为普通变量名, 但还是可以作为 method names, global variable names, instance variable names
* 使用Ripper观察TOKENIZATION

      require 'ripper'
         require 'pp'
         code = <<STR
         10.times do |n|
      puts n end
      STR
      puts code
      pp Ripper.lex(code)

---

### Parsing

* Ruby 使用的parser generator 叫做Bison, Yacc (Yet Another Compiler Compiler)的早期版本
* Bison接收一系列语法规则(定义在parse.y, ruby语言的核心), 生成 parser (parse.c), 然后parser再去parse token.
* parse.y和生成的parse.c 也包含Tokenize的功能代码
* Tokenize 和 Parse 其实是同时进行
* LALR(Look-Ahead Left Reversed Rightmost)
  * L(left) 从左到右parse token
  * R (reversed rightmost derivation) 反向最右推导??  采用shift/reduce

    shift 到 Grammar Rule Stack, reduce 为一个Grammar Rule
  * LA(look ahead) the parser looks ahead at the next token, the parser maintains a state table of possible outcomes depending on what the next token is and which grammar rule was just parsed.

* `-y` 参数可以展示parse过程, 如 `ruby -y simple.rb`
* 用Ripper查看解析过程

      require 'ripper'
      require 'pp'
      code = <<STR
        10.times do |n|
          puts n
        end
      STR
      puts code
      pp Ripper.sexp(code)

* 解析结果是abstract syntax tree (AST)

---

## 2. COMPILATION


<img width="40%" src="/assets/images/ruby_under_a_microscope/ruby-18-layers.png" />

* ruby 1.8 没有编译过程, ruby team编写的C代码, 直接解释运行parser生成的AST

<img width="40%" src="/assets/images/ruby_under_a_microscope/ruby-19-20-layers.png" />

* compile means to translate your code from one programming language to another (ruby代码 -> YARV指令)
* YARV : Yet Another Ruby Virtual Machine
* you don’t use Ruby’s compiler directly; unlike in C or Java, Ruby’s compiler runs automatically without you ever knowing


* YARV: It’s a stack-oriented virtual machine. That means when YARV executes your code, it maintains a stack of values—mainly arguments and return values for the YARV instructions

* AST节点:

  * `NODE_SCOPE`: 作用域, 包含因子: table(输入变量名?) args(输入变量个数?)
  * `NODE_FCALL` 函数调用的
  * `NODE_CALL` 代表方法调用
  * `NODE_ITER`: literal string
  * `NODE_DVAR`: block parameter
  * `NODE_LIT`: 

* `NODE_FCALL` `NODE_CALL` 都会被编译为以下YARV指令:

  * Push receiver
  * Push arguments
  * Call the method/function

* Ruby 的 parser,  compiler 区分函数和方法: 方法调用有明确的 receiver, 函数调用的receiver是当前self
* Compiler通过变量AST就能获得正确的指令执行顺序
* `puts 2+2` 生成的YARV指令

      YARV instructions
      putself
      putobject         2
      putobject         2
      send              <callinfo!mid:+, argc:1, ...  #将被优化为opt_plus
      send              <callinfo!mid:puts, argc:1, ...

* (methods, blocks, classes, modules) Each `NODE_SCOPE` is compiled into a new snippet of YARV instructions
* 观察YARV指令:

      code = <<END
      puts 2+2
      END
      puts RubyVM::InstructionSequence.compile(code).disasm

---

<img width="80%" src="/assets/images/ruby_under_a_microscope/local_table.png" />

* `local table` compiler将会从AST中复制出block参数到local table, 每一个scope有自己的local table

  用于存储局部变量和block参数

* 各参数标签

  * <Arg> 标准的方法参数或者block参数
  * <Rest> 使用`*`的数组参数
  * <Post> 数组参数后面的标准参数
  * <Block> 使用`&`表示的block参数
  * <Opt=i> 带有默认值的参数, `i`表示默认值存储的下标

---

## 3. HOW RUBY EXECUTES YOUR CODE

TODO

---

## 4. CONTROL STRUCTURES AND METHOD DISPATCH

TODO

---

## 5. OBJECTS AND CLASSES

### RObject

**Every Ruby object is the combination of a class pointer and an array of instance variables.**

所有ruby对象都是: 包含一个指向其class的指针, 以及一个存储实例变量的数组的集合

<img width="25%" src="/assets/images/ruby_under_a_microscope/r_object.png" />

* Ruby always refers to any value with a VALUE pointer

  对象inspect结果如`#<Mathematician:0x007fbd738608c0>` 16进制数组表示VALUE指针地址, 每个对象不相同

* klass: 所属类的指针
* numiv: 实例变量个数
* ivptr: 实例变量数组的指针
* `iv_index_tbl`: 指向Rclass中的存储实例变量的映射关系, 是一个hash table, 用于解释ivptr内容


---

<img width="70%" src="/assets/images/ruby_under_a_microscope/generic_objects.png" />

* custom对象使用RObject, ruby内置对象叫做`generic objects`, 不使用RObject:
  * string: RString
  * array: RArray
  * 正则: RRegexp

  但所有类型对象都使用RBasic结构

---

<img width="40%" src="/assets/images/ruby_under_a_microscope/fixnum_object.png" />

* 简单值(integer, symbol, nil, true, false)没有对象结构, 直接存于VALUE
  * These VALUEs are not pointers at all; they’re values themselves
  * 无klass指针, 在flag中复制出标明klass标志位

---

<img width="80%" src="/assets/images/ruby_under_a_microscope/generic_iv_tbl.png" />

* 对不使用RObject结构的对象, 实例变量都存在hash `generic_iv_tbl`中

---

<img width="80%" src="/assets/images/ruby_under_a_microscope/ivptr.png" />

* ivptr 在ruby1.8里是hash, 存储实例变量的名称内容, 1.9 以及上改为了数组, 单纯存储实例变量值
* ruby1.9及以上, ivptr 第一次分配7个, 当添加第8个时, ruby再分配3个, 这能说明为什么添加实例变量耗时的变化

---

### RClass

**A Ruby class is a Ruby object that also contains method definitions, attribute names, a superclass pointer, and a constants table**

<img width="80%" src="/assets/images/ruby_under_a_microscope/r_class.png" />

* `klass pointer` 指向Class, 用于查找具体的类的(实例)方法, 如`new`
* `flags`
* `m_tbl` 类定义的实例方法hash, key是方法名或者id, 值是指向方法定义的pointer, 指向处包括已经编译好的方法YARV指令
* `iv_index_tbl` 类的实例的实例变量映射hash, key 为实例变量名称, 值为在RObject中ivptr的索引

**rb\_classext\_struct**

* `super pointer` 指向父类, 用于查找继承链上的方法, 读写类变量
* `iv_tbl` 存储类的实例变量, 以及类变量, 通过前缀`@` `@@`来区别
* `const_tbl` 存储常量
* `origin` 实现`Module#prepend feature`
* `refined_class` 实现refinements
* `allocator` 为新实例分配内存
---

**类变量**

* 类变量读写都是沿着super向上查找, 而不会向下查找

      class A
        def self.a
          @@x
        end

      end

      class B < A
        @@x = 5

        def self.b
          @@x
        end
      end

      class C < B
        def self.c
          @@x
        end
      end

      puts B.b #=> 5
      puts C.c #=> 5
      puts A.b #undefined method `b' for A:Class

---

**类方法**

<img width="80%" src="/assets/images/ruby_under_a_microscope/metaclass.png" />

* 每个普通类创建的同时, ruby会同时创建对应的单件类, 普通类的类方法是存于单件类(metaclass)中的`m_tbl`

      > ObjectSpace.count_objects[:T_CLASS] v => 859
         > class Mathematician; end
          => nil
      > ObjectSpace.count_objects[:T_CLASS] w => 861

---

## 6. METHOD LOOKUP AND CONSTANT LOOKUP

### Module

**A Ruby module is a Ruby object that also contains method definitions, a superclass pointer, and a constants table**

* Module 和 Class的区别
  * Module实例 不能调用new
  * Module实例没有superclass
  * Module实例可以被include, Class实例不行

<img width="80%" src="/assets/images/ruby_under_a_microscope/r_class_for_module.png" />

* 和Rclass相比
  * 去掉了`iv_index_tbl`, 没有实例, 因此不需要实例变量映射表
  * 不需要`refined_class` `allocator`
  * Module 保留了`super`, 但是外部不能调用.

---

<img width="80%" src="/assets/images/ruby_under_a_microscope/include_a_module_in_class.png" />

* 被`include`的Module会被复制一份, (猜测应该和super相关, 因为Module的super要被改变, 但是Module可以被多个target include)
  被复制的Module 的`m_tbl`指向原来Module的方法表, 因此方法后续可以动态添加

* `inlucde` 改变了super的指向
* Ruby implements module inclusion using class inheritance. Essentially, there is no difference between including a module and specifying a superclass
* 可以通过多个include实现类似多重继承的功能, 但是内部ruby还是维护的单链super继承
* ruby 方法查找逻辑: terate through the superclass linked list until it finds the class or module that contains the target method

---

### The Global Method Cache

<img width="80%" src="/assets/images/ruby_under_a_microscope/g_m_cache.png" />

* 出于时间效率考虑, ruby会缓存调用过的方法查找结果, 类似一个hash, key为调用对象的`class#method`, 值为`defined_class#method`

### The Inline Method Cache

* ruby 也会把方法查找结果缓存于YARV指令中

      # ruby代码
      10.times do... end

      # 原始YARV
      putobject 10
      send          <callinfo!mid:times, argc:0,
                    block:block in <compiled>>
      # 缓存结果
      putobject 10
      send        ￼￼Integer#times
      ￼
* 以下动作会造成方法缓存的清除:
  * create or remove (undefine) a method
  * include a module into a class
  * refinements
  * 其他可能的元编程技术

* clearing the cache happens quite frequently in Ruby. The global and inline method caches might remain valid for only a short time

---

### Module#prepend 实现

<img width="80%" src="/assets/images/ruby_under_a_microscope/prepend_module_in_class.png" />

* 首先ruby把prepend按照include实现, 将被prepend的Module插到target的super
* 然后ruby复制target, 作为origin插到prepend的super, target的origin指针指向复制的origin
* 最后ruby把所有target定义的方法, 移动到origin中去

---

### Classes Don’t See Submodules Included Later

    module A
      def a
        puts 'a'
      end
    end

    class B
      include A
    end

    B.new.a  # 'a'

    module C
      def c
        puts 'c'
      end
    end

    module A
      include C
    end

    B.new.a  # 'a'
    B.new.c  # undefined method `c' for #<B:0x000001019285b8>

  include 的机制是复制Module, 被复制的Module和原始的Module的super后续可以被改变(inlcude其他Module), 从而变得互不相同. 

---

### Constant Lookup

#### Lexical Scope

<img width="80%" src="/assets/images/ruby_under_a_microscope/lexical_scope.png" />

* Ruby在创建RClass的同时, 也创建了对应的词法范围
* 词法范围存在于YARV指令中
* `nd_next` 指向上级词法范围
* `nd_clss` 指向当前类/模块

<img width="80%" src="/assets/images/ruby_under_a_microscope/constant_lookup.png" />

* 先沿着词法范围向上查找(即Module.nesting)
* (如果Module.nesting.first是class的话)然后沿着当前类的super向上查找

---

## 7. THE HASH TABLE: THE WORKHORSE OF RUBY INTERNALS


## 参考资料

* <http://patshaughnessy.net/ruby-under-a-microscope>
* <http://bachue.github.io/ruby-under-a-microscope-introduction-slides/>
