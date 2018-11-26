let api = {
  /*
  描述：个人信息
    type:GET
    args:{
      无
    }
  */
  getMyInfo: "/v2/profile",
  /*
  描述：游戏点赞
    url:/game/id/like //需要游戏id
    type:PUT
    args:{
      favourFormId:xxx,//小程序点赞的formId(String)
    }
  */
  getOtherInfo: (id) => '/v2/profile/'+id,
}
module.exports = api