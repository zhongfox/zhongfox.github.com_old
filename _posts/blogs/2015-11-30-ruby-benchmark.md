---
layout: post
categories: [blog, ruby]
tags : [benchmark, ruby]
title: Ruby Benchmark
---
{% include JB/setup %}

##标准库的Benchmark

* `Benchmark.measure {code}`

* `Benchmark.bm(label_width = 0) {|job| job.report(label) {code} }` 可以有多个job.report， label可选

* `Benchmark.bmbm(label_width)` 2次测试，第一次是演练，第二次是真实


### 示例

    require 'benchmark'
    n = 100_000
    size = 10_000
    array = (0...size).to_a.shuffle

    Benchmark.bm do |x|
      x.report("#at") {
        n.times { array.at rand(size)}
      }

      x.report("#index") {
        n.times { array.index rand(size) }
      }
    end

           user     system      total        real
    #at  0.020000   0.000000   0.020000 (  0.025401)
    #index  3.060000   0.010000   3.070000 (  3.062166)

  输出四个时间分别是(单位是秒)：

        user: the amount of time spent executing userspace code (i.e.: your code),
        system: the amount of time spent executing kernel code
        user + system
        real: the "real" amount of time it took to execute the code (i.e. system + user + time spent waiting for I/O, network, disk, user input, etc.). Also known as "wallclock time".

### 分析

优点:

* 简单
* 标准库

不足:

* Variable Fiddling: 需要一个大小合适比较样本, 要考虑要运行多少次(guessing iteration counts)
* 输出不易读

---

## benchmark/ips

<https://github.com/evanphx/benchmark-ips>

* 会计算一个合适的运算次数, 用以提供合理的比较结果, 结果通过每秒多少次进行展示
* 输出标准方差 (各数据偏离平均数的距离（离均差）的平均数)
* 比较功能

### 示例

    require 'benchmark/ips'
    size = 100_000
    array = (0...size).to_a.shuffle

    Benchmark.ips do |x|
      x.report("#at") {
        array.at rand(size)
      }

      x.report("#index") {
        array.index rand(size)
      }
      x.compare!
    end

    Calculating -------------------------------------
                     #at    90.406k i/100ms
                  #index   182.000  i/100ms
    -------------------------------------------------
                     #at      2.800M (±20.4%) i/s -     12.566M   #默认运行5秒, 可以改变, 最后的数据是5秒中运行次数
                  #index      2.823k (±23.8%) i/s -     13.104k

    Comparison:
                     #at:  2799519.5 i/s
                  #index:     2822.7 i/s - 991.80x slower

### 分析

优点:

* 不用推测运行次数
* Bigger=Better 按照秒统计, 可以运行更多次的比较
* 语法不变
* 比较功能

不足:

* 独立Gem
* Snapshot View (没有考虑样本大小变化的影响, 只是基于固定大小样本的比较)

 ---

## benchmark/bigo

<https://github.com/davy/benchmark-bigo>

* 不同大小样本下, 进行比较
* 图表比较功能(前端图表库ChartKick) 非常直观
* 终端输出ASCII 图表(需要安装gnuplot) 将就可用

### 示例

    require 'benchmark/bigo'

    Benchmark.bigo do |x|
      # generator should construct a test object of the given size
      # example of an Array generator
      # 生成器是接受一个size参数的block
      x.generator {|size| (0...size).to_a.shuffle }

      # or you can use the built in array generator
      # x.generate :array

      # steps is the total number of data points to collect
      # default is 10
      x.steps = 6

      # step_size is the size between steps
      # default is 100
      x.step_size = 200

      # indicates the starting size of the object to test
      # default is 100
      x.min_size = 1000

      # report takes a label and a block.
      # block is passed in the generated object and the size of that object
      x.report("#at")           {|array, size| array.at rand(size) }
      x.report("#index")        {|array, size| array.index rand(size) }
      x.report("#index-miss")   {|array, size| array.index (size + rand(size)) }

      # generate HTML chart using ChartKick
      x.chart! 'chart_array_simple.html' # 样本大小为自变量, 每个最小运行代码耗时为因变量

      # for each report, create a comparison chart showing the report
      # and scaled series for O(log n), O(n), O(n log n), and O(n squared)
      x.compare! #集成到上面的html图表中, 对每种测试方案, 生成一个数学计算的比较图表

      # generate an ASCII chart using gnuplot(安装gnuplot貌似比较麻烦)
      # works best with only one or two reports
      # otherwise the lines often overlap each other
      x.termplot!

      # generate JSON output
      x.json! 'chart_array_simple.json'

      # generate CSV output
      x.csv! 'chart_array_simple.csv'
    end

    结果示例(和上面无关)

    Calculating -------------------------------------
                 #at 100    74.532k i/100ms
                 #at 200    80.842k i/100ms
                 #at 300    79.774k i/100ms
                 #at 400    82.184k i/100ms
                 #at 500    82.745k i/100ms
                 #at 600    85.597k i/100ms
                 #at 700    83.958k i/100ms
                 #at 800    82.119k i/100ms
                 #at 900    81.008k i/100ms
                #at 1000    82.054k i/100ms
              #index 100    65.882k i/100ms
              #index 200    53.107k i/100ms
              #index 300    44.360k i/100ms
              #index 400    39.844k i/100ms
              #index 500    34.899k i/100ms
              #index 600    31.575k i/100ms
              #index 700    29.898k i/100ms
              #index 800    26.109k i/100ms
              #index 900    22.099k i/100ms
             #index 1000    21.879k i/100ms
    -------------------------------------------------
                 #at 100      2.019M (± 8.3%) i/s -     10.062M
                 #at 200      1.895M (±10.2%) i/s -      9.459M
                 #at 300      1.755M (±14.3%) i/s -      8.536M
                 #at 400      1.784M (±10.5%) i/s -      8.876M
                 #at 500      1.836M (± 9.6%) i/s -      9.185M
                 #at 600      1.800M (±10.7%) i/s -      8.902M
                 #at 700      1.888M (± 6.1%) i/s -      9.487M
                 #at 800      1.904M (± 5.9%) i/s -      9.526M
                 #at 900      1.904M (±10.8%) i/s -      9.397M
                #at 1000      1.950M (± 6.2%) i/s -      9.764M
              #index 100      1.144M (± 6.0%) i/s -      5.732M
              #index 200    832.603k (± 5.3%) i/s -      4.195M
              #index 300    638.280k (± 6.0%) i/s -      3.194M
              #index 400    538.280k (± 4.9%) i/s -      2.709M
              #index 500    456.839k (± 4.9%) i/s -      2.303M
              #index 600    400.429k (± 5.3%) i/s -      2.021M
              #index 700    356.477k (± 4.7%) i/s -      1.794M
              #index 800    317.905k (± 4.7%) i/s -      1.593M
              #index 900    262.601k (±18.8%) i/s -      1.260M
             #index 1000    259.646k (± 8.5%) i/s -      1.291M



        4 +-+-----+------+-------+-------+------+-------+-------+------+-----+-+
          +       +      +       +       +      +       +       +     ##########
      3.5 +-+    #at *******                                        ##       +-+
          |   #index #######                                      ##           |
          |                                                   ####             |
        3 +-+                                             ####               +-+
          |                                         ######                     |
      2.5 +-+                                  #####                         +-+
          |                                ####                                |
        2 +-+                        ######                                  +-+
          |                    ######                                          |
          |                ####                                                |
      1.5 +-+         #####                                                  +-+
          |     ######                                                         |
        1 +-####                                                             +-+
          ##                                                                   |
          |   **************************************************               |
      0.5 ****                                                  ****************
          +       +      +       +       +      +       +       +      +       +
        0 +-+-----+------+-------+-------+------+-------+-------+------+-----+-+
         100     200    300     400     500    600     700     800    900     1000



### 分析

优点:

* 基于不同样本大小进行比较
* 有图有真相!
* 还有文本图表(ASCII)

不足:

* 独立Gem
* 较长的运行时间
* 并不是任何场景都适用: 使用于需要考虑测试样本变化的场景

---

## 如何有效地进行基准测试

### 需要一致的比较环境

硬件环境需要一致, 且如果相同的机器, 同样的测试代码, 负载情况不一样, 输出的测试结果也会受到极大的影响

### 编写测试

基准测试代码也是代码, 需要用测试来保证基准测试代码的正确性

### 对比过程中, 每次只改对一个地方

对比代码中, 应该只有比较处是不同的.

    x.report("reduce") {
      items.reduce({}) { |hash, x|
        hash.merge(x[:id] => x[:score])
      }
    }

    x.report("each with object") {
      items.each_with_object({}) { |x, hash|
        hash[x[:id]] = x[:score]
      }
    }
    #以上代码想比较reduce和each_with_object, 但是引入merge和[]赋值的不同, 最后比较结果没有意义


### 运行过程中注意不要误修改了测试样本

如果每次运行都(不是期望的)修改了测试样本, 那么后续的测试结果可能出现问题.

对于测试会修改测试样本的方法, 可以考虑每次都进行dup

    x.report('#delete') {|array, size|
      (0..(size/2)).each do |i|
        array.delete i
      end
    }

    x.report('#delete_if') {|array, size|
      array.delete_if {|a| a < size / 2 }
    }
    #2个测试都会删除测试样本, 测试结果没有意义

### 合理使用"随机"

---

## 结论

* Verify Assumptions
* Learn about your code
* Learn about Ruby
* When to use Benchmark gem: Just use Benchmark IPS
* When to use Benchmark IPS: All the time!
* When to use Benchmark BigO: Input has range of sizes; Results in chart form


---

## 参考资料

* <http://blog.onyxraven.com/ruby/rubyconf/2014/11/19/rubyconf-2014-3.html#benchmarking-ruby---githubcomdavybenchmarkingruby---davystevenson>
* code: <https://github.com/davy/benchmarking-ruby>
* 视频: <http://confreaks.tv/videos/rubyconf2014-benchmarking-ruby>

