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
        campus: -1,
        email: "",
        verificationCode: "",
        campusList: config.common.campus,
        userInfo: {},
        showCountDown: false,
        countDown: 60,
        emailLoading: false,
        clientID: ""
    },
    choose: function (e) {
        let that = this;
        that.setData({ campus: e.detail.value });
    },
    sendEmail: function (e) {
        if (!this.data.email) {
            wx.showToast({ title: '请输入邮箱', icon: 'none' });
            return;
        }
        this.setData({ emailLoading: true, showCountDown: true });
        server.account.getEmailCode({ email: this.data.email + "@buaa.edu.cn" }).then(res => {
            this.setData({
                emailLoading: false,
                clientID: res.clientID
            });
            let interval = setInterval(() => {
                if (this.data.countDown <= 0) {
                    clearInterval(interval);
                    this.setData({
                        countDown: 60,
                        showCountDown: false
                    });
                }
                else
                    this.setData({ countDown: this.data.countDown - 1 });
            }, 1000)
        }).catch(e => {
            this.setData({ showCountDown: false, countDown: 60 });
            util.common.catchFunc(e);
        })
    },
    weChatInput: function (e) {
        console.log(e);
        this.data[e.currentTarget.dataset.prop] = e.detail.value;
        this.setData(this.data);
    },
    //获取用户信息
    getUserInfo: function (e) {
        console.log({
            campus: this.data.campus,
            userInfo: this.data.userInfo,
            studentcard: this.data.studentCard
        });
        console.log(e);
        let test = e.detail.errMsg.indexOf("ok");
        if (test == '-1') {
            wx.showToast({
                title: '授权后才能绑定哦',
                icon: 'none'
            });
        } else {
            this.data.userInfo = e.detail.userInfo;
            if (this.checkRegisterInfo())
                this.submitRegisterInfo();
        }
    },
    //校检
    checkRegisterInfo: function () {
        // 校检校区
        if (this.data.campus == -1) {
            wx.showToast({
                title: '请选择您所在的校区',
                icon: 'none'
            });
            return false;
        }
        if (!this.data.email) {
            wx.showToast({
                title: '请输入邮箱',
                icon: 'none'
            });
            return false;
        }
        return true;
    },
    submitRegisterInfo: function () {
        wx.showLoading({ title: '正在提交信息' });
        server.account.register({
            campus: this.data.campus,
            userInfo: this.data.userInfo,
            email: this.data.email + "@buaa.edu.cn",
            clientID: this.data.clientID,
            verificationCode: this.data.verificationCode
        }).then(res => {
            app.globalData.loginStatus = 1;
            app.globalData.user = res.user;
            wx.hideLoading();
            wx.showToast({ title: "注册成功" });
            wx.reLaunch({ url: '/pages/oldgood/list/oldgood' });
        }).catch(util.common.catchFunc);
    }
})