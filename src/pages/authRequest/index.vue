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
              <view class="auth-info flex">还剩：
                <view class="emphasize">{{item.hour}}</view>
                小时
                <view class="emphasize">{{item.minute}}</view>
                分
                <view class="emphasize">{{item.second}}</view>
                秒
              </view>
            </template>
            <template v-else>
              <view class="auth-info">{{item.authSceneStr}}</view>
              <view class="auth-info">{{item.authTime}}</view>
            </template>
          </view>
          <view class="item-btn" @tap="toConfirmAuth" v-if="flag">马上认证</view>
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
import { ref, reactive } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import noAuthRecordImage from '@images/no-auth-record.png'
import './index.scss'
import { getAuthList } from '@api/auth'

const flag = ref(0) // 0.认证记录；1.待认证
const authList = ref([])

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
const toConfirmAuth = () => {

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

useDidShow(async () => {
  let router = useRouter()
  flag.value = Number(router.params?.flag) || 0
  Taro.setNavigationBarTitle({
    title: ['认证记录', '认证请求'][flag.value]
  })
  let {data} = await getAuthList({
    pageNum: 0,
    pageSize: 10,
    flag: flag.value,
  })
  authList.value = data.list
  console.log(data)
})

</script>
