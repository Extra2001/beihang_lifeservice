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
    loading: true,
    courseList: []
  },

  onLoad: function () {
    this.getStarList();
  },

  getStarList: function () {
    server.course.getStarList().then(res => {
      this.setData({ courseList: res.list, loading: false });
    })
  },

  onShareAppMessage: function () {
    return {
      path: '/pages/course/list/index',
      imageUrl: '/images/share_post.png',
      title: "北航生活服务·通识课评价"
    }
  }
})