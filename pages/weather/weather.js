var amapFile = require('../../utils/amap-wx.js');
var app = getApp()                                //引入全局变量
Page({
  data: {
    // latitude: "109.576782",          //存储最新的纬度
    // longitude: "19.517486",          //存储最新的经度
    search_city: null,                  //搜索的城市
    key: 'eaf9a08d317a7a3b',            //极速数据的密钥
  },
  /**
   * 根据城市获取天气预报
   */
  getWeather() {
    let _this = this
    var URL = '';
    if(this.data.search_city)     //是否有值
      var city = this.data.search_city.trim();  //去掉首位空格
    if(!city){ 
      // 极速数据的URL规则是先纬度后经度
      URL ='https://api.jisuapi.com/weather/query?appkey=' + this.data.key + '&location=' + app.globalData.selfLatitude + ',' 
      + app.globalData.selfLongitude 
    }else{
      URL = 'https://api.jisuapi.com/weather/query?appkey=' + this.data.key + '&city=' + city
      console.log("city值为:",city)
    }
    //获取实况天气
    wx.request({
      url: URL,
      success: function(res) {
        console.log("获取实况天气",res.data)
        const data = res.data.result ;
        if (data == '') {
          wx.showToast({
            title: '抱歉！没有该城市的天气预报',
            icon: 'none',
            duration: 2000
          })
          return;
        }
      // 处理数据
        _this.setData({
          city: data.city,                  //城市
          tmp: data.temp,                  //温 度
          img: data.img,                 //天气图标路径
          wind_dir: data.winddirect,        //风向
          wind_sc: data.windpower,          //风力
          hum: data.humidity,               //湿度
          pres: data.pressure              //气压
        })
        // 获取24小时天气预报
        console.log("获取24小时天气预报",data.hourly)
        var arr = data.hourly
        var hourly = []
        for (var i = 0; i < arr.length; i++) {
          hourly[i] = {
            "img": arr[i].img,
            "tmp": arr[i].temp,
            "time": arr[i].time,
            "weather": arr[i].weather,
          }
        }
        _this.setData({
          hourly: hourly
        })
        //获取未来7天天气预报
        console.log("获取未来7天天气预报",data.daily)
        var arr = data.daily
        var daily = []
        var day = ''
        for (var i = 0; i < arr.length; i++) {
          switch (i) {
            case 0:{ day = "今天" }break;
            case 1:{ day = "明天" }break;
            case 2:{ day = "后天" }break;
            default: { day = arr[i].week } break;
          }
          daily[i] = {
            day: day,
            date: arr[i].date.substring(5),
            img_d: arr[i].day.img,
            img_n: arr[i].night.img,
            weather_d: arr[i].day.weather,
            weather_n: arr[i].night.weather,
            temphigh: arr[i].day.temphigh,
            templow: arr[i].night.templow,
            winddirect_d: arr[i].day.winddirect,
            windpower_d: arr[i].day.windpower,
            winddirect_n: arr[i].day.winddirect,
            windpower_n: arr[i].day.windpower,
            sunrise: arr[i].sunrise,
            sunset: arr[i].sunset,
          }
        }
        _this.setData({
          daily: daily
        })
        // 提示信息
        console.log("提示信息",data.index)
        var arr = data.index
        var imformation = []
        for (var i = 0; i < arr.length; i++) {
          imformation[i] = {
            "iname": arr[i].iname,       //信息名称
            "ivalue": arr[i].ivalue,     //信息情况
            "detail": arr[i]. detail,   //信息细节
          }
        }
        _this.setData({
          imformation: imformation
        })
      }
    })
  },
  bindKeyInput(e) {
    this.data.search_city = e.detail.value
    console.log(this.data.search_city)
  },
  search() {
    this.getWeather(this.data.search_city)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getWeather()
    wx.showLoading({
      title: '正在加载',
    })
    setTimeout( () => wx.hideLoading({}),2000)
  },
})