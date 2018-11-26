//获取应用实例
const app = getApp()
const { autoAuth, loginfail } = app
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  data: {
    formId: ''
  },
  methods: {
    /* 上报formId */
    formSubmit(e) {
      console.log('收集到formId',e.detail.formId)
      this.setData({
        formId:e.detail.formId
      })
    },
    /* 点击事件统一处理函数 */
    handleEvent(event){
      console.log('handleEvent',event)
      // 此方法用于登录拦截:未登录的转由登录fn处理
      // let action = e.target.dataset.action;
      // console.log('action',action)
      // console.log('isLogin',app.isLogin)
      // if (!app.isLogin) {//需要授权的
      //   // getUserInfo中e.target永远都是绑定的该事件的button 
      //   // 所以要记录授权之前的action
      //   app.action = action
      //   return;
      // }
      // this.triggerEvent('loginOver', e)
      // this[action](e);
    },
    /* 获取授权后获取信息回调 */
    getUserInfo(e) { 
      console.log('getUserInfo',e)
      if (app.isLogin) return;
      console.log('未登录',e)
      if (e.detail.errMsg === 'getUserInfo:ok'){
        let { detail:{ errMsg, ...res} } = e
        app.res = res
        app.globalData.userInfo = res.userInfo
        autoAuth().then(res=>{
          console.log('登录成功')
          this.loginTrigger('登录成功', e)
          // this[app.action](e)
        }).catch(err=>{
          console.log(err)
          this.loginTrigger('登录失败', e)
        })
      }else{
        console.log('用户拒绝授权')
        this.loginTrigger('用户未授权', e)
      }
    },
    /* 真实登录trigger */
    loginTrigger(title, e) {
      let loginRes = {
        state: 0,
        formId: this.data.formId,
        msg: title,
        event: e
      }
      if (title !== '登录成功'||title!=='用户未授权') {
        loginRes.state = 1;
        wx.showToast({
          title: '授权失败，请检查网络并重试',
          icon: 'none',
          duration: 1500,
          mask: true
        });
      }
      this.triggerEvent('loginOver', loginRes,{bubbles:true,composed:true})
    },
    // /* 微信登陆:获取code */
    // wxLogin() {
    //   return new Promise(function (resolve, reject) {
    //     wx.login({
    //       success: function (res) {
    //         console.log("code-SUCC", res.code)
    //         //save app
    //         app.authCode = res.code;
    //         //在服务端登录处理
    //         resolve(res);
    //       },
    //       fail: function (err) {
    //         console.log("code-ERR", res);
    //         //在服务端登录处理
    //         reject(err);
    //       }
    //     });
    //   });
    // },
    // /* 获取Openid */
    // getOpenid() {
    //   let {
    //     authCode,
    //     api: {
    //       getOpenid
    //     }
    //   } = app
    //   return new Promise((resolve, reject) => {
    //     app.ajaxRequest({
    //       url: getOpenid,
    //       type: 'post',
    //       data: {
    //         code: authCode
    //       },
    //       success: res => {
    //         console.log('opendid-SUCC', res)
    //         if (res.code === 200) {
    //           app.openid = res.data.openid;
    //           resolve()
    //         } else {
    //           reject('opendid-ERR')
    //         }
    //       },
    //       fail: err => {
    //         console.log('opendid-ERR', err)
    //         reject(err)
    //       }
    //     })
    //   });
    // },
    // /* 真正登录 */
    // realLogin() {
    //   let {
    //     api: {
    //       realLogin
    //     },
    //     res,
    //     openid
    //   } = app
    //   app.ajaxRequest({
    //     url: realLogin,
    //     type: 'post',
    //     data: {
    //       ...res,
    //       openId: openid
    //     },
    //     success: res => {
    //       console.log('login-SUCC', res)
    //       if (res.code === 200) {
    //         let {
    //           data: {
    //             token,
    //             user
    //           }
    //         } = res
    //         let userInfo = Object.assign({}, app.globalData.userInfo, user)
    //         app.globalData.userInfo = userInfo
    //         app.token = token
    //         app.shareUid = userInfo.id;
    //         app.isLogin = true;
    //         wx.setStorageSync('token', token);
    //         // 真实登录成功后出发方法
    //         this.loginTrigger('登录成功', userInfo)
    //       } else {
    //         this.loginTrigger('真实登录失败' + res.msg)
    //       }
    //     },
    //     fail: err => {
    //       console.log('login-ERR', err)
    //       this.loginTrigger('真实登录失败')
    //     }
    //   })
    // },
    // /* 真实登录trigger */
    // loginTrigger(title, data) {
    //   let loginRes = {
    //     state: 0,
    //     formId: this.data.formId,
    //     msg: title,
    //     userInfo: data
    //   }
    //   wx.hideLoading()
    //   if (title !== '登录成功') {
    //     loginRes.state = 1;
    //     wx.showToast({
    //       title: '授权失败，请检查网络并重试',
    //       icon: 'none',
    //       duration: 1500,
    //       mask: true
    //     });
    //   }
    //   this.triggerEvent('loginOver', loginRes)
    // },
    // /* 获取授权后获取信息回调 */
    // getUserInfo(e) {
    //   console.log('getUserInfo', e)
    //   let {
    //     errMsg,
    //     ...res
    //   } = e.detail
    //   if (errMsg === 'getUserInfo:ok') {
    //     app.res = res
    //     app.globalData.userInfo = res.userInfo
    //     wx.showLoading({
    //       title: "授权加载中"
    //     });
    //     // 授权成功获取code
    //     this.wxLogin().then(res => {
    //       this.getOpenid().then(res => {
    //         this.realLogin()
    //       }).catch(err => {
    //         this.loginTrigger('获取Openid失败')
    //         console.log(err)
    //       })
    //     }).catch(err => {
    //       this.loginTrigger('获取Openid失败')
    //       console.log(err)
    //     })
    //   } else {
    //     // 授权失败
    //     console.log('授权失败')
    //     this.loginTrigger('用户未授权')
    //   }
    // }
  }
});