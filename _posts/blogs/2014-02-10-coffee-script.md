---
layout: post
categories: [blog, javascript]
tags : [rails, coffee, javascript]
title: Coffee Script
---
{% include JB/setup %}

###安装

* 安装nodejs <http://howtonode.org/how-to-install-nodejs>

        git clone git://github.com/ry/node.git
        cd node
        ./configure
        make
        sudo make install

  mac 安装：`brew install node`

  安装后测试是否安装成功：

        var http = require('http');
        http.createServer(function (req, res) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Hello Node.js\n');
        }).listen(8124, "127.0.0.1");
        console.log('Server running at http://127.0.0.1:8124/');

        > node hello_node.js
        Server running at http://127.0.0.1:8124/

        访问 http://127.0.0.1:8124/ 应该看到Hello Node.js

* 安装coffee `sudo /usr/local/bin/npm install -g coffee-script` (安装的是Node.js版的编译器)

  测试： 命令行`coffee` 进入coffee的控制台


* 安装VIM插件 <https://github.com/kchmck/vim-coffee-script>

---

### 使用

1. 前端编译

        <script src="http://jashkenas.github.com/coffee-script/extras/coffee-script.js" type="text/javascript" charset="utf-8"></script>
        <script type="text/coffeescript">
          # Some CoffeeScript
        </script>


2. 后台编译

   要预处理文件: `coffee --compile my-script.coffee`

   如果没有指定--output参数，CoffeeScript会直接将编译后的代码写入一个同名的JavaScript文件中

---

### 语法

1. 注释

    # 单行注释不会出现在源码里

    ###
      多行注释会出现在源码里
    ###

2. 变量定义

   coffee会在变量定义时自动加上var，以避免全局变量，如果确实需要全局变量，可以给window赋属性

3. 函数

   * 函数最后一个表达式会自动return

   * 简易函数 `func = -> "bar"`

   * 多行函数，锁进既语法（从python），一次缩进代表一层{}

        func = ->
          # An extra line
          "bar"

4. 函数参数

   * 参数放在剪头前面的括号里, 没有参数括号可以省略`times = (a, b) -> a * b`

   * 支持默认值 `times = (a = 1, b = 2) -> a * b`

   * 支持参数槽(splats 即ruby里的数目不定的参数数组), 下例中nums是真实的Array，而不是arguments对象

        sum = (nums...) ->
          result = 0
          nums.forEach (n) -> result += n
          result

5. 函数调用

   * 函数调用可以不加括号：`alert a`

   * `alert inspect a` 等价于`alert(inspect(a))`

   * 但是嵌套函数调用最好加上括号

   * 对于无参函数调用，必须要加上括号。

6. 函数上下文

   coffee通过用`=>`代替`->` 定义函数，实现在该函数调用时，内部this保持了定义时候的外部this

   `(e) => this.clickHandler(e)` coffee貌似是视具体情况进行实现，实现方式很多

   jQuery 中 proxy 也是类似用法

7. 对象字面量和数组定义

   * 对象定义和使用大括号可以省略

     object2 = one: 1, two: 2 (数组不行)

     User.create(name: "John Smith")

   * 对象定义和数组定义还可以通过换行省略分隔的逗号

        object3 =
          one: 1
          two: 2

        array2 = [
          1
          2
          3
        ]

8. 流程控制

   * 支持unless

   * if unless 的括号可以省略，还可以通过then写到单行`if 1 > 0 then "Ok" else "Y2K!"`

   * 类似ruby的if unless后置：`alert "It's cold!" if heat < 5`

   * 使用`not` 代替! 取反增强可读性 `if not true then "Panic"`

   * is 等价于=== `if true is 1`

   * isnt 等价于 is not 等价于 !==  `if true isnt true`

   * coffee会自动转化 == != 为 === !==

9. 字符串插值法

   * 支持ruby 里的#{变量名}，同样必须放到双引号里

   * 多行字符串是允许的，不需要在每一行前添加+, 这个单双引号都支持

10. 循环和列表解析

    * for in 迭代

        for name in ["Roger", "Roderick", "Brian"]
          alert "Release #{name}"

        for name, i in ["Roger the pickpocket", "Roderick the robber"] #附带index
          alert "#{i} - Release #{name}"

        release prisoner for prisoner in ["Roger", "Roderick", "Brian"] #后缀式for in 很像python

        release prisoner for prisoner in prisoners when prisoner[0] is "R" #用when过滤

        names = sam: seaborn, donna: moss
        alert("#{first} #{last}") for first, last of names #迭代对象

    * while 循环

      while类似原生while, 但是如果把while结果赋值给变量，会有map的效果 (但是我感觉这是鸡肋啊，干嘛不直接用map，map更直观，不过对于没有map方法的倒是可以一试)

                num = 6
                minstrel = while num -= 1
                  num + " Brave Sir Robin ran away"

      题外话：原生的`Array.prototype.map()` `[1,2,3].map(function(x) { return x+ 1 })`


11. 数组

    coffee支持range来定义分离数组，几乎和ruby一模一样：

        imAArray = [1..5]
        firstTwo = ["one", "two", "three"][0..1] #使用slice

        my = "my string"[0..2] ＃range分离还可以用于字符串

    为了解决IE不支持indexOf，coffee提供了in，来判断array的包含关系

        words = ["rattled", "roudy", "rebbles", "ranks"]
        alert "Stop wagging me" if "ranks" in words 

12. 别名和存在操作符

    * @代表this `@saviour = true` == `this.saviour = true`

    * ::代表prototype `User::first = 3` == `User.prototype.first = 3`

    * 存在判断符`?`

        praise if brian? # if (typeof brian !== "undefined" && brian !== null) { praise; }

        velocity = southern ? 40 # 用于代替或： velocity = typeof southern !== "undefined" && southern !== null ? southern : 40;

        blackKnight.getLegs()?.kick() # 类似ruby的try，但是只判断了null： var _ref; if ((_ref = blackKnight.getLegs()) != null) { _ref.kick(); }

        blackKnight.getLegs().kick?() #可调用性判断

---

### 类

1. 类定义

        class Animal
          constructor: (name) ->
            @name = name

        等价于：

        class Animal
          constructor: (@name) ->

        实例化 
        animal = new Animal("Parrot")
        alert "Animal is a #{animal.name}"

2. 类的实例属性

   * 实例属性即在够构造器的prototype上的属性

        class Animal
          price: 5
          sell: (customer) ->

   * 胖箭头生成的实例方法里的this总是绑定当前的实例对象

        class Animal
          price: 5
          sell: =>
            alert "Give me #{@price} shillings!" # this.price 会是5

3. 类的静态属性

   类的静态属性即类的属性，在类定义处用this来实现

        class Animal
          this.find = (name) ->

4. 继承

   继承使用`extends` (oh no java) 

   super用于调用被覆盖的父类的方法

        class Animal
          constructor: (@name) ->

          alive: ->
            false

        class Parrot extends Animal
          constructor: ->
            super("Parrot")

