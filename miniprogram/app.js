const config = require("config.js");
const server = {
    account: require("./server/account.js")
};
const util = {
    cache: require("./util/cache.js")
};
App({
    globalData: {
        userinfo: {
            "_id": "",
            "_openid": "",
            "campus": {
                "id": 1,
                "name": ""
            },
            "info": {},
            "parse": 0,
            "stamp": 0,
            "studentcard": "",
            "useful": false
        },
        // 描述登录状态 0为未登录 1为已登录
        loginStatus: 0,
    },
    canReflect: true,
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
            wx.showToast({
                title: '请更新微信来使用小程序',
                icon: 'none'
            });
        } else {
            wx.cloud.init({
                env: JSON.parse(config.data).env,
                traceUser: true,
            })
        }
        this.systeminfo = wx.getSystemInfoSync();
        util.cache.clearCache();
        this.login();
    },
    login: function () {
        return new Promise((resolve, reject) => {
            server.account.login().then((res) => {
                this.globalData.userinfo = res.data;
                this.globalData.loginStatus = 1;
                resolve({ data: res.data, errMsg: "成功登录" });
            }).catch((e) => {
                this.initailizeLoginStatus();
                reject(e);
            });
        })
    },
    initailizeLoginStatus: function () {
        this.globalData.userinfo = {
            "_id": "",
            "_openid": "",
            "campus": {
                "id": 1,
                "name": ""
            },
            "info": {},
            "parse": 0,
            "stamp": 0,
            "studentcard": "",
            "useful": false
        };
        this.globalData.loginStatus = 0
    }
})