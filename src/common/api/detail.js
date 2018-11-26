let api = {
  /*
  描述：获取游戏详情
    type:get
    args:{
      无
    }
  */
  getGame: id => '/game/' + id,
  /*
   描述：获取游戏评论
     type:get
     args:{
       content:xxx,
       iv:xxx,
       signature:xxxx,
       rowData:xxxx
     }
   */
  getCommentsDtl: id => '/game/' + id + '/comments',
  /*
   描述：收藏游戏
     type:PUT
     args:{
       favoriteFormId:xxx//小程序收藏的formId
     }
   */
  collect: id => '/game/' + id + '/favorite',
  /*
   描述：取消收藏游戏
     type:PUT
     args:{
       favoriteFormId:xxx//小程序收藏的formId
     }
   */
  unCollect: id => '/game/' + id + '/favorite',
  /*
   描述：游戏评论
     type:PUT
     args:{
       favoriteFormId:xxx//小程序收藏的formId
     }
   */
  comment: id => '/game/' + id + '/comment',
  /*
   描述：游戏详情点赞
     type:POST
     args:{
       无
     }
   */
  dtlCommentFavour: (gameId,id) => '/game/'+ gameId +'/comment/'+id+'/like'
}
module.exports = api