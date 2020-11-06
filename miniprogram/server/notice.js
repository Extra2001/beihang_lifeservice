const db = wx.cloud.database({
    env: 'studentinfo-0a2885'
});

function getBanner() {
    return new Promise((resolve, reject) => {
        db.collection('banner').get({
            success: function (res) {
                resolve(res);
            },
            fail: function (e) {
                reject({
                    errCode: 1,
                    errMsg: "连接服务器失败",
                    errData: e
                })
            }
        })
    })
}

module.exports = {
    getBanner: getBanner
}