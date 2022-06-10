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
      <nut-button type="primary" shape="square" plain block color="#666" @tap="logout">退出登录</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import Taro from '@tarojs/taro'
import './index.scss'

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
const logout = () => {
  Taro.showModal({
    title: '退出登录',
    content: '是否确认退出登录',
    success: (res) => {
      if (res.confirm) {
        console.log('用户点击确定')
      }
    }
  })
}

</script>
