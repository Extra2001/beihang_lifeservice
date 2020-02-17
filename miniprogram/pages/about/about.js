// pages/about/about.js
const config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    des: '本程序由原生小程序开发，数据存储等处理全部使用小程序云开发功能,无与腾讯外部服务器通信。\n\n本程序使用了@许坏在其Github上发布的源码，在这里特别感谢他能够开源自己的小程序，为我做学习之用。在二次开发的过程中我学到了很多很多关于小程序、html、css和Javascript的知识。\n\n开发此程序的初衷是为了解决北航的校内沟通渠道过少的问题，校园论坛没什么人用是因为不适配移动设备，然而开发一个原生App的成本过高，所以就想到了微信小程序，使用云开发也省去了维护服务器的烦恼。\n\n本人的水平比较菜，有些Bug也很正常，发现了请及时联系我反馈。\n\n下面附上源码作者的小程序码。'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (getApp().openid.length == 0) {
      wx.redirectTo({
        url: '/pages/start/start',
      })
    }
  },

  onReady: function() {

  },
  //复制
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: res => {
        wx.showToast({
          title: '复制' + e.currentTarget.dataset.name + '成功',
          icon: 'success',
          duration: 1000,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onPageScroll: function(e) {
    if (e.scrollTop < 0) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
})