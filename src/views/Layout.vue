<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: appStore.isSidebarCollapsed }">
      <div class="sidebar-header">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <span v-show="!appStore.isSidebarCollapsed" class="app-name">明析</span>
      </div>

      <el-menu
        :default-active="currentRoute"
        :collapse="appStore.isSidebarCollapsed"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/workspace">
          <el-icon><Monitor /></el-icon>
          <template #title>工作站</template>
        </el-menu-item>

        <el-menu-item index="/projects">
          <el-icon><Folder /></el-icon>
          <template #title>项目管理</template>
        </el-menu-item>

        <el-sub-menu index="/settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </template>
          <el-menu-item index="/settings/profile">
            <el-icon><User /></el-icon>
            <template #title>个人设置</template>
          </el-menu-item>
          <el-menu-item index="/settings/users">
            <el-icon><UserFilled /></el-icon>
            <template #title>人员管理</template>
          </el-menu-item>
          <el-menu-item index="/settings/repositories">
            <el-icon><FolderOpened /></el-icon>
            <template #title>代码库设置</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="sidebar-footer">
        <div class="user-info" v-if="userStore.user">
          <el-avatar :size="32" class="user-avatar">
            {{ userStore.user.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <div v-show="!appStore.isSidebarCollapsed" class="user-details">
            <span class="username">{{ userStore.user.username }}</span>
            <el-button text type="danger" size="small" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <el-button
            :icon="appStore.isSidebarCollapsed ? Expand : Fold"
            text
            @click="appStore.toggleSidebar"
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/projects' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <div class="assistant-status">
            <span class="status-dot online"></span>
            <span class="status-text">灵眸助手</span>
          </div>
          <el-dropdown @command="handleCommand">
            <el-avatar :size="32" class="user-avatar">
              {{ userStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import {
  Folder,
  Monitor,
  Fold,
  Expand,
  Setting,
  User,
  UserFilled,
  SwitchButton,
  FolderOpened,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const currentRoute = computed(() => route.path)
const currentTitle = computed(() => route.meta.title as string)

onMounted(() => {
  userStore.init()
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function handleCommand(command: string) {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'settings') {
    router.push('/settings/profile')
  }
}
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

.sidebar {
  width: 240px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.collapsed {
    width: 64px;

    .sidebar-header {
      padding: 16px 18px;
    }

    .app-name {
      display: none;
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);
  gap: 12px;
}

.logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 600;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 56px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.assistant-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.online {
    background-color: #10B981;
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
  }
}

.status-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>