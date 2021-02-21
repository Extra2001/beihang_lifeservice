const config = require("../config.js");
const db = wx.cloud.database({
  env: config.common.env
});

function getBanner() {
  return new Promise((resolve, reject) => {
    db.collection('banner').get({
      success: function (res) {
        resolve(res);
      },
      fail: function (e) {
        reject({
          errCode: 1,
          errMsg: "连接服务器失败",
          errData: e
        })
      }
    })
  })
}

module.exports = {
  getBanner: getBanner
}