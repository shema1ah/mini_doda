var app = getApp();
Page({
  data: {
    url: '',
    id:null,
    share:null
  },
  onLoad: function (options) {
    console.log(options);
    let token = wx.getStorageSync('token');
    let { url, gameId }=options
    url = decodeURIComponent(url)
    url = url.indexOf('?')>-1? url+'&':url+'?';
    url = gameId?url+'token='+token+'&gameId='+gameId  : url+'token='+token
    console.log(url)
    this.setData({
      url: url,
      id:parseInt(gameId)
    })
    this.getShareContent(parseInt(gameId))
  },     
  /* 获取分享内容 */
  getShareContent(id){
   app.getShare(id).then( res => {
      console.log('分享内容',id,res)
      this.setData({ share: res })
    }).catch( err => {
      this.setData({ share: err })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    return {
      ...this.data.share,
      path:'pages/detail/detail?shareUid='+ app.uid +'&gameId='+this.data.id
    }
  }
})