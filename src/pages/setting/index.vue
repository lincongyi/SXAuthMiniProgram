<template>
  <view class="container">
    <nut-cell-group>
      <nut-cell title="账号管理" @tap="toAccountManagement">
        <template #link>
          <nut-icon name="arrow-right" size="16"></nut-icon>
        </template>
      </nut-cell>
      <nut-cell title="切换账号" @tap="switchAccount"></nut-cell>
    </nut-cell-group>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" plain block color="#666" @tap="handleLogout">退出登录</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import Taro, {useDidShow} from '@tarojs/taro'
import './index.scss'
import {logout} from '@api/login'

// 账号管理
const toAccountManagement = () => {
  Taro.navigateTo({
    url: '/pages/accountManagement/index'
  })
}

// 切换账号
const switchAccount = () => {
  Taro.navigateTo({
    url: '/pages/login/index?isSwitch=1'
  })
}

// 退出登录
const handleLogout = () => {
  Taro.showModal({
    title: '退出登录',
    content: '是否确认退出登录',
    success: async (res) => {
      if (res.confirm) {
        await logout()
        Taro.removeStorageSync('loginToken') // 退出登录，移除loginToken
        Taro.showToast({
          icon: 'none',
          title: '已退出登录',
          mask: true,
          success: () => {
            Taro.reLaunch({url: '/pages/index/index'})
          }
        })
      }
    }
  })
}

useDidShow(() => {
  Taro.removeStorageSync('certToken') // 移除certToken，不然切换账号的时候返回setting页面，再进入，不会重新获取弹出框的内容
})

</script>
