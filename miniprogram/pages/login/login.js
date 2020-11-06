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
        ids: -1,
        studentcard: "",
        campus: JSON.parse(config.data).campus,
    },
    choose: function (e) {
        let that = this;
        that.setData({ ids: e.detail.value });
    },

    //获取校园卡号
    xkInput(e) {
        this.data.studentcard = e.detail.value;
    },
    //获取用户信息
    getUserInfo: function (e) {
        let that = this;
        let test = e.detail.errMsg.indexOf("ok");
        if (test == '-1') {
            wx.showToast({
                title: '授权访问用户信息才能登录哦',
                icon: 'none',
                duration: 2000
            });
        } else {
            that.setData({ userInfo: e.detail.userInfo });
            that.check();
        }
    },
    //校检
    check() {
        let that = this;
        //校检校区
        let ids = that.data.ids;
        if (ids == -1) {
            wx.showToast({
                title: '请选择您所在的校区',
                icon: 'none',
                duration: 2000
            });
        }
        //校检校园卡
        /* let stucard = that.data.studentcard
        if (stucard.length > 8 || stucard.length < 8) {
            wx.showToast({
                title: '请输入正确的校园卡号',
                icon: 'none',
                duration: 2000
            });
            return false;
        } */
        wx.showLoading({ title: '正在提交' });
        server.account.register({
            campus: that.data.campus[that.data.ids],
            info: that.data.userInfo,
            studentcard: that.data.studentcard
        }).then(() => {
            wx.showToast({ title: "注册成功" });
            wx.reLaunch({ url: '/pages/index/index' });
        }).catch(util.common.catchFunc);
    },
})