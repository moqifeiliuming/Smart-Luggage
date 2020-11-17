const util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    dataName: "",               //当前数据名称
    dataUnitSymbol: "",         //当前数据单位
    targetData: null,           //当前数据
    startDate: "2020-11-13",
    startTime:"00:00",
    endDate: "2020-11-14",
    endTime:"00:01",
    id: "",                     //当前数据unit（英文名称，用于检索）
  },
    // 生命周期函数--监听页面加载
    onLoad: function (options) {
      var newTime = util.formatTime(new Date)           //获取当前日期时间
      var yesterdaytime = util.formatTime(new Date(new Date().setDate(new Date().getDate()-1)))   //获取前一天的日期时间
      // let api_key = JSON.parse(decodeURIComponent(options.key));    //将参数解析出来
      this.setData({
        id: options.unit,
        startDate: yesterdaytime.substring(0,10),
        startTime: yesterdaytime.substring(11,16),
        endDate: newTime.substring(0,10),
        endTime: newTime.substring(11,16),
      })
      wx.showModal({
        title: '提示',
        content: '请选择数据时间段',
        success: function (res) {
          if (res.confirm) {     
            console.log('确定')
          } else {               
            console.log('取消')
          }
        }
      })
      this.getDataInformation()          // 为名称和单位赋值
      this.getHistoricalDataRequest()    // 获取历史数据请求
    },
/* ---------------------------------------------处理函数部分start-------------------------------------------------*/ 
  // 开始日期处理函数
  bindStartDateChangeHanlde: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      startDate: e.detail.value
    })
    this.getHistoricalDataRequest()  // 获取历史数据请求
  },
  // 开始时间处理函数
    bindStartTimeChangeHanlde: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        startTime: e.detail.value
      })
      this.getHistoricalDataRequest()  // 获取历史数据请求
    },
  // 结束日期处理函数
  bindEndDateChangeHanlde: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endDate: e.detail.value
    })
    this.getHistoricalDataRequest()  // 获取历史数据请求
  },
  // 结束时间处理函数
  bindEndTimeChangeHanlde: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endTime: e.detail.value
    })
    this.getHistoricalDataRequest()  // 获取历史数据请求
  },
/* ---------------------------------------------处理函数部分end-------------------------------------------------*/ 
/*----------------------------------------------辅助函数部分start--------------------------------------------------*/ 
  // 数据处理
  hanldeData(data){
    let targetData = data.filter(value=>{
      return value.id == this.data.id;
    })[0]
    for(var i = 0; i < targetData.datapoints.length ; i++)
    targetData.datapoints[i].at = targetData.datapoints[i].at.substring(0, targetData.datapoints[i].at.length - 4);
    this.setData({ targetData: targetData.datapoints.reverse()});
  },

  // 为名称和单位赋值
  getDataInformation(){
    switch(this.data.id) {
      case 'temp':{ wx.setNavigationBarTitle({title: '温度历史数据'}), this.setData({ dataName: "温度", dataUnitSymbol: "°C"}) } break;
      case 'hum':{wx.setNavigationBarTitle({title: '湿度历史数据'}), this.setData({ dataName: "湿度", dataUnitSymbol: " %rh"}) } break;
      case 'weight':{wx.setNavigationBarTitle({title: '压力历史数据'}), this.setData({ dataName: "压力", dataUnitSymbol: " N"})} break;
      case 'latitude':{wx.setNavigationBarTitle({title: '经度历史数据'}), this.setData({ dataName: "经度", dataUnitSymbol: "°"})}break;
      case 'longitude':{wx.setNavigationBarTitle({title: '纬度历史数据'}), this.setData({ dataName: "纬度", dataUnitSymbol:"°"})}break;
    }
  },
  
  // 获取历史数据请求
  getHistoricalDataRequest(){
    let start = this.data.startDate +"T"+ this.data.startTime + ":00";
    let end = this.data.endDate +"T"+ this.data.endTime + ":00";
    console.log(start,end)
    let search_id = this.data.id;
    var _this = this;
    wx.showLoading({ title: '正在加载', })   // loading 提示框
    wx.request({                            //获取指定的onenet历史数据
      url: 'https://api.heclouds.com/devices/' + app.globalData.device_id + "/datapoints?datastream_id=" + search_id + "&start=" + start + "&end=" + end,
      method:'GET',
      header:{
        'content-type': 'application/x-www-form-urlencoded',
        "api-key": app.globalData.api_key ,
      },
      success: function(res){
        console.log("当前获取到的数据:",res.data.data.datastreams);
       if(res.data.data.datastreams.length != 0 )_this.hanldeData(res.data.data.datastreams)
       else{_this.setData({ targetData: null }) } 
      },
      fail: function(){
        wx.showToast({
          title: '与服务器通信失败',
          icon: 'fail',
          duration: 2000
        })
      },
    })
    _this.clearLoading();      // 清除提示框
  },

  // 清除loading 提示框
  clearLoading(){
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
  },
/*----------------------------------------------辅助函数部分end--------------------------------------------------*/ 
})