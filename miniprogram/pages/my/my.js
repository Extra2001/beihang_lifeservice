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
    },
    onShow: function () {
        this.setData({
            userinfo: app.globalData.userinfo.info,
            currcampus: app.globalData.userinfo.campus.name,
            openid: app.globalData.userinfo._openid
        });
    },
    //切换校区
    changeCampus: function (e) {
        let that = this
        wx.showActionSheet({
            itemList: ["学院路校区", "沙河校区"],
            success: function (res) {
                if (res.tapIndex !== app.globalData.userinfo.campus.id) {
                    let names = ["学院路校区", "沙河校区"];
                    let campus = {
                        id: res.tapIndex,
                        name: names[res.tapIndex]
                    }
                    app.globalData.userinfo.campus = campus;
                    that.setData({ currcampus: campus.name });
                    server.account.changeCampus(campus).catch(util.common.catchFunc);
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
    },
    cleartmp: function () {
        wx.showModal({
            title: '提示',
            content: '您确实要清空缓存数据吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({ title: '正在清理' });
                    util.cache.clearCache();
                    wx.hideLoading();
                    wx.showToast({ title: '清除完成' });
                }
            }
        });
    },
    clearAcc: function () {
        wx.showModal({
            title: '提示',
            content: '您真的想要清除账号内容并退出吗？该操作不可逆。',
            success: function (res) {
                if (res.confirm) {
                    wx.showModal({
                        title: '再次确认',
                        content: '确实要删除账号吗？',
                        success: function (e) {
                            if (e.confirm) {
                                wx.showLoading({ title: '正在删除' });
                                server.account.deleteUser().then(() => {
                                    wx.hideLoading();
                                    wx.showToast({ title: '已清除数据' });
                                    app.initailizeLoginStatus();
                                    wx.reLaunch({ url: "/pages/index/index" });
                                })
                            }
                        }
                    })
                }
            }
        })
    }
})