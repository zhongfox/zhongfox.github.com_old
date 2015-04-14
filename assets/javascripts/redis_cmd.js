var trTexts = [
  '添加成员(目标需要存在)',
  '添加成员(目标需要不存在)',
  '添加成员(目标如果不存在则先创建)',
  '个数',
  '通过index/key求value',
  '通过value求key/index',
  '获得所有keys',
  '获得所有values',
  '获得所有成员',
  '插入成员',
  '通过索引设置成员',
  '通过索引保留',
  '删除成员',
  '成员是否存在',
  '增减成员',
  '弹出',
  '原子移动',
  '集合操作',
  '位运算',
  '',
];
var redisObj = {
  String: {
    '添加成员(目标需要存在)': [
      'SET k v XX',
      'SET 带 XX参数'
    ],
    '添加成员(目标需要不存在)': [
      'SET k v NX <br/> SETNX k v',
      '二者效果等同， 建议使用前者， 后者之后可能去掉<br/> MSETNX k v [k v ...] 当且仅当所有给定k都不存在（原子）'
    ],
    '添加成员(目标如果不存在则先创建)': [
      'SET<br/>APPEND k v',
      'SET k v [EX seconds] [PX milliseconds] [NX|XX]<br/>' +
      '如果 k 已经持有其他值， SET 就覆写旧值，无视类型<br/>' +
      '对于某个原本带有生存时间（TTL）的键来说，当SET命令成功在这个键上执行时，这个键原有的TTL将被清除<br/>' +
      'MSET k v [k v ...] 覆盖旧值<br/>' +
      'SETEX k seconds v 顺带设置过期时间<br/>' +
      'PSETEX k milliseconds v 顺带设置过期时间<br/>' +
      'APPEND k v'
    ],
    '个数': [
      'STRLEN k<br/>BITCOUNT k [start] [end]',
      'STRLEN k<br/>' +
      'BITCOUNT k [start] [end] bit位为1的个数'
    ],
    '通过index/key求value': [
      'GETBIT k offset<br>GETRANGE k start end'
    ],
    '获得所有values': [
      'GET k<br/>MGET k [k ...]'
    ],
    '通过索引设置成员': [
      'SETBIT k offset v<br/>SETRANGE k offset v',
      '旧值会被覆盖'
    ],
    '增减成员': [
     'DECR k<br/>DECRBY k decrement<br/>INCR k<br/>INCRBY k increment<br/>INCRBYFLOAT k increment',
      '不存在会创建<br/>' +
      'DECR k 减一<br/>' +
      'DECRBY k decrement 减整数值<br/>' +
      'INCR k 加一<br/>' +
      'INCRBY k increment 增整数值<br/>' +
      'INCRBYFLOAT k increment 增浮点值'
    ],
  },
  'Hash': {
    '添加成员(目标需要不存在)': [
      'HSETNX k field v',
      'field需要不存在'
    ],
    '添加成员(目标如果不存在则先创建)': [
      'HSET k field v<br/>HMSET k field v [field v...]',
      '会覆盖哈希表中已存在的域'
    ],
    '个数': [
      'HLEN k'
    ],
    '通过index/key求value': [
      'HGET k field'
    ],
    '获得所有keys': [
      'HKEYS k'
    ],
    '获得所有values': [
      'HVALS k'
    ],
    '获得所有成员': [
      'HGETALL key'
    ],
    '删除成员': [
      'HDEL k field [field ...]',
      'HDEL k field [field ...] 不存在的field忽略'
    ],
    '成员是否存在': [
      'HEXISTS k field'
    ],
    '增减成员': [
      'HINCRBY k field increment<br/>HINCRBYFLOAT k field increment',
      '不存在会创建<br/>' +
      '如果 key 不存在，一个新的哈希表被创建并执行<br/>' +
      '如果域 field 不存在，那么在执行命令前，域的值被初始化为 0'
    ],
    // '': [
    //   '',
    //   ''
    // ],
    //
  
  }


};

var redisTable = $('#redis_table tbody');
var tdSpan;
var typeObj;
var content = '';

for (var i = 0, iLen = trTexts.length; i < iLen; i++) {
  redisTable.append('<tr><td class="name">' + trTexts[i] +
                    '</td><td class="String"><span></span></td>' +
                    '<td class="Hash"><span></span></td>' + 
                    '<td class="List"><span></span></td>' + 
                    '<td class="Set"><span></span></td>' + 
                    '<td class="Zset"><span></span></td></tr>');
}

for (var type in redisObj) {
  if (!redisObj.hasOwnProperty(type)) return;
  typeObj = redisObj[type];
  for (var action in typeObj) {
    if (!typeObj.hasOwnProperty(action)) return;
    tdSpan = redisTable.find('tr:contains(' + action + ')').find('td.' + type).find('span');
    tdSpan.html(typeObj[action][0]);
    content = typeObj[action][1] ? '<br/><br/>' + typeObj[action][1] : '';
    tdSpan.attr('title', typeObj[action][0] + content);
    tdSpan.tooltip({html: true, placement: 'bottom' });
  }
}
