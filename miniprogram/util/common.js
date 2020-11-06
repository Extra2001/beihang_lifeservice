const app = getApp();

function goUrl(url) {
    if (!url) {
        return false;
    }
    let jumpFunc = (urlx) => {
        wx.navigateTo({
            url: urlx,
            fail: () => {
                wx.switchTab({
                    url: urlx
                })
            }
        })
    };
    if (app.globalData.loginStatus == 0) {
        unLogin().then(() => {
            jumpFunc(url);
        }).catch(() => {
            console.log("未登录");
        });
    } else {
        // 已登录，直接跳转
        jumpFunc(url);
    }
}

function unLogin() {
    return new Promise((resolve, reject) => {
        app.login().then(() => {
            // 登录成功，跳转
            resolve();
        }).catch(() => {
            // 用户未授权访问用户信息
            wx.showModal({
                title: "此功能需要您授权用户信息后使用",
                confirmText: "去授权",
                cancelText: "取消",
                success: (res) => {
                    if (res.confirm) {
                        wx.reLaunch({
                            url: '/pages/login/login',
                        });
                    } else {
                        wx.showToast({
                            title: "您放弃了登录",
                            icon: "none"
                        })
                    }
                    reject();
                }
            });
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

module.exports = {
    goUrl: goUrl,
    catchFunc: catchFunc,
    unLogin: unLogin
}