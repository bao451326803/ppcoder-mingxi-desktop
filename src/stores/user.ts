import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, setToken, clearToken } from '@/api'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const user = ref<User | null>(null)

  // Token
  const token = ref<string | null>(localStorage.getItem('access_token'))

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 登录
  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    token.value = res.data.access_token
    setToken(res.data.access_token)
    await fetchUserInfo()
  }

  // 注册
  async function register(username: string, password: string, email: string) {
    const res = await authApi.register(username, password, email)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    token.value = res.data.access_token
    setToken(res.data.access_token)
    await fetchUserInfo()
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await userApi.me()
      if (res.code === 0) {
        user.value = res.data
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null
    clearToken()
  }

  // 修改密码
  async function changePassword(oldPassword: string, newPassword: string) {
    const res = await userApi.updatePassword(oldPassword, newPassword)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
  }

  // 初始化 - 如果有 token，获取用户信息
  async function init() {
    if (token.value) {
      await fetchUserInfo()
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo,
    changePassword,
    init,
  }
})