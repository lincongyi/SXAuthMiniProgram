<template>
  <web-view :src='url' @message="handleMessage" />
</template>

<script setup>
import {ref} from 'vue'
import {useDidShow, useRouter} from '@tarojs/taro'

const url = ref('')

useDidShow(() => {
  let router = useRouter()
  url.value = router.params?.url ?? ''
})
</script>
