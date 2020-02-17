// 云函数入口文件
const cloud = require('wx-server-sdk')
const db= cloud.database()
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  await db.collection('oldgood').where({
    _openid:event.openid
  }).remove();
  await db.collection('ccomment').where({
    _openid: event.openid
  }).remove();
  await db.collection('lostfound').where({
    _openid: event.openid
  }).remove();
  await db.collection('user').where({
    _openid: event.openid
  }).remove();
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}