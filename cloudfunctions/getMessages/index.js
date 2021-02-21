// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let data = await cloud.database().collection("message").where({
    openid: wxContext.OPENID
  }).orderBy("stamp", "desc").skip(event.page * 20).limit(20).get()
  return data
}