// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'bhls-product-8g4rg3z19bb9cc1e'
})
const db = cloud.database().collection('message')

// 云函数入口函数
exports.main = async (event, context) => {
  let data = JSON.parse(event.POSTBODY);
  await db.add({
    data: {
      openid: data.openid,
      serviceKind: data.serviceKind,
      dbId: data.dbId,
      title: data.title,
      subtitle: data.subtitle,
      detail: data.detail,
      read: false,
      stamp: Date.now()
    }
  })
  return {}
}