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
    courseName: "正在加载...",
    hideNameCheckBox: true,
    submitted: false,
    showPubSuccess: false,
    testWayCheckbox: [],
    optionsCheckbox: ['recommend', 'hidename'],
    note_counts: 0,
    courseDetail: {
      recordOfw: 0,
      recordOfi: 0,
      recordOfs: 0,
      recordOfhw: 0,
      test: 0,
      opentest: 0,
      paper: 0,
      show: 0,
      no: 0,
      comment: {
        value: "",
        bgc: false,
        teacher: "",
        email: ""
      }
    },
  },

  onLoad: function (options) {
    this.data._id = options.id;
    if (!app.globalData.user.email)
      this.handleNoLogin();
    this.getUnSubmit();
    this.getCourseName();
  },

  getUnSubmit: function () {
    wx.getStorage({
      key: 'courseComment',
      success: res => {
        if (res.data._id == this.data._id)
          wx.showModal({
            title: "检测到您未提交的记录",
            content: "是否继续上次编辑？",
            success: e => {
              if (e.confirm) {
                this.setData(res.data);
              }
              else {
                wx.removeStorage({
                  key: 'courseComment',
                })
              }
            }
          })
      }
    })
  },

  getCourseName: function () {
    server.course.getCourseDetail({
      _id: this.data._id
    }).then(res => {
      this.setData({ courseName: res.name })
    }).catch(() => {
      this.setData({ courseName: "获取失败" })
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "获取课程信息失败",
        success: () => {
          wx.navigateBack()
        }
      })
    });
  },

  handleNoLogin: function () {
    const checkbox = this.selectComponent(`.checkboxes-7`);
    if (checkbox.data.value == false)
      checkbox.toggle();
    this.setData({ hideNameCheckBox: true })
  },

  testWayCheck: function (event) {
    this.setData({ testWayCheckbox: event.detail });
  },

  toggle: function (event) {
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },
  noop: function () { },
  optionsCheck: function (event) {
    this.setData({ optionsCheckbox: event.detail });
  },
  rateChange: function (event) {
    this.data.courseDetail[event.currentTarget.dataset.prop] = event.detail
    this.setData({ courseDetail: this.data.courseDetail });
  },
  getSubmitData: function () {
    let data = JSON.parse(JSON.stringify(this.data.courseDetail));
    // let data = this.data.courseDetail
    data._id = this.data._id;
    data.recordOfhw *= 20;
    if (this.data.optionsCheckbox.indexOf('recommend') != -1)
      data.comment.bgc = true;
    if (this.data.optionsCheckbox.indexOf('hidename') == -1)
      data.comment.email = app.globalData.user.email;
    for (let item of this.data.testWayCheckbox)
      data[item] = 1;
    return data;
  },
  checkSubmitData: function (data) {
    let toast = msg => wx.showToast({ title: msg, icon: 'none' })
    if (data.recordOfw == 0 || data.recordOfs == 0 || data.recordOfi == 0 || data.recordOfhw == 0) {
      toast("请填写评价指标");
      return false;
    }
    if (data.recordOfw < 3 || data.recordOfs < 3 || data.recordOfi < 3 || data.recordOfhw < 3) {
      if (data.comment.value.length < 10) {
        toast("请填写至少10字的理由");
        return false;
      }
    }
    if (data.test == 0 && data.opentest == 0 && data.paper == 0 && data.show == 0 && data.no == 0) {
      toast("请选择至少一项考核方式");
      return false;
    }
    return true;
  },
  publish: function () {
    let data = this.getSubmitData();
    if (!this.checkSubmitData(data)) return
    wx.showModal({
      title: "是否确认提交？",
      content: "提交后无法更改和删除您的评价",
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '正在提交', mask: true });
          server.course.publish(data).then(() => {
            wx.hideLoading();
            this.data.submitted = true;
            this.setData({ showPubSuccess: true })
            app.globalData.refresh.courseDetail = true;
            wx.removeStorage({ key: 'courseComment' })
          }).catch(util.common.catchFunc);
        }
      }
    })
  },
  vanInput: function (e) {
    let obj = {};
    obj[e.currentTarget.dataset.prop] = e.detail;
    this.setData(obj);
  },
  noteInput: function (e) {
    this.setData({
      "courseDetail.comment.value": e.detail.value,
      note_counts: e.detail.cursor
    });
  },
  onReachBottom: function () {
    if (!app.globalData.user.email) {
      const checkbox = this.selectComponent(`.checkboxes-7`);
      if (checkbox.data.value == false)
        checkbox.toggle();
      this.setData({ hideNameCheckBox: true })
    }
    else
      this.setData({ hideNameCheckBox: false })
  },
  onUnload: function () {
    let init = {
      hideNameCheckBox: true,
      submitted: false,
      showPubSuccess: false,
      testWayCheckbox: [],
      optionsCheckbox: ['recommend', 'hidename'],
      note_counts: 0,
      courseDetail: {
        recordOfw: 0,
        recordOfi: 0,
        recordOfs: 0,
        recordOfhw: 0,
        test: 0,
        opentest: 0,
        paper: 0,
        show: 0,
        no: 0,
        comment: {
          value: "",
          bgc: false,
          teacher: "",
          email: ""
        }
      },
    };
    let thisdata = JSON.parse(JSON.stringify(this.data))
    delete thisdata._id;
    delete thisdata.courseName;
    delete thisdata.__webviewId__
    if (!this.data.submitted && this.data.courseName != "获取失败" && JSON.stringify(init) != JSON.stringify(thisdata)) {
      wx.setStorage({
        data: this.data,
        key: 'courseComment'
      });
    }
  }
})