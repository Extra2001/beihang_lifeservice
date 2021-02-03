// 云函数入口文件
const cloud = require('wx-server-sdk')
const images = require("images");

cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let file = await cloud.downloadFile({
    fileID: event.fileID,
  });
  let buffer = images(file.fileContent)
    .resize(400)
    .encode("jpg", { quality: 20 });
  let res = await cloud.openapi.security.imgSecCheck({
    media: {
      contentType: 'image/png',
      value: Buffer.from(buffer)
    }
  });
  cloud.deleteFile({
    fileList: [event.fileID]
  });
  return {
    res: res
  }
}