const app = getApp();
const config = require("../../config.js");
Page({
  data: {
    showShare: false,
    poster: JSON.parse(config.data).share_poster,
  },
  onLoad() {
    if (getApp().openid.length == 0) {
      wx.redirectTo({
        url: '/pages/start/start',
      })
    }
  },
  //切换校区
  changeCampus(e) {
    let that = this
    wx.showActionSheet({
      itemList: [
        "学院路校区",
        "沙河校区"
      ],
      success(res) {
        if (res.tapIndex == 0) { //学院路校区
          wx.cloud.callFunction({
            name: "changecampus",
            data: {
              campus: {
                "id": 0,
                "name": "学院路校区"
              }
            },
            success(res) {
              app.campus = {
                "id": 0,
                "name": "学院路校区"
              };
              that.setData({
                currcampus: "学院路校区"
              })
            }
          })
        } else {
          wx.cloud.callFunction({
            name: "changecampus",
            data: {
              campus: {
                "id": 1,
                "name": "沙河校区"
              }
            },
            success(res) {
              app.campus = {
                "id": 1,
                "name": "沙河校区"
              };
              that.setData({
                currcampus: "沙河校区"
              })
            }
          })
        }
      }
    })
  },
  onShow() {
    this.setData({
      userinfo: app.userinfo,
      currcampus: app.campus.name,
      openid: app.openid
    })
  },
  //跳转方法
  go(e) {
    if (e.currentTarget.dataset.status == '1') {
      if (!app.openid) {
        wx.showModal({
          title: '温馨提示',
          content: '该功能需要注册方可使用，是否马上去注册',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            }
          }
        })
        return false
      }
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.go
    })
  },

  //展示分享弹窗
  showShare() {
    this.setData({
      showShare: true
    });
  },
  //关闭弹窗
  closePop() {
    this.setData({
      showShare: false,
    });
  },
  //预览图片
  preview(e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.link.split(",")
    });
  },
  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start'
    }

  },
  cleartmp() {
    wx.showModal({
      title: '提示',
      content: '您确实要清空缓存数据吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在清理',
          })
          wx.removeStorage({
            key: 'iscard',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'oldgood',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'ccomment',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'lostfound',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'myoldgood',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'myccomment',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'mylostfound',
            success: function(res) {},
          })
          wx.removeStorage({
            key: 'history',
            success: function(res) {},
          })
          wx.hideLoading()
          wx.showToast({
            title: '清除完成',
          })
        }
      }
    })
  },
  clearAcc(){
    wx.showModal({
      title: '提示',
      content: '您真的想要清除账号内容并退出吗？该操作不可逆。',
      success(res){
        if(res.confirm){
          wx.showModal({
            title: '再次确认',
            content: '确实要删除账号吗？',
            success(e){
              if(e.confirm){
                wx.showLoading({
                  title: '正在删除',
                })
                wx.cloud.callFunction({
                  name:"clearUser",
                  data:{
                    openid:app.openid
                  },
                  success(res){
                    console.log(res)
                    wx.hideLoading()
                    wx.showToast({
                      title: '已清除数据',
                    }),
                    app.campus =''
                    app.userinfo=''
                    app.openid=''
                    wx.redirectTo({
                      url: '/pages/start/start',
                    })
                  },
                  fail(res){
                    console.log(res)
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})