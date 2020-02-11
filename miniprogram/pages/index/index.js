const app = getApp()
const db = wx.cloud.database({
  env: 'studentinfo-0a2885'
});
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    tabon: 0,
    showImg: true,
    showPrice: true,
    showC:false,
    scrollTop: 0,
    nomore: false,
    list: [],
  },
  onLoad() {
    this.getbanner();
    this.getList();
  },
  //监测屏幕滚动
  onPageScroll: function(e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
  },
  //跳转搜索
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  getList() {
    let that = this;
    if (this.data.tabon == 0) {
      db.collection('oldgood').where({
        status: 0,
        dura: _.gt(new Date().getTime()),
      }).orderBy('creat', 'desc').limit(20).get({
        success: function(res) {
          wx.stopPullDownRefresh(); //暂停刷新动作
          if (res.data.length == 0) {
            that.setData({
              nomore: true,
              list: [],
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true,
              page: 0,
              list: res.data,
            })
            wx.setStorage({
              key: 'oldgood',
              data: res.data,
            })
          } else {
            that.setData({
              page: 0,
              list: res.data,
              nomore: false,
            })
            wx.setStorage({
              key: 'oldgood',
              data: res.data,
            })
          }
        }
      })
    } else if (this.data.tabon == 1) {
      db.collection('ccomment').where({}).orderBy('creat', 'desc').limit(20).get({
        success: function(res) {
          wx.stopPullDownRefresh(); //暂停刷新动作
          if (res.data.length == 0) {
            that.setData({
              nomore: true,
              list: [],
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true,
              page: 0,
              list: res.data,

            })
            wx.setStorage({
              key: 'ccomment',
              data: res.data,
            })
          } else {
            that.setData({
              page: 0,
              list: res.data,
              nomore: false,
            })
            wx.setStorage({
              key: 'ccomment',
              data: res.data,
            })
          }
        }
      })
    } else if (this.data.tabon == 2) {
      db.collection('lostfound').where({}).orderBy('creat', 'desc').limit(20).get({
        success: function(res) {
          wx.stopPullDownRefresh(); //暂停刷新动作
          if (res.data.length == 0) {
            that.setData({
              nomore: true,
              list: [],
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true,
              page: 0,
              list: res.data,
            })
            wx.setStorage({
              key: 'lostfound',
              data: res.data,
            })
          } else {
            that.setData({
              page: 0,
              list: res.data,
              nomore: false,
            })
            wx.setStorage({
              key: 'lostfound',
              data: res.data,
            })
          }
        }
      })
    }
    wx.stopPullDownRefresh(); //暂停刷新动作
  },
  more() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1;
    if (that.data.tabon == 0) {
      db.collection('oldgood').where({
        status: 0,
        dura: _.gt(new Date().getTime()),
      }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
        success: function(res) {
          if (res.data.length == 0) {
            that.setData({
              nomore: true
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true
            })
          }
          that.setData({
            page: page,
            list: that.data.list.concat(res.data)
          })
        },
        fail() {
          wx.showToast({
            title: '获取失败',
            icon: 'none'
          })
        }
      })
    } else if (that.data.tabon == 1) {
      db.collection('ccomment').where({}).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
        success: function(res) {
          if (res.data.length == 0) {
            that.setData({
              nomore: true
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true
            })
          }
          that.setData({
            page: page,
            list: that.data.list.concat(res.data)
          })
        },
        fail() {
          wx.showToast({
            title: '获取失败',
            icon: 'none'
          })
        }
      })
    } else if (that.data.tabon == 2) {
      db.collection('lostfound').where({}).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
        success: function(res) {
          if (res.data.length == 0) {
            that.setData({
              nomore: true
            })
            return false;
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true
            })
          }
          that.setData({
            page: page,
            list: that.data.list.concat(res.data)
          })
        },
        fail() {
          wx.showToast({
            title: '获取失败',
            icon: 'none'
          })
        }
      })
    }
  },
  //切换至课程评价
  ccomment() {
    this.setData({
      tabon: 1,
      list: [],
      showImg: false,
      showPrice: false,
      showC:true
    })
    let that = this;
    wx.getStorage({
      key: 'ccomment',
      success: function(res) {
        that.setData({
          list: res.data
        })
      },
      fail() {
        that.getList()
      }
    })
  },
  oldgoods() {
    this.setData({
      list: [],
      tabon: 0,
      showImg: true,
      showPrice: true,
      showC:false,
    })
    let that = this;
    wx.getStorage({
      key: 'oldgood',
      success: function(res) {
        that.setData({
          list: res.data
        })
      },
      fail() {
        that.getList()
      }
    })
  },
  lostfound() {
    this.setData({
      list: [],
      tabon: 2,
      showImg: true,
      showPrice: false,
      showC:false,
    })
    let that = this;
    wx.getStorage({
      key: 'lostfound',
      success: function(res) {
        that.setData({
          list: res.data
        })
      },
      fail() {
        that.getList()
      }
    })
  },
  onReachBottom() {
    this.more();
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getList();
  },
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  //跳转详情
  detail(e) {
    let that = this;
    if (that.data.tabon == 0) {
      wx.navigateTo({
        url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=old',
      })
    } else if (that.data.tabon == 1) {
      wx.navigateTo({
        url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=ccomm',
      })
    } else if (that.data.tabon == 2) {
      wx.navigateTo({
        url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=losta',
      })
    }

  },
  //获取轮播
  getbanner() {
    let that = this;
    wx.cloud.database().collection('banner').get({
      success: function(res) {
        that.setData({
          banner: res.data
        })
      }
    })
  },
  comming() {
    wx.showToast({
      title: '敬请期待',
      icon: 'none'
    })
  },
  //跳转轮播链接
  goweb(e) {
    if (e.currentTarget.dataset.web.url.length == 0) {
      return
    } else if (e.currentTarget.dataset.web.url.indexOf('/') == 0) {
      wx.switchTab({
        url: e.currentTarget.dataset.web.url,
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + e.currentTarget.dataset.web.url,
      })
    }
  },
  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start'
    }
  },

})