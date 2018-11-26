//获取应用实例
const app = getApp()
const {
  ajaxRequest,
  api: {
    api_post_operate
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
          let cb = action !== '' ? () => {
            this[action](app.e)
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
    /* 帖子点赞  type:1
          收藏  type:2
     */
    postAction({ target: {  dataset: { i, id, type } } }) {
      let str = '收藏过';
      let typeNum = 2 ;
      if(type ==='favour'){
        str='点过赞'
        typeNum = 1
      }
      if (this.data.list[i][type]) {
        wx.showToast({
          title: '你已经'+str+'了',
          duration: 1000,
          icon: "none"
        })
        return
      }
      i = parseFloat(i)
      id = parseFloat(id)
      ajaxRequest({
        url: api_post_operate,
        type: 'post',
        proxy:'app',
        data: {
          postId:id,
          type:typeNum
        },
        success: res => {
          console.log(str+'成功', res)
          if (res.code === 200) {
            let show = '['+i+'].'+type;
            let curNum = this.data.list[i][type+'Count']
            // let resNum = 'post['+i+'].'+type+'Count'
            this.triggerEvent('postCb',{show,fieldCount:show+'Count',resNum:curNum+1})
            // this.setData({ 
            //   [show]:true,
            //   [resNum]: curNum + 1
            //  })
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
    /* 去帖子详情 */
    goPostDtl({ target:{ dataset:{ id }} }){
      wx.navigateTo({
        url:'../../pages/postDtl/postDtl?id='+ id
      })
    },
    /* 去话题详情 */
    goTopicDtl({ target:{ dataset:{ name, id }} }){
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