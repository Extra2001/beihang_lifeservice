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
  campus: ['学院路校区', '沙河校区'],
  env: "bhls-product-8g4rg3z19bb9cc1e"
}

module.exports = {
  formTime: formTime,
  days: days,
  common: common,
  getKindNames: getKindNames
}