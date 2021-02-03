const app = getApp();
const config = require("../../config.js");
const server = {
    account: require("../../server/account.js"),
    data: require("../../server/data.js"),
    notice: require("../../server/notice.js")
};
const util = {
    cache: require("../../util/cache.js"),
    common: require("../../util/common.js")
};
Page({
    data: {
        showShare: false,
        poster: JSON.parse(config.data).share_poster,
        loginStatus: 0
    },
    onShow: function () {
        this.setData({
            loginStatus: app.globalData.loginStatus,
            currcampus: config.common.campus[app.globalData.user.campus],
            openid: app.globalData.user.openid
        });
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
        util.common.goUrl(e.currentTarget.dataset.go);
    },
    //展示分享弹窗
    switchPop: function () {
        this.setData({ showShare: !this.data.showShare });
    },
    //预览图片
    preview(e) {
        wx.previewImage({
            urls: e.currentTarget.dataset.link.split(",")
        });
    },
    onShareAppMessage: function () {
        return {
            title: JSON.parse(config.data).share_title,
            imageUrl: JSON.parse(config.data).share_img,
            path: '/pages/start/start'
        }
    }
})