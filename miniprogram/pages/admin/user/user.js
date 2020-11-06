const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {},
  getUser() {
    let that = this
    wx.cloud.database().collection('user').orderBy('stamp', 'desc').limit(20).get({
      success(res) {
        if (res.data.length == 20) {
          that.setData({
            nomore: false,
            page: 0,
            list: res.data
          })
        } else {
          that.setData({
            nomore: true,
            page: 0,
            list: res.data
          });
        }
        wx.stopPullDownRefresh();
      },
      fail(res) {
        console.log('fail', res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getUser();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getUser();
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
    wx.database().collection('user').orderBy('stamp', 'desc').skip(page * 20).limit(20).get({
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
  deleteit(e) {
    let that = this
    let id = e.currentTarget.dataset.ord._id
    wx.showModal({
      title: '提示',
      content: '您确实要删除该用户吗？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteUser',
            data: {
              id: id
            },
            success(res) {
              wx.hideLoading();
              wx.showToast({
                title: '已删除',
              })
              that.getUser();
            },
            fail(res) {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
              })
            }
          })
        }
      }
    })
  }
})