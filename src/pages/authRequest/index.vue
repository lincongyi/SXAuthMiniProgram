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
          <nut-button v-if="flag" shape="square" type="primary" @tap="toConfirmAuth" :disabled="!(item.hour||item.minute||item.second)">马上认证</nut-button>
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
import { ref } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import noAuthRecordImage from '@images/no-auth-record.png'
import './index.scss'
import { getAuthList } from '@api/auth'

const flag = ref(0) // 0.认证记录；1.待认证
const authList = ref([])
let timer

// 认证结果:0-成功；1-失败；2-过期
const authResult = [
  { text: '成功', class: 'success' },
  { text: '失败', class: 'fail' },
  { text: '过期', class: 'expire' }
]

// authRes:00xx
// 第一字节：姓名，身份号码，有效期等文本信息比对结果
// 第二字节：人像比对结果

// 马上认证
const toConfirmAuth = (e) => {
  e.stopPropagation()
}

// 认证详情
const toAuthDetail = (item) => {
  let {authMethod, authSceneStr, fullName, idNum, authModeStr, createTime, authTime} = item
  let authDetail = {
    authMethod, // 认证方式
    authSceneStr, // 认证场景
    fullName, // 姓名
    idNum, // 证件号码
    authModeStr, // 认证模式
    createTime, // 发起时间
    authTime, // 认证时间
  }
  Taro.setStorageSync('authDetail', authDetail)
  Taro.navigateTo({
    url: `/pages/authDetail/index?authResult=${item.authResStr}`
  })
}

// 计算剩余时间
const calRestTime = (target) => {
  let timestamp = (new Date()).getTime()
  for (let i=0;i<target.length;i++){
    let item = target[i]
    if (item.isExpired) continue // 标志了已过期的认证条目，不做计算

    let expireTimestamp = (new Date(item.expireTime)).getTime()
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

useDidShow(async () => {
  let router = useRouter()
  flag.value = Number(router.params?.flag ?? 1)
  Taro.setNavigationBarTitle({
    title: ['认证记录', '认证请求'][flag.value]
  })
  // let {data} = await getAuthList({
  //   pageNum: 0,
  //   pageSize: 10,
  //   flag: flag.value,
  // })
  let data = {
    list: [
      {
        authMethod: '认证本人',
        authMode: 66,
        authModeStr: '实名+实人',
        authScene: '2',
        authSceneStr: '第三方认证',
        authType: 'regular',
        certToken: '972c8964-ba7a-436d-909d-3e701539e68c',
        createTime: '2022-06-22 16:18:17',
        expireTime: '2022-06-30 16:25:17',
        fullName: '林聪毅',
        idNum: '440105199203182415',
        sourceName: '陕西公民实人认证公众号',
      },
      {
        authMethod: '认证本人',
        authMode: 66,
        authModeStr: '实名+实人',
        authScene: '2',
        authSceneStr: '第三方认证',
        authType: 'regular',
        certToken: 'ae773fc7-4bcb-47b5-9759-2e1659ff9e7e',
        createTime: '2022-06-22 10:25:09',
        expireTime: '2022-06-23 10:28:30',
        fullName: '林聪毅',
        idNum: '440105199203182415',
        sourceName: '陕西公民实人认证公众号',
      }
    ]
  }
  if (!flag.value){
    authList.value = data.list
  } else { // 如果是认证请求，需要计算剩余时间
    authList.value = calRestTime(data.list)
    clearInterval(timer)
    timer = null
    timer = setInterval(() => {
      authList.value = calRestTime(authList.value)
    }, 1000)
  }
  // console.log(data)
})


</script>
