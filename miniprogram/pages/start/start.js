const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    flag: false
  },
  onLoad: function(option) {
    var flag = false;
    if (option.scene != undefined) {
      flag = true;
      this.setData({
        id: e.scene,
        func: e.func,
        flag: true
      })
    }
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.removeStorage({
      key: 'oldgood',
      success: function(res) {},
    })
    wx.removeStorage({
      key: 'myoldgood',
      success: function(res) {},
    })
    wx.removeStorage({
      key: 'ccomment',
      success: function(res) {},
    })
    wx.removeStorage({
      key: 'myccomment',
      success: function(res) {},
    })
    wx.removeStorage({
      key: 'lostfound',
      success: function(res) {},
    })
    wx.removeStorage({
      key: 'mylostfound',
      success: function(res) {},
    })
    wx.getUserInfo({
      withCredentials: true,
      lang: '',
      success: function(res) {
        wx.cloud.callFunction({
          name: "login",
          success: function(res) {
            if (res.result.data.length == 0) {
              wx.hideLoading();
              wx.navigateTo({
                url: '/pages/login/login',
              })
            } else {
              app.userinfo = res.result.data[0].info;
              app.openid = res.result.data[0]._openid;
              app.campus = res.result.data[0].campus;
              wx.hideLoading()
              if (flag) {
                wx.switchTab({
                  url: '/pages/detail/detail?scene=' + that.data.id + '&func' + that.data.func,
                })
              } else {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            }
          }
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
      wx.showLoading({
        title: '登陆中',
      })
      wx.cloud.callFunction({
        name: "login",
        success: function(res) {
          if (res.result.data.length == 0) {
            wx.hideLoading();
            wx.navigateTo({
              url: '/pages/login/login',
            })
          } else {
            app.userinfo = res.result.data[0].info;
            app.openid = res.result.data[0]._openid;
            app.campus = res.result.data[0].campus;
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
            })
            if (that.data.flag) {
              wx.switchTab({
                url: '/pages/detail/detail?scene=' + that.data.id + '&func' + that.data.func,
              })
            } else {
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          }
        }
      })
    }
  }
})