import { createApp } from 'vue'
import Taro from '@tarojs/taro'
import { getEnv, handleUpdate } from '@utils/taro'
import './app.scss'
import '@styles/theme.scss'
import copyright from '@components/copyright/index.vue'
import { Button, Icon, Dialog, Popup, OverLay, Input, Cell, CellGroup, Divider, DatePicker, Picker, Switch, Swiper, SwiperItem, ActionSheet, Checkbox } from '@nutui/nutui-taro'

const App = createApp({
  async onLaunch (options) {
    // 清理本地数据缓存
    Taro.clearStorageSync()

    // 获取小程序当前环境
    getEnv()
    // 版本更新
    handleUpdate()
  },
  onShow () {},
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
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
