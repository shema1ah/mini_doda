const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const {
  ajaxRequest,
  errTip,
  doneTask,
  api: {
    getGameList,
    api_isCheckIn,
    api_checkIn,
    like,
    getNotice
  },
  play,
  getShare,
  autoAuth,
  authCheck,
  loginfail,
  checkToken
} = app
Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight: '', //电池高度
    onlineUrl: '', //webUrl
    formId: '', //收集 的formId
    share: null, //分享文案

    game: [], //游戏列表
    gameMore: true,
    gameQuery: {
      index: 1,
      pageSize: 10
    },
  
    ad:false,//广告
    noticeShow: false,
    notice:{
      title:'哆哒欢迎您',
      content:'玩完游戏后，若是出现了任何不愉快的体验和从中出现的BUG，都可以加入我们的官方群进行反馈，哆哒QQ群827553653，我们会认真对待您提出的意见，并努力修复和调整哒~'
    },
    // 签到数据
    checkIn:false,
    checkCount:0,//连续签到天数
    checkInData:[
      {
        name:'第1天',
        count:50
      },
      {
        name:'第2天',
        count:100
      },
      {
        name:'第3天',
        count:100
      },
      {
        name:'第4天',
        count:100
      },
      {
        name:'第5天',
        count:150
      },
      {
        name:'第6天',
        count:150
      },
      {
        name:'第7~∞天',
        count:200
      }
    ],
    checkErrNum:0,//签到失败次数
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
        let cb = action!==''?()=>{
          this[action](app.e)
        }:null;
        this.fetchGameData(true,cb)
      }).catch(err => {
        console.log(err)
        loginfail()
      })
    } else {
      console.log('用户拒绝授权')
    }
  },
  /* 是否签到 */
  isCheckIn(){
    ajaxRequest({
      url:api_isCheckIn,
      type:'get',
      proxy:'app',
      success: res =>{
        if(res.code===200){
          console.log('是否签到OK',res)
          if(res.data.signin)return;//已经签过到
          this.toCheckIn()
        }else{
          console.log('是否签到code!==200',res)
          if(this.data.checkErrNum>=5)return
          this.setData({checkErrNum:this.data.checkErrNum+1})
          this.isCheckIn()
        }
      },
      fail: err =>{
        console.log('是否签到失败',err)
        if(this.data.checkErrNum>=5)return
          this.setData({checkErrNum:this.data.checkErrNum+1})
        this.isCheckIn()
      }
    })
  },
  /* 签到 */
  toCheckIn(){
    ajaxRequest({
      url:api_checkIn,
      type:'post',
      proxy:'app',
      success: res=>{
        if(res.code===200&&res.data.success){
          console.log('签到成功',res)
          this.setData({
            checkIn:true,
            checkCount:res.data.signinCount
          })
        }else{
          console.log('签到code==200',res)
          if(this.data.checkErrNum>=5)return
          this.setData({checkErrNum:this.data.checkErrNum+1})
          this.toCheckIn()
        }
      },
      fail: err=>{
        console.log('签到失败',err)
        if(this.data.checkErrNum>=5)return
         this.setData({checkErrNum:this.data.checkErrNum+1})
        this.toCheckIn()
      }
    })
  },
  /* 关闭签到 */
  closeCheckIn(){
    this.setData({checkIn:false})
    wx.showToast({
      title:'签到成功',
      icon:'success',
      duration:800
    })
  },
  /* 公告开关 */
  switchNotice(){
    this.setData({ noticeShow: !this.data.noticeShow })
  },
  /* 获取公告 */
  fetchNotice(){
    ajaxRequest({
      url: getNotice,
      proxy:'app',
      success: res =>{
        console.log('公告获取成功',res)
        if(res.code===200&& res.data){
          this.setData({ notice: res.data })
        }else{
          console.log('公告获取成功code!==200',res)
        }
      },
      fail: err => {
        console.log('公告获取失败',err)
      }
    })
  },
  /* 查看规则 */
  goRule(){
    wx.navigateTo({
      url: '../web/web?url=https://m.ajimiyou.com/app/signrule.html'
    })
  },
  /* 获取游戏列表 */
  /**
   * 
   * @param refresh :是否刷新数据( 刷新数据不会cancat )
   * @param auth (是否是授权，授权之后要执行回调)
   */
  fetchGameData(refresh,cb) {
    cb = cb ||null
    wx.showLoading({title:'数据加载中',mask:true});
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let str = 'game'
    let strMore = str + 'More'
    let strIndex = str + 'Query.index'
    let query = refresh? {...this.data[str+'Query'],index:1} : this.data[str+'Query'];
    ajaxRequest({
      url: getGameList,
      type: 'get',
      data: query,
      success: res => {
        if (res.code === 200 && res.data) {
          console.log(str+'成功',res)
          let newData = res.data;
          let index = query.index
          let more = true;
          if (newData.length ===10) {
            index += 1
          }else{
            if(!refresh){
              newData = newData.splice(this.data[str].length%10)
              if(newData.length===0)return
            }
            more =false
          }
          newData = refresh ? newData : this.data[str].concat(newData)
          this.setData({
            [str]: newData,
            [strMore]: more,
            [strIndex]: index
          },cb)
          
        }else{
          console.log(str+'成功code!=200',res)
          errTip(0)
        }
      },
      fail: err => {
        console.log(str+'失败', err)
        errTip(1)
      },
      complete: res=>{
        wx.hideLoading();
      }
    })
  },
  /* 去详情 */
  goDetail({ target: { dataset: { id } } }) {
    console.log('跳转到详情', id)
    wx.navigateTo({
      url: '../detail/detail?gameId=' + id
    });
    play({
      page:'index',
      act:'click',
      pos:'index_1'
    });
  },
  /* 点赞 */
  like({ target: {  dataset: { i, id } } }) {
    if (this.data.game[i].favour) {
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
      data: {
        favourFormId: this.data.formId
      },
      success: res => {
        if (res.code === 200) {
          console.log('点赞成功', res)
          let show = 'game['+i+'].favour'
          let fieldCount = show + 'Count'
          let count = this.data.game[i].favourCount+1
          this.setData({ 
            [show]:true,
            [fieldCount]:count
           })
        }else{
          console.log('点赞失败', res)
          errTip(0)
        }
      },
      fail: err => {
        console.log('点赞失败', err)
        errTip(1)
      }
    })
    play({
      page:'index',
      act:'click',
      pos:'index_3'
    });
  },
  /* 打开小程序 */
  openMiniapp({ target: { dataset: { obj } } }) {
    console.log('miniApp', obj)
    let { id, miniAppid, path } = obj
    checkToken().then(res=>{
      // this.getShareContent(id);
      wx.navigateToMiniProgram({
        appId: miniAppid,
        path: path,
        extraData: {
          from: 'doda'
        },
        envVersion: '',
        success: res => {
          console.log(res)
        },
      })
    }).catch(err=>{

    })
    play({
      page:'index',
      act:'click',
      pos:'index_2'
    });
  },
  /* 打开网页 */
  openWeb({ target: { dataset: { obj } } }) {
    console.log('web', obj)
    let { id, onlineUrl } = obj
    checkToken().then(expire=>{
      if(!expire){//未过期
        wx.navigateTo({
          url: '../web/web?url=' + encodeURIComponent(onlineUrl) + '&gameId=' + id
        })
      }else{
        this.isLogin = fasle;
        this.token = null
        wx.removeStorageSync('token')
      }
      // onlineUrl = 'https://m.ajimiyou.com/game/YanxiPalace/?origin=miniapp&t=181018' + '&token=' + token + '&gameId=' + id
      // this.getShareContent(id);
      // this.setData({ onlineUrl })
      
    }).catch(err=>{

    })
    // 游戏上报
    play({
      page:'index',
      act:'click',
      pos:'index_2'
    });
  },
  /* 
  生命周期回调—监听页面加载
  */
  onLoad(options) {
    let { fetchNotice,isCheckIn,fetchGameData } = this
    fetchNotice();
    let { SystemInfo: {  batteryBarHeight }, isLogin , adShow  } = app
    if(isLogin){
      isCheckIn()
      fetchGameData();
    }else{
      app.eventAry.push(isCheckIn,fetchGameData)
    }
    console.log('onLoad-Home', isLogin)
    this.setData({
      systemHeight: Number(batteryBarHeight) + 6,
      ad:adShow
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady() {

  },
  /**
   * 生命周期函数--监听页面显示
   */

  onShow() {
    console.log('onShow-Home')
    this.setData({ad:app.adShow})
    this.getShareContent();
    this.fetchGameData(true);
    play({
      page:'index',
      act:'view',
      pos:'index_0'
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
  /* 
  下拉刷新
  */
  onPullDownRefresh() {
    this.fetchGameData(true)
    wx.stopPullDownRefresh()
  },
  /* 
  上拉触底
  */
  onReachBottom() {
    console.log('上拉触底了')
    this.fetchGameData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    console.log('options', options)
    
    let that = this;
    doneTask(1)
    return {
      ...this.data.share
    }
  }
})