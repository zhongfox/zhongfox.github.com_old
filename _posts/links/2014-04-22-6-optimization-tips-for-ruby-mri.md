---
layout: link
category : link
link: http://www.igvita.com/2008/07/08/6-optimization-tips-for-ruby-mri/
title: 关于 MRI ruby 性能优化的6个小技巧
---

1. Minimize searches in the abstract syntax tree

2. Optimize for Ruby cache, avoid expensive lookups

   Ruby会缓存局部变量和方法签名，也就是局部变量和直接使用实例变量查找更廉价。而实例变量的读取器（方法）需要更多的AST查找

3. Interpolation over concatenation

   字符串内插更高效

4. When possible, use destructive operations!

   bang!( 改变自身)方法更高效，因为这不会要求复制自身。但是要注意bang!的返回值比较诡异，通常修改了就返回修改后的对象，否则返回nil

5. Symbol.to_proc fan? Use blocks!

6. Benchmark everything!

   有疑问，用性能测试说话！
