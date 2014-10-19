------
layout: post
categories: [blog, javascript]
tags : [nodejs, sequelize, orm]
title: nodejs orm sequelize
---
{% include JB/setup %}

* `npm install --save sequelize@2.0.0-rc1 sequelize-cli mysql`

* `node_modules/.bin/sequelize init` 创建  `config/ migrations/ models/` 和 `models/index.js`(models的引入文件) `config/config.json`(数据库配置文件)

* model 的define 里自动会加上`createdAt`,`updatedAt`, 但是migration里要显示写上`createdAt`,`updatedAt`, model save时总是会带上, 如果migration里没有会报错

      Executing (default): INSERT INTO `Users` (`id`,`name`,`age`,`createdAt`,`updatedAt`) VALUES (DEFAULT,'zhongfox',12,'2014-10-16 08:40:48','2014-10-16 08:40:48');
      Possibly unhandled SequelizeBaseError

# 参考资料

* <http://sequelizejs.com/>
