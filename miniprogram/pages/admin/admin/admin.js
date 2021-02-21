const server = {
    account: require("../../../server/account.js"),
};
const util = {
    common: require("../../../util/common.js")
};
Page({
    onLoad: function () {
        server.account.isAdmin().catch(() => {
            wx.navigateBack();
        })
    },
    go: function (e) {
        util.common.goUrl(e.currentTarget.dataset.go);
    }
})