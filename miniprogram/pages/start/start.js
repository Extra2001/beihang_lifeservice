const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  onLoad: function(option) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.getUserInfo({
      withCredentials: true,
      lang: '',
      success: function(res) {
        wx.cloud.callFunction({
          name: "login",
          success: function(res) {
            if (res.result.data.length == 0) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            } else {
              app.userinfo = res.result.data[0].info;
              app.openid = res.result.data[0]._openid;
              app.campus = res.result.data[0].campus;
            }
          }
        })
        wx.hideLoading()
        wx.switchTab({
          url: '/pages/index/index',
        })
      },
      fail: function(res) {
        wx.hideLoading()
      },
    })
  },
  getUserInfo(e) {
    let that = this;
    let test = e.detail.errMsg.indexOf("ok");
    if (test == '-1') {
      wx.showToast({
        title: '请授权后方可使用',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.cloud.callFunction({
        name: "login",
        success: function(res) {
          if (res.result.data.length == 0) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          } else {
            app.userinfo = res.result.data[0].info;
            app.openid = res.result.data[0]._openid;
            app.campus = res.result.data[0].campus;
            wx.showToast({
              title: '登录成功',
            })
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }
      })

    }
  }
})