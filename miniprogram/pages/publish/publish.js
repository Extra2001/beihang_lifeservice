const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
const data = require("../../server/data.js");
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
        systeminfo: app.systeminfo,
        entime: {
            enter: 600,
            leave: 300
        }, //进入褪出动画时长
        tab: [{
            name: '二手商品',
            id: 0,
        }, {
            name: '课程评价',
            id: 1,
        }, {
            name: '拾物/寻物',
            id: 2,
        }],
        tabid: 0
    },
    onLoad: function () {
        if (app.globalData.loginStatus == 0) {
            util.common.unLogin();
        }
        this.setData({ userinfo: app.globalData.userinfo.info });
        this.initializeOldgood();
    },
    // 切换标签页
    changeTab: function (e) {
        let that = this;
        if (this.data.tabid == e.currentTarget.dataset.id)
            return;
        that.setData({ tabid: e.currentTarget.dataset.id });
        this.initializeOldgood();
        this.initializeCComment();
        this.initializeLostfound();
        if (e.currentTarget.dataset.id == 0) {
            that.setData({
                // 展示发布页的开关
                show_ershow: true,
                show_losta: false,
                show_course: false,
                // 展示发布成功页的开关
                show_c: false,
                show_cc: false,
                show_cl: false
            })
        } else if (e.currentTarget.dataset.id == 1) {
            that.setData({
                show_course: true,
                show_ershow: false,
                show_losta: false,
                show_c: false,
                show_cc: false,
                show_cl: false
            })
        } else if (e.currentTarget.dataset.id == 2) {
            that.setData({
                show_losta: true,
                show_ershow: false,
                show_course: false,
                show_c: false,
                show_cc: false,
                show_cl: false
            })
        }
    },
    // 恢复初始态
    initializeOldgood: function () {
        let that = this;
        that.setData({
            dura: 30,
            place: '',
            grids: [],
            chooseDelivery: 0,
            show_ershow: true,
            show_c: false,
            show_losta: false,
            show_course: false,
            show_cc: false,
            show_cl: false,
            active: 0,
            note_counts: 0,
            notes: '',
            phone: '',
            qq: '',
            delivery: [{
                name: '自提',
                id: 0,
                check: true,
            }, {
                name: '帮送',
                id: 1,
                check: false
            }],
            thumb: '',
            goodinfo: {
                name: '',
                rawprice: 20,
                price: 15,
                detail: '',
                xianyulink: '',
                desc: '',
                campus: app.globalData.userinfo.campus.name
            }
        })
    },
    initializeCComment: function () {
        this.setData({
            cinfo: {
                name: '',
                teacher: '',
                detail: '',
            },
            show_cc: false,
            show_course: true,
            show_ershow: false,
            show_c: false,
            show_losta: false,
            show_cl: false,
            cdetail_counts: 0,
        });
    },
    initializeLostfound: function () {
        this.setData({
            grids: [],
            thumb: '',
            lostinfo: {
                name: '',
                place: '',
                phone: '',
                qq: '',
                detail: '',
                campus: app.globalData.userinfo.campus.name
            },
            show_cc: false,
            show_course: false,
            show_ershow: false,
            show_c: false,
            show_losta: true,
            show_cl: false,
        })
    },
    // 通用输入处理程序
    weChatInput: function (e) {
        console.log(e.currentTarget.dataset.prop + ": " + e.detail.value);
        let obj = {};
        obj[e.currentTarget.dataset.prop] = e.detail.value;
        console.log(obj);
        this.setData(obj);
    },
    // 发布时长输入改变
    duraChange: function (e) {
        this.setData({ dura: e.detail });
    },
    // 取货方式改变
    delChange: function (e) {
        let that = this;
        let delivery = that.data.delivery;
        let id = e.detail.value;
        for (let i = 0; i < delivery.length; i++) {
            delivery[i].check = false
        }
        delivery[id].check = true;
        if (id == 1) {
            that.setData({
                delivery: delivery,
                chooseDelivery: 1
            })
        } else {
            that.setData({
                delivery: delivery,
                chooseDelivery: 0
            })
        }
    },
    // 输入备注
    noteInput: function (e) {
        this.setData({
            "goodinfo.detail": e.detail.value
        })
        if (this.data.note_counts > 45) {
            this.setData({
                "goodinfo.desc": this.data.goodinfo.detail.substring(0, 44) + "..."
            })
        } else {
            this.setData({
                "goodinfo.desc": this.data.goodinfo.detail
            })
        }
        this.setData({
            note_counts: e.detail.cursor,
        })
    },
    // 选择上传的图片
    chooseImg: function () {
        let that = this
        wx.showModal({
            title: '提示',
            content: '由于云存储空间的限制，最多允许上传6张照片，请一次选择全部照片。',
            showCancel: false,
            success: function (res) {
                wx.chooseImage({
                    count: 6,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: function (res) {
                        that.setData({
                            grids: res.tempFilePaths,
                            thumb: res.tempFilePaths[0]
                        })
                    },
                });
            }
        });
    },
    // 点击图片处理程序
    selectPhoto: async function (e) {
        let selectedindex = e.currentTarget.dataset.bindex;
        await wx.showActionSheet({
            itemList: ['作为缩略图', '删除图片'],
            success: function (res) {
                if (res.tapIndex == 1) {
                    //删除图片
                    let tmp = this.data.grids;
                    tmp.splice(selectedindex, 1);
                    this.setData({ grids: tmp });
                } else {
                    //设置为缩略图
                    this.setData({ thumb: grids[selectedindex] });
                }
            }
        });
    },
    // 课程评价输入
    commentInput: function (e) {
        this.setData({
            cdetail_counts: e.detail.value.length,
            "cinfo.detail": e.detail.value
        });
    },
    // 失物招领详情输入
    lNoteInput: function (e) {
        this.setData({
            note_counts: e.detail.cursor,
            "lostinfo.detail": e.detail.value
        });
    },
    // 跳转到详情页
    detail: function (e) {
        let that = this;
        wx.navigateTo({
            url: '/pages/detail/detail?scene=' + that.data.detail_id + '&func=' + e.currentTarget.dataset.func,
        });
    },
    // 发布二手物品
    publishOldGood: function () {
        let that = this;
        wx.showLoading({ title: "正在发布" });
        server.data.publishOldGood({
            grids: this.data.grids,
            dura: this.data.dura,
            chooseDelivery: this.data.chooseDelivery,
            place: this.data.place,
            goodinfo: this.data.goodinfo,
            userinfo: app.globalData.userinfo.info,
            qq: this.data.qq,
            phone: this.data.phone,
            delivery: this.data.delivery,
            thumb: this.data.thumb
        }).then((res) => {
            this.initializeOldgood();
            that.setData({
                show_ershow: false,
                show_c: true,
                detail_id: res.result._id
            });
            wx.pageScrollTo({ scrollTop: 0 });
            wx.hideLoading();
        }).catch(util.common.catchFunc);
    },
    // 发布课程评价
    publishCComment: function () {
        let that = this
        wx.showLoading({
            title: '正在发布',
        })
        server.data.publishCComment({
            cinfo: this.data.cinfo,
            userinfo: app.globalData.userinfo.info
        }).then((res) => {
            this.initializeCComment();
            that.setData({
                show_cc: true,
                show_ershow: false,
                show_losta: false,
                show_course: false,
                detail_id: res.result._id,
            });
            wx.pageScrollTo({
                scrollTop: 0,
            });
            
            wx.hideLoading();
        }).catch(util.common.catchFunc);
    },
    // 发布失物招领
    publishLostfound: function () {
        let that = this;
        wx.showLoading({ title: "正在发布" });
        server.data.publishOldGood({
            grids: this.data.grids,
            place: this.data.place,
            lostinfo: this.data.lostinfo,
            userinfo: app.globalData.userinfo.info,
        }).then((res) => {
            this.initializeLostfound();
            that.setData({
                show_losta: false,
                show_cl: true,
                detail_id: res.result._id,
            })
            wx.pageScrollTo({ scrollTop: 0 });
            wx.hideLoading();
        }).catch(util.common.catchFunc);
    }
})