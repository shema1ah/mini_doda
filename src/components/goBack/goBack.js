//获取应用实例
const app = getApp()
// components/nav/nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 顶部背景颜色渐变透明度
    opacity:{
      type:Number,
      default: 0
    },
    // 固定背景颜色
    background:{
      type:String
    },
    // 返回icon的颜色
    iconColor:{
      type:String,
      value:'white'
    }
  },
  data: {
    systemHeight: 0
  },
  methods: {
    goBack() {
      let page = getCurrentPages()
      if (page.length === 1) {
        wx.switchTab({
          url: '../../pages/home/home'
        })
      } else {
        wx.navigateBack({
          delta: 1
        });
      }
    }
  },
  attached() {
    let {
      batteryBarHeight
    } = app.SystemInfo
    this.setData({
      systemHeight: Number(batteryBarHeight)
    })
  }
});