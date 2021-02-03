const request = require("./account.js").request;
const common = require("../util/common.js");

function getOne(options) {
  return request({
    url: "oldgood/get",
    data: options
  });
}

function getAllList(options) {
  return request({
    url: "oldgood/getalllist",
    data: options
  });
}

function getMyList(options) {
  return request({
    url: "oldgood/getmylist",
    data: options
  });
}

function getKindList(options) {
  return request({
    url: "oldgood/getlist",
    data: options
  });
}

function submitInfo(goodInfo) {
  return request({
    url: "oldgood/publish",
    data: { goodInfo: goodInfo }
  });
}

function goodInfoToString(goodInfo) {
  let a = goodInfo;
  return `${a.name}\n${a.detail}\n${a.xianyulink}\n${a.qq}\n${a.phone}`
}

function publish(options) {
  return new Promise((resolve, reject) => {
    if (options.img) {
      wx.showLoading({ title: '正在检查信息', mask: true });
      let promiseArr = [];
      promiseArr.push(common.checkImg(options.img));
      promiseArr.push(common.checkMsg(goodInfoToString(options.goodInfo)));
      Promise.all(promiseArr).then(() => {
        wx.showLoading({ title: '正在上传图片', mask: true });
        return common.uploadFile({
          filePaths: options.img,
          serviceKind: 0
        });
      }).then(res => {
        wx.showLoading({ title: '正在请求数据', mask: true });
        options.goodInfo.keys = res.keys;
        return submitInfo(options.goodInfo);
      }).then(res => {
        resolve(res);
      }).catch(e => { reject(e); });
    } else {
      common.checkMsg(goodInfoToString(options.goodInfo)).then(() => {
        wx.showLoading({ title: '正在请求数据', mask: true });
        return submitInfo(options.goodInfo);
      }).then(res => {
        resolve(res);
      }).catch(e => { reject(e); });
    }
  })
}

function deleteOne(options) {
  return request({
    url: "oldgood/delete",
    data: options
  });
}

function reNew(options) {
  return request({
    url: "oldgood/renew",
    data: options
  });
}
function setState(options) {
  return request({
    url: "oldgood/setstate",
    data: options
  });
}

function iWant(options) {
  return request({
    url: 'oldgood/iwant',
    data: options
  });
}

module.exports = {
  // { _id: String }
  getOne: getOne,
  // { page: Number }
  getMyList: getMyList,
  // { page: Number, kind: Number }
  getKindList: getKindList,
  // { page: Number }
  getAllList: getAllList,
  // { img: Array, goodInfo: Object }
  publish: publish,
  // { _id: String }
  deleteOne: deleteOne,
  // { _id: String }
  reNew: reNew,
  // { _id: String, state: Number }
  setState: setState,
  // { _id: String, message: String }
  iWant: iWant
}