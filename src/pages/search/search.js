
var app = getApp();
var { 
  ajaxRequest,
  errTip,
  doneTask,
  api:{ 
    getHotTopic, 
    getTopicHst, 
    topicSearch,
    postSearch,
    api_post_operate,
    followTopic,
    unFollowTopic
  },
  getShare, 
  play} = app;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//电池高度
    navHeight:'',//导航栏高度
    share: null,

    focus:false, //输入框是否聚焦
    resShow: false,//是否展示搜索结果
    moreShow: false,//更多是否显示
    
    content:'',//输入框内容
    
    history:[],//搜索历史

    /* 热门话题参数 */
    hotTopic:[],//热门话题
    hotTopicMore:true,
    hotTopicQuery: {
      index: 1
    },
    
    /* 相关话题参数 */
    rtsTopic:[],
    rtsTopicMore:true,
    rtsTopicQuery: {
      index: 1,
      topicName:''
    },

    /* 相关帖子参数 */
    rtsPost:[],
    rtsPostMore:true,
    rtsPostQuery: {
      index: 1,
      type: 1,
      keyword:''
    },
  },
  back(){
    let { moreShow  } = this.data
    if(moreShow){
      this.setData({ resShow:true,moreShow: false  })
      return 
    }
    wx.navigateBack({
      delta:1
    })
  },
  /**
   *  帖子事件（点赞，收藏）回调 
   * @param {show : [0].favor 控制样式名称 } param0 
   * @param {fieldCount : [0].favorCount 控制数量显示名称  } param1
   * @param {resNum : 1 数量  } param2 
   */
  postCb({ detail:{ show, fieldCount, resNum } }){
    let str = 'rtsPost'
    show = str + show
    fieldCount = str + fieldCount
    this.setData({
      [show]:1,
      [fieldCount]: resNum
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
  // 更多相关话题
  moreRtsTopic(){
    if(this.data.rtsTopic.length<4){
      wx.showToast({
        title:'没有更多相关话题了',
        icon:'none',
        duration:800
      })
      return
    }
    this.setData({ resShow:false, moreShow:true })
  },
  /* 设置选中内容 */
  search(){
    let { content } = this.data 
    this.setData({
      'rtsTopicQuery.topicName':content,
      'rtsPostQuery.keyword':content,
      resShow:true
    })
    // 搜索帖子
    this.fetchTopicOrPost(true,1)
    // 搜索话题
    this.fetchTopicOrPost(true)
    // 重新拉取历史
    this.fetchTopicHst()
  },
  /* 点击历史搜索相关内容 */
  tapSearch({ target: { dataset: { name } } }){
    this.setData({
      content:name,
      'rtsTopicQuery.topicName':name,
      'rtsPostQuery.keyword':name,
      resShow:true
    })
    // 搜索帖子
    this.fetchTopicOrPost(true,1)
    // 搜索话题
    this.fetchTopicOrPost(true)
    // 重新拉取历史
    this.fetchTopicHst()
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
  /* 模糊搜索 相关话题(默认) 与 帖子(type===1) */
  fetchTopicOrPost(refresh,type){
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let str = 'rtsTopic'
    let url = topicSearch
    if(type===1){
      wx.showLoading()
      str = 'rtsPost'
      url = postSearch
    }
    let strMore = str + 'More'
    let strIndex = str + 'Query.index'
    let query = refresh? {...this.data[str+'Query'],index:1} : this.data[str+'Query'];
    ajaxRequest({
      url,
      type:'get',
      proxy:'app',
      data:query,
      success: res =>{
        if(res.code===200&&res.data){
          console.log(str+'搜索OK',res)
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
          console.log(str+'搜索code!==200',res)
          errTip(0)
        }
      },
      fail: err=>{
        console.log(str+'失败',res)
        errTip(1)
      },
      complete: res=>{
        if(type===1)wx.hideLoading()
      }
    })
  },
  /* 获取话题搜索历史 */
  fetchTopicHst(){
    ajaxRequest({
      url:getTopicHst,
      type:'get',
      proxy:'app',
      success: res=>{
        if(res.code===200 && res.data){
          console.log('话题历史获取成功',res)
          this.setData({
            history: res.data
          })
        }else{
          console.log('话题历史获取成功code!==200',res)
        }
      },
      fail: err=>{
        console.log('话题历史获取失败',err)
      }
    })
  },
  /* 获取热门话题 */
  fetchData(refresh){
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    wx.showLoading()
    let str = 'hotTopic'
    let strMore = str + 'More'
    let strIndex = str + 'Query.index'
    let query = refresh? {...this.data[str+'Query'],index:1 } : this.data[str+'Query'];
    ajaxRequest({
      url: getHotTopic,
      proxy: 'app',
      data: query,
      success: res =>{
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
          console.log('获取热门话题code!==200',res)
          errTip(0)
        }
      },
      fail: err =>{
        console.log('获取关注失败',res)
        errTip(1)
      },
      complete: res=>{
        wx.hideLoading();
      }
    })
  },
  /* 关注话题 */
  focusTopic({ target:{ dataset:{ type, i, id } } }){
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
        console.log('话题'+type+'成功',res)
        if(res.code===200&&res.data==1){
          let str = 'hotTopic'
          if(this.data.moreShow) str = 'rtsTopic'
          let followField = str+'['+ i +'].follow'
           this.setData({
             [followField]:follow
           })
        }else{
          console.log('话题'+type+'成功code!==200',res)
          errTip(0)
        }
      },
      fail: err=>{
        console.log('话题'+type+'失败',res)
        errTip(1)
      }
    })
  },
  /* 去话题详情 */
  goTopicDtl({ target:{ dataset:{ name,id }} }){
    wx.navigateTo({
      url:'../topic/topic?id='+id+'&name='+name
    })
  },
  onLoad: function (options) {
    let { SystemInfo: { batteryBarHeight, navigationBarHeight }, isLogin   } = app;
    console.log('onLoad-my',isLogin)
    this.setData({
      systemHeight: Number(batteryBarHeight),
      navHeight: Number(navigationBarHeight)
    })
    if(isLogin){
      this.fetchTopicHst()
      this.fetchData()
    }else{
      app.eventAry.push(this.fetchData,this.fetchTopicHst)
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
    this.getShareContent();
    // play({
    //   page:'',
    //   act:'view',
    //   pos:'user_center_0'
    // });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /* 
  上拉触底
  */
  onReachBottom() {
    console.log('上拉触底了')
    let { resShow,moreShow }= this.data
    // 搜索结果页面
    if(resShow){
      // 搜索帖子
      this.fetchTopicOrPost(null,1)
      // 搜索话题
      this.fetchTopicOrPost(null)
    }else if(moreShow){//更多话题页面
      this.fetchTopicOrPost(null)
    }else{
      // 获取热门话题
      this.fetchData()
    }
    
  },
  onPullDownRefresh () {
    let { resShow,moreShow }= this.data
    // 搜索结果页面
    if(resShow){
      // 搜索帖子
      this.fetchTopicOrPost(true,1)
      // 搜索话题
      this.fetchTopicOrPost(true)
    }else if(moreShow){//更多话题页面
      this.fetchTopicOrPost(true)
    }else{
      // 获取热门话题
      this.fetchData(true)
    }
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
          let share = 'rtsPost['+i+'].share'
          let shareCount = 'rtsPost['+i+'].shareCount'
          let count = this.data.rtsPost[i].shareCount;
          this.setData({
            [share]: 1,
            [shareCount]: count + 1
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