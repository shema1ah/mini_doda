const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, api: { getCollectWorks, getPost , api_post_operate, like }, play, getShare, autoAuth, loginfail } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    share:null,//分享文案
    title:'我的收藏',// 顶部导航文字

    cur:0,
    /* 作品相关参数 */
    works:[],
    worksMore:true,
    worksQuery:{
      index:1,
      favorite:1
    },

    /* 帖子相关参数 */
    post:[],
    postMore: true,
    postQuery:{
      index:1,
      type:1
    }
  },
  /* 帖子的回调*/
  postCb({ detail:{ show, fieldCount, resNum } }){
    show = 'post'+ show
    fieldCount = 'post'+ fieldCount
    this.setData({
      [show]:1,
      [fieldCount]: resNum
    })
  },
  /* 选项改变：点击事件 */
  selChange({ target: { dataset: { cur } } }){
    this.setData({ cur })
    this.fetchData(true)
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
  /* 获取收藏数据 */
  fetchData(refresh){
    wx.showLoading({ mask:true })
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let { cur }= this.data
    let url = getCollectWorks;
    let str = 'works'
    if(cur===1){
      url = getPost
      str = 'post'
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
  /* 点赞 */
  like({ currentTarget: {  dataset: { i, id } } }) {
    console.log('like')
    if (this.data.works[i].favour) {
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
        console.log('点赞成功', res)
        if (res.code === 200) {
          let favour = 'works['+ i +'].favour'
          let favourCount = 'works['+ i +'].favourCount'
          let index = this.data.works[i].favourCount
          this.setData({ 
            [favour]: true,
            [favourCount]: index + 1
           })
        }
      },
      fail: err => {
        console.log('点赞失败', err)
      }
    })
    // play({
    //   page:'index',
    //   act:'click',
    //   pos:'index_3'
    // });
  },
  /* 去详情 */
  goDetail ({ currentTarget: { dataset:{ id } } }) {
    console.log('跳转到详情',id)
    wx.navigateTo({
      url: '../detail/detail?id='+id
    });
  },
  /* 
  生命周期回调—监听页面加载
  */
  onLoad (options) {
    console.log(options)
    let title = '我的收藏'
    let postQuery = {
      index:1,
      type:1
    }
    if(options.title==='foot'){
      title = '我的足迹'
      postQuery = {
        index:1,
        type:2
      } 
    }

    let { SystemInfo: { batteryBarHeight,navigationBarHeight },isLogin }=app
    this.setData({ 
      systemHeight: Number(batteryBarHeight),
      navHeight:Number(navigationBarHeight),
      title,
      postQuery
    })
    if(isLogin){
      this.fetchData()
    }else{
      app.eventAry.push(this.fetchData)
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
    this.fetchData(true)
    wx.stopPullDownRefresh()
  },
  /* 
  上拉触底
  */
  onReachBottom () {
    console.log('上拉触底了')
    this.fetchData()
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
          let share = 'post['+i+'].share'
          let shareCount = 'post['+i+'].shareCount'
          let count = this.data.post[i].shareCount;
          this.setData({
            [share]: 1,
            [shareCount]: count + 1
          })
        }
      })
    }
    return {
      
    }
  }
})