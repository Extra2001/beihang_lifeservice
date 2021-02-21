const app = getApp();
const config = require("../../config.js");
const server = {
    account: require("../../server/account.js"),
};
const util = {
    common: require("../../util/common.js")
};
Page({
    data: {
        showShare: false,
        loginStatus: 0,
        isAdmin: false
    },
    onShow: function () {
        this.setData({
            loginStatus: app.globalData.loginStatus,
            currcampus: config.common.campus[app.globalData.user.campus],
            email: app.globalData.user.email
        });
        server.account.isAdmin().then(() => {
            this.setData({ isAdmin: true });
        }).catch(() => { this.setData({ isAdmin: false }) });
    },
    //切换校区
    changeCampus: function (e) {
        let that = this
        wx.showActionSheet({
            itemList: config.common.campus,
            success: function (res) {
                if (res.tapIndex !== app.globalData.user.campus) {
                    server.account.changeCampus({ campus: res.tapIndex }).catch(util.common.catchFunc);
                    app.globalData.user.campus = res.tapIndex;
                    that.setData({ currcampus: config.common.campus[res.tapIndex] });
                }
            }
        });
    },
    // 跳转页面方法
    go: function (e) {
        if (e.currentTarget.dataset.status == 3) {
            server.account.isAdmin().then(() => {
                util.common.goUrl(e.currentTarget.dataset.go);
            }).catch(util.common.catchFunc)
            return
        }
        else if (e.currentTarget.dataset.status == 0) {
            wx.navigateTo({ url: e.currentTarget.dataset.go })
            return
        }
        util.common.goUrl(e.currentTarget.dataset.go);
    },
    onShareAppMessage: function () {
        return {
            path: '/pages/course/list/index',
            imageUrl: '/images/share_post.png',
            title: "北航生活服务·通识课评价"
        }
    }
})