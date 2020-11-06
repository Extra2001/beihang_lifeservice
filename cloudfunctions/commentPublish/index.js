// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    if ((await cloud.openapi.security.msgSecCheck({
        content: event.comment.value
    })).errCode == 0) {
        let arr = (await cloud.database().collection(event.collection).doc(event._id).get()).data.comment
        if (arr == undefined) {
            arr = []
        }
        let tmp = event.comment
        tmp._openid = wxContext.OPENID
        arr.push(tmp)
        return (await cloud.database().collection(event.collection).doc(event._id).update({
            data: {
                comment: arr,
            }
        }))
    }
    else {
        return "risky"
    }
}