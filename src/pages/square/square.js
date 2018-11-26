var app = getApp();
var {
  ajaxRequest,
  doneTask,
  api: {
    getFocus,
    getRecmTopic,
    getRecmPost,
    api_post_operate,
    getHotTopic,
    followTopic,
    unFollowTopic
  },
  play,
  getShare,
  autoAuth,
  loginfail,
  checkToken
} = app
Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight: '',
    navHeight: '',
    share: '', //分享相关，
    formId: '',

    /* 当前选项 */
    cur: 1, //0关注,1推荐 2人气

    /* 关注帖子参数 */
    focusPost: [],
    focusPostMore: true,
    focusPostQuery: {
      index: 1,
      type: 3
    },

    recmTopic: [], //推荐话题数组

    /* 推荐帖子参数 */
    recmPost: [],
    recmPostMore: true,
    recmPostQuery: {
      index: 1
    },



    /* 人气榜参数 */
    navCur: 0, //0:作品 1:角色
    //人气榜导航列表
    navList: [{
        name: '作品',
        src: '../../images/square/icon_book.png'
      },
      {
        name: '角色',
        src: '../../images/square/icon_user.png'
      }
    ],
    /* 人气作品参数 */
    hot_works: [],
    hot_worksMore: true,
    hot_worksQuery: {
      index: 1
    },
    /* 人气角色参数 */
    hot_role: [],
    hot_roleMore: true,
    hot_roleQuery: {
      index: 1
    },
  },
  /**
   *  帖子事件（点赞，收藏）回调 
   * @param {show : [0].favor 控制样式名称 } param0 
   * @param {fieldCount : [0].favorCount 控制数量显示名称  } param1
   * @param {resNum : 1 数量  } param2 
   */
  postCb({ detail:{ show, fieldCount, resNum } }){
    let { cur } = this.data;
    let str = 'focusPost'
    if(cur===1) str = 'recmPost'
    show = str + show
    fieldCount = str + fieldCount
    this.setData({
      [show]:1,
      [fieldCount]: resNum
    })
  },
  /* 阻止冒泡 */
  stopBubble() {},
  /* 去编辑帖子页面 */
  goEdit() {
    wx.showToast({
      title:'功能暂未开放，请下载 哆哒APP 进行编辑',
      icon:'none',
      duration:1500
    })
    return
    wx.navigateTo({
      url: '../edit/edit'
    })
  },
  /* 选项改变：点击事件 */
  selChange({ target: { dataset: { cur } } }) {
    console.log(cur)
    if (this.data.cur === cur) return
    this.setData({ cur })
  },
  /* 人气榜导航选项改变 */
  navChange({ currentTarget: { dataset: { i } } }) {
    this.setData({ navCur: i })
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
    if (action === 'cur') {
      this.refreshData(true)
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
        if (action === 'cur') {
          this.refreshData(true)
          return;
        }
        if(action === 'goSearch'){
          this.refreshData(true)
          this[app.action](app.e)
          return;
        }
        action !== '' ? this[app.action](app.e) : null;
      }).catch(err => {
        console.log(err)
        loginfail()
      })
    } else {
      console.log('用户拒绝授权')
    }
  },
  /* 去搜索页面 */
  goSearch() {
    console.log('去搜索')
    wx.navigateTo({
      url: '../search/search'
    });
    // play({
    //   ...this.data.report,
    //   act:'click',
    //   pos:'index_1'
    // });
  },
  /* 获取关注列表 */
  fetchFocus(refresh) {//是否刷新
    // if(!refresh)return //没有更多了
    wx.showLoading({ title:'数据加载中',mask: true })
    ajaxRequest({
      url: getFocus,
      proxy: 'app',
      data: refresh ? {
        index: 1,
        type: 3
      } : this.data.focusPostQuery,
      success: res => {
        console.log('获取关注成功', res)
        if (res.code === 200 && res.data) {
          let newData = res.data;
          let index = this.data.focusPostQuery.index;
          let more = true;
          refresh ? index = 1 : null;
          if (newData.length ===10) {
            index += 1
          }else{
            if(!refresh){
              newData = newData.splice(this.data.focusPost.length%10)
              if(newData.length===0)return
            }
            more =false
          }
          newData = refresh ? newData : this.data.focusPost.concat(newData)
          this.setData({
            focusPost: newData,
            focusPostMore: more,
            'focusPostQuery.index': index
          })
        } else {
          console.log('获取关注成功code!==200', res)
        }
      },
      fail: err => {
        console.log('获取关注失败', res)
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  /* 获取推荐话题列表 */
  fetchRecmTopic() {
    ajaxRequest({
      url: getRecmTopic,
      proxy: 'app',
      success: res => {
        console.log('获取推荐话题成功', res)
        if (res.code === 200 && res.data) {
          this.setData({
            recmTopic: res.data
          })
        } else {
          console.log('获取推荐话题成功code!==200', res)
        }
      },
      fail: err => {
        console.log('获取推荐话题失败', res)
      }
    })
  },
  /* 获取推荐帖子 */
  fetchRecmPost(refresh) {
    // if(!refresh&&!this.data.recmPostMore)return //没有更多了
    wx.showLoading({ mask: true })
    ajaxRequest({
      url: getRecmPost,
      proxy:'app',
      data: refresh ? {
        index: 1
      } : this.data.recmPostQuery,
      success: res => {
        console.log('获取推荐帖子成功', res)
        if (res.code === 200 && res.data) {
          let newData = res.data;
          let index = this.data.recmPostQuery.index;
          let more = true;
          refresh ? index = 1 : null;
          if (newData.length ===10) {
            index += 1
          }else{
            if(!refresh){
              newData = newData.splice(this.data.recmPost.length%10)
              if(newData.length===0)return
            }
            more =false
          }
          newData = refresh ? newData : this.data.recmPost.concat(newData)
          this.setData({
            recmPost: newData,
            recmPostMore: more,
            'recmPostQuery.index': index
          })
        } else {
          console.log('获取推荐帖子成功code!==200', res)
        }
      },
      fail: err => {
        console.log('获取推荐帖子失败', res)
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  /* 获取人气榜话题 */
  fetchHotTopic(refresh){
    let str = 'hot_works';
    let strMore = 'hot_worksMore'
    let strQuery = 'hot_worksQuery'
    let strIndex = 'hot_worksQuery.index'
    
    if(this.data.navCur===1){
      str='hot_role'
      strMore = 'hot_roleMore'
      strQuery = 'hot_roleQuery'
      strIndex = 'hot_roleQuery.index'
    }
    // if(!refresh&&!this.data[strMore])return //没有更多了
    wx.showLoading({ mask: true })
    ajaxRequest({
      url: getHotTopic,
      proxy:'app',
      data: refresh ? {
        index: 1,
        topicType: this.data.navCur
      } : {...this.data[strQuery],topicType: this.data.navCur},
      success: res => {
        console.log(str+'成功', res)
        if (res.code === 200 && res.data) {
          let newData = res.data;
          let more = true;
          let index = this.data[strQuery].index;
          refresh ? index = 1 : null;
          if (newData.length ===10) {
            index += 1
          }else{
            if(!refresh){
              newData = newData.splice(this.data[str].length%10)
              if(newData.length===0)return
            }
            more = false
          }
          newData = refresh ? newData : this.data[str].concat(newData)
          this.setData({
            [str]: newData,
            [strMore]: more,
            [strIndex]: index
          })
        } else {
          console.log(str+'成功code!==200', res)
        }
      },
      fail: err => {
        console.log(str+'失败', res)
      },
      complete: res => {
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
          let str = 'hot_works'
          if(this.data.navCur===1){
            str = 'hot_role'
          }
          let followField = str+'['+ i +'].follow'
          console.log(followField)
           this.setData({
             [followField]:follow
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
  /* 去话题详情 */
  goTopicDtl({ target:{ dataset:{ name,id }} }){
    wx.navigateTo({
      url:'../topic/topic?id='+id+'&name='+name
    })
  },
  /* 查看规则 */
  goRule(){
    wx.navigateTo({
      url: '../web/web?url=https://m.ajimiyou.com/app/rankrule.html'
    })
  },
  /* 刷新数据 */
  refreshData(refresh) {
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let data = this.data
    switch (data.cur) {
      case 0: //关注
        this.fetchFocus(refresh);
        return;
      case 1: //推荐
        this.fetchRecmTopic()
        this.fetchRecmPost(refresh)
        return;
      case 2: //人气
        this.fetchHotTopic(refresh)
        return;
    }
  },
  onLoad: function (options) {
    let { SystemInfo: { batteryBarHeight, navigationBarHeight }, adShow, isLogin } = app
    this.setData({
      systemHeight: Number(batteryBarHeight),
      navHeight: Number(navigationBarHeight),
      ad: adShow
    })
    if(isLogin){
      // this.fetchFocus()
      this.fetchRecmTopic()
      this.fetchRecmPost()
    }else{
      app.eventAry.push(this.fetchRecmTopic,this.fetchRecmPost)
      // app.eventAry.push(fetchFocus)
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
    // this.fetchFocus(true);
    this.fetchRecmTopic()
    this.fetchRecmPost(true)
    this.setData({
      ad: app.adShow
    })
    this.getShareContent()
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
    this.refreshData()
  },
  /*
    下拉刷新 
   */
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshData(true)
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
      console.log(i)
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
          let str = this.data.cur === 0 ? 'focusPost' : 'recmPost'
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