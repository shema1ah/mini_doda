var app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
var { ajaxRequest,doneTask, api: { getTopicDtl, followTopic, unFollowTopic, getTopicPost,api_post_operate }, play, getShare, autoAuth, loginfail, checkToken } = app
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

    /* 话题参数 */
    id:'',
    name: null,
    topic: null,
    cur: 0, //导航参数 0:推荐  1:全部  2:精华

    /* 推荐帖子参数 */
    recm:[],
    recmMore:true,
    recmQuery:{
      index:1,
      topicType:1,
      type:2
    },
    /* 全部帖子参数 */
    all:[],
    allMore:true,
    allQuery:{
      index:1,
      topicType:0,
      type:2
    },
    /* 精华帖子参数 */
    elite:[],
    eliteMore:true,
    eliteQuery:{
      index:1,
      topicType:2,
      type:2
    },
    listQuery: {
      index: 1,
      pageSize: 10
    },
    ad:false
    
  },
  /**
   *  帖子事件（点赞，收藏）回调 
   * @param {show : [0].favor 控制样式名称 } param0 
   * @param {fieldCount : [0].favorCount 控制数量显示名称  } param1
   * @param {resNum : 1 数量  } param2 
   */
  postCb({ detail:{ show, fieldCount, resNum } }){
    let { cur } = this.data;
    let str = 'all'
    if(cur===0)str = 'recm'
    if(cur===2)str = 'elite'
    show = str + show
    fieldCount = str + fieldCount
    this.setData({
      [show]:1,
      [fieldCount]: resNum
    })
  },
  /* 阻止冒泡 */
  stopBubble() {},
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
  /* 选项改变：点击事件 */
  selChange({ target: { dataset: { cur } } }){
    this.setData({ cur })
    this.fetchTopicPost(true)
  },
  /* 获取话题详情 */
  fetchTopicDtl (name) {
    wx.showLoading({ mask:true});
    ajaxRequest({
      url: getTopicDtl,
      type: 'get',
      proxy: 'app',
      data:{ topicName:name },
      success: res => {
        if(res.code===200&&res.data){
          console.log('话题详情成功', res)
          let topic = res.data;
          this.setData({ topic })
        }else{
          console.log('话题详情成功res.code!==200', res)
        }
      },
      fail: err => {
        console.log('话题详情失败', err)
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
  },
  /* 根据话题获取帖子 */
  fetchTopicPost(refresh){
    wx.showLoading({ mask:true })
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let { id , cur }= this.data
    let str = 'all';
    if(cur===0){
      str = 'recm'
    }
    if(cur===2){
      str = 'elite'
    }
    let strIndex = str + 'Query.index'
    let strMore = str + 'More'
    let query = refresh? {...this.data[str+'Query'],index:1} : this.data[str+'Query'];
    query.topicId = id
    ajaxRequest({
      url:getTopicPost,
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
          console.log(newData)
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
  /* 关注话题 */
  focusTopic({ target:{ dataset:{ type, id } } }){
    let fn =  unFollowTopic
    let method = 'delete';
    let follow = 0
    if(type==='follow'){
      fn = followTopic
      method = 'post'
      follow = 1
    }
    ajaxRequest({
      url: fn(id),
      type: method,
      proxy:'app',
      success: res=>{
        if(res.code===200&&res.data==1){
          console.log('话题'+type+'成功',res)
           this.setData({
             'topic.follow':follow
           })
        }else{
          console.log('话题'+type+'成功code!==200',res)
        }
      },
      fail: err=>{
        console.log('话题'+type+'失败',res)
      }
    })
  },
  /* 打开网页 */
  openWeb() {
    let { id, onlineUrl } = this.data.topic
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
    // play({
    //   page:'avg_detail',
    //   act:'click',
    //   pos:'avg_detail_1'
    // })
  },
  /* 
  页面Load
   */
  onLoad(options) {
    console.log('onLoad-topicDtl',options)
    // options = {id: "154095483285547",name:'奇妙社日常' };
    let { id, name } = options
    this.fetchTopicDtl(name);
    let { adShow, isLogin  } = app
    this.setData({ 
      id,
      name,
      ad: adShow
    })
    if(isLogin){
      this.fetchTopicPost()
    }else{
      app.eventAry.push(this.fetchTopicPost)
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
    console.log('onShow-Detail')
    this.setData({ad:app.adShow})
    this.getShareContent(this.data.id);
    // play({
    //   page:'avg_detail',
    //   act:'click',
    //   pos:'avg_detail_0'
    // })
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
  /* 
  上拉触底
  */
  onReachBottom() {
    console.log('上拉触底了')
    this.fetchTopicPost()
  },
  /*
    下拉刷新 
  */
  onPullDownRefresh() {
    // 下拉刷新
    this.fetchTopicPost(true)
    wx.stopPullDownRefresh()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage({ from, target }) {
    if (from === 'button') {
      let { id, i } = target.dataset
      i = parseFloat(i)
      id = parseFloat(id)
      ajaxRequest({
        url: api_post_operate,
        type: "post",
        proxy: 'app',
        data: {
          type: 3,
          postId: id,
          shareType: 1
        },
        success: res => {
          console.log('分享成功')
          let str = 'recm'
          if(this.data.cur===1){
            str = 'all'
          }
          if(this.data.cur===2){
            str = 'elite'
          }
          let share = str +'['+i+'].share'
          let count = this.data[str][i].shareCount;
          str +='['+i+'].shareCount'
          this.setData({
            [str]: count + 1,
            [share]: 1
          })
        }
      })
    }
    doneTask(1)
    return {
      ...this.data.share
    }
  }
})