// Copyright 2020.11.15 Lingxiao <1625825119@qq.com>
// Author： Lingxiao
// Version: 1.0.8
App({
  globalData: {     //设置globalData全局变量
    device_id: "647346049",
    api_key: "9XN2rq5qfwaIuYDMjIt65yg2CBA=",
    selfLatitude: null,                  //存储自身的经度
    selfLongitude: null,                 //存储自身的纬度
    luggageLatitude: null,                  //存储行李箱的经度
    luggageLongitude: null,                 //存储行李箱的纬度
    refreshTime: 5000,
    userInfo: null ,
  },

  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
})