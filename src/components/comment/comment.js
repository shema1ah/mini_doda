//获取应用实例
const app = getApp()
const {
  ajaxRequest,
  api: {
    commentFavour,
    dtlCommentFavour
  },
  play,
  getShare
} = app
// components/nav/nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    listType:{
      type:String,
      value:'new'
    },
    gameId:{
      type:String,
      value:''
    }
  },
  data: {
    formId: ''
  },
  methods: {
    /* 阻止冒泡 */
    stopBubble() {},
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
    /* 评论的点赞（一级评论）*/
    favour_comment({ target:{ dataset:{ i,id,favour} } }){
      wx.showLoading({ mask:true })
      if(favour==1){
        wx.showToast({
          title: '你已经点过赞了',
          duration: 1000,
          icon: "none"
        })
        return
      }
      let url = commentFavour
      let proxy = 'app'
      let param = { commentId:id }
      if(this.data.listType==='old'){
        url = dtlCommentFavour(this.data.gameId,id)
        proxy = 'mini'
        param = {}
      }
      ajaxRequest({
        url,
        type:'post',
        proxy,
        data: param,
        success: res => {
          wx.hideLoading()
          if(res.code===200){
            console.log('评论点赞成功',res)
            let show = 'list['+i+'].favour';
            let curNum = this.data.list[i].favourCount|| 0
            let resNum = 'list['+i+'].favourCount'
            this.setData({ 
              [show]: true,
              [resNum]: curNum + 1
            })
          }else{
            console.log('评论点赞成功code!==200',res)
          }
        },
        fail: err=>{
          wx.hideLoading()
          console.log('评论点赞失败',res)
        }
      })
    }
  },
  attached() {
    let {
      batteryBarHeight
    } = app.SystemInfo
    this.setData({
      systemHeight: Number(batteryBarHeight)
    })
  }
});