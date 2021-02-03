const request = require("./account.js").request;
const common = require("../util/common.js");

function publish(options) {
  return new Promise((resolve, reject) => {
    common.checkMsg(options.value).then(() => {
      return request({
        url: 'comment/commentpub',
        data: options
      });
    }).then(res => {
      resolve(res);
    }).catch(e => { reject(e) });
  });
}

function reply(options) {
  return new Promise((resolve, reject) => {
    common.checkMsg(options.value).then(() => {
      return request({
        url: 'comment/commentreply',
        data: options
      });
    }).then(res => {
      resolve(res);
    }).catch(e => { reject(e) });
  });
}
function deletecomment(options) {
  return request({
    url: 'comment/commentdelete',
    data: options
  });
}
function get(options) {
  return request({
    url: 'comment/getcomment',
    data: options
  });
}
function getList(options) {
  return request({
    url: 'comment/getcommentlist',
    data: options
  });
}

module.exports = {
  publish: publish,
  reply: reply,
  deletecomment: deletecomment,
  get: get,
  getList: getList
}