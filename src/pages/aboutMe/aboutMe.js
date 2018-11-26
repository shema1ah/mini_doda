const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, getShare, autoAuth, loginfail } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    share:null,//分享文案
    login:false,
  },
  /* 分享文案获取 */
  getShareContent (id){
    getShare(id).then( res => {
      console.log('分享内容',id || '平台分享')
      this.setData({
        share: res
      })
    }).catch( err => {
      this.setData({
        share: err
      })
    })
  },
  /* 清除缓存 */
  clear(){
    wx.showToast({ 
      title:'清除成功',
      icon:'success',
      duration:800
    })
  },
  /* 获取授权后获取信息回调 */
  getUserInfo({target:{dataset:{ action }},detail}) {
    if (action==='loginOut'){
      wx.clearStorageSync()
      app.token = null;
    }
    if(action==='feedback'&&app.isLogin){//已经登录
      this.goFeedBack()
      return
    }
    if (detail.errMsg === 'getUserInfo:ok') {
      let { errMsg, ...res } = detail
      app.res = res
      app.globalData.userInfo = res.userInfo
      autoAuth().then(res => {
        this.setData({login:true})
        if(action==='feedback')this.goFeedBack()
      }).catch(err => {
        console.log(err)
        loginfail()
      })
    } else {
      console.log('用户拒绝授权')
    }
  },
  /* 去反馈 */
  goFeedBack(){
    wx.navigateTo({
      url:'../feedback/feedback'
    })
  },  
  /* 
  生命周期回调—监听页面加载
  */
  onLoad (options) {
    console.log(options)
    let { SystemInfo: { batteryBarHeight,navigationBarHeight },isLogin:login }=app
    this.setData({ 
      systemHeight: Number(batteryBarHeight),
      navHeight:Number(navigationBarHeight),
      login
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady () {

  },
  /**
   * 生命周期函数--监听页面显示
   */

  onShow () {
    let { isLogin:login }=app
    this.setData({ login })
    console.log('onShow-Home')
    this.getShareContent();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },
  /* 
  下拉刷新
  */
  onPullDownRefresh () {
  
    wx.stopPullDownRefresh()
  },
  /* 
  上拉触底
  */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    console.log('options', options)
    let that = this;
    return {
      ...this.data.share
    }
  }
})