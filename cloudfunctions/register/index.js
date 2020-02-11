// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let campus= event.campus
  let stamp= event.stamp
  let info= event.info
  let useful= event.useful
  let parse= event.parse
  let studentcard= event.studentcard
  if((await cloud.database().collection('user').where({
      _openid:wxContext.OPENID
    }).get()).data.length != 0){
    return 1//该微信已注册
    }
  else if ((await cloud.database().collection('user').where({
    studentcard: event.studentcard
  }).get()).data.length != 0){
    return 2//该校卡已注册
  }
  else{
    return (await cloud.database().collection('user').doc((await cloud.database().collection('user').add({
      data: {
        campus: campus,
        stamp: stamp,
        info: info,
        useful: useful,
        parse: parse,
        studentcard: studentcard,
        _openid:wxContext.OPENID
      }
    }))._id).get()).data
    return 4
  }
  return 5
}