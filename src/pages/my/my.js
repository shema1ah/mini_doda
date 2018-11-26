
var app = getApp();
var { ajaxRequest ,errTip,doneTask, api:{ getCoin }, getShare ,autoAuth,loginfail, play } = app;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null,//个人信息
    share: null,
    coin:{
      dodaCoin:0,
      yuanqiCoin:0
    }
  },
  /* 分享文案获取 */
  getShareContent(id) {
    getShare(id).then(res => {
      console.log('分享内容', id || '平台分享')
      this.setData({
        share: res
      })
    }).catch(err => {
      this.setData({
        share: err
      })
    })
  },
  /* 上报formId */
  formSubmit(e) {
    console.log('收集到formId', e.detail.formId)
    this.setData({
      formId: e.detail.formId
    })

  },
  /* 点击事件统一处理函数 */
  handleEvent(e) {
    let action = e.target.dataset.action || "";
    console.log('action', action)
    if (!app.isLogin) { //需要授权的
      // getUserInfo中e.target永远都是绑定的该事件的button 
      // 所以要记录授权之前的action
      app.action = action
      app.e = e
      return;
    }
    action !== '' ? this[action](e) : null;
  },
  /* 获取授权后获取信息回调 */
  getUserInfo(e) {
    if (app.isLogin) return;
    console.log('未登录', e)
    if (e.detail.errMsg === 'getUserInfo:ok') {
      let { detail: { errMsg, ...res } } = e
      app.res = res
      app.globalData.userInfo = res.userInfo
      autoAuth().then(res => {
        let action = app.action
        console.log(action)
        action !== '' ? this[action](app.e) : null;
      }).catch(err => {
        console.log(err)
        loginfail()
      })
    } else {
      console.log('用户拒绝授权')
    }
  },
  /* 跳转到其他页面 */
  go({ target:{ dataset:{ path } } }){
    console.log(path)
    if(!path){
      wx.showToast({
        title:'敬请期待',
        mask:true,
        icon:'none',
        duration:1000
      })
      return
    }
    if(path==='pay'){
      wx.showToast({
        title:'暂不支持充值，请下载哆哒官方APP进行充值！',
        mask:true,
        icon:'none',
        duration:1000
      })
      return
    }
    let url= '../'+path+'/'+path
    if(path==='foot') url = '../collect/collect?title=foot'
    wx.navigateTo({ url })
  },
  /* 获取钱币接口 */
  fetchCoin(){
    ajaxRequest({
      url:getCoin,
      proxy:'app',
      success: res=>{
        if(res.code===200&&res.data){
          console.log('获取钱币成功')
          this.setData({ coin:res.data.userWealth })
        }else{
          console.log('获取钱币code！==200')
        }
      },
      fail: err=>{
        console.log('获取钱币成功')
        errTip(1)
      }
    })
  },
  /* 获取个人信息 */
  getInfo(){
    let { globalData:{ userInfo }, isLogin , adShow   } = app;
    let user = isLogin? userInfo : null;
    this.setData({
      user,
      ad:adShow
    })
  },
  onLoad: function (options) {
    console.log('onLoad-my',app.isLogin)
    if(app.isLogin){
      this.getInfo()
      this.fetchCoin()
    }else{
      app.eventAry.push(this.getInfo,this.fetchCoin)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    let { globalData:{ userInfo }, isLogin  } = app;
    let user = isLogin? userInfo : null;
    this.setData({ user });
    this.getShareContent();
    this.fetchCoin()
    play({
      page:'user_center',
      act:'view',
      pos:'user_center_0'
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
 
  onPullDownRefresh: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    doneTask(1)
    return {
      ...this.data.share,
      path: 'pages/home/home?&shareUid='+ app.uid
    }
  }
})