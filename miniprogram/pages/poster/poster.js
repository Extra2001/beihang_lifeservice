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
        input: ""
    },
    test: function (e) {
        wx.chooseImage({
            count: 3,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                util.common.uploadFile({
                    filePaths: res.tempFilePaths,
                    serviceKind: 0
                }).then(e => {
                    util.common.getFileLinks({ keys: e.keys }).then(res => {
                        console.log(res.links)
                        this.setData({
                            img: res.links
                        });
                    })
                }).catch(util.common.catchFunc);
            }
        })
    },
    test2: function (e) {
        wx.chooseImage({
            count: 3,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                util.common.checkImg(res.tempFilePaths).then(res => {
                    wx.showToast({
                        title: 'Pass',
                    })
                }).catch(e => {
                    wx.showToast({
                        title: 'Risky',
                        icon: 'none'
                    })
                })
            }
        })
    },
    test3: function (e) {
        util.common.checkMsg(this.data.input).then(res => {
            console.log(res);
        })
    },
    input: function (e) {
        console.log(e);
        this.setData({ input: e.detail.value })
    }
})