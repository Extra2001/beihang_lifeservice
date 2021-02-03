const app = getApp();
const config = require("../../../config.js");
const server = {
  account: require("../../../server/account.js"),
  data: require("../../../server/data.js"),
  notice: require("../../../server/notice.js"),
  oldgood: require("../../../server/oldgood.js")
};
const util = {
  cache: require("../../../util/cache.js"),
  common: require("../../../util/common.js")
};
Page({
  data: {
    banner: [],
    kinds: config.common.kinds,
    kindslist: [],
    allList: [],
    nomore: false,
    allListPage: 0,
    curKind: -1,
    kindslistPage: new Array(config.common.kinds.length).fill(0)
  },

  onLoad: function (options) {
    this.getBanner();
    this.getAllList();
  },
  onShow: function () {
    if (app.globalData.refresh.oldgood) {
      app.globalData.refresh.oldgood = false;
      wx.startPullDownRefresh();
    }
  },
  onPullDownRefresh: function () {
    if (this.data.curKind === -1) {
      this.data.allListPage = 0;
      this.getAllList();
    }
    else {
      this.data.kindslistPage[this.data.curKind] = 0;
      this.getKindList(this.data.curKind);
    }
  },

  onReachBottom: function () {
    if (this.data.nomore)
      return;
    if (this.data.curKind === -1) {
      this.data.allListPage++;
      this.getAllList();
    }
    else {
      this.data.kindslistPage[this.data.curKind]++;
      this.getKindList(this.data.curKind);
    }
  },

  onShareAppMessage: function () {

  },
  onTabChange: function (e) {
    this.setData({
      curKind: e.detail.name,
      nomore: false
    });
    if (e.detail.name === -1) {
      if (!this.data.allList)
        this.getAllList();
    }
    else
      if (!this.data.kindslist[e.detail.name])
        this.getKindList(e.detail.name);
  },
  getAllList: function () {
    server.oldgood.getAllList({ page: this.data.allListPage }).then(res => {
      wx.stopPullDownRefresh();
      let tmp = this.data.allList;
      if (this.data.allListPage)
        tmp = tmp.concat(res.oldgoodLists);
      else
        tmp = res.oldgoodLists;
      this.setData({ allList: tmp });
      if (res.oldgoodLists.length < 20)
        this.setData({ nomore: true });
      else
        this.setData({ nomore: false });
      if (res.oldgoodLists.length === 0)
        this.data.allListPage--;
    }).catch(util.common.catchFunc);
  },
  getKindList: function (kind) {
    server.oldgood.getKindList({
      page: this.data.kindslistPage[kind],
      kind: kind
    }).then(res => {
      wx.stopPullDownRefresh();
      if (this.data.kindslistPage[kind])
        this.data.kindslist[kind] = this.data.kindslist[kind].concat(res.oldgoodLists);
      else
        this.data.kindslist[kind] = res.oldgoodLists;
      this.setData({ kindslist: this.data.kindslist });
      if (res.oldgoodLists.length < 20)
        this.setData({ nomore: true });
      else
        this.setData({ nomore: false });
      if (res.oldgoodLists.length === 0)
        this.data.kindslistPage[kind]--;
    }).catch(util.common.catchFunc);
  },
  goUrl: function (e) {
    util.common.goUrl(e.currentTarget.dataset.url);
  },
  getBanner: function () {
    let that = this;
    server.notice.getBanner().then((res) => {
      that.setData({ banner: res.data });
    });
  }
})