const app = getApp();
const config = require("../../config.js");
const util = {
  cache: require("../../util/cache.js"),
  common: require("../../util/common.js")
};
Page({
  data: {
    messages: [],
    page: 0,
    nomore: false
  },

  onLoad: function (options) {
    this.data.page = 0;
    this.getList();
  },

  onShow: function () {
    this.checkList();
    if (app.globalData.refresh.message) {
      app.globalData.refresh.message = false
      wx.startPullDownRefresh()
    }
  },

  onPullDownRefresh: function () {
    this.data.page = 0;
    this.getList();
  },

  onReachBottom: function () {
    if (!this.data.nomore) {
      this.data.page++;
      this.getList();
    }
  },

  onShareAppMessage: function () {

  },
  getList: function () {
    wx.showNavigationBarLoading();
    wx.cloud.callFunction({
      name: "getMessages",
      data: { page: this.data.page },
      success: res => {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(this.data.page, res.result.data);
        if (this.data.page === 0)
          this.setData({ messages: res.result.data })
        else
          this.setData({ messages: this.data.messages.concat(res.result.data) })
        if (res.result.data.length < 100)
          this.setData({ nomore: true });
        if (this.data.page !== 0 && res.result.data.length === 0)
          this.data.page--;
        this.checkList();
      },
      fail: util.common.catchFunc
    })
  },
  checkList: function () {
    let list = this.data.messages;
    if (list.findIndex(x => x.read == false) == -1)
      wx.hideTabBarRedDot({ index: 1 })
    else
      wx.showTabBarRedDot({ index: 1 })
  },
  detail: function (e) {
    this.markRead(e);
    let message = e.currentTarget.dataset.message
    if (message.serviceKind === 0)
      wx.navigateTo({ url: '/pages/oldgood/detail/detail?id=' + message.dbId })
  },
  markRead: function (e) {
    let message = e.currentTarget.dataset.message
    wx.cloud.callFunction({
      name: "markRead",
      data: { _id: message._id, op: 0 }
    });
    this.data.messages.find(x => x._id == message._id).read = true;
    this.setData({ messages: this.data.messages })
    this.checkList();
  },
  deleteIt: function (e) {
    let message = e.currentTarget.dataset.message
    wx.cloud.callFunction({
      name: "markRead",
      data: { _id: message._id, op: 1 }
    });
    let index = this.data.messages.findIndex(x => x._id == message._id);
    this.data.messages.splice(index, 1);
    this.setData({ messages: this.data.messages })
    this.checkList();
  },
  markAll: function (e) {
    wx.cloud.callFunction({
      name: "markRead",
      data: { op: 0 }
    });
    this.setData({
      messages: this.data.messages.map(item => {
        item.read = true;
        return item
      })
    });
    this.checkList();
  },
  deleteAll: function (e) {
    wx.showModal({
      content: "是否要删除全部消息？",
      title: "提示",
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "markRead",
            data: { op: 1 }
          });
          this.setData({ messages: [] })
          this.checkList();
        }
      }
    })
  }
})