const app = getApp()
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
const indexObj = {
    "old": "oldgood",
    "ccomm": "ccomment",
    "losta": "lostfound"
};
Page({
    data: {
        first_title: true,
        cshow: false,
        commentValue: '',
        isFocus: false,
    },
    onPullDownRefresh() {
        this.getPublish(this.data.id);
    },
    onLoad: function (e) {
        let that = this
        wx.getSystemInfo({
            success: function (res) {
                if (res.system.indexOf('Android') != -1)
                    that.setData({ isAndroid: true });
            }
        })
        if (e.func == "old") {
            this.setData({
                func: 'old',
                showBuy: true,
                showFound: false,
                showC: false,
            });
        } else if (e.func == "losta") {
            this.setData({
                func: 'losta',
                showBuy: false,
                showFound: true,
                showC: false,
            });
        } else if (e.func == "ccomm") {
            this.setData({
                func: 'ccomm',
                showBuy: false,
                showFound: false,
                showC: true,
            });
        }
        this.setData({
            id: e.scene,
            thisopenid: app.globalData.userinfo._openid
        });
        this.getPublish(e.scene);
    },
    //获取发布信息
    getPublish(_id) {
        let that = this;
        server.data.getItem({
            collection: indexObj[this.data.func],
            _id: _id
        }).then(res => {
            that.setData({
                publishinfo: res.data,
                userinfo: res.data.userinfo
            })
            if (res.data.img && res.data.img.length != 0) {
                that.setSwiperHeight(res.data.img[0])
            }
            wx.stopPullDownRefresh();
        }).catch(util.common.catchFunc);

    },
    //回到首页
    home: function () {
        wx.switchTab({ url: '/pages/index/index' });
    },
    //提供卖家信息
    buy: function () {
        if (this.data.publishinfo.status != 0) {
            return
        }
        let that = this
        let actionSheetArray = []
        let selected_phone = false;
        let selected_qq = false;
        let selected_xianyulink = false;
        if (this.data.publishinfo.phone.length != 0) {
            actionSheetArray.push("手机号：" + this.data.publishinfo.phone)
            selected_phone = true
        }
        if (this.data.publishinfo.qq.length != 0) {
            actionSheetArray.push("QQ号：" + this.data.publishinfo.qq)
            selected_qq = true
        }
        if (this.data.publishinfo.goodinfo.xianyulink.length != 0) {
            actionSheetArray.push("复制闲鱼链接")
            selected_xianyulink = true
        }
        if (actionSheetArray.length == 0) {
            wx.showToast({
                title: '卖家未提供联系方式',
                icon: 'none'
            });
            return;
        }
        wx.showActionSheet({
            itemList: actionSheetArray,
            success: function (res) {
                if (res.tapIndex == 0) {
                    if (selected_phone) {
                        wx.setClipboardData({ data: that.data.publishinfo.phone });
                    } else if (selected_qq) {
                        wx.setClipboardData({ data: that.data.publishinfo.qq });
                    } else if (selected_xianyulink) {
                        wx.setClipboardData({ data: that.data.publishinfo.goodinfo.xianyulink });
                    }
                } else if (res.tapIndex == 1) {
                    if (selected_phone) {
                        if (selected_qq) {
                            wx.setClipboardData({ data: that.data.publishinfo.qq });
                        } else if (selected_xianyulink) {
                            wx.setClipboardData({ data: that.data.publishinfo.goodinfo.xianyulink });
                        }
                    } else if (selected_qq) {
                        wx.setClipboardData({ data: that.data.publishinfo.goodinfo.xianyulink });
                    }
                } else if (res.tapIndex == 2) {
                    wx.setClipboardData({ data: that.data.publishinfo.goodinfo.xianyulink });
                }
            }
        })
    },
    found: function () {
        if (this.data.publishinfo.status != 0) {
            return
        }
        let that = this;
        let actionSheetArray = [];
        let selected_phone = false;
        let selected_qq = false;
        if (this.data.publishinfo.lostinfo.phone.length != 0) {
            actionSheetArray.push("手机号：" + this.data.publishinfo.lostinfo.phone)
            selected_phone = true
        }
        if (this.data.publishinfo.lostinfo.qq.length != 0) {
            actionSheetArray.push("QQ号：" + this.data.publishinfo.lostinfo.qq)
            selected_qq = true
        }
        if (actionSheetArray.length == 0) {
            wx.showToast({
                title: '无发布者信息',
                icon: 'none'
            })
            return
        }
        wx.showActionSheet({
            itemList: actionSheetArray,
            success: function (res) {
                if (res.tapIndex == 0) {
                    if (selected_phone) {
                        wx.setClipboardData({ data: that.data.publishinfo.lostinfo.phone });
                    } else if (selected_qq) {
                        wx.setClipboardData({ data: that.data.publishinfo.lostinfo.qq });
                    }
                } else if (res.tapIndex == 1) {
                    if (selected_qq) {
                        wx.setClipboardData({ data: that.data.publishinfo.lostinfo.qq });
                    }
                }
            }
        });
    },
    //路由
    go: function (e) {
        wx.navigateTo({ url: e.currentTarget.dataset.go });
    },
    onShareAppMessage: function () {
        return {
            title: '北航生活服务——详情页',
            path: '/pages/detail/detail?scene=' + this.data.publishinfo._id + '&func=' + this.data.func,
        }
    },
    showComment: function () {
        this.setData({
            cshow: true,
            isFocus: true,
        })
    },
    closeComment: function () {
        this.setData({ cshow: false });
    },
    commentInput: function (e) {
        this.setData({ commentValue: e.detail.value });
    },
    commentPub: function () {
        if (this.data.commentValue.length == 0) {
            wx.showToast({
                title: '输入的内容不能为空',
                icon: 'none'
            });
            return false;
        }
        let that = this;
        wx.showLoading({ title: '正在发布' });
        server.data.publishComment({
            collection: indexObj[that.data.func],
            comment: {
                userinfo: app.globalData.userinfo.info,
                value: that.data.commentValue
            },
            _id: that.data.id
        }).then(() => {
            that.setData({
                cshow: false,
                commentValue: ''
            });
            wx.hideLoading();
            wx.showToast({ title: '发布成功' });
            that.getPublish(that.data.id);
        }).catch(util.common.catchFunc);
    },
    deleteit: function (e) {
        let that = this
        wx.showModal({
            title: '提示',
            content: '确实要删除这条评论吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除',
                    })
                    let flag = -1;
                    for (let i = 0; i < that.data.publishinfo.comment.length; i++) {
                        if (e.currentTarget.dataset.ord.creat == that.data.publishinfo.comment[i].creat) {
                            flag = i;
                            break;
                        }
                    }
                    if (flag == -1) {
                        wx.hideLoading();
                        wx.showToast({
                            title: '删除失败',
                            icon: 'none'
                        })
                        return;
                    }
                    let arr = that.data.publishinfo.comment
                    arr.splice(flag, 1);
                    console.log(arr)
                    server.data.deleteComment({
                        _id: that.data.id,
                        newData: {
                            comment: arr
                        },
                        collection: indexObj[that.data.func]
                    }).then(() => {
                        wx.hideLoading();
                        wx.showToast({ title: '删除成功' });
                        that.setData({ "publishinfo.comment": arr });
                    }).catch(util.common.catchFunc);
                }
            }
        })

    },
    commentCancel: function () {
        this.setData({
            cshow: false
        })
    },
    preview: function (e) {
        let that = this
        wx.previewImage({
            urls: that.data.publishinfo.img,
            current: e.currentTarget.dataset.img
        })
    },
    swiperchange: function (e) {
        this.setSwiperHeight(this.data.publishinfo.img[e.detail.current])
    },
    setSwiperHeight: function (e) {
        let that = this
        wx.getImageInfo({
            src: e,
            success(res) {
                console.log(res)
                let swiperH = res.height / res.width * 650
                that.setData({
                    swiperHeight: swiperH
                })
            }
        })
    }
})