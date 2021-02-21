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
    server.course.getNewCourseList().then(res => {
      this.setData({ list: res.list });
    })
  },
  deleteIt: function (e) {
    wx.showLoading({ title: '正在请求数据' })
    server.course.verifyDelete({
      _id: e.currentTarget.dataset.message._id
    }).then(() => {
      wx.showToast({ title: '成功' })
      wx.hideLoading();
      server.course.getNewCourseList().then(res => {
        this.setData({ list: res.list });
      })
    }).catch(util.common.catchFunc);
  },
  passIt: function (e) {
    wx.showLoading({ title: '正在请求数据' })
    server.course.verifyAdd({
      _id: e.currentTarget.dataset.message._id
    }).then(() => {
      wx.showToast({ title: '成功' })
      wx.hideLoading();
      server.course.getNewCourseList().then(res => {
        this.setData({ list: res.list });
      })
    }).catch(util.common.catchFunc);
  }
})