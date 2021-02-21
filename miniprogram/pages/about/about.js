Page({
  data: {
    mianze: ' 本平台目前提供二手商品信息服务和通识课评价信息服务。平台本身不提供任何信息，所有信息均来自用户上传。请对平台上的信息仔细甄别。\n 小程序运营方不具有承担交易纠纷的责任，但可在必要时协助用户挽回损失。\n“通识课评价”板块中，严禁侮辱谩骂、造谣诋毁等行为，后台会一直对评价内容进行审核。平台内容仅供学习交流使用，不得擅自转载、引用，进行再加工、再创造。'
  },
  //复制
  copy: function(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: res => {
        wx.showToast({
          title: '复制' + e.currentTarget.dataset.name + '成功',
          icon: 'success',
          duration: 1000,
        })
      }
    })
  },
})