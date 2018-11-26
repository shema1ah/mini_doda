var app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
var { ajaxRequest, api: { getGame, getCommentsDtl, like, collect, unCollect, comment }, play, getShare, autoAuth, loginfail, checkToken } = app
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iphoneX: false,//是否是 X 系列
    backOpacity: 0,
    onlineUrl:'',//webUrl
    formId:'',//收集 的formId
    share: null,//分享文案

    /* 游戏参数 */
    id:'',
    game:null,


    /* 评论参数 */
    noMore:false,
    focus: false,//唤起键盘
    content:'',
    comments:[],
    commentsMore:true,
    commentsQuery: {
      index: 1,
      pageSize: 10,
      orderType:0
    },
    ad:false
    
  },
  /* 分享文案获取 */
  getShareContent(id){
    getShare(id).then( res => {
      console.log('分享内容',id,res)
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
        let action = app.action
        let cb = action!==''? () => {
          this[action](app.e)
        }:null
        this.fetchGame(cb)
        this.fetchComments()
      }).catch(err=>{
        console.log(err)
        loginfail()
      })
    }else{
      console.log('用户拒绝授权')
    }
  },
  /* 获取游戏详情 */
  fetchGame (cb) {
    cb = cb || null;
    wx.showLoading();
    ajaxRequest({
      url: getGame(this.data.id),
      type: 'get',
      success: res => {
        console.log('game获取成功', res)
        if(res.code===200){
          let game = Object.assign({},res.data);
          this.setData({ game },cb)
        }
      },
      fail: err => {
        console.log('game获取失败', err)
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
  },
  /* 获取帖子评论 */
  fetchComments(refresh){
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let { id, commentsQuery } = this.data;
    let query = refresh ? {...this.data.commentsQuery,index:1} : this.data.commentsQuery;
    wx.showLoading({mask:true})
    ajaxRequest({
      url: getCommentsDtl(id),
      type: 'get',
      data: query,
      success: res => { 
        if(res.code===200 && res.data){
          console.log('评论OK',res)
          let newData = res.data
          let index = commentsQuery.index;
          let more = true;
          refresh ? index = 1 : null;
          if (newData.length ===10) {
            index += 1
          }else{
            if(!refresh){
              newData = newData.splice(this.data.comments.length%10)
              if(newData.length===0)return
            }
            more =false
          }
          newData = refresh ? newData : this.data.comments.concat(newData)
          this.setData({
            comments: newData,
            commentsMore: more,
            'commentsQuery.index': index
          })
        }else{
          console.log('评论OK code!==200',res)
        }
      },
      fail: err => {
        console.log('评论ERR',err)
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  /* 评论按时间排序 */
  orderByTime(){
    let val = this.data.commentsQuery.orderType===1?0:1;
    console.log(val)
    this.setData({ 'commentsQuery.orderType': val })
    this.fetchComments(true)
  },
  /* 点赞 */
  like(){
    let { game:{ id, favour }, formId } = this.data;
    if(favour){
      wx.showToast({
        title: "你已经点过赞了",
        duration: 800,
        icon: "none"
      })
      return
    }
    ajaxRequest({
      url: like(id),
      type: 'put',
      proxy:'app',
      data: { favourFormId:formId },
      success: res => {
        console.log('点赞成功', res) 
        if(res.code===200){
          let game= this.data.game
          let count = game.favourCount
          game.favour = true
          game.favourCount = count + 1;
          this.setData({ game })
        }
      },
      fail: err => {
        console.log('点赞失败', err)
      }
    })
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_4'
    })
  },
  /* 收藏 */
  collect(){
    let { game:{ id, favorite }, formId } = this.data
    let url = collect(id);
    let type = 'put';
    let tip = '收藏'
    if(favorite){
      url = unCollect(id)
      type = 'delete'
      tip = '取消收藏'
    }
    ajaxRequest({
      url,
      type,
      data:{  favoriteFormId:formId },
      success: res =>{
        console.log(tip+'成功',res)
        if(res.code===200){
          let game = this.data.game
          game.favorite = !favorite
          this.setData({ game})
          wx.showToast({
            title:tip+'成功',
            mask:true,
            duration:800
          })
        }else{
          wx.showToast({
            title:'服务器错误，请重试',
            mask:true,
            icon:'none',
            duration:800
          })
        }
      },
      fail: err => {
        wx.showToast({
          title:'网络错误，请检查网络后重试',
          mask:true,
          icon:'none',
          duration:800
        })
      }
    })
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_2'
    })
  },
  /* 唤起输入框 */
  focus(){
    this.setData({ focus:true })
  },
  /* 输入框失去焦点时触发 */
  inputBlur(){
    this.setData({ focus:false })
  },
  /* 有内容输入时的事件 */
  input({ detail: { value }}){
    this.setData({ content:value })
  },
  /* 评论 */
  comment(){
    let { content, formId, comments, game:{ id } } = this.data
    if(content===''){return}
    wx.showLoading()
    ajaxRequest({
      url:comment(id),
      type:'post',
      data:{
        content,
        formId
      },
      success: res => {
        console.log('评论成功',res)
        wx.hideLoading()
        if(res.code===200){
          wx.showToast({
            title:'评论成功',
            mask:true,
            duration:1000
          })
          let item = res.data
          comments.unshift(item)
          this.setData({ comments,content:'' })
        }else{
          wx.showToast({
            title:'服务器错误，请重试',
            mask:true,
            icon:'none',
            duration:1000
          })
          this.setData({ focus:true })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title:'评论失败，请检查网络后重试',
          mask:true,
          icon:'none',
          duration:1000
        })
        this.setData({ focus:true })
      }
    })
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_3'
    })
  },
  /* 去话题详情 */
  goTopicDtl({ target:{ dataset:{ name, id }} }){
    wx.navigateTo({
      url:'../topic/topic?id='+id+'&name='+name
    })
  },
  /* 打开小程序 */
  openMiniapp() {
    let { id, miniAppid, path } = this.data.game
    checkToken().then(res=>{
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
    }).catch(err=>{

    })
    console.log('miniApp')
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_1'
    })
  },
  /* 打开网页 */
  openWeb() {
    let { id, onlineUrl } = this.data.game
    checkToken().then(res=>{
      console.log('web')
      // onlineUrl='https://m.ajimiyou.com/game/YanxiPalace/?origin=miniapp&t=181018'+'&token='+token+'&gameId='+id
      // this.getShareContent(id);
      // this.setData({ onlineUrl })
      wx.navigateTo({
        url: '../web/web?url='+encodeURIComponent(onlineUrl)+'&gameId='+id
      })
    }).catch(err=>{

    })
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_1'
    })
  },
  /* 
  页面Load
   */
  onLoad(options) {
    console.log('onLoad-Detail',options)
    // 1,2,6,9
    let { shareUid, gameId } = options
    shareUid?app.shareUid = shareUid : null
    let { SystemInfo: { iphoneX } , adShow  } = app
    this.setData({
      id: gameId,
      ad: adShow,
      iphoneX
    })
    // 获取游戏列表
    this.fetchGame()
    // 获取评论
    this.fetchComments();
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
    console.log('onShow-Detail')
    this.setData({ad:app.adShow})
    this.getShareContent(this.data.id);
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_0'
    })
  },

  /* 
  上拉触底
  */
 onReachBottom () {
  console.log('上拉触底了')
  // 获取游戏列表
  this.fetchGame()
  // 获取评论
  this.fetchComments();
  
},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({focus:false})
  },
  onPageScroll({ scrollTop }) { // 获取滚动条当前位置
    if(scrollTop>100)return ;
    this.setData({ backOpacity: scrollTop/150 })
  },
  onPullDownRefresh () {
    // 获取游戏列表
    this.fetchGame(true)
    // 获取评论
    this.fetchComments(true);
    wx.stopPullDownRefresh()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (options) {
    console.log('options',options)
    play({
      page:'avg_detail',
      act:'click',
      pos:'avg_detail_5'
    })
    return {
      ...this.data.share,
      path:'pages/detail/detail?gameId='+this.data.id+'&shareUid='+app.uid
    }
  }
})