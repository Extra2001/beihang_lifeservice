const app = getApp();
const config = require("../../../config.js");
const server = {
  account: require("../../../server/account.js"),
  oldgood: require("../../../server/oldgood.js")
};
const util = {
  common: require("../../../util/common.js")
};
Page({
  data: {
    showPubSuccess: false,
    campusList: config.common.campus,
    kindList: config.getKindNames(),
    kindAction: config.common.kinds,
    note_counts: 0,
    func: 0, // 0: 发布; 1: 编辑
    entime: {
      enter: 600,
      leave: 300
    }, //进入褪出动画时长
    grids: [],
    goodInfo: {},
  },
  onLoad: function (options) {
    this.initialize();
    if (!util.common.checkLogin())
      wx.navigateBack();
  },
  initialize: function () {
    this.setData({
      showPubSuccess: false, note_counts: 0, grids: [],
      goodInfo: {
        name: '', rawprice: 20, price: 15, detail: '', xianyulink: '',
        campus: app.globalData.user.campus, phone: '', qq: '', img: [], keys: [], kind: -1
      },
    });
  },
  detail: function (e) {
    if (this.data._id) {
      wx.navigateBack();
      wx.navigateTo({
        url: '/pages/oldgood/detail?id=' + this.data._id,
      });
    }
  },
  weChatInput: function (e) {
    let obj = {};
    obj[e.currentTarget.dataset.prop] = e.detail.value;
    this.setData(obj);
  },
  noteInput: function (e) {
    this.setData({
      "goodInfo.detail": e.detail.value,
      note_counts: e.detail.cursor
    });
  },
  chooseImg: function () {
    let that = this
    wx.chooseImage({
      count: 3 - this.data.grids.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let tmp = this.data.grids.concat(res.tempFilePaths);
        that.setData({ grids: tmp });
      }
    });
  },
  selectPhoto: function (e) {
    let selectedindex = e.currentTarget.dataset.bindex;
    wx.showActionSheet({
      itemList: ['替换图片', '删除图片'],
      success: (res) => {
        if (res.tapIndex == 1) {
          // 删除图片
          let tmp = this.data.grids;
          tmp.splice(selectedindex, 1);
          this.setData({ grids: tmp });
        } else if (res.tapIndex == 0) {
          // 替换图片
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
              let path = res.tempFilePaths[0];
              if (path) {
                let tmp = this.data.grids;
                tmp[selectedindex] = path;
                this.setData({ grids: tmp });
              }
            }
          });
        }
      }
    });
  },
  publishOldGood: function () {
    if (!this.checkInfo())
      return;
    this.checkImg().then(() => {
      wx.showLoading({ title: '正在发布', mask: true });
      return server.oldgood.publish({
        goodInfo: this.data.goodInfo,
        img: this.data.grids
      });
    }).then(res => {
      wx.hideLoading();
      this.data._id = res._id;
      this.setData({ showPubSuccess: true });
      app.globalData.refresh.oldgood = true;
    }).catch(util.common.catchFunc);
  },
  checkInfo: function () {
    let data = this.data.goodInfo;
    let toast = function (item) { wx.showToast({ title: '请输入' + item, icon: 'none' }) };
    if (!data.name) {
      toast("商品标题");
      return false;
    }
    if (!data.rawprice) {
      toast("商品原价");
      return false;
    }
    if (!data.price) {
      toast("商品价格");
      return false;
    }
    if (!data.detail) {
      toast("商品详情");
      return false;
    }
    if ((!data.phone) && (!data.qq) && (!data.xianyulink)) {
      toast("至少一项联系方式");
      return false;
    }
    return true;
  },
  checkImg: function () {
    return new Promise((resolve, reject) => {
      if (this.data.grids.length == 0)
        wx.showModal({
          title: "提示",
          content: "确定不添加图片发表商品吗？",
          success: res => {
            if (res.confirm)
              resolve();
            else
              reject({
                errCode: 1,
                errMsg: "用户取消"
              });
          }
        });
      else
        resolve();
    });
  },
  chooseKind: function (e) {
    this.setData({ showKindChooser: true });
  },
  selectKind: function (e) {
    this.setData({ "goodInfo.kind": e.detail.id});
  },
  closeKind: function (e) {
    this.setData({ showKindChooser: false });
  },
  chooseCampus: function (e) {
    wx.showActionSheet({
      itemList: config.common.campus,
      success: res => {
        this.setData({ "goodInfo.campus": res.tapIndex });
      }
    });
  }
})