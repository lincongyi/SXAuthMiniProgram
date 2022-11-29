<template>
  <web-view :src='url' @message="handleMessage" />
</template>

<script setup>
import Taro, {useRouter} from '@tarojs/taro'
import {BASE_URL} from '@utils/request'
let router = useRouter()
let {mode} = router.params

const url = `${BASE_URL}/sxauthalipay/yc/index.html?mode=${mode}`
const handleMessage = (e) => {
  let {img: imgBase64, mode} = e.detail.data[0]
  Taro.setStorageSync('imgBase64', imgBase64)
  Taro.setStorageSync('mode', mode)
}
</script>
