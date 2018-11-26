let api = {
  /*
  描述：获取关注帖子
    type:get
    args:{
      type:3 //必须
      index: xx
      pageSize:10
    }
  */
  getFocus: '/post',
  /*
   描述：获取推荐话题
     type:get
     args:{
     }
   */
  getRecmTopic: '/topic/recommend',
  /*
    描述：获取话题搜索列表历史
    type:get
    args:{
      无
    }
  */
  getTopicHst: '/search/topicLog',
  /*
   描述：获取热门话题
     type:get
     args:{
       
     }
   */
  getHotTopic:'/search/hot',
  /*
   描述：获取相关帖子
     type:get
     args:{
       favoriteFormId:xxx//小程序收藏的formId
     }
   */
  getRecmPost: '/recommendPost',
  /*
   描述：帖子点赞与收藏 分享
     type:post
     args:{
       postId:xxx//帖子id
       shareType:1 //帖子分享类型,当type=3时传
       type:3  //帖子操作（1：点赞，2：收藏，3：分享）
     }
   */
  api_post_operate: '/postOperate',
  /*
   描述：获取人气榜数据
     type:get
     args:{
       topicType:xxx//0-作品,1-角色
     }
   */
  getHotTopic: '/search/hotTopic',
  /*
   描述：关注话题
     type:post
     args:{
       url中带id
     }
   */
  followTopic: id => '/topic/follow/'+id,
  /*
   描述：取消关注
     type:delete
     args:{
       url中带id
     }
   */
  unFollowTopic: id => '/topic/'+id+'/follow',
  /*
   描述：按话题名称模糊查询
     type:get
     args:{
       topicName：xxx  //话题名称 必须
     }
   */
  topicSearch: '/search/topic',
  /*
   描述：按帖子名称模糊查询
     type:get
     args:{
       keyword:xxx  //关键词 必须
       type:1  必须
     }
   */
  postSearch: '/post'


}
module.exports = api