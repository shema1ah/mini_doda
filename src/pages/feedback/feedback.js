const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, api: { feedback }, play, getShare } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    formId:'',//收集 的formId
    share:null,//分享文案
    kbHeight:0,//键盘高度

    /* phone参数 */
    title:'',
    titFocus:false,
    /* 反馈内容参数 */
    text:'',
    textFocus:false,
    
  },
  /* 联系方式聚焦*/
  titfocus(){
    this.setData({ titFocus:true })
  },
  /* 联系方式失去焦点 */
  titblur(){
    this.setData({ titFocus:false })
  },
  /* 联系方式输入 */
  titInput({ detail:{ value } }){
    value = value.trim() 
    this.setData({ title:value })
  },
  /* 联系方式点击下一项 */
  titconfirm(){
    this.setData({titFocus:false,textFocus:false })
  },
  /* 内容框聚焦*/
  textfocus(){
    this.setData({ textFocus: true })
  },
  /* 内容框失去焦点 */
  textblur(){
    this.setData({ textFocus:false })
  },
  /* 内容输入 */
  textInput({ detail:{ value } }){
    value = value.trim() 
    this.setData({ text:value })
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
  /* 提交反馈 */
  putFeedback(){
    let { text, title  } = this.data;
    if(text===''){
      wx.showToast({
        title:'请输入反馈内容',
        icon:'none',
        duration:1000
      })
      return
    }
    if(text.length<5){
      wx.showToast({
        title:'内容至少为5个字',
        icon:'none',
        duration:1000
      })
      return
    }
    ajaxRequest({
      url:feedback,
      type:'post',
      proxy: 'app',
      data: {
        content: text,
        contact: title
      },
      success: res=>{
        if(res.code===200){
          wx.showToast({
            title:'反馈成功,感谢您的反馈,您的意见对我们非常重要，我们会更努力的',
            icon:'none'
          })
        }else{
          wx.showToast({
            title:'反馈失败,您的意见对我们非常重要，请您重试',
            icon:'none',
          })
        }
      },
      fail: err=>{
        wx.showToast({
          title:'反馈失败,您的网络不好，您的意见对我们非常重要，请您重试',
          icon:'none'
        })
      }
    })
  },
  /* 
  生命周期回调—监听页面加载
  */
  onLoad (options) {
    let { SystemInfo: { batteryBarHeight,navigationBarHeight } }=app
    this.setData({ 
      systemHeight: Number(batteryBarHeight),
      navHeight:Number(navigationBarHeight)
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
    console.log('上拉触底了')
    if(this.data.noMore)return;
    let { listQuery: { index } }=this.data
    this.setData({
      listQuery:{
        index:index+1,
        pageSize:10
      }
    })
    this.fetchGameData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (options) {
    console.log('options',options)
    let that=this;
    return {
      ...this.data.share
    }
  }
})