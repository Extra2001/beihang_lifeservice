const app = getApp();
const config = require("../../config.js");
const server = {
  account: require("../../server/account.js"),
};
const util = {
  common: require("../../util/common.js")
};
Page({
  data: {
    email: "",
    emailLoading: false,
    showCountDown: false,
    countDown: 60,
    verificationCode: "",
    clientID: ""
  },

  sendEmail: function (e) {
    if (!this.data.email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }
    this.setData({ emailLoading: true, showCountDown: true });
    server.account.getEmailCode({ email: this.data.email + "@buaa.edu.cn" }).then(res => {
      this.setData({
        emailLoading: false,
        clientID: res.clientID
      });
      let interval = setInterval(() => {
        if (this.data.countDown <= 0) {
          clearInterval(interval);
          this.setData({
            countDown: 60,
            showCountDown: false
          });
        }
        else
          this.setData({ countDown: this.data.countDown - 1 });
      }, 1000)
    }).catch(e => {
      this.setData({ showCountDown: false, countDown: 60 });
      util.common.catchFunc(e);
    })
  },
  weChatInput: function (e) {
    this.data[e.currentTarget.dataset.prop] = e.detail.value;
    this.setData(this.data);
  },
  changeEmail: function () {
    wx.showLoading({ title: '正在请求数据' })
    server.account.changeEmail({
      clientID: this.data.clientID,
      code: this.data.verificationCode,
      email: this.data.email + "@buaa.edu.cn"
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '更改成功' });
      app.globalData.user.email = this.data.email + "@buaa.edu.cn"
      wx.navigateBack();
    }).catch(util.common.catchFunc);
  }
})