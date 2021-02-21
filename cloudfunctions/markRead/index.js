// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (!event._id) {
    if (event.op === 0)
      await cloud.database().collection('message').where({
        openid: wxContext.OPENID
      }).update({
        data: { read: true }
      });
    else if (event.op === 1)
      await cloud.database().collection('message').where({
        openid: wxContext.OPENID
      }).remove();
  }
  else {
    if (event.op === 0)
      await cloud.database().collection('message').doc(event._id).update({
        data: { read: true }
      });
    else if (event.op === 1)
      await cloud.database().collection('message').doc(event._id).remove();
  }
  return {}
}