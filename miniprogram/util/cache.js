function clearCache() {
    wx.removeStorage({
        key: 'oldgood',
    })
    wx.removeStorage({
        key: 'myoldgood',
    })
    wx.removeStorage({
        key: 'ccomment',
    })
    wx.removeStorage({
        key: 'myccomment',
    })
    wx.removeStorage({
        key: 'lostfound',
    })
    wx.removeStorage({
        key: 'mylostfound',
    })
}

function checkAndRemoveEmpty(keyName) {
    wx.getStorage({
        key: keyName,
        success: function (res) {
            if (!res.data) {
                wx.removeStorage({
                    key: keyName,
                })
            }
        }
    })
}

function addDataListCache(collection, list) {
    if (list) {
        wx.setStorage({
            data: list,
            key: collection,
        })
    }
    checkAndRemoveEmpty(collection);
}

function readDataListCache(collection) {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: collection,
            success: (res) => {
                if (res.data.length == 0)
                    reject({
                        errCode: 0,
                        errMsg: "无本地缓存"
                    });
                else
                    resolve(res);
            },
            fail: (e) => {
                reject({
                    errCode: 0,
                    errMsg: "无本地缓存",
                    errData: e
                });
            }
        })
    })
}

module.exports = {
    clearCache: clearCache,
    addDataListCache: addDataListCache,
    readDataListCache: readDataListCache
}