const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, api: { getGameList, like }, play, getShare, autoAuth, loginfail } = app
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
    /* 标题参数 */
    titNum:0,//已输入标题字数
    titFocus:false,
    title:'',
    /* 文本参数 */
    text:'',
    textFocus:false,

    images:[],//需要上传的图片数组
    
  },
  /* 标题框聚焦*/
  titfocus(){
    this.setData({ titFocus:true })
  },
  /* 失去焦点 */
  titblur(){
    this.setData({ titFocus:false })
  },
  /* 标题输入 */
  titInput({ detail:{ value } }){
    value = value.trim() 
    this.setData({ title:value,titNum:value.length })
  },
  /* 标题点击下一项 */
  titconfirm(){
    this.setData({titFocus:false})
    
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
    this.setData({ text:value})
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
  /* 上报formId */
  formSubmit(e) {
    console.log('收集到formId',e.detail.formId)
    this.setData({
      formId:e.detail.formId
  })

  },
  /* 点击事件统一处理函数 */
  handleEvent(e){
    let action = e.target.dataset.action || "";
    console.log('action',action)
    if (!app.isLogin) {//需要授权的
      // getUserInfo中e.target永远都是绑定的该事件的button 
      // 所以要记录授权之前的action
      app.action = action
      app.e = e
      return;
    }
    action!==''?this[action](e):null;
  },
  /* 获取授权后获取信息回调 */
  getUserInfo(e) {  
    if (app.isLogin) return;
    console.log('未登录',e)
    if (e.detail.errMsg === 'getUserInfo:ok'){
      let { detail:{ errMsg, ...res} } = e
      app.res = res
      app.globalData.userInfo = res.userInfo
      autoAuth().then(res=>{
        app.action!==''?this[app.action](app.e):null;
      }).catch(err=>{
        console.log(err)
        loginfail()
      })
    }else{
      console.log('用户拒绝授权')
    }
  },
  /* 获取游戏列表 */
  fetchGameData () {
    wx.showLoading();
    ajaxRequest({
      url: getGameList,
      type: 'get',
      data: this.data.listQuery,
      success: res => {
        console.log('avg列表成功', res)
        if(res.code===200){
          let result = res.data || [];
          let noMore = false;
          result.forEach(item=>{
            item._count = numToChinese(item.favourCount)
            item.favour=false;
          })
          let { gameList } = this.data
          if(gameList.length !== 0) {
            gameList = gameList.concat(result)
          }else{
            gameList = result
          }
          if(result.length<10)noMore = true
          this.setData({ gameList, noMore })
        }
      },
      fail: err => {
        console.log('avg列表失败', err)
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },
  /* 去详情 */
  goDetail ({ target: { dataset:{ id } } }) {
    console.log('跳转到详情',id)
    wx.navigateTo({
      url: '../detail/detail?id='+id
    });
  },
  /* 点赞 */
  like ({ target: { dataset: { i, id } } }) {
    console.log(i)
    if(this.data.gameList[i].favour){
      wx.showToast({
        title: "你已经点过赞了",
        duration: 1000,
        icon: "none"
      })
      return
    }
    ajaxRequest({
      url: like(id),
      type: 'put',
      data: { favourFormId: this.data.formId },
      success: res => {
        console.log('点赞成功', res) 
        if(res.code===200){
          let gameList = this.data.gameList
          let count = gameList[i].favourCount
          gameList[i].favour = true
          gameList[i].favourCount = count + 1;
          gameList[i]._count = numToChinese(count + 1);
          this.setData({ gameList })
        }
      },
      fail: err => {
        console.log('点赞失败', err)
      }
    })
  },
  /* 打开小程序 */
  openMiniapp ({ target: { dataset: { obj } } } ) {
    console.log('miniApp',obj)
    // 游戏上报
    let { id, miniAppid, path } = obj
    // this.getShareContent(id);
    wx.navigateToMiniProgram({
      appId: miniAppid,
      path: path,
      extraData: { from: 'doda' },
      envVersion: '',
      success: res => {
        console.log(res)
      },
    })
    play(id);
  },
  /* 打开网页 */
  openWeb ({ target: { dataset: { obj } } } ) {
    console.log('web',obj)
    let token=app.token;
    let { id, onlineUrl } = obj
    onlineUrl='https://m.ajimiyou.com/game/YanxiPalace/?origin=miniapp&t=181018'+'&token='+token+'&gameId='+id
    // onlineUrl=onlineUrl+'&token='+token+'&gameId='+id
    // this.getShareContent(id);
    // this.setData({ onlineUrl })
    wx.navigateTo({
      url: '../web/web?url='+encodeURIComponent(onlineUrl)+'&gameId='+id
    })
    // 游戏上报
    play(id);
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