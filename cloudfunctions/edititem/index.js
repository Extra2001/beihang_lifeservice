// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.operateId == 0) {//更新数据
    return await cloud.database().collection(event.collection).doc(event._id).update({
      data: event.newData
    });
  }
  else if (event.operateId == 1) {//删除数据
    return await cloud.database().collection(event.collection).doc(event._id).remove();
  }
}