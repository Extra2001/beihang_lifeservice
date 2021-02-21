const app = getApp();
const config = require("../../../config.js");
const server = {
  account: require("../../../server/account.js"),
  course: require("../../../server/course.js")
};
const util = {
  common: require("../../../util/common.js")
};
Page({
  data: {
    _id: "",
    courseDetail: {},
    avgs: { w: 0.5, i: 0.5, s: 0.5, hw: 0.5 },
    loading: true,
    star: 0
  },

  onLoad: function (options) {
    this.setData({ _id: options.id })
    this.getCourseDetail();
    this.getStarStatus();
  },
  onShow: function () {
    if (app.globalData.refresh.courseDetail) {
      app.globalData.refresh.courseDetail = false;
      this.getCourseDetail();
    }
  },
  onPullDownRefresh: function () {
    this.getCourseDetail();
    this.getStarStatus();
  },
  getStarStatus: function () {
    server.course.getStarStatus({
      _id: this.data._id
    }).then(res => {
      let status = 1;
      if (res.status)
        status = 2;
      this.setData({ star: status });
    })
  },
  starCourse: function () {
    if (this.data.star == 1) {
      this.setData({ star: 2 });
      server.course.star({ _id: this.data._id }).catch(util.common.catchFunc);
    } else if (this.data.star == 2) {
      this.setData({ star: 1 });
      server.course.unStar({ _id: this.data._id }).catch(util.common.catchFunc);
    }
  },
  getCourseDetail: function () {
    server.course.getCourseDetail({
      _id: this.data._id
    }).then(res => {
      wx.stopPullDownRefresh();
      this.data.avgs.s = res.avgRecordOfs / 5 * 100;
      this.data.avgs.i = res.avgRecordOfi / 5 * 100;
      this.data.avgs.w = res.avgRecordOfw / 5 * 100;
      this.data.avgs.hw = res.avgRecordOfhw;
      if (res.avgRecordOfs < 0.5)
        this.data.avgs.s = 0.5;
      if (res.avgRecordOfi < 0.5)
        this.data.avgs.i = 0.5;
      if (res.avgRecordOfhw < 0.5)
        this.data.avgs.hw = 0.5;
      if (res.avgRecordOfw < 0.5)
        this.data.avgs.w = 0.5;
      res.comment.sort((x, y) => y.stamp - x.stamp)
      for (let item of res.comment.filter(x => !x.value)) {
        item.value = "该用户未填写评论内容"
      }
      this.setData({
        courseDetail: res,
        avgs: this.data.avgs
      }, () => { this.setData({ loading: false }) });
    }).catch(() => {
      wx.navigateBack();
    })
  },

  onShareAppMessage: function () {
    return {
      path: '/pages/course/detail/index?id=' + this.data._id,
      imageUrl: '/images/share_post.png',
      title: "北航通识课评价：" + this.data.courseDetail.name
    }
  },
  goPublish: function () {
    wx.navigateTo({
      url: '/pages/course/publish/index?id=' + this.data._id,
    })
  },
  expandIntroduction: function (event) {
    this.setData({ activeName: event.detail });
  },
  commentTap: function (e) {
    wx.showActionSheet({
      itemList: ['举报'],
      success: res => {
        if (res.tapIndex == 0) {
          if (!util.common.checkLogin(null, '需要通过校友认证才能举报评论，是否认证？')) return;
          wx.showModal({
            title: '确定要举报吗？',
            content: '后台不会记录您的信息，并且将该评论暂时删除。若判断内容无异常会将其恢复。',
            success: re => {
              if (re.confirm) {
                server.course.report({
                  _id: this.data._id,
                  stamp: e.currentTarget.dataset.comment.stamp
                }).then(() => {
                  this.getCourseDetail()
                }).catch(util.common.catchFunc)
              }
            }
          })
        }
      }
    })
  }
})