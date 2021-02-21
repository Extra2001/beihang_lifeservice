const app = getApp();
const config = require("../../config.js");
const util = {
  common: require("../../util/common.js")
};
Page({
  data: {
    messages: [],
    page: 0,
    nomore: false,
    loading: true
  },

  onLoad: function (options) {
    this.data.page = 0;
    this.getList();
  },

  onShow: function () {
    this.checkList();
    if (app.globalData.refresh.message) {
      app.globalData.refresh.message = false
      this.data.page = 0;
      this.getList();
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
    return {
      path: '/pages/course/list/index',
      imageUrl: '/images/share_post.png',
      title: "北航生活服务"
    }
  },
  getList: function () {
    wx.showNavigationBarLoading();
    wx.getStorage({
      key: 'messageCache',
      success: res => {
        this.setData({ messages: res.data, loading: false });
      }
    })
    wx.cloud.callFunction({
      name: "getMessages",
      data: { page: this.data.page },
      success: res => {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        if (this.data.page === 0) {
          this.setData({ messages: res.result.data })
          wx.setStorage({
            data: res.result.data,
            key: 'messageCache',
          })
        }
        else
          this.setData({ messages: this.data.messages.concat(res.result.data) })
        if (res.result.data.length < 100)
          this.setData({ nomore: true });
        if (this.data.page !== 0 && res.result.data.length === 0)
          this.data.page--;
        this.checkList();
        this.setData({ loading: false })
      },
      fail: util.common.catchFunc
    })
  },
  checkList: function () {
    let list = this.data.messages;
    if (list.findIndex(x => x.read == false) == -1)
      wx.hideTabBarRedDot({ index: 2 })
    else
      wx.showTabBarRedDot({ index: 2 })
  },
  detail: function (e) {
    this.markRead(e);
    let message = e.currentTarget.dataset.message
    if (message.serviceKind === 0)
      wx.navigateTo({ url: '/pages/oldgood/detail/detail?id=' + message.dbId })
    else if (message.serviceKind === 2)
      wx.navigateTo({ url: '/pages/course/detail/index?id=' + message.dbId })
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
      data: { _id: message._id, op: 1 },
      success: () => {
        this.checkList();
      }
    });
    let index = this.data.messages.findIndex(x => x._id == message._id);
    this.data.messages.splice(index, 1);
    this.setData({ messages: this.data.messages })
  },
  markAll: function (e) {
    wx.cloud.callFunction({
      name: "markRead",
      data: { op: 0 },
      success: () => {
        this.checkList();
      }
    });
    this.setData({
      messages: this.data.messages.map(item => {
        item.read = true;
        return item
      })
    });
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