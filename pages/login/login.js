var app = getApp() //引入app全局变量
Page({
  data: {
    device_id: app.globalData.device_id,
    api_key: app.globalData.api_key,
  },

/* ---------------------------------------------处理函数部分start-------------------------------------------------*/ 
  // 设备ID表单处理函数
  device_idHanlde(e){
    app.globalData.device_id = e.detail.value   //修改全局变量device_id
    this.setData({ device_id: e.detail.value })
  },

  // 密钥表单处理函数
  api_keyHandle(e){
    app.globalData.api_key = e.detail.value     //修改全局变量api_key
    this.setData({ api_key: e.detail.value })
  },

  // 登陆处理函数
  loginHanlde(){
    //encodeURIComponent函数可把字符串作为URI组件进行编码,避免参数丢失
    const api_key = encodeURIComponent(JSON.stringify(app.globalData.api_key))
    console.log(api_key)
    console.log("登陆中...")
    wx.reLaunch({
      url: '../index/index?id=' + this.data.device_id + '&key=' + api_key ,
      success: function(res) {
        wx.showLoading({
          title: '登陆中',
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      },
    })
  },
/* ---------------------------------------------处理函数部分end-------------------------------------------------*/ 

})