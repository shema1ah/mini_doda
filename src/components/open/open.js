//获取应用实例
const app = getApp()
// components/nav/nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    openTime:{
      type:String,
      value:3
    }
  },
  data:{
    img:'',
    show:true,
    timer:null,
    isIphoneX:false
  },
  methods: {
    close(){
      clearInterval(this.data.timer)
      this.setData({ show:false })
      wx.showTabBar()
      app.adShow = false
    },
    start(){
      let timer=setInterval(()=>{
        let openTime = this.data.openTime-1;
        let show = true;
        if(openTime<0){
          wx.showTabBar()
          show = false;
          clearInterval(this.data.timer)
          app.adShow = false
        }
        this.setData({ openTime,show })
      },1000)
      this.setData({ timer })
    },
    fetchData(){
      app.ajaxRequest({
        url: app.api.openScreen,
        proxy:'share',
        type: 'post',
        success: res =>{
          let url = 'https://doda.oss-cn-beijing.aliyuncs.com/launch/launch_lilithy.jpg';
          if(res.code===200&&res.data.url!=''){
            url = res.data.url
          }
          this.setData({ img: url })
          this.start();
        },
        fail: err =>{
          console.log(err)
        }
      })
    },
    go(){
      wx.navigateTo({
        url:'../../pages/detail/detail?gameId=1'
      })
      this.close()
    }
  },
  created () {
    wx.hideTabBar()
  },
  attached(){
    let { adShow,SystemInfo:{ iphoneX } } = app; 
    this.setData({ show: adShow, isIphoneX: iphoneX })
    this.fetchData()
  }
});