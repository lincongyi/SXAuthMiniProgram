<template>
    <view class="container">
    <block v-if="!authList.length">
      <image class="no-auth-record" mode="widthFix" :src="noAuthRecordImage" />
      <view class="no-auth-record-tips">暂无认证任务</view>
    </block>
    <block v-else>
      <view class="auth-list">
        <view class="list-item" v-for="(item,index) in authList" :key="index" @tap="toAuthDetail(item)">
          <view class="item-content">
            <view class="auth-method">{{item.authMethod}}</view>
            <template v-if="flag">
              <view class="auth-info">来源：{{item.sourceName}}</view>
              <view class="auth-info flex" v-if="item.hour||item.minute||item.second">还剩：
                <view class="emphasize">{{item.hour}}</view>小时
                <view class="emphasize">{{item.minute}}</view>分
                <view class="emphasize">{{item.second}}</view>秒
              </view>
            </template>
            <template v-else>
              <view class="auth-info">{{item.authSceneStr}}</view>
              <view class="auth-info">{{item.authTime}}</view>
            </template>
          </view>
          <nut-button v-if="flag" shape="square" type="primary" @tap.stop="toAuth(item)" :disabled="!(item.hour||item.minute||item.second)">马上认证</nut-button>
          <view class="auth-result" v-else>
            <view :class="['auth-status', authResult[item.authResStr].class]">{{authResult[item.authResStr].text}}</view>
            <nut-icon name="right" class="arrow" size="18" color="#bbb"></nut-icon>
          </view>
        </view>
      </view>
    </block>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import {ref, toRaw} from 'vue'
import Taro, {useDidShow, useRouter, useReachBottom} from '@tarojs/taro'
import noAuthRecordImage from '@images/no-auth-record.png'
import './index.scss'
import {getAuthList} from '@api/auth'

const flag = ref(0) // 0.认证记录；1.待认证
const authList = ref([]) // 认证数据
const pageNum = ref(0)
const pageSize = ref(10)
const noMore = ref(false)
let timer

// 认证结果:0-成功；1-失败；2-过期
const authResult = [
  {text: '成功', class: 'success'},
  {text: '失败', class: 'fail'},
  {text: '过期', class: 'expire'}
]

// 马上认证
const toAuth = (item) => {
  cacheData(item)
  Taro.navigateTo({
    url: `/pages/authDetail/index?authResult=3&certToken=${item.certToken}`
  })
}

// 认证详情
const toAuthDetail = (item) => {
  if (flag.value) return
  cacheData(item)
  Taro.navigateTo({
    url: `/pages/authDetail/index?authResult=${item.authResStr}`
  })
}

// 缓存跳转到认证详情所需的数据
const cacheData = (item) => {
  let {authMode, authMethod, authSceneStr, fullName, idNum, authModeStr, createTime, authTime, sourceName, expireTime} = toRaw(item)
  let authDetail = {
    authMode, // 认证模式
    authMethod, // 认证方式
    authSceneStr, // 认证场景
    fullName, // 姓名
    idNum, // 证件号码
    authModeStr, // 认证模式
    createTime, // 发起时间
    authTime, // 认证时间
    sourceName, // 认证来源
    expireTime, // 到期时间
  }
  Taro.setStorageSync('authDetail', authDetail)
}

// 计算剩余时间
const calRestTime = (target) => {
  let timestamp = (new Date()).getTime()
  for (let i=0;i<target.length;i++){
    let item = target[i]
    if (item.isExpired) continue // 标志了已过期的认证条目，不做计算

    let expireTime = item.expireTime.replace(/-/g, '/') // 兼容ios日期识别的bug
    let expireTimestamp = (new Date(expireTime)).getTime()
    let restTimestamp = expireTimestamp - timestamp
    if (restTimestamp>0){
      let hour = parseInt(restTimestamp/(60*60*1000))
      let deduct_hour = restTimestamp - hour*(60*60*1000)
      let minute = parseInt(deduct_hour/(1000*60))
      let deduct_minute = deduct_hour - minute*(1000*60)
      let second = parseInt(deduct_minute/1000)
      target[i] = {...item, ...{hour, minute, second}}
    } else {
      target[i].isExpired = true
    }
  }
  return target
}

// 初始化页面数据
const init = async () => {
  if (noMore.value){
    return Taro.showToast({
      icon: 'none',
      title: '没有更多了',
    })
  }
  let {data} = await getAuthList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    flag: flag.value,
  })
  if (data.size>(pageNum.value+1)*pageSize.value) pageNum.value++
  else noMore.value = true
  if (!flag.value){
    authList.value = [...authList.value, ...data.list]
  } else { // 如果是认证请求，需要计算剩余时间
    authList.value = [...authList.value, ...calRestTime(data.list)]
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      authList.value = calRestTime(authList.value)
    }, 1000)
  }
}

useDidShow(() => {
  let router = useRouter()
  flag.value = Number(router.params?.flag ?? 1)
  Taro.setNavigationBarTitle({
    title: ['认证记录', '认证请求'][flag.value]
  })

  init()
})

useReachBottom(() => {
  init()
})


</script>
