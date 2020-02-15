var app = getApp();
var db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        title: '该程序是做什么的？',
        id: 0,
        des: ['本程序主要为北京航空航天大学的朋友提供发布和获取生活、选课信息的平台。',
          '如果你想让其它学校的同学也有这个平台，请到【关于程序】页面获取信息。'
        ],
        check: true,
      }, {
        title: '该程序收费吗？',
        id: 1,
        des: ['本程序是完全的公益项目，永久承诺不收取任何中介费，您可以随心所欲的发布自己的二手物品、课程评价以及拾到/丢失物品'],
        check: false,
      }, {
        title: '我如何知道有人想要购买我发布的二手物品？',
        id: 2,
        des: ['在发布信息时程序会要求您留下联系方式，想要购买的同学可以通过手机、QQ或者手机号绑定的微信来和您沟通。', '请确定发布使用的手机号已经绑定登录的微信，方便他人鉴定这是否是你的微信'],
        check: false,
      }, {
        title: '我能不能修改自己的头像和昵称？',
        id: 3,
        des: ['很抱歉，暂时不能。', '由于小程序的限制，不能含有太多的功能。现有的头像和昵称就是您的微信头像和昵称，如果您想修改可以直接修改微信头像或昵称'],
        check: false,
      },
      {
        title: '为什么我不能编辑我发布的内容？',
        id: 4,
        des: ['很抱歉，开发者时间有限，暂时没有该项功能', '作为替代，您可以删除您发布的内容再发布一条新的内容。',
          '搜索显示条数大于20条，发布求购，点赞等功能将逐步上线',
          '您可以点击下方的联系开发团队来向我们提出建议，我们将视实际情况采取您的建议'
        ],
        check: false,
      }, {
        title: '我在该平台买到的东西和实际不符怎么办？',
        id: 5,
        des: ['开发小程序平台的目的是为了方便北航的同学发布信息，为这些信息提供一个统一的平台。',
          '任何信息都来自使用者，平台本身并不提供任何信息，也不提供资金托管功能。',
          '因此平台没有保障消费者的能力，发生纠纷应该追究提供信息者的责任。',
          '不过作为开发运营方，我们尽力清理平台上可能是诈骗或无用的信息，并在发生纠纷且必要时提供双方的微信资料。',
          '请放心，我们不会随意泄露您的信息。'
        ],
        check: false,
      },
    ]
  },
  onReady() {},

  show(e) {
    var that = this;
    let ite = e.currentTarget.dataset.show;
    let list = that.data.list;
    if (!ite.check) {
      list[ite.id].check = true;
    } else {
      list[ite.id].check = false;
    }
    that.setData({
      list: list
    })
  },
  //跳转页面
  go(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.go
    })
  },
  onLoad() {
    if (getApp().openid.length == 0) {
      wx.switchTab({
        url: '/pages/start/start',
      })
    }
  },

})