let api = {
  /*
  描述：换取oppenId
    type:POST
    args:{
      code: authCode//来自wx登录接口code
    }
  */
  getOpenid: "/login/wx/getOpenid",
  /*
   描述：用户登录获取基础信息 
     type:POST
     args:{
       encryptedData:xxx,
       iv:xxx,
       signature:xxxx,
       rowData:xxxx
     }
   */
  realLogin: "/login/wx",
  /*
   描述：校验token是否过期
     type:POST
     header:{
       token:xxx
     }
     args:{
        无
     }
   */
  checkToken: '/token',
  /*
   描述：获取开屏接口
     type:get
     header:{
       token:xxx
     }
     args:{
        无
     }
   */
  openScreen: '/launch/get',
}
module.exports = api