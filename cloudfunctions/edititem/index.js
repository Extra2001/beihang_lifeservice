// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let dbn =''
  if(event.tabid==0){
    dbn='oldgood'
  }
  else if(event.tabid==1){
    dbn='ccomment'
  }
  else if(event.tabid==2){
    dbn='lostfound'
  }
  if(event.operateid==0){//更新数据
    return cloud.database().collection(dbn).doc(event._id).update({
      data: event.ndata
    })
  }
  else if(event.operateid==1){//删除数据
    return cloud.database().collection(dbn).doc(event._id).remove()
  }
}