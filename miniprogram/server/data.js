const app = getApp();
const db = wx.cloud.database({
    env: 'studentinfo-0a2885'
});

const util = {
    cache: require("../util/cache.js"),
    common: require("../util/common.js")
};

let msg = ""

// collection: String, page: Number
// collection有三种：'oldgood', 'ccomment', 'lostfound'
// 每页有20个商品
// page从0开始计数
function getList(collection, page, condition) {
    if (!condition)
        condition = {};
    return new Promise((resolve, reject) => {
        db.collection(collection).where(condition).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function (res) {
                if (page == 0)
                    util.cache.addDataListCache(res.data);
                resolve({ data: res.data });
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "数据库查询错误",
                    errData: e
                });
            }
        });
    });
}

function getMyList(collection, page) {
    return new Promise((resolve, reject) => {
        db.collection(collection).where({
            _openid: app.globalData.userinfo._openid
        }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function (re) {
                resolve(re);
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "数据库查询失败",
                    errData: error
                });
            }
        });
    })
}

function checkOldGood(data) {
    let showNotice = function (msgStr) {
        wx.showToast({
            title: msgStr,
            icon: 'none'
        })
    };
    if (data.goodinfo.name.length == 0) {
        showNotice("请输入商品名称");
        msg = "请输入商品名称";
        return false;
    }
    //如果用户选择了自提，需要填入详细地址
    if (data.delivery[0].check) {
        if (data.place == '') {
            showNotice("请输入地址");
            msg = "请输入地址"
            return false;
        }
    }
    if (data.qq.length == 0 && data.phone.length == 0) {
        showNotice("请输入至少一种联系方式");
        msg = "请输入至少一种联系方式"
        return false;
    }
    if (data.phone.length != 0 && data.phone.length != 11) {
        showNotice("请输入正确的手机号");
        msg = "请输入正确的手机号"
        return false;
    }
    //没有输入详细信息
    if (data.goodinfo.detail.length == 0) {
        showNotice("请输入详细信息");
        msg = "请输入详细信息"
        return false;
    }
    return true;
}

function checkCComment(data) {
    if (data.cinfo.name.length == 0) {
        wx.showToast({
            title: '请输入课程名称',
            icon: 'none'
        });
        msg = "请输入课程名称"
        return false;
    }
    if (data.cinfo.teacher.length == 0) {
        data.cinfo.teacher = "无"
    }
    if (data.cinfo.detail.length < 5) {
        wx.showToast({
            title: '评价内容过短',
            icon: 'none'
        });
        msg = "评价内容过短"
        return false;
    }
    return true;
}

function checkLostfound(data) {
    if (data.lostinfo.name.length == 0) {
        wx.showToast({
            title: '请输入拾到/丢失物品名称',
            icon: 'none',
        });
        msg = "丢失物品名称"
        return false;
    }
    if (data.lostinfo.phone.length == 0 && data.lostinfo.qq.length == 0) {
        wx.showToast({
            title: '请输入至少一种联系方式',
            icon: 'none',
        });
        msg = "请输入至少一种联系方式"
        return false;
    }
    if (data.lostinfo.phone.length != 0 && data.lostinfo.phone.length != 11) {
        wx.showToast({
            title: '请输入正确的手机号',
            icon: 'none',
        });
        msg = "请输入正确的手机号"
        return false;
    }
    return true;
}

function checkImg(paths) {
    return new Promise((resolve, reject) => {
        let flag = true;
        for (let i = 0; i < paths.length; i++) {
            wx.getFileSystemManager().readFile({
                filePath: paths[i],
                success: function (res) {
                    wx.cloud.callFunction({
                        name: "checkImg",
                        data: {
                            buffer: res.data
                        },
                        fail: function (e) {
                            // 图片含有违法内容
                            flag = false;
                        }
                    });
                }
            });
        }
        if (flag)
            resolve({
                errCode: 0,
                errMsg: "图片校验通过"
            });
        else
            reject({
                errCode: 3,
                errMsg: "图片含有违法内容"
            });
    });
}

function uploadFiles(data, directory) {
    return new Promise((resolve, reject) => {
        let thumbid = -1
        let files = []
        let promiseArr = []
        checkImg(data.grids).then(() => {
            for (let i = 0; i < data.grids.length; i++) {
                promiseArr.push(new Promise((reslove, reject) => {
                    wx.cloud.uploadFile({
                        cloudPath: directory + "/" + new Date().getTime(),
                        filePath: data.grids[i], // 文件路径
                    }).then(res => {
                        files.push(res.fileID);
                        if (data.thumb == data.grids[i])
                            thumbid = i;
                        reslove();
                    }).catch(error => {
                        console.log(error);
                        reject({
                            errCode: 1,
                            errMsg: "上传文件失败",
                            errData: error
                        });
                    });
                }));
            }
            Promise.all(promiseArr).then(() => {
                resolve({
                    data: {
                        filePaths: files,
                        thumbPath: files[thumbid]
                    },
                    errCode: 0,
                    errMsg: "文件上传完成"
                });
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        });
    });
}

function uploadOldGoodDatabase(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "publishold",
            data: {
                img: data.filePaths,
                thumb: data.thumbPath,
                creat: new Date().getTime(),
                dura: new Date().getTime() + data.dura * (24 * 60 * 60 * 1000),
                status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                //分类
                deliveryid: data.chooseDelivery, //0自1配
                place: data.place, //选择自提时地址
                goodinfo: data.goodinfo,
                userinfo: data.userinfo,
                qq: data.qq,
                phone: data.phone
            },
            success: function (res) {
                util.cache.clearCache();
                resolve({
                    errCode: 0,
                    errMsg: "上传数据库成功",
                    result: res.result
                });
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "上传数据库失败",
                    errData: res
                })
            }
        });
    });
}

function uploadCCommentDatabase(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "cpublish",
            data: {
                cinfo: data.cinfo,
                userinfo: data.userinfo,
            },
            success: function (res) {
                util.cache.clearCache();
                resolve(res);
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "上传数据库失败",
                    errData: res
                });
            }
        })
    });
}

function uploadLostfoundDatabase(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "lpublish",
            data: {
                img: data.filePaths,
                thumb: data.thumbPath,
                creat: new Date().getTime(),
                status: 0, //0未找到；1已找到
                lostinfo: data.lostinfo,
                userinfo: data.userinfo,
            },
            success: function (res) {
                util.cache.clearCache();
                resolve({
                    errCode: 0,
                    errMsg: "上传数据库成功",
                    result: res.result
                });
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "上传数据库失败",
                    errData: res
                });
            }
        });
    });
}

function publishOldGood(data) {
    return new Promise((resolve, reject) => {
        if (!checkOldGood(data)) {
            reject({
                errCode: 2,
                errMsg: msg
            });
            return;
        }
        uploadFiles(data, "old")
            .then((res) => {
                return uploadOldGoodDatabase(Object.assign(data, res.data));
            }).then((res) => {
                resolve({
                    errCode: 0,
                    errMsg: "成功发布",
                    result: res.result
                });
            }).catch((e) => {
                reject(e);
            });
    });
}

function publishCComment(data) {
    return new Promise((resolve, reject) => {
        if (!checkCComment(data))
        {
            reject({
                errCode: 2,
                errMsg: msg
            });
            return;
        }
        uploadCCommentDatabase(data).then(res => {
            resolve({
                errCode: 0,
                errMsg: "成功发布",
                result: res.result
            });
        }).catch(e => {
            reject(e);
        });
    });
}

function publishLostfound(data) {
    return new Promise((resolve, reject) => {
        if (!checkLostfound(data))
        {
            reject({
                errCode: 2,
                errMsg: msg
            });
            return;
        }
        uploadFiles(data, "lostfound")
            .then((res) => {
                return uploadLostfoundDatabase(Object.assign(data, res.data));
            }).then((res) => {
                resolve({
                    errCode: 0,
                    errMsg: "成功发布",
                    result: res.result
                });
            }).catch((e) => {
                reject(e);
            });
    });
}

// data结构：
// data.img: 文件内容
// data._id: 数据库条目的id号
// data.collection: 数据库集合名称
function deleteItem(data) {
    return new Promise((resolve, reject) => {
        if (data.img) {
            wx.cloud.deleteFile({
                fileList: data.img
            });
        }
        wx.cloud.callFunction({
            name: "edititem",
            data: {
                _id: data._id,
                collection: data.collection,
                operateId: 1 //0为更新1为删除
            },
            success: function (res) {
                resolve(res);
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "调用云函数失败",
                    errData: res
                });
            }
        });
    });
}

// data结构：
// data._id: 数据库条目的id号
// data.collection: 数据库集合名称
// data.newData: 新数据
function updateItem(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "edititem",
            data: {
                _id: data._id,
                collection: data.collection,
                operateId: 0, //0为更新1为删除
                newData: data.newData
            },
            success: function (res) {
                resolve(res);
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "调用云函数失败",
                    errData: res
                });
            }
        });
    });
}

// data结构：
// data._id: 数据库条目的id号
// data.collection: 数据库集合名称
function getItem(data) {
    return new Promise((resolve, reject) => {
        db.collection(data.collection).doc(data._id).get({
            success: function (res) {
                resolve(res);
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "数据库查询失败",
                    errData: e
                });
            }
        })
    });
}

// data结构：
// data._id: 数据库条目的id号
// data.collection: 数据库集合名称
// data.comment: { userinfo: Object, value: String }
function publishComment(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "commentPublish",
            data: {
                collection: data.collection,
                comment: {
                    creat: new Date().getTime(),
                    userinfo: data.comment.userinfo,
                    value: data.comment.value
                },
                _id: data._id
            },
            success: function (res) {
                resolve(res);
            },
            fail: function (res) {
                wx.hideLoading();
                if (("" + res).indexOf("errCode: 87014") != -1) {
                    reject({
                        errCode: 3,
                        errMsg: "含有违法信息",
                        errData: res
                    });
                } else {
                    reject({
                        errCode: 1,
                        errMsg: "云函数调用失败",
                        errData: res
                    });
                }
            }
        })
    });
}

function deleteComment(data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "edititem",
            data: {
                _id: data._id,
                newData: data.newData,
                collection: data.collection,
                operateId: 0
            },
            success: function (res) {
                resolve(res);
            },
            fail: function (res) {
                reject({
                    errCode: 1,
                    errMsg: "云函数调用失败",
                    errData: res
                });
            }

        });
    });
}

module.exports = {
    getList: getList,
    publishOldGood: publishOldGood,
    publishCComment: publishCComment,
    publishLostfound: publishLostfound,
    getMyList: getMyList,
    deleteItem: deleteItem,
    updateItem: updateItem,
    getItem: getItem,
    publishComment: publishComment,
    deleteComment: deleteComment
}