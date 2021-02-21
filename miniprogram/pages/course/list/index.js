import Dialog from '../../../vant/dialog/dialog';
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
    courseList: [],
    character: [],
    courseListBackup: [],
    newCourseName: "",
    starCourseList: [],
    hotCourseList: [],
    searched: false
  },

  onLoad: function (options) {
    this.loadDefaultData();
    this.getCourseList();
    this.getStarList();
    this.getHotCoursesList();
  },

  onShow: function () {
    this.getStarList();
    this.getHotCoursesList();
  },

  getHotCoursesList: function () {
    wx.getStorage({
      key: 'hotCourseCache', success: res => {
        if (res.data.length > 0)
          this.setData({ hotCourseList: res.data });
        server.course.getHotCoursesList().then(res => {
          wx.setStorage({ data: res.list, key: 'hotCourseCache' })
          this.setData({ hotCourseList: res.list });
        })
      }, fail: () => {
        server.course.getHotCoursesList().then(res => {
          wx.setStorage({ data: res.list, key: 'hotCourseCache' })
          this.setData({ hotCourseList: res.list });
        })
      }
    })
  },

  getCourseList: function () {
    server.course.getCoursesList().then(res => {
      this.setData({ courseList: res.list.slice(0, 20) }, () => {
        this.setData({ loading: false })
        this.setData({ courseList: res.list })
      });
      this.data.courseListBackup = res.list
      return server.course.getCoursesList(true)
    }).then(res => {
      this.setData({ loading: false })
      this.setData({ courseList: res.list })
      this.data.courseListBackup = res.list
    }).catch(util.common.catchFunc)
  },

  getStarList: function () {
    wx.getStorage({
      key: 'starCourseCache', success: res => {
        if (res.data.length > 0)
          this.setData({ starCourseList: res.data });
        server.course.getStarList().then(res => {
          wx.setStorage({ data: res.list, key: 'starCourseCache' })
          this.setData({ starCourseList: res.list });
        })
      }, fail: () => {
        server.course.getStarList().then(res => {
          wx.setStorage({ data: res.list, key: 'starCourseCache' })
          this.setData({ starCourseList: res.list });
        })
      }
    })
  },

  onPullDownRefresh: function () {
    server.course.getCoursesList(true).then(res => {
      wx.stopPullDownRefresh();
      this.setData({ courseList: res.list })
      this.data.courseListBackup = res.list
    }).catch(util.common.catchFunc)
  },

  onShareAppMessage: function () {
    return {
      path: '/pages/course/list/index',
      imageUrl: '/images/share_post.png',
      title: "北航生活服务·通识课评价"
    }
  },
  search: function (e) {
    let key = e.detail.toLowerCase();
    if (!key)
      this.setData({ searched: false }, () => {
        this.setData({ courseList: this.data.courseListBackup })
      });
    else
      this.setData({ courseList: this.data.courseListBackup.filter(value => value.name.toLowerCase().indexOf(key) != -1), searched: true })
  },
  loadDefaultData: function () {
    for (let i = 0; i < 26; i++) {
      let num = 'A'.charCodeAt(0) + i;
      this.data.character.push(String.fromCharCode(num));
    }
    this.data.character.push('#');
    this.setData({ character: this.data.character });
  },
  courseInput: function (e) {
    this.setData({ newCourseName: e.detail });
  },
  addNewCourseDialog: function () {
    const beforeClose = (action) => new Promise((resolve) => {
      if (action == 'cancel') {
        resolve(true);
        return;
      }
      if (!this.data.newCourseName) {
        wx.showToast({ title: '请填写课程名称' });
        return
      }
      wx.showToast({ title: '成功，等待审核' });
      server.course.addNewCourse({
        name: this.data.newCourseName
      }).then(() => {
        resolve(true);
        this.setData({ newCourseName: "" });
      }).catch(util.common.catchFunc);
    });

    Dialog.confirm({
      title: "添加新的课程",
      beforeClose
    });
  },
  goStarPage: function () {
    wx.navigateTo({
      url: '/pages/course/star/star',
    })
  }
})