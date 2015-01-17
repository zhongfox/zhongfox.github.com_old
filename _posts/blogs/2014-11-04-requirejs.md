---
layout: post
categories: [blog, javascript]
tags : [requirejs]
title: requirejs 笔记
---
{% include JB/setup %}

---

    <!--This sets the baseUrl to the "scripts" directory, and
    loads a script that will have a module ID of 'main'-->
    <script data-main="scripts/main.js" src="scripts/require.js"></script>

* `data-main`主文件应该是相对当前html文件的, 而不是src的require文件
* 默认`baseUrl` 将设置为和主文件所在的目录? 默认的baseUrl为包含RequireJS的那个HTML页面的所属目录?

---

### 参考资料

* http://www.cnblogs.com/snandy/archive/2012/05/22/2513652.html
* http://www.cnblogs.com/snandy/archive/2012/05/23/2513712.html
* http://www.oschina.net/translate/getting-started-with-the-requirejs-library
* http://www.requirejs.cn/
