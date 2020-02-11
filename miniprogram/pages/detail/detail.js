const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    first_title: true,
  },
  onLoad(e) {
    if (e.func == "old") {
      this.setData({
        func: 'old',
        showBuy: true,
        showFound: false,
        showC: false,
      })
    } else if (e.func == "losta") {
      this.setData({
        func: 'losta',
        showBuy: false,
        showFound: true,
        showC: false,
      })
    } else if (e.func == "ccomm") {
      this.setData({
        func: 'ccomm',
        showBuy: false,
        showFound: false,
        showC: true,
      })
    }
    this.setData({
      id: e.scene
    })
    this.getPublish(e.scene);
  },
  //获取发布信息
  getPublish(e) {
    let that = this;
    if (this.data.func == 'old') {
      db.collection('oldgood').doc(e).get({
        success: function(res) {
          that.setData({
            publishinfo: res.data,
            userinfo: res.data.userinfo
          })
        }
      })
    } else if (this.data.func == 'ccomm') {
      db.collection('ccomment').doc(e).get({
        success: function(res) {
          that.setData({
            publishinfo: res.data,
            userinfo: res.data.userinfo
          })
        }
      })
    } else if (this.data.func == 'losta') {
      db.collection('lostfound').doc(e).get({
        success: function(res) {
          that.setData({
            publishinfo: res.data,
            userinfo: res.data.userinfo
          })
        }
      })
    }
  },
  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //提供卖家信息
  buy() {
    if (this.data.publishinfo.status != 0) {
      return
    }
    let that = this
    let arr = []
    let p = false;
    let q = false;
    let x = false;
    if (this.data.publishinfo.phone.length != 0) {
      arr.push("手机号：" + this.data.publishinfo.phone)
      p = true
    }
    if (this.data.publishinfo.qq.length != 0) {
      arr.push("QQ号：" + this.data.publishinfo.qq)
      q = true
    }
    if (this.data.publishinfo.goodinfo.xianyulink.length != 0) {
      arr.push("复制闲鱼链接")
      x = true
    }
    if (arr.length == 0) {
      wx.showToast({
        title: '无卖家信息',
        icon: 'none'
      })
      return
    }
    wx.showActionSheet({
      itemList: arr,
      success(res) {
        if (res.tapIndex == 0) {
          if (p) {
            wx.setClipboardData({
              data: that.data.publishinfo.phone
            })
            //复制手机号
          } else if (q) {
            wx.setClipboardData({
              data: that.data.publishinfo.qq
            })
            //QQ
          } else if (x) {
            wx.setClipboardData({
              data: that.data.publishinfo.goodinfo.xianyulink
            })
            //闲鱼
          }
        } else if (res.tapIndex == 1) {
          if (p) {
            if (q) {
              wx.setClipboardData({
                data: that.data.publishinfo.qq
              })
              //QQ
            } else if (x) {
              wx.setClipboardData({
                data: that.data.publishinfo.goodinfo.xianyulink
              })
              //闲鱼
            }
          } else if (q) {
            wx.setClipboardData({
              data: that.data.publishinfo.goodinfo.xianyulink
            })
            //闲鱼
          }

        } else if (res.tapIndex == 2) {
          wx.setClipboardData({
            data: that.data.publishinfo.goodinfo.xianyulink
          })
          //闲鱼
        }
      }
    })
  },
  found() {
    if (this.data.publishinfo.status != 0) {
      return
    }
    let that = this
    let arr = []
    let p = false;
    let q = false;
    if (this.data.publishinfo.lostinfo.phone.length != 0) {
      arr.push("手机号：" + this.data.publishinfo.lostinfo.phone)
      p = true
    }
    if (this.data.publishinfo.lostinfo.qq.length != 0) {
      arr.push("QQ号：" + this.data.publishinfo.lostinfo.qq)
      q = true
    }
    if (arr.length == 0) {
      wx.showToast({
        title: '无发布者信息',
        icon: 'none'
      })
      return
    }
    wx.showActionSheet({
      itemList: arr,
      success(res) {
        if (res.tapIndex == 0) {
          if (p) {
            wx.setClipboardData({
              data: that.data.publishinfo.lostinfo.phone
            })
            //复制手机号
          } else if (q) {
            wx.setClipboardData({
              data: that.data.publishinfo.lostinfo.qq
            })
            //QQ
          }
        } else if (res.tapIndex == 1) {

          if (q) {
            wx.setClipboardData({
              data: that.data.publishinfo.lostinfo.qq
            })
            //QQ
          }
        }
      }
    })
  },
  //路由
  go(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.go,
    })
  },
  onShareAppMessage() {
    return {
      title: '这本《' + this.data.bookinfo.title + '》只要￥' + this.data.publishinfo.price + '元，快来看看吧',
      path: '/pages/detail/detail?scene=' + this.data.publishinfo._id,
    }
  },
  //生成海报
  creatPoster() {
    let that = this;
    let pubInfo = {
      id: that.data.publishinfo._id,
      name: that.data.publishinfo.bookinfo.title,
      pic: that.data.publishinfo.bookinfo.pic.replace('http', 'https'),
      origin: that.data.publishinfo.bookinfo.price,
      now: that.data.publishinfo.price,
    }
    wx.navigateTo({
      url: "/pages/poster/poster?bookinfo=" + JSON.stringify(pubInfo)
    })
  },
  preview() {
    wx.previewImage({
      urls: this.data.publishinfo.img // 需要预览的图片http链接列表
    })
  }
})