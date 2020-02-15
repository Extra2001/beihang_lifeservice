// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return (await cloud.database().collection('lostfound').add({
    data: {
      img: event.img,
      thumb: event.thumb,
      creat: event.creat,
      status: event.status,
      lostinfo: event.lostinfo,
      userinfo: event.userinfo,
      _openid:wxContext.OPENID
    }
  }))
}