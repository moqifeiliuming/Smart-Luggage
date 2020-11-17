var app = getApp() //引入app全局变量
Page({
  data: {
    key: 'eaf9a08d317a7a3b',                  //极速数据的密钥
    device_id: app.globalData.device_id,      //onenet设备ID
    api_key: app.globalData.api_key,          //onenet密钥
    refreshTime: app.globalData.refreshTime,  //刷新时间
    showIdFlag: true,                         //是否显示设备ID标志
    showKeyFlag: true,                         //是否显示密钥标志
    showrefreshTime: true ,                   //是否显示刷新时间标志
    address: '',                              //当前地址
    flag: false ,                             //表单数据是否被修改的标志
  },
    /* ---------------------------------------------处理函数部分start-------------------------------------------------*/ 
  //点击修改设备ID按键处理函数
  modifyIdBtnHanlde(){
    this.setData({
      showIdFlag: false,
    })
  },
  //点击修改密钥按键处理函数
    modifyKeyBtnHanlde(){
    this.setData({
      showKeyFlag: false,
    })
  },
  //点击修改定时时间按键处理函数
  modifyTimeBtnHanlde(){
    this.setData({
      showrefreshTime: false,
    })
  },

  // 设备ID表单处理函数
  modifyIdHanlde(e){
    app.globalData.device_id = e.detail.value   //修改全局变量device_id
    this.setData({ device_id: e.detail.value, flag: true })
  },
  // 密钥表单处理函数
  modifyKeyHanlde(e){
    app.globalData.api_key = e.detail.value     //修改全局变量api_key
    this.setData({ api_key: e.detail.value, flag: true })
  },
  // 定时时间表单处理函数
  modifyTimeHanlde(e){
    app.globalData.refreshTime = e.detail.value     //修改全局变量api_key
    this.setData({ refreshTime: e.detail.value, flag: true })
  },
  
  //设备ID表单输入完成处理函数
  modifyIdConfirm(){
    if(this.data.flag){
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      })
    }
    setTimeout(()=>{
      this.setData({
        showIdFlag: true,
        flag: false
      })
    },200);
   
  },
   //密钥表单输入完成处理函数
  modifyKeyConfirm(){
    if(this.data.flag){
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      })
    }
    setTimeout(()=>{
      this.setData({
        showKeyFlag: true,
        flag: false
      })
    },200)
  },
   //定时时间表单输入完成处理函数
   modifyTimeConfirm(){
    if(this.data.flag){
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      })
    }
    setTimeout(()=>{
      this.setData({
        showrefreshTime: true,
        flag: false
      })
    },200)
  },
  /* ---------------------------------------------处理函数部分end-------------------------------------------------*/ 
/*----------------------------------------------辅助函数部分start--------------------------------------------------*/ 
  //获取地址
  getAddress(){
    var _this = this;
    console.log(app.globalData.selfLatitude,app.globalData.selfLongitude)
    wx.request({
      url: 'https://api.jisuapi.com/geoconvert/coord2addr?lat='+ app.globalData.selfLatitude + '&lng='+ app.globalData.selfLongitude + '&type=baidu&appkey=' + _this.data.key, 

      success (res) {
        console.log(res.data.result)
        _this.setData({
          address: res.data.result.address + ' ' + res.data.result.description 
        })
      }
    })
  },

/*----------------------------------------------辅助函数部分end--------------------------------------------------*/ 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getAddress()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})