<template>
  <nut-tabbar
    v-model:visible="tabbarIndex"
    :bottom="true"
    :safeAreaInsetBottom="true"
    @tab-switch="tabSwitch"
  >
    <nut-tabbar-item
      tab-title="首页"
      :img="tabbarHomeOff"
      :activeImg="tabbarHomeOn"
    ></nut-tabbar-item>
    <nut-tabbar-item
      tab-title="我的"
      :img="tabbarMineOff"
      :activeImg="tabbarMineOn"
    ></nut-tabbar-item>
  </nut-tabbar>
</template>
<script setup>
import Taro, { useRouter } from '@tarojs/taro'
import tabbarHomeOn from '@images/tabbar-home-on.png'
import tabbarHomeOff from '@images/tabbar-home-off.png'
import tabbarMineOn from '@images/tabbar-mine-on.png'
import tabbarMineOff from '@images/tabbar-mine-off.png'

const tabbarList = ['index', 'mine']
const router = useRouter()
const path = router.path.slice(1)
const target = path.split('/')[1]

const tabbarIndex = tabbarList.findIndex(item => item === target)
const tabSwitch = (data, index) => {
  if (index === tabbarIndex) return

  Taro.reLaunch({
    url: `/pages/${tabbarList[index]}/index`
  })
}
</script>
