const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
const server = {
  account: require("../../../server/account.js"),
};
Page({
  data: {
    campusList: config.common.campus,
    list: [],
    nomore: false,
    page: 0
  },
  getUser: function () {
    server.account.getUsers({ page: this.data.page }).then(res => {
      let nomore = false;
      if (res.list.length < 20)
        nomore = true;
      this.setData({ list: this.data.list.concat(res.list), nomore: nomore })
      if (res.length == 0)
        this.data.page--;
      wx.stopPullDownRefresh()
    })
  },
  onLoad: function () {
    this.getUser();
  },
  onPullDownRefresh: function () {
    this.data.page = 0;
    this.data.list = [];
    this.getUser();
  },

  onReachBottom: function () {
    if (this.data.nomore) {
      return false
    }
    this.data.page++;
    this.getUser();
  }
})