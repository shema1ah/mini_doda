let api = {
  /*
    描述：获取话题详情
    type:get
    args:{
      topicName: 话题名称	Y
    }
  */
  getTopicDtl: '/topic',
  /*
    描述：查询话题内帖子
    type:get
    args:{ //必传参数
      topicId: xxx //	话题id
      topicType:1 //1：推荐，2：加精，0：全部
      type:2
    }
  */
  getTopicPost: '/post',
  
}
module.exports = api