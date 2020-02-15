// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let userinfo = event.userinfo
  let cinfo = event.cinfo
  return (await cloud.database().collection('ccomment').add({
    data: {
      userinfo:userinfo,
      cinfo:cinfo,
      creat: new Date().getTime(),
      _openid:wxContext.OPENID
    }
  }))
}