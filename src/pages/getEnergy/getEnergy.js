const app = getApp();
/* 此处只能解构常用方法，并不能获取异步更改的数据，此时还未完成异步赋值 */
const { ajaxRequest,doneTask,errTip, api: { getTask,getEnergy }, play, getShare } = app
Page ({

  /**
   * 页面的初始数据
   */
  data: {
    systemHeight:'',//系统高度
    navHeight:'',//胶囊高度
    formId:'',//收集 的formId
    share:null,//分享文案
    task:{
      viewTask:0,
      invateTask:0,
      yuanqiCoin:0
    } //任务状态
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
  /* 获取任务状态 */
  fetchTaskState(){
    ajaxRequest({
      url:getTask,
      type:'get',
      proxy:'app',
      success:res=>{
        if(res.code===200&&res.data){
          console.log('任务状态成功',res)
          this.setData({task:res.data})
        }else{
          console.log('任务状态code!==200',res)
          errTip(0)
        }
      },
      fail:err=>{
        console.log('任务状态失败',res)
        errTip(1)
      }
    })
  },
  /* 去完成任务 */
  doTask({ target:{ dataset:{ type } }}){
    console.log(type)
    type===0 ? doneTask(0):null;
    wx.switchTab({
      url: '../home/home'
    })
  },
  /* 领取能量 */
  fetchEnergy({target:{ dataset:{ type } }}){
    wx.showLoading({mask:true})
    let str = 'task.viewTask'
    if(type===1) str = 'task.invateTask'
    ajaxRequest({
      url:getEnergy(type),
      type:'post',
      proxy:'app',
      success:res=>{
        if(res.code===200&&res.data){
          console.log('获取能量成功',res)
          this.setData({
            'task.yuanqiCoin':res.data.yuanqiCoin,
            [str]:2
          })
          wx.hideLoading()
        }else{
          wx.hideLoading()
          errTip(0)
          console.log('获取能量code!==200',res)
        }
      },
      fail:err=>{
        wx.hideLoading()
        errTip(1)
        console.log('获取能量失败')

      }
    })
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
    let { isLogin } = app
    this.getShareContent();
    if(isLogin){
      this.fetchTaskState()
    }else{
      app.eventAry.push(this.fetchTaskState)
    }
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