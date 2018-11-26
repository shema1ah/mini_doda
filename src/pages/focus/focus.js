const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, doneTask, api: { getFollowTpc, getFollowUser, getFollowFans }, play, getShare, autoAuth, loginfail } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    formId:'',//收集 的formId
    share:null,//分享文案

    cur:0,
    topic:[],
    topicMore:true,
    topicQuery:{
      index:1
    },
    user:[],
    userMore:true,
    userQuery:{
      index:1
    },
    fans:[],
    fansMore:true,
    fansQuery:{
      index:1
    },
  },

  /* 选项改变：点击事件 */
  selChange({ target: { dataset: { cur } } }){
    this.setData({ cur })
    this.fetchFollow(true)
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
  /* 获取关注数据 */
  fetchFollow(refresh){
    wx.showLoading({ mask:true })
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let { cur }= this.data
    let url = getFollowTpc;
    let str = 'topic'
    if(cur===1){
      url = getFollowUser
      str = 'user'
    }
    if(cur===2){
      url = getFollowFans
      str = 'fans'
    }
    let strIndex = str + 'Query.index'
    let strMore = str + 'More'
    let query = refresh? {...this.data[str+'Query'],index:1} : this.data[str+'Query'];
    ajaxRequest({
      url,
      type:'get',
      proxy:'app',
      data:query,
      success: res => {
        if(res.code===200&&res.data){
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
          })
        }else{
          console.log(str+'失败code!==200',res)
        }
      },
      fail: err=>{
        console.log(str+'失败',res)
      },
      complete: res=>{
        wx.hideLoading()
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
  /* 
  生命周期回调—监听页面加载
  */
  onLoad (options) {
    let { SystemInfo: { batteryBarHeight,navigationBarHeight },isLogin }=app
    this.setData({ 
      systemHeight: Number(batteryBarHeight),
      navHeight:Number(navigationBarHeight)
    })
    if(isLogin){
      this.fetchFollow()
    }else{
      app.eventAry.push(this.fetchFollow)
    }
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
    this.fetchFollow(true)
    wx.stopPullDownRefresh()
  },
  /* 
  上拉触底
  */
  onReachBottom () {
    console.log('上拉触底了')
    this.fetchFollow()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (options) {
    console.log('options',options)
    let that=this;
    doneTask(1)
    return {
      ...this.data.share
    }
  }
})