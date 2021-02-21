const app = getApp();
const config = require("../../../config.js");
const server = {
  account: require("../../../server/account.js"),
  course: require("../../../server/course.js")
};
const util = {
  common: require("../../../util/common.js")
};
Page({
  data: {
    list: []
  },

  onLoad: function (options) {
    server.course.getReportList().then(res => {
      this.setData({ list: res.list });
    })
  },
  recoverIt: function (e) {
    wx.showLoading({ title: '正在请求数据' })
    server.course.reportRecover({
      _id: e.currentTarget.dataset.message._id
    }).then(() => {
      wx.showToast({ title: '成功' })
      wx.hideLoading()
      server.course.getReportList().then(res => {
        this.setData({ list: res.list });
      })
    }).catch(util.common.catchFunc);
  }
})