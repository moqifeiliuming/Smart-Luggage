const Charts = require('../../utils/wxcharts.js') //引入统计图处理文件
const util = require('../../utils/util.js')       //引入时间处理文件
var app = getApp()                                //引入全局变量
Page({
  data:{
    onenetData: null,                //onenet总数据
    hum: null,                       //存储最新的湿度
    temp: null,                      //存储最新的温度
    weight: null,                    //存储最新的压力
    latitude: null,                  //存储最新的纬度
    longitude: null,                 //存储最新的经度
    timedRefresh: false,             //定时刷新开关
    statisticalChartSwitch: false,    //统计图开关
    statisticalChartFlag: false,     //统计图是否需要暂时关闭标志
    timedRefreshFlag: false,         //是否为定时刷新的标志
    timer: null,                     //定时刷新的定时器
    animationFlag: true,             //打开定时刷新则关闭统计图动画
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) { 
    // let api_key = JSON.parse(decodeURIComponent(options.key)); //将参数解析出来
    this.getDataHandle()           //调用获取onenet数据处理函数
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        const latitude = res.latitude       //获取纬度
        const longitude = res.longitude     //获取经度
        console.log("当前经纬度为：",latitude,longitude)
        app.globalData.selfLatitude = latitude;
        app.globalData.selfLongitude = longitude;
        console.log(app.globalData.selfLatitude,app.globalData.selfLongitude)
      },
      fail (){
        wx.showToast({
          title: '抱歉！无法获取位置',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    let _this = this;
    if(_this.data.statisticalChartSwitch) { 
      _this.statisticalChartSwitchHandle()      //暂时关闭统计图
      _this.data.statisticalChartFlag = true;   //启动重绘
    }
    wx.showNavigationBarLoading()             //在标题栏中显示加载
    _this.data.timedRefreshFlag = false;      //人为刷新，启动loading加载
    _this.getDataHandle();
    wx.hideLoading()
    setTimeout(function(){
      wx.hideNavigationBarLoading()            //完成停止加载
      wx.stopPullDownRefresh()                 //停止下拉刷新
      if(_this.data.statisticalChartFlag)_this.statisticalChartSwitchHandle() //重绘统计图
    },1000);
  },

/* ---------------------------------------------处理函数部分start-------------------------------------------------*/ 
// 获取onenet数据处理函数
  getDataHandle () {
    var _this = this;
    if(!_this.data.timedRefreshFlag)wx.showLoading({ title: '正在加载', })    // loading 提示框
    wx.request({
      // url: 'https://api.heclouds.com/devices/' + _this.data.device_id +"/datastreams",
      url: 'https://api.heclouds.com/devices/' + app.globalData.device_id +"/datapoints",
      method:'GET',
      header:{
        'content-type': 'application/x-www-form-urlencoded',
        "api-key": app.globalData.api_key ,
      },
      success: function(res){
        console.log(res.data.data.datastreams);
        if(res.data.data.datastreams != null){
          _this.grtdetail(res.data.data.datastreams);      // 裁剪时间字符串的后四位，并且拆分onenet数据
          _this.setData({onenetData : res.data.data.datastreams});  //为onenetData赋值
        } 
      },
      fail: function(){
        wx.showToast({
          title: '与服务器通信失败',
          icon: 'fail',
          duration: 2000
        })
      },
    })
    _this.clearLoading()// 清除loading 提示框
  },

  //导航到历史数据处理函数
  getHistoryData (){
    wx.showActionSheet({
      itemList: ['查看温度', '查看湿度', '查看压力', '查看经度', '查看纬度'],
      success (res) {
        console.log(res.tapIndex)
        switch(res.tapIndex){
          case 0:{ wx.navigateTo({ url: '../details/details?unit=' + "temp"}) }break;
          case 1:{ wx.navigateTo({ url: '../details/details?unit=' + "hum"}) }break;
          case 2:{ wx.navigateTo({ url: '../details/details?unit=' + "weight"}) }break;
          case 3:{ wx.navigateTo({ url: '../details/details?unit=' + "latitude"}) }break;
          case 4:{ wx.navigateTo({ url: '../details/details?unit=' + "longitude"}) }break;
        }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
 
  // 定时器开关处理函数
  timedRefreshHandle(){
    this.data.timedRefreshFlag = true;        //定时标志改为true，用于下拉刷新
    const _this = this; 
    if(_this.data.timedRefresh){
      wx.showModal({
        title: '提示',
        content: '您确定关闭定时刷新吗？',
        success (res) {
          if (res.confirm) {
            _this.setData({ timedRefresh: false ,animationFlag: true})    //页面关闭定时刷新,打开统计图动画
            clearInterval(_this.data.timer);                    //清除定时器timer
            wx.showToast({
              title: '关闭成功',
              icon: 'success',
              duration: 2000
            })
            console.log('用户关闭定时刷新')

          } else if (res.cancel) {
            _this.setData({ timedRefresh: true })  //将定时刷新标志重新设为true（因为onchange事件已经触发改变）
            console.log('用户取消关闭定时刷新')
          }
        }
      })
    }else{
      _this.setData({ timedRefresh: true })         //页面显示定时刷新标志为true
      clearInterval(_this.data.timer);              //清除定时器旧的timer            
      _this.setData({
        animationFlag: false,

        timer: setInterval(() => {
          _this.getDataHandle();                  //获取历史数据
          _this.statisticalChartData("temp")       
          _this.statisticalChartData("hum")         
          +this.statisticalChartData("weight")                
          console.log("定时刷新中...")
        }, app.globalData.refreshTime),

      }) 
      wx.showToast({
        title: '开启成功',
        icon: 'success',
        duration: 2000
      })
    }
  },

  // 统计图开关处理函数
  statisticalChartSwitchHandle(){
    this.data.statisticalChartFlag = false;   //统计图标志需要暂时关闭
    this.setData({ statisticalChartSwitch: !this.data.statisticalChartSwitch })
    if(this.data.statisticalChartSwitch){
      this.statisticalChartData("temp")       //获取历史数据
      this.statisticalChartData("hum")         
      this.statisticalChartData("weight")                  
      setTimeout(function(){
        wx.pageScrollTo({ scrollTop: 300 , duration: 300 })
      },500)
    }
  },
 
  // 打开地图处理函数
  openMapHandle(){
    wx.openLocation({
      latitude: this.data.latitude.value,
      longitude: this.data.longitude.value,
      scale: 10,          //缩放比例
      name: "当前位置",
      
    })
  },

  // 跳转到数据历史详情页面处理函数
  detailHanlde(e){
    // const api_key = encodeURIComponent(JSON.stringify(this.data.api_key));encodeURIComponent函数可把字符串作为 URI 组件进行编码,避免参数丢失
    wx.navigateTo({
      url: '../details/details?unit=' + e.currentTarget.dataset.id ,
    })
  },
/* ---------------------------------------------处理函数部分end-------------------------------------------------*/ 
/*----------------------------------------------辅助函数部分start--------------------------------------------------*/ 

  // 裁剪时间字符串的后四位，并且拆分onenet数据
  grtdetail (data){
      for(var i = 0; i < data.length ; i++)
        data[i].datapoints[0].at = data[i].datapoints[0].at.substring(0, data[i].datapoints[0].at.length - 4);
      let longitude = data.filter(value => { return value.id == "longitude" ; })[0];
      let latitude = data.filter(value => { return value.id == "latitude" ; })[0];
      let hum = data.filter(value => { return value.id == "hum" ; })[0];
      let temp = data.filter(value => { return value.id == "temp" ; })[0];
      let weight = data.filter(value => { return value.id == "weight" ; })[0];
      this.setData({
        longitude: longitude.datapoints[0], 
        latitude: latitude.datapoints[0], 
        weight: weight.datapoints[0], 
        temp: temp.datapoints[0], 
        hum: hum.datapoints[0]
      })
  },
  
  // 清除loading 提示框
  clearLoading(){
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
  },

  // 获取统计图数据
  statisticalChartData(search_id){
    // let api_key = JSON.parse(decodeURIComponent(options.key));    //将参数解析出来
    var newTime = util.formatTime(new Date)           //获取当前日期时间
    var yesterdaytime = util.formatTime(new Date(new Date().setDate(new Date().getDate()-1)))   //获取前一天的日期时间
    // 获取历史数据请求
    var _this = this;
    wx.request({                            //获取指定的onenet历史数据
      url: 'https://api.heclouds.com/devices/' + app.globalData.device_id +"/datapoints?datastream_id=" + search_id + "&start=" + yesterdaytime + "&end=" + newTime,
      method:'GET',
      header:{
        'content-type': 'application/x-www-form-urlencoded',
        "api-key": app.globalData.api_key ,
      },
      success: function(res){
        console.log("当前统计图获取到的数据:",search_id,res.data.data.datastreams)
        if(res.data.data.datastreams.length != 0 ){
          switch(search_id){
            case "temp":{ _this.getTempLineChart(res.data.data.datastreams); }break;
            case "hum":{ _this.getHumLineChart(res.data.data.datastreams); }break;
            case "weight":{ _this.getWeightLineChart(res.data.data.datastreams); }break;
          }
        } 
      },
      fail: function(){
        wx.showToast({
          title: '与服务器通信失败',
          icon: 'fail',
          duration: 2000
        })
      },
    })
  },
  //统计图数据处理
  statisticalChartHandleData(data){
    let arr = data[0].datapoints.reverse().slice(0,20)   //将数据的时间翻转在取八个值显示在统计图
    var dataObj = {
      time: [],
      value: []
    }
    for(var i = 0; i < arr.length ; i++){
      dataObj.time.push(arr[i].at.substring(11,19))
      dataObj.value.push(arr[i].value)
    }
    return dataObj
  },
  // 温度折线统计图
  getTempLineChart:function(data){
    var _this = this;
    var dataObj = this.statisticalChartHandleData(data)
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
     new Charts({ //当月用电折线图配置
      canvasId: 'temp',     //布画ID
      type: 'line',       
      categories: dataObj.time,      //categories X轴
      animation:  _this.data.animationFlag ,       //开启了定时刷新就关闭动画效果，（开启会使下拉刷新出现重影）
      series: [{
        name: '时间',
        data: dataObj.value,        //统计图数据
        format: function (val, name) {
          return val.toFixed(1) + '°C';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '温度(°C)',
        format: function (val) {
          return val.toFixed(1);
        },
        max: 40,
        min: 0,
      },
      // width: windowWidth,
      width: 950,           //给足够的宽度而在css也设置足够宽度加上滚动组件就可以横向滑动
      height: 300,
      dataLabel: true,      //显示数据值
      bindtouchmove: true,  //手指触摸后移动
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },

// 湿度折线统计图
  getHumLineChart:function(data){
    var _this = this;
    var dataObj = this.statisticalChartHandleData(data)
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    new Charts({ //当月用电折线图配置
      canvasId: 'hum',
      type: 'line',
      categories: dataObj.time , //categories X轴
      animation:  _this.data.animationFlag  ,       //开启会使下拉刷新出现重影,开启了定时刷新就关闭动画
      // background: '#f5f5f5',
      series: [{
        name: '时间',
        //data: yuesimulationData.data,
        data: dataObj.value ,
        format: function (val, name) {
          return val.toFixed(1) + '%rh';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '湿度(%rh)',
        format: function (val) {
          return val.toFixed(1);
        },
        max:70,
        min: 50,
      },
      width: 1000,
      height: 300,
      dataLabel: true,
      bindtouchmove: true,  //手指触摸后移动
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },

  // 压力折线统计图
  getWeightLineChart:function(data){
    var _this = this;

    var dataObj = this.statisticalChartHandleData(data)
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    new Charts({ //当月用电折线图配置
      canvasId: 'weight',
      type: 'line',
      categories: dataObj.time , //categories X轴
      animation:  _this.data.animationFlag ,       //开启会使下拉刷新出现重影,开启了定时刷新就关闭动画
      series: [{
        name: '时间',
        data: dataObj.value ,
        format: function (val, name) {
          return val.toFixed(1) + ' N';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '压力(N)',
        format: function (val) {
          return val.toFixed(1);
        },
        max: 5,
        min: -5,
      },
      // width: windowWidth,
      width: 950,           //给足够的宽度而在css也设置足够宽度加上滚动组件就可以横向滑动
      height: 300,
      dataLabel: true,
      bindtouchmove: true,  //手指触摸后移动
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
/*----------------------------------------------辅助函数部分end--------------------------------------------------*/ 

})