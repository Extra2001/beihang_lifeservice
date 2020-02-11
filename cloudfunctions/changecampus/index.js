// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let campus = event.campus
  const wxContext = cloud.getWXContext()
  let a = (await cloud.database().collection('user').where({
    _openid:wxContext.OPENID
  }).update(
    {
      data:{
        campus:campus
      }
    }
  ))
  return a
}