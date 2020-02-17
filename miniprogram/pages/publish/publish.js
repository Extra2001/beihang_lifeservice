const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({
  data: {
    systeminfo: app.systeminfo,
    setInter: '',
    entime: {
      enter: 600,
      leave: 300
    }, //进入褪出动画时长
    tab: [{
        name: '二手商品',
        id: 0,
      },
      {
        name: '课程评价',
        id: 1,
      },
      {
        name: '拾物/寻物',
        id: 2,
      }
    ],
    tabid: 0
  },
  //切换标签页
  changeTab(e) {
    let that = this;
    that.setData({
      tabid: e.currentTarget.dataset.id
    })
    this.initial()
    this.initialc()
    this.linitial()
    if (e.currentTarget.dataset.id == 0) {
      that.setData({
        show_ershow: true,
        show_losta: false,
        show_course: false,
        show_c: false,
        show_cc: false,
        show_cl: false
      })
      this.updateErshow()
    } else if (e.currentTarget.dataset.id == 1) {
      that.setData({
        show_course: true,
        show_ershow: false,
        show_losta: false,
        show_c: false,
        show_cc: false,
        show_cl: false
      })
      this.endSetInter()
    } else if (e.currentTarget.dataset.id == 2) {
      that.setData({
        show_losta: true,
        show_ershow: false,
        show_course: false,
        show_c: false,
        show_cc: false,
        show_cl: false
      })
      this.endSetInter()
      this.updateLosta()
      this.linitial()
    }
  },
  onShow: function() {

    if (this.data.tabid == 0) {
      this.updateErshow()
    } else if (this.data.tabid == 1) {

    } else if (this.data.tabid == 2) {
      this.updateLosta()
    }
  },
  onHide: function() {
    this.endSetInter()
  },
  //恢复初始态
  initial() {
    let that = this;
    that.setData({
      dura: 30,
      place: '',
      grids: [],
      chooseDelivery: 0,
      show_ershow: true,
      show_c: false,
      show_losta: false,
      show_course: false,
      show_cc: false,
      show_cl: false,
      active: 0,
      note_counts: 0,
      notes: '',
      phone: '',
      qq: '',
      delivery: [{
        name: '自提',
        id: 0,
        check: true,
      }, {
        name: '帮送',
        id: 1,
        check: false
      }],
      thumb: '',
      goodinfo: {
        name: '',
        rawprice: 20,
        price: 15,
        detail: '',
        xianyulink: '',
        desc: '',
        campus: app.campus.name
      }
    })
    this.updateErshow()
  },
  onLoad() {
    if (getApp().openid.length == 0) {
      wx.switchTab({
        url: '/pages/start/start',
      })
    }
    this.setData({
      userinfo: app.userinfo
    })
    this.initial();
  },
  bNameInput(e) {
    this.data.goodinfo.name = e.detail.value
  },
  //价格输入改变
  rawPriceChange(e) {
    this.data.goodinfo.rawprice = e.detail.value
  },
  //价格输入改变
  priceChange(e) {
    this.data.goodinfo.price = e.detail.value
  },
  //发布时长输入改变
  duraChange(e) {
    this.data.dura = e.detail;
  },
  //地址输入
  placeInput(e) {
    this.data.place = e.detail.value
  },
  //手机号输入
  phoneInput(e) {
    this.data.phone = e.detail.value
  },
  qqInput(e) {
    this.data.qq = e.detail.value
  },
  //QQ号输入
  //取货方式改变
  delChange(e) {
    let that = this;
    let delivery = that.data.delivery;
    let id = e.detail.value;
    for (let i = 0; i < delivery.length; i++) {
      delivery[i].check = false
    }
    delivery[id].check = true;
    if (id == 1) {
      that.setData({
        delivery: delivery,
        chooseDelivery: 1
      })
    } else {
      that.setData({
        delivery: delivery,
        chooseDelivery: 0
      })
    }
  },
  //输入备注
  noteInput(e) {
    this.data.goodinfo.detail = e.detail.value
    if (this.data.note_counts > 45) {
      this.data.goodinfo.desc = this.data.goodinfo.detail.substring(0, 44) + "..."
    } else {
      this.data.goodinfo.desc = this.data.goodinfo.detail
    }
    this.setData({
      note_counts: e.detail.cursor,
    })
  },
  linkInput(e) {
    this.data.goodinfo.xianyulink = e.detail.value
  },
  chooseImg() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '由于云存储空间的限制，最多允许上传6张照片，请一次选择全部照片',
      showCancel: false,
      success(res) {
        wx.chooseImage({
          count: 6,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: function(res) {
            that.setData({
              grids: res.tempFilePaths,
              thumb: res.tempFilePaths[0]
            })

          },
        })
      }
    })


  },
  async selectPhoto(e) {
    let that = this

    let selectedindex = e.currentTarget.dataset.bindex
    await wx.showActionSheet({
      itemList: ['作为缩略图', '删除图片'],
      success(res) {
        if (res.tapIndex == 1) { //删除图片
          that.delPhoto(selectedindex)
        } else { //设置为缩略图
          that.thumbPhoto(selectedindex)
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  delPhoto(index) {
    this.data.grids.splice(index, 1)
    wx.showLoading({
      title: '正在删除',
    })
  },
  thumbPhoto(index) {
    this.setData({
      thumb: grids[index]
    })
  },
  //发布校检
  check_pub() {
    let that = this;
    if (that.data.goodinfo.name.length == 0) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none',
      });
      return false;
    }
    //如果用户选择了自提，需要填入详细地址
    if (that.data.delivery[0].check) {
      if (that.data.place == '') {
        wx.showToast({
          title: '请输入地址',
          icon: 'none',
        });
        return false;
      }
    }

    if (that.data.qq.length == 0 && that.data.phone.length == 0) {
      wx.showToast({
        title: '请输入至少一种联系方式',
        icon: 'none',
      });
      return false;
    }
    if (that.data.phone.length != 0 && that.data.phone.length != 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return false;
    }
    //没有输入详细信息
    if (that.data.goodinfo.detail.length == 0) {
      wx.showToast({
        title: '请输入详细信息',
        icon: 'none',
      });
      return false;
    }
    that.publish();
  },
  //正式发布
  publish() {
    let that = this;
    this.endSetInter()
    wx.showLoading({
      title: '正在发布',
    })
    let thumbid = -1
    let files = []
    let flag = true;
    let promiseArr = []
    for (let i = 0; i < this.data.grids.length; i++) {
      let filePath = that.data.grids[i]
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        success(res) {
          wx.cloud.callFunction({
            name: "checkImg",
            data: {
              buffer: res.data
            },
            success(e) {
              if (e.result == "ok") {}
            },
            fail(e) {
              wx.hideLoading()
              wx.showToast({
                title: '图片违法',
                icon: 'none'
              })
              flag = false;
              return;
            }
          })
        }
      })
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: "old/" + new Date().getTime(),
          filePath: filePath, // 文件路径
        }).then(res => {
          files.push(res.fileID)
          if (that.data.thumb == that.data.grids[i]) {
            thumbid = i
          }
          reslove()
        }).catch(error => {
          console.log(error)
        })
      }))
    }
    Promise.all(promiseArr).then(res => {
      if (flag) {
        that.updateDatabase(files, thumbid)
      } else {
        wx.cloud.deleteFile({
          fileList: files
        })
      }
    })
  },
  updateDatabase(files, thumbid) {
    let that = this
    wx.cloud.callFunction({
      name: "publishold",
      data: {
        img: files,
        thumb: files[thumbid],
        creat: new Date().getTime(),
        dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
        status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
        //分类
        deliveryid: that.data.chooseDelivery, //0自1配
        place: that.data.place, //选择自提时地址
        goodinfo: that.data.goodinfo,
        userinfo: app.userinfo,
        qq: that.data.qq,
        phone: that.data.phone
      },
      success: function(res) {
        that.setData({
          show_ershow: false,
          show_c: true,
          detail_id: res.result._id,
        })
        wx.removeStorage({
          key: 'oldgood',
          success: function(res) {},
        })
        wx.removeStorage({
          key: 'myoldgood',
          success: function(res) {},
        })
        wx.pageScrollTo({
          scrollTop: 0,
        })
        wx.hideLoading()
        //滚动到顶部
      },
      fail(res) {
        wx.hideLoading()
        if (("" + res).indexOf("errCode: 87014") != -1) {
          wx.showToast({
            title: '含有违法信息',
            icon: 'none'
          })
          return;
        } else {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          })
        }
      }
    })
  },
  detail() {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id + '&func=old',
    })
  },
  //二手商品页面数据更新
  updateErshow: function() {
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function() {
        wx.hideLoading()
        that.setData({
          dura: that.data.dura,
          place: that.data.place,
          chooseDelivery: that.data.chooseDelivery,
          note_counts: that.data.note_counts,
          goodinfo: that.data.goodinfo,
          grids: that.data.grids
        })
      }, 3000);
  },
  //结束更新
  endSetInter: function() {
    var that = this;
    clearInterval(that.data.setInter)
  },
  initialc() {
    this.setData({
      cinfo: {
        name: '',
        teacher: '',
        detail: '',
      },
      show_cc: false,
      show_course: true,
      show_ershow: false,
      show_c: false,
      show_losta: false,
      show_cl: false,
      cdetail_counts: 0,
    })
  },
  cNameInput(e) {
    this.data.cinfo.name = e.detail.value
  },
  teacherInput(e) {
    this.data.cinfo.teacher = e.detail.value
  },
  commentInput(e) {
    this.data.cinfo.detail = e.detail.value
    this.setData({
      cdetail_counts: e.detail.value.length
    })
  },
  detailc() {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id + '&func=ccomm',
    })
  },
  detaill() {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id + '&func=losta',
    })
  },
  cpub(e) {
    let that = this
    if (this.data.cinfo.name.length == 0) {
      wx.showToast({
        title: '请输入课程名称',
        icon: 'none',
      });
      return false;
    }
    if (this.data.cinfo.teacher.length == 0) {
      this.data.cinfo.teacher = "无"
    }
    if (this.data.cinfo.detail.length < 5) {
      wx.showToast({
        title: '评价内容过短',
        icon: 'none',
      });
      return false;
    }
    wx.showLoading({
      title: '正在发布',
    })
    wx.cloud.callFunction({
      name: "cpublish",
      data: {
        cinfo: that.data.cinfo,
        userinfo: app.userinfo,
      },
      success(res) {
        that.setData({
          show_cc: true,
          show_ershow: false,
          show_losta: false,
          show_course: false,
          detail_id: res.result._id,
        })
        wx.removeStorage({
          key: 'ccomment',
          success: function(res) {},
        })
        wx.removeStorage({
          key: 'myccomment',
          success: function(res) {},
        })
        wx.pageScrollTo({
          scrollTop: 0,
        })
        wx.hideLoading()
      },
      fail(res) {
        wx.hideLoading()
        if (("" + res).indexOf("errCode: 87014") != -1) {
          wx.showToast({
            title: '含有违法信息',
            icon: 'none'
          })
          return;
        } else {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          })
        }
      }
    })
  },
  linitial() {
    this.setData({
      grids: [],
      thumb: '',
      lostinfo: {
        name: '',
        place: '',
        phone: '',
        qq: '',
        detail: '',
        campus: app.campus.name
      },
      show_cc: false,
      show_course: false,
      show_ershow: false,
      show_c: false,
      show_losta: true,
      show_cl: false,
    })
  },
  lNameInput(e) {
    this.data.lostinfo.name = e.detail.value
  },
  lPlaceInput(e) {
    this.data.lostinfo.place = e.detail.value
  },
  lPhoneInput(e) {
    this.data.lostinfo.phone = e.detail.value
  },
  lqqInput(e) {
    this.data.lostinfo.qq = e.detail.value
  },
  lNoteInput(e) {
    this.data.lostinfo.detail = e.detail.value
    this.setData({
      note_counts: e.detail.cursor,
    })
  },
  updateLosta() {
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function() {
        wx.hideLoading()
        that.setData({
          note_counts: that.data.note_counts,
          lostinfo: that.data.lostinfo,
          grids: that.data.grids,
          thumb: that.data.thumb
        })
      }, 3000);
  },
  lpub() {
    if (this.data.lostinfo.name.length == 0) {
      wx.showToast({
        title: '请输入拾到/丢失物品名称',
        icon: 'none',
      });
      return false;
    }
    if (this.data.lostinfo.phone.length == 0 && this.data.lostinfo.qq.length == 0) {
      wx.showToast({
        title: '请输入至少一种联系方式',
        icon: 'none',
      });
      return false;
    }
    if (this.data.lostinfo.phone.length != 0 && this.data.lostinfo.phone.length != 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return false;
    }
    let that = this;
    this.endSetInter()
    wx.showLoading({
      title: '正在发布',
    })
    let thumbid = -1
    let files = []
    let flag = true;
    let promiseArr = []
    for (let i = 0; i < this.data.grids.length; i++) {
      let filePath = that.data.grids[i]
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        success(res) {
          wx.cloud.callFunction({
            name: "checkImg",
            data: {
              buffer: res.data
            },
            success(e) {
              if (e.result == "ok") {}
            },
            fail(e) {
              wx.hideLoading()
              wx.showToast({
                title: '图片违法',
                icon:'none'
              })
              flag = false;
              return;
            }
          })
        }
      })
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: "lostfound/" + new Date().getTime(),
          filePath: filePath, // 文件路径
        }).then(res => {
          files.push(res.fileID)
          if (that.data.thumb == that.data.grids[i]) {
            thumbid = i
          }
          reslove()
        }).catch(error => {
          console.log(error)
        })
      }))
    }
    Promise.all(promiseArr).then(res => {
      if (flag) {
        wx.cloud.callFunction({
          name: "lpublish",
          data: {
            img: files,
            thumb: files[thumbid],
            creat: new Date().getTime(),
            status: 0, //0未找到；1已找到
            lostinfo: that.data.lostinfo,
            userinfo: app.userinfo,
          },
          success: function (res) {
            that.setData({
              show_losta: false,
              show_cl: true,
              detail_id: res.result._id,
            })
            wx.removeStorage({
              key: 'lostfound',
              success: function (res) { },
            })
            wx.removeStorage({
              key: 'mylostfound',
              success: function (res) { },
            })
            wx.pageScrollTo({
              scrollTop: 0,
            })
            wx.hideLoading()
          },
          fail(res) {
            wx.hideLoading()
            if (("" + res).indexOf("errCode: 87014") != -1) {
              wx.showToast({
                title: '含有违法信息',
                icon: 'none'
              })
              return;
            } else {
              wx.showToast({
                title: '发布失败',
                icon: 'none'
              })
            }
          }
        })
      } else {
        wx.cloud.deleteFile({
          fileList: files
        })
      }
      
    })
  }
})