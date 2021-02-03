const config = require("config.js");
const { common } = require("./config.js");
const server = {
    account: require("./server/account.js")
};
const util = {
    common: require("./util/common.js")
};
let watch = null;
App({
    globalData: {
        systeminfo: {},
        // 描述登录状态 0为未登录 1为已登录
        loginStatus: 0,
        refresh: {
            oldgood: false,
            message: true
        },
        user: {
            _id: "",
            openid: "",
            campus: 0,
            userInfo: {},
            studentCard: "",
            client: 0,
            stamp: 0
        }
    },
    canReflect: true,
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                env: JSON.parse(config.data).env,
                traceUser: true,
            })
        }
        this.globalData.systeminfo = wx.getSystemInfoSync();
        this.login();
    },
    login: function () {
        server.account.login().then(res => {
            this.globalData.user = res.user
            this.globalData.loginStatus = 1;
            watch = this.watchMessage();
        });
    },
    onHide: function () {
        if (watch)
            watch.close();
        watch = null;
    },
    onShow: function () {
        this.globalData.refresh.message = true;
        if (this.globalData.user.openid)
            watch = this.watchMessage();
    },
    watchMessage: function () {
        return wx.cloud.database().collection('message').where({
            openid: this.globalData.user.openid,
            read: false
        }).watch({
            onChange: res => {
                console.log(res)
                if (res.docs.length)
                    wx.showTabBarRedDot({ index: 1 })
                else
                    wx.hideTabBarRedDot({ index: 1 })
                if (res.type == 'init')
                    return;
                let change = res.docChanges[0];
                if (change.dataType == "add") {
                    let index = getCurrentPages().findIndex(x => x.route == "pages/message/index");
                    console.log(getCurrentPages())
                    if (index == getCurrentPages().length - 1)
                        wx.startPullDownRefresh();
                    else {
                        this.globalData.refresh.message = true
                        util.common.notify("您有新的消息")
                    }
                }
            },
            onError: res => {
                console.error(res)
            }
        })
    }
})