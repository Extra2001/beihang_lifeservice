const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    nomore: false,
    tab: [{
        name: '二手商品',
        id: 0,
      },
      {
        name: '课程评价',
        id: 1,
      },
      {
        name: '失物招领',
        id: 2,
      },
    ],
    tabid: 0,
  },
  //导航栏切换
  changeTab(e) {
    let that = this;
    that.setData({
      tabid: e.currentTarget.dataset.id,
      list: []
    })
    let dbn = '';
    if (this.data.tabid == 0) {
      dbn = 'oldgood'
      this.setData({
        showPrice: true,
        showImg: true,
      })
    } else if (this.data.tabid == 1) {
      dbn = 'ccomment'
      this.setData({
        showPrice: false,
        showImg: false,
      })
    } else if (this.data.tabid == 2) {
      dbn = 'lostfound'
      this.setData({
        showPrice: false,
        showImg: true,
      })
    }
    wx.getStorage({
      key: 'my' + dbn,
      success: function(res) {
        if (res.data.length == 20) {
          that.setData({
            nomore: false,
            page: 0,
            list: res.data
          })
        } else if (res.data.length < 20) {
          that.setData({
            nomore: true,
            page: 0,
            list: res.data
          })
        }
      },
      fail() {
        that.getlist()
      }
    })
  },
  //跳转详情页
  godetail(e) {
    let dbn = '';
    if (this.data.tabid == 0) {
      dbn = 'old'
    } else if (this.data.tabid == 1) {
      dbn = 'ccomm'
    } else if (this.data.tabid == 2) {
      dbn = 'losta'
    }
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=' + dbn,
    })
  },
  onLoad() {
    if (getApp().openid.length == 0) {
      wx.switchTab({
        url: '/pages/start/start',
      })
    }
    let that = this
    this.setData({
      showPrice: true,
      showImg: true,
      tabid: 0,
    })
    wx.getStorage({
      key: 'myoldgood',
      success: function(res) {
        if (res.data.length == 20) {
          that.setData({
            nomore: false,
            page: 0,
            list: res.data
          })
        } else if (res.data.length < 20) {
          that.setData({
            nomore: true,
            page: 0,
            list: res.data
          })
        }
      },
      fail() {
        that.getlist()
      }
    })
  },
  //获取列表
  getlist() {
    let that = this;
    let dbn = '';
    if (this.data.tabid == 0) {
      dbn = 'oldgood'
    } else if (this.data.tabid == 1) {
      dbn = 'ccomment'
    } else if (this.data.tabid == 2) {
      dbn = 'lostfound'
    }
    db.collection(dbn).where({
      _openid: app.openid
    }).orderBy('creat', 'desc').limit(20).get({
      success(re) {
        wx.stopPullDownRefresh(); //暂停刷新动作
        if (re.data.length == 0) {
          that.setData({
            nomore: true,
            page: 0,
            list: re.data
          })
          wx.removeStorage({
            key: 'my' + dbn,
            success: function(res) {},
          })
        } else if (re.data.length == 20) {
          that.setData({
            nomore: false,
            page: 0,
            list: re.data
          })
          wx.setStorage({
            key: 'my' + dbn,
            data: re.data,
          })
        } else if (re.data.length < 20) {
          that.setData({
            nomore: true,
            page: 0,
            list: re.data
          })
        }
        wx.setStorage({
          key: 'my' + dbn,
          data: re.data,
        })
      }
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getlist();
  },

  //删除订单
  deleteit(e) {
    let that = this;
    let detail = e.currentTarget.dataset.ord;
    wx.showModal({
      title: '提示',
      content: '您确实要删除此条目吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          wx.cloud.deleteFile({
            fileList: detail.img,
            success: res => {
              // handle success
            },
            fail: console.error
          })
          wx.cloud.callFunction({
            name: "edititem",
            data: {
              _id: detail._id,
              tabid: that.data.tabid,
              operateid: 1 //0为更新1为删除
            },
            success(res) {
              wx.hideLoading()
              that.getlist()
              wx.showToast({
                title: '已删除',
              })
            },
            fail(res) {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  soldout(e) {
    let that = this;
    let detail = e.currentTarget.dataset.ord;
    wx.showModal({
      title: '提示',
      content: '您确实要设置为已售出吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在设置',
          })
          wx.cloud.callFunction({
            name: "edititem",
            data: {
              _id: detail._id,
              tabid: that.data.tabid,
              ndata: {
                status: 1
              }, //0未售出1已售出2已下架
              operateid: 0 //0为更新1为删除
            },
            success(res) {
              wx.hideLoading()
              that.getlist()
              wx.showToast({
                title: '设置成功',
              })
            },
            fail(res) {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '设置失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  foundit(e) {
    let that = this;
    let detail = e.currentTarget.dataset.ord;
    wx.showModal({
      title: '提示',
      content: '您确认要设置为已找到吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在设置',
          })
          wx.cloud.callFunction({
            name: "edititem",
            data: {
              _id: detail._id,
              tabid: that.data.tabid,
              ndata: {
                status: 1
              }, //0未找到1已找到
              operateid: 0 //0为更新1为删除
            },
            success(res) {
              wx.hideLoading()
              that.getlist()
              wx.showToast({
                title: '设置成功',
              })
            },
            fail(res) {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '设置失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  nofoundit(e) {
    let that = this;
    let detail = e.currentTarget.dataset.ord;
    wx.showModal({
      title: '提示',
      content: '您确认要设置为未找到吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在设置',
          })
          wx.cloud.callFunction({
            name: "edititem",
            data: {
              _id: detail._id,
              tabid: that.data.tabid,
              ndata: {
                status: 0
              }, //0未找到1已找到
              operateid: 0 //0为更新1为删除
            },
            success(res) {
              wx.hideLoading()
              that.getlist()
              wx.showToast({
                title: '设置成功',
              })
            },
            fail(res) {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '设置失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  refresh(e) {
    let that = this;
    let detail = e.currentTarget.dataset.ord;
    wx.showLoading({
      title: '正在擦亮',
    })
    wx.cloud.callFunction({
      name: "edititem",
      data: {
        _id: detail._id,
        tabid: that.data.tabid,
        ndata: {
          creat: new Date().getTime(),
          dura: new Date().getTime() + 7 * (24 * 60 * 60 * 1000), //每次擦亮管7天
        },
        operateid: 0 //0为更新1为删除
      },
      success(res) {
        wx.hideLoading()
        that.getlist()
        wx.showToast({
          title: '已擦亮',
        })
      },
      fail(res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '擦亮失败',
          icon: 'none'
        })
      }
    })
  },
  //至顶
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  //监测屏幕滚动
  onPageScroll: function(e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
  },
  onReachBottom() {
    this.more();
  },
  //加载更多
  more() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1;
    let dbn = '';
    if (this.data.tabid == 0) {
      dbn = 'oldgood'
    } else if (this.data.tabid == 1) {
      dbn = 'ccomment'
    } else if (this.data.tabid == 2) {
      dbn = 'lostfound'
    }
    db.collection(dbn).where({
      _openid: app.openid
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
  },
})