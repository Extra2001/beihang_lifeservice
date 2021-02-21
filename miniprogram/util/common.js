let app = getApp();
const account = require("../server/account.js");
const request = account.request;
let interval = setInterval(function () {
    if (app)
        clearInterval(interval);
    app = getApp();
}, 500);
function goUrl(url) {
    if (!checkLogin())
        return;
    wx.navigateTo({
        url: url,
        fail: (e) => {
            wx.switchTab({
                url: url,
            });
        }
    });
}

function checkLogin(options, msg) {
    if (app.globalData.loginStatus === 1) {
        if (options)
            if (options.success)
                options.success();
        return true;
    }
    else {
        unLogin(options, msg);
        return false;
    }
}

function unLogin(options, msg) {
    wx.showLoading({ title: "正在登录", mask: true });
    account.login().then(res => {
        wx.hideLoading();
        app.globalData.loginStatus = 1;
        app.globalData.user = res.user;
        if (options)
            if (options.success)
                options.success();
    }).catch(e => {
        wx.hideLoading();
        if(!msg) msg = "此功能需要认证后使用"
        wx.showModal({
            title: msg,
            confirmText: "去认证",
            cancelText: "取消",
            success: res => {
                if (res.confirm)
                    wx.reLaunch({ url: '/pages/login/login' });
                else {
                    wx.showToast({ title: "您放弃了认证", icon: "none" });
                    if (options)
                        if (options.fail)
                            options.fail();
                }
            }
        });
    })
}

function catchFunc(e) {
    wx.stopPullDownRefresh();
    wx.hideNavigationBarLoading();
    wx.hideLoading();
    console.error(e);
    wx.showToast({
        title: e.errMsg,
        icon: 'none'
    });
}

function checkImg(paths) {
    return new Promise((resolve, reject) => {
        let promiseArr = [];
        for (let i = 0; i < paths.length; i++)
            promiseArr.push(checkImgCloud(paths[i]));
        Promise.all(promiseArr).then(() => {
            resolve({
                errCode: 0,
                errMsg: "图片校验通过"
            })
        }).catch(e => {
            console.warn(e);
            reject({
                errCode: 3,
                errMsg: "图片校验不通过"
            })
        });
    });
}

function checkImgCloud(path) {
    return new Promise((resolve, reject) => {
        wx.compressImage({
            src: path,
            quality: 20,
            success: res => {
                wx.cloud.uploadFile({
                    cloudPath: `laji/${Date.now()}.png`,
                    filePath: res.tempFilePath,
                    success: res => {
                        wx.cloud.callFunction({
                            name: "checkImg",
                            data: {
                                fileID: res.fileID
                            },
                            success: function (e) {
                                resolve(e);
                            },
                            fail: function (e) {
                                reject(e);
                            }
                        });
                    }
                });
            }
        })

    });
}

function checkMsg(msg) {
    return new Promise((resolve, reject) => {
        if (!msg) {
            resolve({
                errCode: 0,
                errMsg: "信息为空"
            });
            return;
        }
        wx.cloud.callFunction({
            name: "checkMsg",
            data: {
                msg: msg
            },
            success: function (e) {
                resolve({
                    errCode: 0,
                    errMsg: "信息校验通过"
                });
            },
            fail: function (e) {
                reject({
                    errCode: 3,
                    errMsg: "信息校验不通过"
                });
            }
        });
    });
}

function uploadFile(options) {
    return new Promise((resolve, reject) => {
        request({
            url: "file/getuploadtoken",
            data: {
                fileNames: options.filePaths,
                serviceKind: options.serviceKind
            }
        }).then(res => {
            let promiseArr = [];
            for (let i = 0; i < res.fileInfos.length; i++) {
                promiseArr.push(uploadMethod({
                    filePath: options.filePaths[i],
                    token: res.fileInfos[i].token,
                    key: res.fileInfos[i].key
                }));
            }
            Promise.all(promiseArr).then(res => {
                resolve({ keys: res });
            }).catch(e => {
                reject(e);
            })
        }).catch(e => {
            reject(e);
        })
    })
}

function uploadMethod(options) {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            filePath: options.filePath,
            name: 'file',
            url: 'https://upload-z2.qiniup.com',
            header: {
                "Content-Type": "multipart/form-data"
            },
            formData: {
                token: options.token,
                key: options.key
            },
            success: res => {
                let data = JSON.parse(res.data);
                resolve(data.key);
            },
            fail: e => {
                reject({
                    errCode: 8,
                    errMsg: "网络错误",
                    errData: e
                })
            }
        });
    });
}

function getFileLinks(options) {
    return request({
        url: "file/getfilelinks",
        data: { keys: options.keys }
    });
}
import Notify from '../vant/notify/notify';
function notify(message) {
    Notify({ type: 'primary', message: message, background: '#1f90ff' });
}

module.exports = {
    // String(url)
    goUrl: goUrl,
    catchFunc: catchFunc,
    // No Parmaters
    unLogin: unLogin,
    // No Parmaters
    checkLogin: checkLogin,
    // Array(filePaths)
    checkImg: checkImg,
    // { filePaths: Array, serviceKind: Number[0: oldgood, 1: lostfound] }
    uploadFile: uploadFile,
    // { keys: Array }
    getFileLinks: getFileLinks,
    // String(msg)
    checkMsg: checkMsg,
    // String(msg)
    notify: notify
}