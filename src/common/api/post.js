let api = {
  /*
    描述：获取帖子详情
    type:get
    args:{
      帖子id
    }
  */
  getPostDtl: id => '/post/' + id,
  /*
    描述：关注用户
    type:post
    args:{
      followedUser:{
        id:35380121501697
      }
    }
  */
  followUser: '/userFollow',
  /*
    描述：取消关注用户
    type:post
    args:{
      followedUserId:35380121501697
    }
  */
  unFollowUser: '/cancelFollow',
  /*
    描述：分页获取帖子一级评论
    type:get
    args:{
      postId：xxx //帖子id
    }
  */
  getComments: '/comments',
  /*
    描述：发表一级论
    type:post
    args:{
      content：xxx// 内容
      commentId //一级评论id
    }
  */
  firstComment: '/firstComment',
  /*
    描述：评论点赞
    type:post
    args:{
      commentId //一级评论id
    }
  */
  commentFavour: '/firstCommentFavour',


}
module.exports = api