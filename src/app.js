import { createApp } from 'vue'
import './app.scss'
import copyright from '@components/copyright/index.vue'
import { Button, Icon, Dialog, Popup, OverLay, Input, Cell, CellGroup, Divider, DatePicker, Picker, Switch } from '@nutui/nutui-taro'

const App = createApp({
  onShow (options) {},
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

export default App
