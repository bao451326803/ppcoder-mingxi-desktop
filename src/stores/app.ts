import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 应用状态管理
 */
export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const isSidebarCollapsed = ref(false)

  // 主题模式
  const theme = ref<'light' | 'dark'>('light')

  // 计算属性
  const isDarkMode = computed(() => theme.value === 'dark')

  // 切换侧边栏
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  // 设置主题
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return {
    isSidebarCollapsed,
    theme,
    isDarkMode,
    toggleSidebar,
    toggleTheme,
    setTheme,
  }
})