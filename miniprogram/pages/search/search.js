const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    scrollTop: 0,
    newlist: [],
    list: [],
    clist: [],
    llist: [],
    key: '',
    blank: false,
    hislist: [],
    nomore: true,
    cnomore: true,
    lnomore: true,
  },
  onLoad: function(options) {
    if (getApp().openid.length == 0) {
      wx.redirectTo({
        url: '/pages/start/start',
      })
    }
    this.gethis();
    this.getnew();
  },
  //获取本地记录
  gethis() {
    let that = this;
    wx.getStorage({
      key: 'history',
      success: function(res) {
        let hislist = JSON.parse(res.data);
        //限制长度
        if (hislist.length > 5) {
          hislist.length = 5
        }
        that.setData({
          hislist: hislist
        })
      },
    })
  },
  //选择历史搜索关键词
  choosekey(e) {
    this.data.key = e.currentTarget.dataset.key;
    this.search('his');
  },
  //最新推荐书籍
  getnew() {
    let that = this;
    db.collection('oldgood').where({
      status: 0,
      dura: _.gt(new Date().getTime()),
    }).orderBy('creat', 'desc').get({
      success: function(res) {
        let newlist = res.data;
        //限定5个推荐内容
        if (newlist.length > 5) {
          newlist.length = 5;
        }
        that.setData({
          newlist: newlist,
        })
      }
    })
  },
  //跳转详情
  detail(e) {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
    })
  },
  //搜索结果
  search(n) {
    this.setData({
      blank: true
    })
    let that = this;
    let key = that.data.key;
    if (key == '') {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none',
      })
      return false;
    }
    wx.setNavigationBarTitle({
      title: '"' + that.data.key + '"的搜索结果',
    })
    wx.showLoading({
      title: '加载中',
    })
    if (n !== 'his') {
      that.history(key);
    }
    db.collection('oldgood').where(_.or([{
        "goodinfo.name": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        "goodinfo.detail": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    ])).orderBy('creat', 'desc').limit(20).get({
      success(e) {
        wx.hideLoading();
        if (e.data.length < 20) {
          that.setData({
            nomore: true
          })
        }
        that.setData({
          page: 0,
          list: e.data,
        })
      }
    })
    db.collection('ccomment').where(_.or([{
        "cinfo.name": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        "cinfo.detail": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        "cinfo.teacher": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    ])).orderBy('creat', 'desc').limit(20).get({
      success(e) {
        wx.hideLoading();
        if (e.data.length < 20) {
          that.setData({
            cnomore: true
          })
        }
        that.setData({
          page: 0,
          clist: e.data,
        })
      }
    })
    db.collection('lostfound').where(_.or([{
        "lostinfo.name": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        "lostinfo.detail": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        "lostinfo.place": db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    ])).orderBy('creat', 'desc').limit(20).get({
      success(e) {
        wx.hideLoading();
        if (e.data.length < 20) {
          that.setData({
            lnomore: true
          })
        }
        that.setData({
          page: 0,
          llist: e.data,
        })
      }
    })
  },
  onReachBottom() {
    this.more();
  },
  //添加到搜索历史
  history(key) {
    let that = this;
    wx.getStorage({
      key: 'history',
      success(res) {
        let oldarr = JSON.parse(res.data); //字符串转数组
        let newa = [key]; //对象转为数组
        for (var i = 0; i < oldarr.length; i++) { //判断是否存在
          if (oldarr[i] == key) {
            return;
          }
        }
        let newarr = JSON.stringify(newa.concat(oldarr)); //连接数组\转字符串
        wx.setStorage({
          key: 'history',
          data: newarr,
        })
      },
      fail(res) {
        //第一次打开时获取为null
        let newa = [key]; //对象转为数组
        var newarr = JSON.stringify(newa); //数组转字符串
        wx.setStorage({
          key: 'history',
          data: newarr,
        })
      }
    });
  },
  keyInput(e) {
    this.data.key = e.detail.value
  },
  //至顶
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  //监测屏幕滚动
  onPageScroll: function(e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
  },
  //加载更多
  more() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1;
    db.collection('publish').where({
      status: 0,
      dura: _.gt(new Date().getTime()),
      key: db.RegExp({
        regexp: '.*' + that.data.key + '.*',
        options: 'i',
      })
    }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
      success: function(res) {
        if (res.data.length == 0) {
          that.setData({
            nomore: true
          })
          return false;
        }
        if (res.data.length < 20) {
          that.setData({
            nomore: true
          })
        }
        that.setData({
          page: page,
          list: that.data.list.concat(res.data)
        })
      },
      fail() {
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
    })
  },
})