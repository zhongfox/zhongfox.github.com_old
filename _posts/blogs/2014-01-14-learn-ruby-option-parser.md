---
layout: post
categories: [blog, ruby]
tags : [ruby, option parser, optparse]
title: Ruby库学习--OptionParser
---
{% include JB/setup %}


* `parse!(argv = default_argv)`

  和parse不同的是，该方法会破坏ARGV，调用后ARGV为空


---

解析官方的例子

        require 'optparse'
        require 'optparse/time'
        require 'ostruct'
        require 'pp'

        class OptparseExample

          CODES = %w[iso-2022-jp shift_jis euc-jp utf8 binary]
          CODE_ALIASES = { "jis" => "iso-2022-jp", "sjis" => "shift_jis" }

          #
          # Return a structure describing the options.
          #
          def self.parse(args)
            # The options specified on the command line will be collected in *options*.
            # We set default values here.
            options = OpenStruct.new
            options.library = []
            options.inplace = false
            options.encoding = "utf8"
            options.transfer_type = :auto
            options.verbose = false

            opt_parser = OptionParser.new do |opts|
              #banner即帮助提示
              opts.banner = "Usage: example.rb [options]"

              #separator 在帮助时的分隔提示文字（基本就是puts）
              opts.separator ""
              opts.separator "Specific options:"

              # Mandatory argument.
              #LIBRARY没有用[]包裹，代表必填项，意思是传了-r 后面必须有值，但是整个不传是允许的，整个传递了才进block
              opts.on("-r", "--require LIBRARY",
                      "Require the LIBRARY before executing your script") do |lib|
                options.library << lib
              end

              # Optional argument; multi-line description.
              #EXTENSION用[]包裹，代表可选项，意思是可以单传传-i后面无值，只要有-i就会进block
              opts.on("-i", "--inplace [EXTENSION]",
                      #参数解释可以传多个值，用以换行
                      "Edit ARGV files in place",
                      "  (make backup if EXTENSION supplied)") do |ext|
                options.inplace = true
                options.extension = ext || ''
                options.extension.sub!(/\A\.?(?=.)/, ".")  # Ensure extension begins with dot.
              end

              # Cast 'delay' argument to a Float.
              #在短长参数后面插入一个类，作为类型转换的目的类型
              opts.on("--delay N", Float, "Delay N seconds before executing") do |n|
                options.delay = n
              end

              # Cast 'time' argument to a Time object.
              #同样可以对可选参数进行转换
              opts.on("-t", "--time [TIME]", Time, "Begin execution at given time") do |time|
                options.time = time
              end

              # Cast to octal integer.
              opts.on("-F", "--irs [OCTAL]", OptionParser::OctalInteger,
                      "Specify record separator (default \\0)") do |rs|
                options.record_separator = rs
              end

              # List of arguments.
              #获得数组
              opts.on("--list x,y,z", Array, "Example 'list' of arguments") do |list|
                options.list = list
              end

              # Keyword completion.  We are specifying a specific set of arguments (CODES
              # and CODE_ALIASES - notice the latter is a Hash), and the user may provide
              # the shortest unambiguous text.
              code_list = (CODE_ALIASES.keys + CODES).join(',')
              #在短长参数后，第一个数组是有效参数值(并且支持自动完成，意思是输入值是可以是前部分)
              #第二个hash是别名映射
              opts.on("--code CODE", CODES, CODE_ALIASES, "Select encoding",
                      "  (#{code_list})") do |encoding|
                options.encoding = encoding
              end

              # Optional argument with keyword completion.
              #在短长参数后，第一个数组是有效参数值(并且支持自动完成，意思是输入值是可以是前部分)
              opts.on("--type [TYPE]", [:text, :binary, :auto],
                      "Select transfer type (text, binary, auto)") do |t|
                options.transfer_type = t
              end

              # Boolean switch.
              #布尔型参数，block中v是true或false
              opts.on("-v", "--[no-]verbose", "Run verbosely") do |v|
                options.verbose = v
              end

              opts.separator ""
              opts.separator "Common options:"

              # No argument, shows at tail.  This will print an options summary.
              # Try it and see!
              # 下面这个是该库自带的功能，默认会有的，不用写
              opts.on_tail("-h", "--help", "Show this message") do
                puts opts
                exit
              end

              # Another typical switch to print the version.
              # on_tail 表明在helper里一定是最后
              opts.on_tail("--version", "Show version") do
                puts ::Version.join('.')
                exit
              end
            end
            #args可传可不传，有默认值的
            opt_parser.parse!(args)
            options
          end  # parse()

        end  # class OptparseExample

        options = OptparseExample.parse(ARGV)
        pp options
        pp ARGV

