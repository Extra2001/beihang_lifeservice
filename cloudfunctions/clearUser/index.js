// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  "env": "studentinfo-0a2885"
})


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  console.log(await db.collection('oldgood').where({
    _openid:event.openid
  }).remove())
  console.log(await db.collection('ccomment').where({
    _openid: event.openid
  }).remove())
  console.log(await db.collection('lostfound').where({
    _openid: event.openid
  }).remove())
  console.log(await db.collection('user').where({
    _openid: event.openid
  }).remove())
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}