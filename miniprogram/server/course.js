const request = require("./account.js").request;
const common = require("../util/common.js");

function getCoursesList(fromSerer) {
  return new Promise((resolve, reject) => {
    let getFunc = () => {
      request({
        url: "course/getlist"
      }).then(res => {
        wx.setStorage({
          data: res.list,
          key: 'courseListCache',
        })
        resolve(res);
      }).catch(reject);
    }
    if (fromSerer) {
      getFunc();
      return;
    }
    wx.getStorage({
      key: 'courseListCache',
      success: res => {
        if (res.data.length > 0) {
          resolve({ list: res.data });
          return;
        }
        getFunc();
      },
      fail: getFunc
    })
  })
}

function getHotCoursesList() {
  return request({
    url: "course/gethotlist"
  })
}

function getCourseDetail(options) {
  return request({
    url: "course/getone",
    data: options
  })
}

function publish(options) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        options.code = res.code;
        request({
          url: "course/publish",
          data: options
        }).then(resolve).catch(reject);
      }
    })
  })
}

function star(options) {
  return request({
    url: "course/star",
    data: options
  });
}

function unStar(options) {
  return request({
    url: "course/unstar",
    data: options
  });
}

function getStarList() {
  return request({
    url: "course/getstarlist"
  })
}

function getStarStatus(options) {
  return request({
    url: "course/getstarstatus",
    data: options
  });
}

function addNewCourse(options) {
  return request({
    url: "course/addnewcorse",
    data: options
  })
}

function report(options) {
  return request({
    url: "course/report",
    data: options
  })
}
function reportRecover(options) {
  return request({
    url: "course/reportrecover",
    data: options
  })
}
function verifyAdd(options) {
  return request({
    url: "course/verifyadd",
    data: options
  })
}
function verifyDelete(options) {
  return request({
    url: "course/verifydelete",
    data: options
  })
}

function getNewCourseList(options) {
  return request({
    url: "course/getnewcourselist",
    data: options
  })
}

function getReportList(options) {
  return request({
    url: "course/getreportlist",
    data: options
  })
}

module.exports = {
  getCoursesList: getCoursesList,
  getCourseDetail: getCourseDetail,
  publish: publish,
  star: star,
  unStar: unStar,
  getStarList: getStarList,
  getStarStatus: getStarStatus,
  addNewCourse: addNewCourse,
  report: report,
  reportRecover: reportRecover,
  verifyAdd: verifyAdd,
  verifyDelete: verifyDelete,
  getNewCourseList: getNewCourseList,
  getReportList: getReportList,
  getHotCoursesList: getHotCoursesList
}