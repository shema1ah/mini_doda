const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest, api: { getPost,api_post_operate }, play, getShare } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    formId:'',//收集 的formId
    share:null,//分享文案
    post:[],
    postMore: true,
    postQuery:{
      index:1,
      type:3
    }
  },

  /**
   *  帖子事件（点赞，收藏）回调 
   * @param {show : [0].favor 控制样式名称 } param0 
   * @param {fieldCount : [0].favorCount 控制数量显示名称  } param1
   * @param {resNum : 1 数量  } param2 
   */
  postCb({ detail:{ show, fieldCount, resNum } }){
    let str = 'post'
    show = str + show
    fieldCount = str + fieldCount
    this.setData({
      [show]:1,
      [fieldCount]: resNum
    })
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
  /* 获取发布数据 */
  fetchPublish(refresh){
    wx.showLoading({ mask:true })
    refresh = (typeof refresh ==='boolean') && refresh === true? refresh : null
    let str = 'post'
    let strMore = str + 'More'
    let strIndex = str + 'Query.index'
    let query = refresh? {...this.data[str+'Query'],index:1} : this.data[str+'Query'];
    ajaxRequest({
      url:getPost,
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
      this.fetchPublish()
    }else{
      app.eventAry.push(this.fetchPublish)
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
    console.log('onShow-publish')
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
    this.fetchPublish(true)
    wx.stopPullDownRefresh()
  },
  /* 
  上拉触底
  */
  onReachBottom () {
    console.log('上拉触底了')
    this.fetchPublish()
  },

  /**
   * 用户点击分享
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