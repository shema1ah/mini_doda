var app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
var { ajaxRequest,doneTask, api: { getPostDtl, followUser, unFollowUser, api_post_operate, getComments,commentFavour,firstComment }, play, getShare, autoAuth, loginfail } = app
Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',
    navHeight:'',
    iphoneX:false,
    formId:'',//收集 的formId
    share: null,//分享文案

    id:null,//当前帖子id
    post:{},
    
    /* 评论参数 */
    focus: false,//唤起键盘
    content:'',
    comments:[],
    commentsMore:true,
    commentsQuery:{
      postId:null,
      index:1,
      orderType: 0
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
      }).catch(err=>{
        console.log(err)
        loginfail()
      })
    }else{
      console.log('用户拒绝授权')
    }
  },
  /* 获取帖子详情 */
  fetchPostDtl (id) {
    id = parseInt(id)
    wx.showLoading({ mask:true});
    ajaxRequest({
      url: getPostDtl(id),
      type: 'get',
      proxy: 'app',
      success: res => {
        console.log('帖子详情成功', res)
        if(res.code===200&&res.data){
          let post = res.data;
          this.setData({ post })
        }else{
          console.log('帖子详情成功res.code!==200', res)
        }
      },
      fail: err => {
        console.log('帖子详情失败', err)
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
    commentsQuery.postId = id
    wx.showLoading({mask:true})
    ajaxRequest({
      url: getComments,
      type: 'get',
      proxy:'app',
      data: refresh?{...commentsQuery,index:1}:commentsQuery,
      success: res => { 
        console.log('评论OK',res)
        if(res.code===200 && res.data){
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
  /* 关注(取消关注)用户 */
  focusUser({ target:{ dataset: { type, id } }}){
    let method = 'post';
    let url = followUser
    let data = { followedUser:{ id } }
    let follow = true;
    if(type==='unFollow'){
      method = 'get'
      data = { followedUserId: id }
      url = unFollowUser
      follow = false
    }
    ajaxRequest({
      url,
      type: method,
      data,
      proxy:'app',
      success: res=>{
        console.log(type+'用户成功',res)
        if(res.code === 200){
          this.setData({ 
            'post.follow':follow
          })
        }else{
          console.log(type+'用户成功code!==200',res)
        }
      },
      fail: err => {
        console.log(type+'用户失败',res)
      }
    })
  },
  /* 帖子的点赞收藏 */
  postAction({ target: {  dataset: { type } } }) {
    let str = '收藏过';
    let typeNum = 2 ;
    if(type ==='favour'){
      str='点过赞'
      typeNum = 1
    }
    if (this.data.post[type]) {
      wx.showToast({
        title: '你已经'+str+'了',
        duration: 1000,
        icon: "none"
      })
      return
    }
    ajaxRequest({
      url: api_post_operate,
      type: 'post',
      proxy:'app',
      data: {
        postId: this.data.id,
        type: typeNum
      },
      success: res => {
        console.log(str+'成功', res)
        if (res.code === 200) {
          let show = 'post.'+type;
          let curNum = this.data.post[type+'Count']
          let resNum = 'post.'+type+'Count'
          this.setData({ 
            [show]:true,
            [resNum]: curNum + 1
          })
        }
      },
      fail: err => {
        console.log(str+'失败', err)
      }
    })
    // play({
    //   page:'index',
    //   act:'click',
    //   pos:'index_3'
    // });
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
    let { content, formId, comments, id } = this.data
    if(content===''){return}
    wx.showLoading()
    ajaxRequest({
      url:firstComment,
      type:'post',
      proxy:'app',
      data:{
        content,
        pictures:[],
        postId:id
      },
      success: res => {
        console.log('评论成功',res)
        wx.hideLoading()
        if(res.code===200&&res.data){
          wx.showToast({
            title:'评论成功',
            mask:true,
            duration:1000
          })
          let { avatar, nickname  } = app.globalData.userInfo
          let item = res.data
          item.user.nickname = nickname||'暂无名字';
          item.user.avatar = avatar;
          item.time = new Date().getTime();
          comments.unshift(item)
          console.log(app.globalData.userInfo)
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
  goTopicDtl({ target:{ dataset:{ name,id }} }){
    wx.navigateTo({
      url:'../topic/topic?id='+id+'&name=' + name
    })
  },
  /* 
  页面Load
   */
  onLoad(options) {
    console.log('onLoad-Detail',options)
    // options = { id:'154105784172201'};
    this.fetchPostDtl(options.id)
    let { SystemInfo: { batteryBarHeight,navigationBarHeight,iphoneX } }=app
    this.setData({ 
      systemHeight: Number(batteryBarHeight),
      navHeight: Number(navigationBarHeight),
      iphoneX,
      id: options.id
    })
    this.fetchComments()
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
    // play({
    //   page:'avg_detail',
    //   act:'click',
    //   pos:'avg_detail_0'
    // })
  },

  /* 
  上拉触底
  */
 onReachBottom () {
  console.log('上拉触底了')
  this.fetchComments()
},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({focus:false})
  },
  /* 下拉刷新 */
  onPullDownRefresh: function () {
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
    doneTask(1)
    return {
      ...this.data.share,
      path:'pages/detail/detail?gameId='+this.data.id+'&shareUid='+app.uid
    }
  }
})