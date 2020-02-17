// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  if ((await cloud.openapi.security.imgSecCheck({
    media:{
      contentType: 'image/png',
      value: Buffer.from(event.buffer.data)
    }
  })).errCode == 0) {
    return "ok"
  }
  else {
    return "risky"
  }
}