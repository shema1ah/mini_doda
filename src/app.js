// 获取所有ajax地址
let api = require('./common/index')
App({
  /* 
  地址map 
  */
  Source: {
    test: {
      mini: 'https://beta.ajimiyou.com/mini',
      share: 'https://beta.ajimiyou.com/web',
      report: 'https://beta.ajimiyou.com/monitor',
      app: 'https://beta.ajimiyou.com/app'
      
    },
    prod: {
      mini: 'https://api.ajimiyou.com/mini',
      share: 'https://api.ajimiyou.com/web',
      report: 'https://api.ajimiyou.com/monitor',
      app: 'https://api.ajimiyou.com/app'
    }
  },
  /* 
  地址源 
  */
  Sourcetype: "prod",
  /* 
  挂载所有ajax接口 
  */
  api: api,
  /* 
  系统信息 
  */
  SystemInfo: null,
  /* 
  全局数据 用户信息相关 
  */
  globalData: {
    userInfo: null //用户信息-
  },
  /*
  登录状态
  */
  isLogin: false,
  /* 
  authCode 微信登陆接口code
  */
  authCode: null,
  /* token */
  token: null,
  /* 
  ticket  微信获取信息接口 
  */
  ticket: null,
  /* 
  opendid  微信获取信息接口 
  */
  openid: null,
  /*
  signature 微信获取信息接口签名
  */
  signature: null,
  /*
  res 微信获取信息接口res
  */
  res: null,
  /*
  uid 微信获取信息接口个人id
  */
  uid: null,
  /* 唤起授权时的行为 */
  action: null,
  /* 唤起授权时的事件对象 */
  e: null,
  /* 
  分享者的用户id
  */
  shareUid: null,
  /* 广告是否显示 */
  adShow: true,
  /* 上报数据所需参数 */
  reportData: null,
  /* 登录后需要刷新的事件 */
  eventAry:[],
  onLaunch(options) {
    console.log(options)
    console.log("小程序初始化", this.Sourcetype, this.Source[this.Sourcetype]);
    this.getSystemInfo();
    this.authCheck()
  },
  onShow: function () {
    console.log("小程序显示")
  },
  onHide: function () {
    console.log("小程序隐藏")
  },
  onError: function () {
    console.log("错误监听函数")
  },
  onPullDownRefresh() {

  },
  /* 获取分享文案 */
  getShare(avgId) {
    avgId = avgId || ''
    let {
      ajaxRequest,
      api: {
        getShare
      }
    } = this;
    return new Promise((resolve, reject) => {
      ajaxRequest({
        url: getShare,
        proxy: 'share',
        data: {
          avgId
        },
        success: res => {
          if (res.code === 200 && res.data) {
            console.log(res)
            let { data: { title, miniImage } } = res;

            resolve({
              title,
              imageUrl: miniImage,
              path: 'pages/home/home?shareUid=' + this.uid
            })
          } else {
            reject({
              share: {
                title: '哆哒：交互式恋爱小说',
                path: 'pages/home/home?shareUid=' + this.uid
              }
            });
          }
        },
        fail: err => {
          reject({
            share: {
              title: '哆哒：交互式恋爱小说',
              path: 'pages/home/home?shareUid=' + this.uid
            }
          });
        }
      })
    });

  },
  /* 游戏上报接口 */
  play(data) {
    let { ajaxRequest, api: { report }, reportData } = this;
    reportData = Object.assign({},reportData, data)
    ajaxRequest({
      url: report,
      proxy:'report',
      data: reportData,
      success: res => {
        console.log('report上报成功', )
      },
      fail: err => {
        console.log('report上报失败', err)
      }
    })
  },
  /* 完成任务上报接口 */
  doneTask(type){
    let {api: { taskOver }, ajaxRequest} = this
    ajaxRequest({
      url:taskOver(type),
      type:'post',
      proxy:'app',
      success: res=>{
        if(res.code===200){
          console.log('任务完成')
        }else{
          console.log('任务完成code!==200')
        }
      },
      fail: err=>{
        console.log('任务完成失败')
      }
    })
  },
  /* 获取系统信息 */
  getSystemInfo() {
    let SystemInfo = wx.getStorageSync('SystemInfo');
    //获取系统信息
    wx.getSystemInfo({
      success: res => {
        let { platform, model,system } = res
        /*
        1，小程序电池栏/导航栏高度。
        IOS：电池栏(20px)／导航栏(40px)
        Android：电池栏(24px)／导航栏(48px)        
        模拟器：电池栏(20px)／导航栏(44px)
        IPhoneX：电池栏(44px)／导航栏(40px)
        其他刘海手机...
        */
        var batteryBarHeight = 0;
        var navigationBarHeight = 0;
        var iphoneX = false;
        var reportParams = {
          cc:'doda',
          platform:'wx_mini',
          gId:'doda',
          visit: null
        }
        var unitType = '';
        var XNum = ['10,3', '10,6', '11,2', '11,4', '11,6', '11,8']
        if (platform == 'ios') {
          unitType = /<iphone(\d+,\d)>/i.exec(model)
          if (unitType && XNum.indexOf(unitType[1]) > -1) {
            console.log('是X')
            batteryBarHeight = '44';
            navigationBarHeight = '40';
            iphoneX = true;
          } else {
            console.log('不是X')
            batteryBarHeight = '20';
            navigationBarHeight = '40';
          }
          unitType = unitType[0]
        } else if (platform == 'android') {
          unitType = model
          batteryBarHeight = '24';
          navigationBarHeight = '44';
        } else if (platform == 'devtools') {
          batteryBarHeight = '20';
          navigationBarHeight = '44';
        };
        SystemInfo = {
          ...res,
          iphoneX,
          batteryBarHeight: batteryBarHeight,
          navigationBarHeight: navigationBarHeight
        };
        wx.setStorage({
          key: 'SystemInfo',
          data: SystemInfo
        });
        reportParams.device = unitType +'_'+ system
        reportParams.system = 'wx_' + res.version;
        console.log("系统信息", SystemInfo);
        this.SystemInfo = SystemInfo
        this.reportData = reportParams

      }
    });
  },
  /* 微信登陆:获取code */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          console.log("code-SUCC", res.code)
          this.authCode = res.code;
          /* token失效时有  auth:是否授权状态 */
          let auth = wx.getStorageSync('auth');
          if(auth){
            this.getAuthInfo().then(resInfo=>{
              resolve();
            }).catch( err => {
              reject({
                state: 1,
                msg: '获取IV失败'
              })
            }) 
          }else{
            resolve();
          }
          
        },
        fail: err => {
          reject({
            state: 1,
            msg: '获取code失败'
          })
        }
      });
    });
  },
  /* 获取授权后的敏感信息 */
  getAuthInfo(){
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials:true,
        lang:'zh_CN',
        success: result => {
          let { errMsg, ...res }  = result
          if( errMsg === 'getUserInfo:ok'){
            console.log('获取IV成功',res)
            this.res = res
            this.globalData.userInfo = res.userInfo  
            resolve()     
          }else{
            console.log('获取IVcode!==200',result)
            reject({ state: 1, msg: '获取IVcode!==200' })
          }
        },
        fail: err=>{
          reject({ state: 1, msg: '获取IV失败' })
        }
      })
    });
  },  
  /* 获取Openid */
  getOpenid() {
    let {authCode,api: {getOpenid},ajaxRequest} = this
    return new Promise((resolve, reject) => {
      ajaxRequest({
        url: getOpenid,
        type: 'post',
        data: {
          code: authCode
        },
        success: res => {
          console.log('opendid-SUCC', res)
          if (res.code === 200) {
            this.openid = res.data.openid;
            resolve()
          } else {
            reject({ state: 1, msg: '获取Openid失败:res.code!=200' })
          }
        },
        fail: err => {
          reject({ state: 1, msg: '获取Openid失败' })
        }
      })
    });
  },
  /* 真正登录 */
  realLogin() {
    let {api: { realLogin },res,ajaxRequest,globalData: { userInfo },openid} = this
    return new Promise((resolve, reject) => {
      ajaxRequest({
        url: realLogin,
        type: 'post',
        data: { ...res, openId: openid },
        success: res => {
          console.log('login-SUCC', res)
          if (res.code === 200) {
            let { data: { token, user } } = res
            // 龙哥token
            // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDM4MjI0NDAsInVzZXJJZCI6MzUxNzQ4MDI1MjIxMTMsImlhdCI6MTU0MTIzMDQ0MCwiYWNjb3VudCI6IjE4NzMwMjA3NTg2In0.JkMJ9EIilO5M-K6gIU1IKOJQqn6hv82x_2Pif4xmzmU';
            // 聪聪token
            // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDM1NTg3MDEsInVzZXJJZCI6MzUwOTY2MzM3MzcyMTcsImlhdCI6MTU0MDk2NjcwMSwiYWNjb3VudCI6IjE4NjIzNzE2ODI1In0.xZIVO5-zRGcxqrTU8GvegfNzWz2ene3ZOwSfuD2lQVs'; 
            // 海哥token
            // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IkUxMEFEQzM5NDlCQTU5QUJCRTU2RTA1N0YyMEY4ODNFIiwiZXhwIjoxNTQzNTc0MDU2LCJ1c2VySWQiOjM0NzAxMzcyMDk2NTEzLCJpYXQiOjE1NDA5ODIwNTYsImFjY291bnQiOiIxNzYwMDY5OTYwNSJ9.FqNy4y6tUMnxvp0L9NeqE8e5qMGBs4vAjg7ddK1wPFM'
            this.globalData.userInfo = Object.assign({}, userInfo, user)
            this.token = token
            this.shareUid = userInfo.id;
            this.isLogin = true;
            wx.setStorageSync('token', token);
            wx.setStorageSync('auth', true);
            if(this.eventAry.length!==0){
              this.eventAry.forEach(event => {
                event(true)
              });
            }
            // 真实登录成功后出发方法
            resolve({
              state: 0,
              msg: '登录成功',
              userInfo
            })
          } else {
            reject({
              state: 1,
              msg: '真实登录失败:res.code!=200'
            })
          }
        },
        fail: err => {
          reject({
            state: 1,
            msg: '真实登录失败'
          })
        }
      })
    });

  },
  /* 自动授权 */
  autoAuth() {
    let { wxLogin, getOpenid, realLogin } = this
    wx.showLoading({title: "授权加载中",mask:true});
    return new Promise((resolve, reject) => {
      wxLogin().then(res => {
        getOpenid().then(res => {
          realLogin().then(res => {
            wx.hideLoading()
            resolve(res)
          }).catch(err => {
            wx.hideLoading()
            reject(err)
          })
        }).catch(err => {
          wx.hideLoading()
          reject(err)
        })
      }).catch(err => {
        wx.hideLoading()
        reject(err)
      })
    });
  },
  /* 授权失败弹窗 */
  loginfail() {
    wx.showToast({
      title: '授权失败，请检查网络并重试',
      icon: 'none',
      duration: 1500,
      mask: true
    });
  },
  /* 授权检测拉取登录过的信息*/
  authCheck() {
    var that = this;
    let auth = wx.getStorageSync('auth')
    if (auth) { //token存在，已经授权登录过
      this.token = wx.getStorageSync('token')
      this.checkToken().then(expire=>{
        if(!expire){//未过期
          let { ajaxRequest, api: { getMyInfo } } = that;
          ajaxRequest({
            url: getMyInfo,
            type: 'get',
            success: res => {
              if (res.code === 200) {
                let { data } = res;
                console.log('已授权-信息SUCC', data)
                this.isLogin = true;
                this.globalData.userInfo = data
                this.shareUid = data.id
                this.uid = data.id
                if(this.eventAry.length!==0){
                  this.eventAry.forEach(event => {
                    event()
                  });
                }
              }
            },
            fail: err => {
              console.log('已授权-信息ERR', err)
            }
          })
        }else{//过期
          this.isLogin = false;
          this.token = null
          wx.removeStorageSync('token')
          this.autoAuth().then(res=>{}).catch(err=>{
            console.log(err)
            this.loginfail()
          })
        }
      }).catch(err=>{
        console.log('token校验失败',err)
      })
    } else {
      console.log('无token')
    }
  },
  /* 检测token是否过期 */
  checkToken() {
    // 有token说明已经授权过了，不再需要授权
    return new Promise((resolve, reject) => {
      this.ajaxRequest({
        url: this.api.checkToken,
        type: 'get',
        success: res => {
          console.log('token检验成功', res)
          if (res.code === 200) {
            resolve(res.data.expire)
          } else {
            console.log('token检验成功:res.code!==200', res)
            reject()
          }
        },
        fail: err => {
          console.log('token检验失败', err)
          reject()
        }
      })
    });

  },
  /* 错误提示 :  0:服务器错误(默认)   1:客户端错误  */
  errTip(type){
    let title = '抱歉服务器错误，请重试'
    if(type===1) title = '网络错误，请调整网络后重试'
    wx.showToast({
      title,
      mask:true,
      icon:'none',
      duration:800
    })
  },
  /* AJAX封装 */
  ajaxRequest({
    url,
    method,
    type,
    header,
    dataType,
    proxy,
    data,
    responseType,
    success,
    fail,
    complete
  }) {
    let {
      Source,
      Sourcetype,
      shareUid,
      token
    } = this;
    type = method || type;
    proxy = proxy || 'mini'
    data = data || {}
    token = token || ''
    try {
      header = Object.assign({}, {
        token
      }, header);
      //分享者的用户id
      // shareUid ? data.shareUid = shareUid : null
      wx.request({
        url: Source[Sourcetype][proxy] + url,
        data: data,
        header: header,
        method: type ? type.toUpperCase() : 'GET',
        dataType: dataType ? dataType : 'json',
        responseType: responseType ? responseType : "text",
        success: function (res) {
          success(res.data)
        },
        fail: function (err) {
          fail(err);
        },
        complete: function (res) {
          complete && complete(res);
        }
      })
    } catch (err) {
      console.log('ajaxRequest出错了', err)
    }
  }
})