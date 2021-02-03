var data = {
  //云开发环境id
  env: 'bhls-develop-6g0a6u08b92b9a28',
  //分享配置
  share_title: '北航生活服务-二手、课程评价、拾物、寻物',
  share_img: '/images/poster.png', //可以是网络地址，本地文件路径要填绝对位置
  share_poster: 'https://mmbiz.qpic.cn/mmbiz_jpg/nJPznPUZbhpA064Cl78xxvzBYTDa6O1Kl7RY1K6TerBaXcUf5AoN6x7s8q7xHgeu0Cl5qarPzE6ibbQZasWRErg/640', //必须为网络地址
  //客服联系方式
  kefu: {
    weixin: 'jxtmailweixin',
    qq: '782776342',
    gzh: 'https://mmbiz.qpic.cn/mmbiz_png/nJPznPUZbhpKCwnibUUqnt7BQXr3MbNsasCfsBd0ATY8udkWPUtWjBTtiaaib6rTREWHnPYNVRZYgAesG9yjYOG7Q/640', //公众号二维码必须为网络地址
    phone: '' //如果你不设置电话客服，就留空
  },
  //默认启动页背景图，防止请求失败完全空白 
  //可以是网络地址，本地文件路径要填绝对位置
  bgurl: '/images/startBg.jpg',
  //校区
  campus: [{
    name: '学院路校区',
    id: 0
  },
  {
    name: '沙河校区',
    id: 1
  },
  ],
  //配置学院，建议不要添加太多，不然前端不好看
  college: [{
    name: '通用',
    id: -1
  },
  {
    name: '机械',
    id: 0
  },
  {
    name: '经管',
    id: 1
  },
  {
    name: '土木',
    id: 2
  },
  {
    name: '新闻',
    id: 3
  },
  {
    name: '数统',
    id: 4
  },
  {
    name: '物理',
    id: 5
  },
  {
    name: '化工',
    id: 6
  },
  {
    name: '生物',
    id: 7
  },
  {
    name: '电气',
    id: 8
  },
  {
    name: '机械',
    id: 9
  },
  {
    name: '动力',
    id: 10
  },
  {
    name: '资环',
    id: 11
  },
  {
    name: '材料',
    id: 12
  },
  {
    name: '建筑',
    id: 13
  },
  {
    name: '其它',
    id: 14
  },
  ],
}
//下面的就别动了
function formTime(creatTime) {
  let date = new Date(creatTime),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds();
  if (M < 10) {
    M = '0' + M;
  }
  if (D < 10) {
    D = '0' + D;
  }
  if (H < 10) {
    H = '0' + H;
  }
  if (m < 10) {
    m = '0' + m;
  }
  if (s < 10) {
    s = '0' + s;
  }
  return Y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s;
}

function days() {
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  let date = year + "" + month + day;
  return date;
}
function getKindNames() {
  let list = [];
  for (let i = 0; i < common.kinds.length; i++)
    list.push(common.kinds[i].name);
  return list;
}

let common = {
  kinds: [
    { name: "数码设备", id: 0 },
    { name: "宿舍用品", id: 1 },
    { name: "生活百货", id: 2 },
    { name: "运动健身", id: 3 },
    { name: "家用电器", id: 4 },
    { name: "游戏装备", id: 5 },
    { name: "衣物", id: 6 },
    { name: "箱包", id: 7 },
    { name: "技能服务", id: 8 },
    { name: "门票", id: 9 },
  ],
  campus: ['学院路校区', '沙河校区']
}

module.exports = {
  data: JSON.stringify(data),
  formTime: formTime,
  days: days,
  common: common,
  getKindNames: getKindNames
}