const app = getApp();
const config = require("../../../config.js");
const server = {
  account: require("../../../server/account.js"),
  data: require("../../../server/data.js"),
  notice: require("../../../server/notice.js"),
  oldgood: require("../../../server/oldgood.js"),
  comment: require("../../../server/comment.js"),
};
const util = {
  cache: require("../../../util/cache.js"),
  common: require("../../../util/common.js")
};
Page({
  data: {
    _id: "",
    place: "你想对卖家说：\n仅对方可见。请留下联系方式。\n同时将以电子邮件的形式通知对方",
    campusList: config.common.campus,
    commentPublishOptions: {
      showCommentPublish: false,
      isFocus: false,
      placeholder: "",
      loading: false,
      autosized: {
        minHeight: 100,
        maxHeight: 200,
      },
      commentValue: "",
      isReply: false,
      currentCommentId: "",
      toUserId: ""
    },
    publish: {},
    comments: [],
    ShowIWant: false
  },
  onLoad: function (options) {
    util.common.checkLogin({
      fail: () => { wx.navigateBack() }
    });
    this.data.commentPublishOptions.autosized.minHeight = 100 / 750 * app.globalData.systeminfo.windowWidth;
    this.data.commentPublishOptions.autosized.maxHeight = 350 / 750 * app.globalData.systeminfo.windowWidth;
    this.data._id = options.id;
    this.getGoodInfo();
    this.getComments();
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onPullDownRefresh: function () {
    this.getComments();
  },
  onShareAppMessage: function () {

  },
  getGoodInfo: function () {
    server.oldgood.getOne({
      _id: this.data._id
    }).then(res => {
      this.setData({ publish: res });
      this.setSwiperHeight(res.goodInfo.img[0]);
    }).catch(util.common.catchFunc);
  },
  // 设置到剪贴板
  setClipBoard: function (e) {
    let data = {
      content: e.content,
      name: e.name
    }
    if (e.currentTarget)
      data = {
        content: e.currentTarget.dataset.content,
        name: e.currentTarget.dataset.name
      }
    wx.setClipboardData({
      data: data.content,
      success: function () {
        wx.showToast({ title: `已复制${data.name}` });
      }
    });
  },
  // 显示卖家信息按钮
  buy: function () {
    let that = this
    let actionSheetArray = [];
    let data = [];
    if (this.data.publish.goodInfo.phone) {
      actionSheetArray.push("手机号：" + this.data.publish.goodInfo.phone)
      data.push({
        content: this.data.publish.goodInfo.phone,
        name: "手机号"
      });
    }
    if (this.data.publish.goodInfo.qq) {
      actionSheetArray.push("QQ号：" + this.data.publish.goodInfo.qq)
      data.push({
        content: this.data.publish.goodInfo.qq,
        name: "QQ号"
      });
    }
    if (this.data.publish.goodInfo.xianyulink) {
      actionSheetArray.push("复制闲鱼链接")
      data.push({
        content: this.data.publish.goodInfo.xianyulink,
        name: "闲鱼链接"
      });
    }
    if (actionSheetArray.length == 0) {
      wx.showToast({
        title: '卖家未提供联系方式',
        icon: 'none'
      });
      return;
    }
    actionSheetArray.push("通过小程序发送！")
    wx.showActionSheet({
      itemList: actionSheetArray,
      success: function (res) {
        if (res.tapIndex < actionSheetArray.length - 1)
          that.setClipBoard(data[res.tapIndex]);
        else {
          that.setData({
            isFocus: true,
            ShowIWant: true
          });
        }
      }
    })
  },
  // 预览图片
  preview: function (e) {
    let that = this;
    wx.previewImage({
      urls: that.data.publish.goodInfo.img,
      current: e.currentTarget.dataset.img
    });
  },
  // 轮播图改变触发
  swiperChange: function (e) {
    this.setSwiperHeight(this.data.publish.goodInfo.img[e.detail.current])
  },
  // 设置轮播图高度
  setSwiperHeight: function (image) {
    let that = this;
    wx.getImageInfo({
      src: image,
      success: function (res) {
        let swiperH = res.height / res.width * 650;
        that.setData({ swiperHeight: swiperH });
      }
    });
  },
  // 关闭发表评论
  closeCommentPub: function () {
    if (!this.data.loading)
      this.setData({ "commentPublishOptions.showCommentPublish": false, ShowIWant: false });
  },
  // 发表评论框
  showCommentPublish: function () {
    this.data.commentPublishOptions.isReply = false;
    this.setData({ loading: false });
    this.setData({
      "commentPublishOptions.showCommentPublish": true,
      "commentPublishOptions.isFocus": true,
      "commentPublishOptions.placeholder": "在此处添加您的留言："
    })
  },
  // 输入评论处理程序
  commentInput: function (e) {
    this.setData({ "commentPublishOptions.commentValue": e.detail.value })
  },
  IWantMessageInput: function (e) {
    this.setData({ "IWantMessage": e.detail.value })
  },
  // 发表评论
  commentPub: function () {
    if (!this.data.commentPublishOptions.commentValue) {
      wx.showToast({ title: '评论不能为空', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    let callBack = () => {
      this.setData({
        "commentPublishOptions.commentValue": "",
        "commentPublishOptions.showCommentPublish": false,
      });
      wx.hideLoading();
      this.setData({ loading: false });
      this.getComments();
    };
    let data = {
      value: this.data.commentPublishOptions.commentValue,
      dbId: this.data.publish._id,
      serviceKind: 0
    }
    if (this.data.commentPublishOptions.isReply) {
      data.commentId = this.data.commentPublishOptions.currentCommentId;
      data.replyOpenid = this.data.commentPublishOptions.toUserId
      server.comment.reply(data).then(callBack).catch(util.common.catchFunc);
    } else
      server.comment.publish(data).then(callBack).catch(util.common.catchFunc);
  },
  // 点击回复评论
  commentTap: function (e) {
    let dataset = e.currentTarget.dataset;
    this.data.commentPublishOptions.isReply = true;
    this.data.commentPublishOptions.toUserId = dataset.comment.openid;
    if (dataset.parent)
      this.data.commentPublishOptions.currentCommentId = dataset.parent._id;
    else
      this.data.commentPublishOptions.currentCommentId = dataset.comment._id;
    this.setData({ loading: false });
    this.setData({
      "commentPublishOptions.showCommentPublish": true,
      "commentPublishOptions.isFocus": true,
      "commentPublishOptions.placeholder": `回复给${dataset.comment.userInfo.nickName}：`
    });
  },
  getComments: function () {
    wx.showNavigationBarLoading();
    server.comment.get({
      dbId: this.data._id,
      serviceKind: 0
    }).then(res => {
      this.setData({ comments: res.comments });
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }).catch(util.common.catchFunc);
  },
  IWant: function () {
    if (!this.data.IWantMessage) {
      wx.showToast({ title: '信息不能为空', icon: 'none' })
      return;
    }
    this.setData({ loading: true });
    server.oldgood.iWant({
      _id: this.data._id,
      message: this.data.IWantMessage
    }).then(() => {
      wx.hideLoading()
      this.setData({ loading: false });
      this.setData({ ShowIWant: false, IWantMessage: "" });
      util.common.notify("已通过小程序提醒卖家");
    }).catch(util.common.catchFunc);
  }
})