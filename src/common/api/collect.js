let api = {
  /*
    描述：获取我收藏的作品
    type:get
    args:{
      favorite:1 //收藏判断字段	  必须
    }
  */
  getCollectWorks: '/games',
  /*
    描述：获取我收藏的帖子
    type:get
    args:{ //必传参数
      type:1 //不知道干啥的  就穿1就对了
    }
  */
  getPost: '/myPost',
}
module.exports = api