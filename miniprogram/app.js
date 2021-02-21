const config = require("./config.js");
const server = {
  account: require("./server/account.js")
};
const util = {
  common: require("./util/common.js")
};
let watch = null;
App({
  globalData: {
    systeminfo: {},
    // 描述登录状态 0为未登录 1为已登录
    loginStatus: 0,
    refresh: {
      oldgood: false,
      message: true,
      courseDetail: false
    },
    user: {}
  },
  canReflect: true,
  onLaunch: function () {
    this.checkUpdate();
    this.globalData.systeminfo = wx.getSystemInfoSync();
    this.login();
    wx.cloud.init({
      env: config.common.env,
      traceUser: true,
    })
  },
  login: function () {
    server.account.login().then(res => {
      this.globalData.user = res.user
      this.globalData.loginStatus = 1;
      watch = this.watchMessage();
    });
  },
  onHide: function () {
    if (watch)
      watch.close();
    watch = null;
  },
  onShow: function () {
    this.globalData.refresh.message = true;
    if (this.globalData.user.wechatOpenId)
      watch = this.watchMessage();
  },
  watchMessage: function () {
    return wx.cloud.database().collection('message').where({
      openid: this.globalData.user.wechatOpenId,
      read: false
    }).watch({
      onChange: res => {
        if (res.docs.length)
          wx.showTabBarRedDot({ index: 2 })
        else
          wx.hideTabBarRedDot({ index: 2 })
        if (res.type == 'init')
          return;
        let change = res.docChanges[0];
        if (change.dataType == "add") {
          let page = getCurrentPages().find(x => x.route == "pages/message/index");
          if (page) {
            page.data.page = 0;
            page.getList();
          }
          util.common.notify("您有新的消息")
        }
        this.globalData.refresh.message = true
      },
      onError: res => {
        console.error(res)
      }
    })
  },
  checkUpdate: function () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }
  }
})