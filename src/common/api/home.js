let api = {
  /*
  描述：获取公告
    type:GET
    args:{
      无
    }
  */
  getNotice: '/notice',
  /*
  描述：获取分享文案
    type:GET
    args:{
      无
    }
  */
  getShare: '/getShare',
  /*
  描述：获取游戏列表
    type:GET
    args:{
      index: 1,
      pageSize:10
    }
  */
  getGameList: "/games",
  /*
  描述：游戏点赞
    url:/game/id/like //需要游戏id
    type:PUT
    args:{
      favourFormId:xxx,//小程序点赞的formId(String)
    }
  */
  like: id => '/game/' + id + '/like',
  /*
  描述：是否签到
    type:GET
    args:{
      无
    }
  */
  api_isCheckIn: '/profile/hasSignin',
  /*
  描述：签到
    type:POST
    args:{
      无
    }
  */
  api_checkIn: '/profile/signin',
  /*
  描述：获取金币
    type:get
    args:{
      无
    }
  */
  getCoin: '/profile/get',
  /*
  描述：意见反馈
    type:POST
    args:{
      content：xxx 反馈内容	 Y
      contact:xxxxx 
    }
  */
  feedback: '/feedback',
  /*
  描述：获取任务状态
    type:get
    args:{
      无
    }
  */
  getTask: '/task',
  /*
  描述：做任务接口
    type:post
    args:{
      无
    }
  */
  taskOver: type=> '/task/'+ type,
  /*
  描述：领取能量
    type:get
    args:{
      无
    }
  */
  getEnergy: type=> '/task/energy/'+ type ,

  /*
  描述：游戏上报接口
    type:get
    args:{
      cc:	渠道码(默认doda)
      platform: 平台(ios/android/pc/h5)
      page: 页面page(index)
      act: click/view/download/install/register
      pos:	位置，例”index-1”
      gId:	gameId(为空则为平台数据)
      device: 设备信息
      system:	系统信息
      visit:	(当前url,客户端可以不传)
    }
  */
  report: '/static/image/tyh.gif'
}
module.exports = api