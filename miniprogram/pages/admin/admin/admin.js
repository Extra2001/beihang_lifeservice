const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const server = {
    account: require("../../../server/account.js"),
    data: require("../../../server/data.js"),
    notice: require("../../../server/notice.js")
};
const util = {
    cache: require("../../../util/cache.js"),
    common: require("../../../util/common.js")
};
Page({
    data: {
        scrollTop: 0,
        nomore: false,
        tab: [{
            name: '二手商品',
            id: 0,
        }, {
            name: '课程评价',
            id: 1,
        }, {
            name: '失物招领',
            id: 2,
        }, {
            name: '用户列表',
            id: 3,
        }],
        tabid: 0,
    },
    //导航栏切换
    changeTab: function (e) {
        let that = this;
        if (e.currentTarget.dataset.id == 3) {
            that.getUser();
            return;
        }
        that.setData({
            tabid: e.currentTarget.dataset.id,
            list: []
        })
        that.getlist();
    },
    // 跳转详情页
    godetail: function (e) {
        let dbn = '';
        if (this.data.tabid == 0) {
            dbn = 'old'
        } else if (this.data.tabid == 1) {
            dbn = 'ccomm'
        } else if (this.data.tabid == 2) {
            dbn = 'losta'
        }
        wx.navigateTo({
            url: '/pages/admin/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=' + dbn,
        });
    },
    onLoad: function () {
        let that = this
        this.setData({
            showPrice: true,
            showImg: true,
            tabid: 0,
        })
        that.getlist();
    },
    getCollectionName: function () {
        let dbn = ''
        if (this.data.tabid == 0) {
            dbn = 'oldgood'
        }
        else if (this.data.tabid == 1) {
            dbn = 'ccomment'
        }
        else if (this.data.tabid == 2) {
            dbn = 'lostfound'
        }
        return dbn;
    },
    // 获取列表
    getlist: function () {
        let that = this;
        server.data.getList(this.getCollectionName(), 0).then(res => {
            that.setData({
                page: 0,
                list: res.data
            });
            if (res.data.length < 20) {
                that.setData({ nomore: true });
            } else {
                that.setData({ nomore: false });
            }
        }).catch(util.common.catchFunc);
    },
    getUser: function () {
        wx.navigateTo({ url: '/pages/admin/user/user' });
    },
    //下拉刷新
    onPullDownRefresh: function () {
        this.getlist();
    },
    //删除订单
    deleteit: function (e) {
        let that = this;
        let detail = e.currentTarget.dataset.ord;
        wx.showModal({
            title: '提示',
            content: '您确实要删除此条目吗',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({ title: '正在删除' });
                    server.data.deleteItem({
                        img: detail.img,
                        _id: detail._id,
                        collection: that.getCollectionName()
                    }).then(() => {
                        wx.hideLoading();
                        that.getlist();
                        wx.showToast({ title: '已删除' });
                    }).catch(util.common.catchFunc);
                }
            }
        })
    },
    soldout: function (e) {
        let that = this;
        let detail = e.currentTarget.dataset.ord;
        wx.showModal({
            title: '提示',
            content: '您确实要设置为已售出吗',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({ title: '正在设置' });
                    server.data.updateItem({
                        _id: detail._id,
                        collection: that.getCollectionName(),
                        newData: { status: 1 }
                    }).then(() => {
                        wx.hideLoading();
                        that.getlist();
                        wx.showToast({ title: '设置成功' });
                    }).catch(util.common.catchFunc);
                }
            }
        })
    },
    foundit: function (e) {
        let that = this;
        let detail = e.currentTarget.dataset.ord;
        wx.showModal({
            title: '提示',
            content: '您确认要设置为已找到吗',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({ title: '正在设置' });
                    server.data.updateItem({
                        _id: detail._id,
                        collection: that.getCollectionName(),
                        newData: { status: 1 }
                    }).then(() => {
                        wx.hideLoading();
                        that.getlist();
                        wx.showToast({ title: '设置成功' });
                    }).catch(util.common.catchFunc);
                }
            }
        })
    },
    nofoundit: function (e) {
        let that = this;
        let detail = e.currentTarget.dataset.ord;
        wx.showModal({
            title: '提示',
            content: '您确认要设置为未找到吗',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({ title: '正在设置' });
                    server.data.updateItem({
                        _id: detail._id,
                        collection: that.getCollectionName(),
                        newData: { status: 0 }
                    }).then(() => {
                        wx.hideLoading();
                        that.getlist();
                        wx.showToast({ title: '设置成功' });
                    }).catch(util.common.catchFunc);
                }
            }
        });
    },
    refresh: function (e) {
        let that = this;
        let detail = e.currentTarget.dataset.ord;
        wx.showLoading({ title: '正在擦亮' });
        server.data.updateItem({
            collection: that.getCollectionName(),
            _id: detail._id,
            newData: {
                creat: new Date().getTime(),
                dura: new Date().getTime() + 7 * (24 * 60 * 60 * 1000), //每次擦亮管7天
            }
        }).then(() => {
            wx.hideLoading();
            that.getlist();
            wx.showToast({ title: '已擦亮' });
        }).catch(util.common.catchFunc);
    },
    onReachBottom: function () {
        this.more();
    },
    // 加载更多
    more: function () {
        let that = this;
        if (that.data.nomore || that.data.list.length < 20) {
            return false
        }
        let page = that.data.page + 1;
        server.data.getList(this.getCollectionName(), page).then(res => {
            that.setData({
                page: page,
                list: that.data.list.concat(res.data)
            });
            if (res.data.length < 20) {
                that.setData({ nomore: true });
            } else {
                that.setData({ nomore: false });
            }
        }).catch(util.common.catchFunc);
    }
})