<template>
    <view class="container">
    <block v-if="!hasAuthRecord">
      <image class="no-auth-record" mode="widthFix" :src="noAuthRecordImage" />
      <view class="no-auth-record-tips">暂无认证任务</view>
    </block>
    <block v-else>
      <view class="auth-list">
        <view class="list-item" v-for="(item,index) in authList" :key="index">
          <view class="item-content">
            <view class="auth-method">{{item.title}}</view>
            <view class="auth-info">来源：{{item.source}}</view>
            <view class="auth-info flex">还剩：
              <view class="emphasize">{{item.hour}}</view>
              小时
              <view class="emphasize">{{item.minute}}</view>
              分
              <view class="emphasize">{{item.second}}</view>
              秒
            </view>
          </view>
          <view class="item-btn" @tap="toConfirmAuth">马上认证</view>
          <!-- <view class="auth-result">
            <view class="auth-status success">成功</view>
            <van-icon name="arrow" size="22px" color="#999" />
          </view> -->
        </view>
      </view>
    </block>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, reactive, defineAsyncComponent } from 'vue'
import noAuthRecordImage from '@images/no-auth-record.png'
import './index.scss'
const copyright = defineAsyncComponent(() => import('@components/copyright/index.vue'))

const hasAuthRecord = ref(1)
const authList = reactive([
  {
    title: '认证本人',
    source: '陕西省公安厅',
    hour: 10,
    minute: 20,
    second: 30
  },
  {
    title: '认证本人',
    source: '陕西省公安厅',
    hour: 10,
    minute: 20,
    second: 30
  }
])

// 马上认证
const toConfirmAuth = () => {

}
</script>
