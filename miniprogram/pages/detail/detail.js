const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    first_title: true,
    cshow: false,
    commentValue:'',
    
  },
  onPullDownRefresh() {
    this.getPublish(this.data.id);
  },
  onLoad(e) {
     let that = this
    wx.getSystemInfo({
      success: function(res) {
        if(res.system.indexOf('Android')!=-1){
          that.setData({
            isAndroid: true
          })
        }
      },
    })
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
    this.setData({
      thisopenid: getApp().openid,
    })
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
    wx.stopPullDownRefresh();
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
  },
  showComment(){
    this.setData({
      cshow: true
    })
  },
  closeComment(){
    this.setData({
      cshow:false
    })
  },
  commentInput(e){
    this.setData({
      commentValue: e.detail.value
    })
  },
  commentPub(){
    if(this.data.commentValue.length==0){
      wx.showToast({
        title: '输入的内容不能为空',
      });
      return;
    }
    let that = this;
    wx.showLoading({
      title: '正在发布',
    })
    let dbn = '';
    if (this.data.func=='old'){
      dbn='oldgood'
    }
    else if (this.data.func=='ccomm'){
      dbn='ccomment'
    }
    else if (this.data.func=='losta'){
      dbn='lostfound'
    }
    wx.cloud.callFunction({
      name:"commentPublish",
      data:{
        dbn: dbn,
        comment:{
          creat: new Date().getTime(),
          userinfo:app.userinfo,
          value:that.data.commentValue
        },
        id:that.data.id
      },
      success: function (res){
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
        })
        that.setData({
          cshow:false,
          commentValue:''
        })
        
        that.getPublish(that.data.id);
      },
      fail: function (res){
        console.log(res);
        wx.hideLoading();
        wx.showToast({
          title: '发布失败',
          icon:'none'
        })
      }
    })
  },
  deleteit(e){
    let that = this
    wx.showModal({
      title: '提示',
      content: '确实要删除这条评论吗？',
      success(res){
        if(res.confirm){
          wx.showLoading({
            title: '正在删除',
          })
          let flag = -1;
          for(let i = 0; i< that.data.publishinfo.comment.length;i++){
            if(e.currentTarget.dataset.ord.creat==that.data.publishinfo.comment[i].creat){
              flag = i;
              break;
            }
          }
          if(flag == -1){
            console.log(flag)
            wx.hideLoading();
            wx.showToast({
              title: '删除失败',
              icon:'none'
            })
            return;
          }
          let arr = that.data.publishinfo.comment.splice(flag,1);
          let dbn = 0;
          if (that.data.func == 'old') {
            dbn = 0
          }
          else if (that.data.func == 'ccomm') {
            dbn = 1
          }
          else if (that.data.func == 'losta') {
            dbn = 2
          }
          wx.cloud.callFunction({
            name:"edititem",
            data:{
              _id:that.data.id,
              ndata:{
                comment:arr
              },
              tabid:dbn,
              operateid: 0
            },
            success(res){
              wx.hideLoading();
              wx.showToast({
                title: '删除成功'
              })
              that.setData({
                "publishinfo.comment":arr
              })
            },
            fail(res){
              wx.hideLoading();
              wx.showToast({
                title: '删除失败',
                icon:'none'
              })
            }

          })
        }
      }
    })
    
  }
})