// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let img = event.img
  let thumb = event.thumb
  let creat= event.creat
  let dura= event.dura
  let status = event.status
  let deliveryid = event.deliveryid
  let place= event.place
  let goodinfo = event.goodinfo
  let userinfo =event.userinfo
  let phone= event.phone
  let qq = event.qq
  return (await cloud.database().collection('oldgood').doc((await cloud.database().collection('oldgood').add({
    data:{
      img: img,
      thumb: thumb,
      creat:creat,
      dura:dura,
      status:status,
      deliveryid:deliveryid,
      place:place,
      goodinfo: goodinfo,
      userinfo: userinfo,
      phone: phone,
      qq: qq,
      _openid: wxContext.OPENID
    }
  }))._id).get()).data
}