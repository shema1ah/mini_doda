let api = {
  /*
    描述：获取关注话题
    type:get
    args:{
      无
    }
  */
  getFollowTpc: '/follow/topic',
  /*
    描述：获取关注用户接口
    type:get
    args:{ //必传参数
      无
    }
  */
  getFollowUser: '/follow/user',
  /*
    描述：获取关注粉丝接口
    type:get
    args:{ //必传参数
      无
    }
  */
 getFollowFans: '/follow/followUser',
}
module.exports = api