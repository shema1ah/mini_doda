//获取应用实例
const app = getApp()
const {
  ajaxRequest,
  api: {
    followTopic,
    unFollowTopic,
    followUser,
    unFollowUser
  },
  play,
  getShare,
  autoAuth,
  authCheck,
  loginfail,
  checkToken
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
      /* 类型：1：关注的话题，
              2：关注的人，
              3：粉丝
      */
      type: Number,
      value: 1
    }
  },
  data: {
    formId:''
  },
  methods: {
    /* 阻止冒泡 */
    stopBubble() { },
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
      action !== '' ? this[action](e) : null;
    },
    /* 获取授权后获取信息回调 */
    getUserInfo(e) {
      if (app.isLogin) return;
      console.log('未登录', e)
      if (e.detail.errMsg === 'getUserInfo:ok') {
        let {
          detail: {
            errMsg,
            ...res
          }
        } = e
        app.res = res
        app.globalData.userInfo = res.userInfo
        autoAuth().then(res => {
          let action = app.action
          let cb = app.action !== '' ? () => {
            this[app.action](app.e)
          } : null
          this.fetchGameData(true, cb)
        }).catch(err => {
          console.log(err)
          loginfail()
        })
      } else {
        console.log('用户拒绝授权')
      }
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
          if(res.code===200&&res.data){
            let followField = 'list['+i+'].follow'
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
    /* 关注(取消关注)用户 */
    // FixTo 待完善，用户没有是否关注没有follow字段
    focusUser({ target:{ dataset: { type, i, id } }}){
      let method = 'post';
      let url = followUser
      let data = { followedUser:{ id } }
      let follow = 1 ;
      if(type==='unFollow'){
        method = 'get'
        data = { followedUserId: id }
        url = unFollowUser
        follow = 0
      }
      ajaxRequest({
        url,
        type: method,
        data,
        proxy:'app',
        success: res=>{
          console.log(type+'用户成功',res)
          if(res.code === 200){
            let followField = 'list['+i+'].follow'
            this.setData({
              [followField]:follow
            })
          }else{
            console.log(type+'用户失败',res)
          }
        }
      })
    },
    /* 去话题详情 */
    goTopicDtl({ target:{ dataset:{ name,id }} }){
      wx.navigateTo({
        url:'../topic/topic?id='+id+'&name='+name
      })
    },
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