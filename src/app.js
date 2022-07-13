import {createApp} from 'vue'
import Taro from '@tarojs/taro'
import {getEnv, handleUpdate} from '@utils/taro'
import './app.scss'
import '@styles/theme.scss'
import copyright from '@components/copyright/index.vue'
import {Button, Icon, Dialog, Popup, OverLay, Input, Cell, CellGroup, Divider, DatePicker, Picker, Switch, Swiper, SwiperItem, ActionSheet, Checkbox} from '@nutui/nutui-taro'

const App = createApp({
  onLaunch () {
    // 清理本地数据缓存
    Taro.clearStorageSync()

    // 获取小程序当前环境
    getEnv()

    // 版本更新
    handleUpdate()
  },
  onShow(options){
    // 判断是否从第三方小程序跳转
    let extraData = options.referrerInfo?.extraData // 兼容支付宝options默认没有referrerInfo字段
    if (extraData){
      Taro.setStorageSync('certToken', extraData.certToken)
      Taro.setStorageSync('loginType', 1) // 0.小程序内部运行，1.第三方小程序跳转过来
    }
    // 判断是否从外部h5跳转
    let certToken = options.query?.certToken
    if (certToken){
      Taro.setStorageSync('certToken', certToken)
      Taro.setStorageSync('loginType', 2)
    }
  }
})

App.component('copyright', copyright)

App
  .use(Button)
  .use(Icon)
  .use(Dialog).use(Popup).use(OverLay)
  .use(Input)
  .use(Cell).use(CellGroup)
  .use(Divider)
  .use(DatePicker).use(Picker)
  .use(Switch)
  .use(Swiper).use(SwiperItem)
  .use(ActionSheet)
  .use(Checkbox)

export default App
