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
    nomore: false,
    list: [],
    page: 0,
    actionSheet: false,
    cur_id: "",
    actions: []
  },

  onLoad: function (options) {
    wx.showNavigationBarLoading();
    this.getMyList();
  },

  onPullDownRefresh: function () {
    this.data.page = 0;
    this.getMyList();
  },

  onReachBottom: function () {
    if (this.data.nomore)
      return;
    this.data.page++;
    this.getMyList();
  },

  detail: function (e) {
    util.common.goUrl("/pages/oldgood/detail/detail?id=" + e.currentTarget.dataset.id);
  },

  getMyList: function () {
    server.oldgood.getMyList({ page: this.data.page }).then(res => {
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      let tmp = this.data.list;
      if (this.data.page)
        tmp = this.data.list.concat(res.oldgoodLists);
      else
        tmp = res.oldgoodLists;
      this.setData({ list: tmp });
      if (res.oldgoodLists.length < 20)
        this.setData({ nomore: true });
      else
        this.setData({ nomore: false });
      if (res.oldgoodLists.length === 0)
        this.data.page--;
    }).catch(util.common.catchFunc);
  },
  showOptions: function (e) {
    let _id = e.currentTarget.dataset.id;
    this.data.cur_id = _id;
    let actions = [[{ name: "设置为已售出" },
    { name: "擦亮商品" },
    { name: "下架商品" },
    { name: "删除", color: "red" }],
    [{ name: "设置为已售出", disabled: true },
    { name: "擦亮商品", disabled: true },
    { name: "重新上架商品" },
    { name: "删除", color: "red" }]];
    if (this.data.list.find(x => x._id == _id).state == 0)
      this.setData({ actions: actions[0] });
    else
      this.setData({ actions: actions[1] });
    this.setData({ actionSheet: true });
  },
  hideOptions: function (e) {
    this.setData({ actionSheet: false });
  },
  actionHandler: function (e) {
    let _id = this.data.cur_id;
    app.globalData.refresh.oldgood = true;
    if (e.detail.name == "设置为已售出") {
      server.oldgood.setState({ _id: _id, state: 1 }).then(() => {
        util.common.notify("已设置为售出");
      });
      this.data.list.find(x => x._id == _id).state = 1;
      this.setData({ list: this.data.list });
    } else if (e.detail.name == "擦亮商品") {
      server.oldgood.reNew({ _id: _id }).then(() => {
        util.common.notify("已擦亮");
      });
      this.data.list.find(x => x._id == _id).creat = new Date().getTime() - 20;
      this.setData({ list: this.data.list });
    } else if (e.detail.name == "下架商品") {
      server.oldgood.setState({ _id: _id, state: 2 }).then(() => {
        util.common.notify("已下架");
      });
      this.data.list.find(x => x._id == _id).state = 2;
      this.setData({ list: this.data.list });
    } else if (e.detail.name == "重新上架商品") {
      server.oldgood.setState({ _id: _id, state: 0 }).then(() => {
        util.common.notify("商品已重新上架");
      });
      this.data.list.find(x => x._id == _id).state = 0;
      this.setData({ list: this.data.list });
    } else if (e.detail.name == "删除") {
      wx.showModal({
        title: "提示",
        content: "您确定要删除当前商品吗？",
        success: res => {
          if (res.confirm) {
            server.oldgood.deleteOne({ _id: _id }).then(() => {
              util.common.notify("已删除");
            });
            this.data.list.splice(this.data.list.findIndex(x => x._id == _id), 1);
            this.setData({ list: this.data.list });
          }
        }
      })
    }
  }
})