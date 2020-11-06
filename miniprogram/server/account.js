function login() {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (result) => {
                if (result.authSetting["scope.userInfo"]) {
                    // 登录处理程序
                    wx.cloud.callFunction({
                        name: "login",
                        success: function (res) {
                            if (res.result.data.length == 0) {
                                reject({
                                    errCode: 2,
                                    errMsg: "找不到用户信息"
                                });
                            } else {
                                resolve({ data: res.result.data[0] });
                            }
                        },
                        fail: function (res) {
                            reject({
                                errCode: 1,
                                errMsg: "云函数调用失败",
                                errData: res
                            })
                        }
                    })
                } else {
                    reject({
                        errCode: 3,
                        errMsg: "用户未授权"
                    })
                }
            },
        });
    })
}

function changeCampus(campus) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "changecampus",
            data: {
                campus: campus
            },
            success: function (res) {
                resolve(res);
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "调用云函数失败",
                    errData: e
                })
            }
        })
    })
}

function deleteUser() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "clearUser",
            success: function (res) {
                resolve();
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "调用云函数失败",
                    errData: e
                });
            }
        });
    })
}

function register(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "register",
            data: {
                campus: data.campus,
                stamp: new Date().getTime(),
                info: data.userInfo,
                useful: true,
                parse: 0,
                studentcard: data.studentcard,
            },
            success: function (res) {
                if (res.result == 1) {
                    reject({
                        errCode: 2,
                        errMsg: "该微信已经注册"
                    });
                    getApp().login().then(() => {
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                    }).catch((e) => {
                        reject({
                            errCode: 1,
                            errMsg: "登录过程出错",
                            errData: e
                        });
                    })
                } else if (res.result == 2) {
                    reject({
                        errCode: 3,
                        errMsg: "该校园卡已被注册"
                    });
                } else if (res.result == 5) {
                    reject({
                        errCode: 5,
                        errMsg: "系统出错，请稍后再试"
                    });
                } else {
                    getApp().login().then(() => {
                        resolve();
                    }).catch((e) => {
                        reject({
                            errCode: 1,
                            errMsg: "登录过程出错",
                            errData: e
                        });
                    })
                }
            },
            fail: function () {
                reject({
                    errCode: 1,
                    errMsg: "云函数调用失败",
                    errData: e
                });
            }
        })
    })
}

module.exports = {
    login: login,
    changeCampus: changeCampus,
    deleteUser: deleteUser,
    register: register
}