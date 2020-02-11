const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: -1,
    studentcard: "",
    campus: JSON.parse(config.data).campus,
  },
  choose(e) {
    let that = this;
    that.setData({
      ids: e.detail.value
    })
    //下面这种办法无法修改页面数据
    /* this.data.ids = e.detail.value;*/
  },

  //获取校园卡号
  xkInput(e) {
    this.data.studentcard = e.detail.value;
  },
  //获取用户信息
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

      that.setData({
        userInfo: e.detail.userInfo
      })
      that.check();
    }
  },
  //校检
  check() {
    let that = this;
    //校检校区
    let ids = that.data.ids;
    let campus = that.data.campus;
    if (ids == -1) {
      wx.showToast({
        title: '请选择您所在的校区',
        icon: 'none',
        duration: 2000
      });
    }
    //校检校园卡
    let stucard = that.data.studentcard
    if (stucard.length > 8 || stucard.length < 8) {
      wx.showToast({
        title: '请输入正确的校园卡号',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    wx.showLoading({
      title: '正在提交',
    })
    wx.cloud.callFunction({
      name: "register",
      data: {
        campus: that.data.campus[that.data.ids],
        stamp: new Date().getTime(),
        info: that.data.userInfo,
        useful: true,
        parse: 0,
        studentcard: stucard
      },
      success: function(res) {
        if (res.result == 1) {
          wx.hideLoading();
          wx.showToast({
            title: '该微信已被注册',
            icon: 'none'
          })
        } else if (res.result == 2) {
          wx.hideLoading();
          wx.showToast({
            title: '该校园卡已被注册',
            icon: 'none'
          })
        } else if (res.result == 5) {
          wx.hideLoading();
          wx.showToast({
            title: '系统出错，请稍后再试',
            icon: 'none'
          })
        } else {
          app.userinfo = res.result.info;
          app.openid = res.result._openid;
          app.campus = res.result.campus;
          wx.showToast({
            title: '注册成功',
          })
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      },
      fail() {
        wx.hideLoading()
        wx.showToast({
          title: '注册失败，请重新提交',
          icon: 'none',
        })
      }
    })
  },
})