const urlbase = "https://bhls.buaaer.top/api/";
// const urlbase = "https://localhost:5001/api/";
let loginToken = "";
wx.getStorage({
  key: 'loginToken',
  success: function (res) {
    loginToken = res.data;
  }
});

function saveToken(token) {
  loginToken = token;
  wx.setStorage({
    key: 'loginToken',
    data: token
  });
}

function request(options) {
  return new Promise((resolve, reject) => {
    if (!options.data)
      options.data = {}
    if (!options.resolve)
      options.resolve = resolve;
    if (!options.reject)
      options.reject = reject;
    options.data.client = 0;
    // console.log("请求体", options.data);
    wx.request({
      url: urlbase + options.url,
      method: "POST",
      header: { Authorization: `Bearer ${loginToken}` },
      data: options.data,
      success: function (res) {
        // console.log("请求结果", res.data);
        if (res.statusCode === 200)
          options.resolve(res.data);
        else
          options.reject(res.data);
        resolve(res.data);
      },
      fail: function () {
        if (!options.retryTimes)
          options.retryTimes = 1;
        else if (options.retryTimes > 3) {
          options.reject({
            errCode: 8,
            errMsg: "网络错误"
          });
          resolve(res.data);
          return;
        }
        else
          options.retryTimes++;
        request(options);
      }
    });
  });
}

function login() {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (result) => {
        if (result.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            success: function (re) {
              wx.login({
                success: function (res) {
                  wx.request({
                    url: urlbase + "account/login",
                    method: "POST",
                    data: JSON.stringify({
                      code: res.code,
                      userInfo: re.userInfo,
                      client: 0
                    }),
                    success: function (e) {
                      if (e.statusCode !== 200) {
                        reject(e.data);
                      }
                      else {
                        saveToken(e.data.loginToken);
                        resolve(e.data);
                      }
                    },
                    fail: function (e) {
                      reject(e);
                    }
                  });
                }
              });
            }
          });
        } else {
          reject({
            errCode: 7,
            errMsg: "用户未授权"
          });
        }
      }
    });
  });
}

function changeCampus(options) {
  return request({
    url: "account/campus",
    data: options
  });
}

function deleteUser() {
  return;
}

function register(data) {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: function (re) {
        wx.login({
          success: function (res) {
            wx.request({
              url: urlbase + "account/register",
              method: "POST",
              data: {
                code: res.code,
                userInfo: re.userInfo,
                client: 0,
                campus: data.campus,
                email: data.email,
                clientID: data.clientID,
                verificationCode: data.verificationCode
              },
              success: function (e) {
                if (e.statusCode !== 200) {
                  reject(e.data);
                }
                else {
                  saveToken(e.data.loginToken);
                  resolve(e.data);
                }
              }
            });
          }
        });
      }
    });
  });
}

function getEmailCode(options) {
  return request({
    url: "account/getverificationcode",
    data: options
  });
}

function verifyEmailCode(options) {
  return request({
    url: "account/verifycode",
    data: options
  });
}

function isAdmin() {
  return request({
    url: "account/isadmin"
  })
}

function getUsers(options) {
  return request({
    url: "account/getusers",
    data: options
  })
}

function changeEmail(options) {
  return request({
    url: "account/changeemail",
    data: options
  }).then(res => {
    saveToken(res.loginToken);
    return new Promise((resolve) => { resolve() })
  })
}

module.exports = {
  // No Parmaters
  login: login,
  // { campus: Number }
  changeCampus: changeCampus,
  deleteUser: deleteUser,
  // { campus: Number, studentCard: String }
  register: register,
  // { url:String, data: any, resolve: function, reject: function }
  request: request,
  // { email: Stirng }
  getEmailCode: getEmailCode,
  // { clientID: String, code: String, email: String }
  verifyEmailCode: verifyEmailCode,
  isAdmin: isAdmin,
  getUsers: getUsers,
  changeEmail: changeEmail
}