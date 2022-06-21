<template>
  <view class="container">
    <nut-cell-group>
      <nut-cell title="账号管理" @tap="toAccountManagement">
        <template #link>
          <nut-icon name="arrow-right" size="16"></nut-icon>
        </template>
      </nut-cell>
      <nut-cell title="切换账号" @tap="toLogin"></nut-cell>
    </nut-cell-group>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" plain block color="#666" @tap="handleLogout">退出登录</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import Taro from '@tarojs/taro'
import './index.scss'
import { logout } from '@api/login'

// 账号管理
const toAccountManagement = () => {
  Taro.navigateTo({
    url: '/pages/accountManagement/index'
  })
}

// 切换账号
const toLogin = () => {
  Taro.navigateTo({
    url: '/pages/login/index'
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
            setTimeout(() => {
              Taro.switchTab({url: '/pages/index/index'})
            }, 1500)
          }
        })
      }
    }
  })
}

</script>
