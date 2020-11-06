const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
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
        tabon: 0,
        showImg: true,
        showPrice: true,
        showC: false,
        scrollTop: 0,
        nomore: false,
        list: [],
    },
    onLoad: function () {
        this.getBanner();
        this.getList();
    },
    // 监测屏幕滚动
    onPageScroll: function (e) {
        this.setData({
            scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
        })
    },
    // 跳转页面方法，在传入元素的dataset中添加url即可
    go: function (e) {
        util.common.goUrl(e.currentTarget.dataset.url);
    },
    // 获取首页列表
    getList: function () {
        let that = this;
        let setFunc = function (res) {
            wx.stopPullDownRefresh();
            that.setData({
                page: 0,
                list: res.data,
            });
            if (res.data.length < 20) {
                that.setData({ nomore: true });
            } else {
                that.setData({ nomore: false });
            }
        };
        if (this.data.tabon == 0) {
            server.data.getList('oldgood', 0, {
                status: 0,
                dura: _.gt(new Date().getTime())
            }).then(setFunc).catch(util.common.catchFunc);
        } else if (this.data.tabon == 1) {
            server.data.getList('ccomment', 0)
                .then(setFunc).catch(util.common.catchFunc);
        } else if (this.data.tabon == 2) {
            server.data.getList('lostfound', 0)
                .then(setFunc).catch(util.common.catchFunc);
        }
    },
    // 加载更多数据
    more: function () {
        let that = this;
        if (that.data.nomore || that.data.list.length < 20) {
            return false
        }
        let page = that.data.page + 1;
        let setFunc = function (res) {
            if (res.data.length < 20) {
                that.setData({ nomore: true });
            }
            that.setData({
                page: page,
                list: that.data.list.concat(res.data)
            })
        };
        if (this.data.tabon == 0) {
            server.data.getList('oldgood', page, {
                status: 0,
                dura: _.gt(new Date().getTime())
            }).then(setFunc).catch(util.common.catchFunc);
        } else if (this.data.tabon == 1) {
            server.data.getList('ccomment', page)
                .then(setFunc).catch(util.common.catchFunc);
        } else if (this.data.tabon == 2) {
            server.data.getList('lostfound', page)
                .then(setFunc).catch(util.common.catchFunc);
        }
    },
    // 切换至课程评价标签卡
    ccomment: function () {
        this.setData({
            tabon: 1,
            list: [],
            showImg: false,
            showPrice: false,
            showC: true
        })
        let that = this;
        util.cache.readDataListCache('ccomment').then((res) => {
            that.setData({
                list: res.data
            });
        }).catch(() => {
            that.getList();
        })
    },
    // 切换至二手商品标签卡
    oldgoods: function () {
        this.setData({
            list: [],
            tabon: 0,
            showImg: true,
            showPrice: true,
            showC: false,
        })
        let that = this;
        util.cache.readDataListCache('oldgood').then((res) => {
            that.setData({
                list: res.data
            });
        }).catch(() => {
            that.getList();
        })
    },
    // 切换至失物招领标签卡
    lostfound: function () {
        this.setData({
            list: [],
            tabon: 2,
            showImg: true,
            showPrice: false,
            showC: false,
        })
        let that = this;
        util.cache.readDataListCache('lostfound').then((res) => {
            that.setData({
                list: res.data
            });
        }).catch(() => {
            that.getList();
        })
    },
    onReachBottom: function () {
        this.more();
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        this.getList();
    },
    // 滚动到页面顶部
    gotop: function () {
        wx.pageScrollTo({ scrollTop: 0 });
    },
    // 跳转到详情页
    detail: function (e) {
        let that = this;
        let url = "";
        if (that.data.tabon == 0) {
            url = '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=old';
        } else if (that.data.tabon == 1) {
            url = '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=ccomm';
        } else if (that.data.tabon == 2) {
            url = '/pages/detail/detail?scene=' + e.currentTarget.dataset.id + '&func=losta';
        }
        util.common.goUrl(url);
    },
    //获取轮播
    getBanner: function () {
        let that = this;
        server.notice.getBanner().then((res) => {
            that.setData({ banner: res.data });
        });
    },
    comming: function () {
        wx.showToast({
            title: '敬请期待',
            icon: 'none'
        });
    },
    onShareAppMessage: function () {
        return {
            title: JSON.parse(config.data).share_title,
            imageUrl: JSON.parse(config.data).share_img,
            path: '/pages/index/index'
        }
    },
})