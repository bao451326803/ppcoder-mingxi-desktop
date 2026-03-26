# 代码库设置功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在设置模块下新增代码库设置功能，支持用户管理代码库配置（名称、本地目录、描述），提供新增、编辑、删除、验证目录、打开目录等操作。

**Architecture:** 将设置页面改造为带侧边菜单的嵌套布局容器，新建独立的代码库管理页面。采用 Vue 3 Composition API + Pinia 状态管理，通过 Mock API 支持开发阶段测试。

**Tech Stack:** Vue 3, Element Plus, Pinia, Vue Router, TypeScript, Tauri

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/types/index.ts` | 添加 Repository 相关类型定义 |
| `src/stores/repository.ts` | 新建 Pinia store 管理代码库状态 |
| `src/api/index.ts` | 添加 repositoryApi 接口封装 |
| `src/mock/index.ts` | 添加 mockRepositories 数据和 mockRepositoryApi |
| `src/mock/data.ts` | 添加 mockRepositories 数据数组 |
| `src/views/Settings.vue` | 改造为带侧边菜单的布局容器 |
| `src/views/SettingsProfile.vue` | 新建个人设置页面（迁移原内容） |
| `src/views/Repositories.vue` | 新建代码库设置页面 |
| `src/router/index.ts` | 调整设置路由为嵌套结构 |
| `src/views/Layout.vue` | 添加"代码库设置"菜单项 |

> **注意:** Tauri 插件配置（Task 0）为可选任务，仅在需要生产环境打包时执行。开发阶段使用 Mock 数据和浏览器预览时无需执行。

---

## Task 0: 安装和配置 Tauri 插件（可选）

> 此任务仅在生产环境打包时需要。如果仅使用 `npm run dev` 在浏览器中开发，可以跳过此任务。

**Files:**
- Modify: `package.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: 安装 Tauri 插件 npm 包**

运行:
```bash
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-shell @tauri-apps/plugin-fs
```

预期: package.json 中添加三个依赖

- [ ] **Step 2: 添加 Rust 依赖**

在 `src-tauri/Cargo.toml` 的 `[dependencies]` 部分添加：

```toml
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
tauri-plugin-fs = "2"
```

- [ ] **Step 3: 配置 tauri.conf.json**

在 `src-tauri/tauri.conf.json` 中添加 `plugins` 配置（如果不存在则创建）：

```json
{
  "plugins": {
    "dialog": {
      "all": true,
      "open": true
    },
    "shell": {
      "open": true
    },
    "fs": {
      "all": true,
      "readFile": true,
      "readDir": true
    }
  }
}
```

- [ ] **Step 4: 注册插件到 lib.rs**

在 `src-tauri/src/lib.rs` 中注册插件：

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        // ... 其他配置
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 5: 验证编译**

运行: `npm run tauri build`
预期: 编译成功，无 Rust 错误

- [ ] **Step 6: 提交**

```bash
git add package.json src-tauri/
git commit -m "feat: add Tauri plugins for repository directory operations"
```

---

## Task 1: 添加类型定义

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: 添加 Repository 相关类型**

在 `src/types/index.ts` 文件末尾添加：

```typescript
// 代码库相关类型
export interface Repository {
  id: number
  user_id: number
  name: string
  local_path: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface RepositoryCreateParams {
  name: string
  local_path: string
  description?: string
}

export interface RepositoryUpdateParams {
  name?: string
  local_path?: string
  description?: string
}
```

- [ ] **Step 2: 验证类型定义**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: add Repository type definitions"
```

---

## Task 2: 添加 Mock 数据

**Files:**
- Modify: `src/mock/data.ts`

- [ ] **Step 1: 添加 mockRepositories 数据**

在 `src/mock/data.ts` 文件末尾添加：

```typescript
// 代码库 Mock 数据
export const mockRepositories: Repository[] = [
  {
    id: 1,
    user_id: 1,
    name: '主项目代码库',
    local_path: '/Users/dev/projects/main-project',
    description: '主要业务项目代码库',
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: '工具库',
    local_path: '/Users/dev/projects/utils',
    description: '通用工具函数库',
    created_at: '2026-03-21T14:30:00Z',
    updated_at: '2026-03-21T14:30:00Z',
  },
]
```

需要在文件顶部导入 Repository 类型：

```typescript
import type {
  // ... 现有类型
  Repository,
} from '@/types'
```

- [ ] **Step 2: 验证类型定义**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/mock/data.ts
git commit -m "feat: add mock repositories data"
```

---

## Task 3: 添加 Mock API

**Files:**
- Modify: `src/mock/index.ts`

- [ ] **Step 1: 导入 Repository 类型和数据**

在文件顶部导入区域添加 `Repository` 类型：

```typescript
import type {
  // ... 现有类型
  Repository,
  RepositoryCreateParams,
  RepositoryUpdateParams,
} from '@/types'
```

在数据导入区域添加：

```typescript
import {
  // ... 现有导入
  mockRepositories,
} from './data'
```

- [ ] **Step 2: 添加 mockRepositoryApi**

在文件末尾（`getCurrentUser` 函数之后）添加：

```typescript
// ----- 代码库相关 -----
export const mockRepositoryApi = {
  async list(): Promise<ApiResponse<Repository[]>> {
    await delay()
    // 返回当前用户的代码库
    const items = mockRepositories.filter(r => r.user_id === currentUser?.id)
    return success(items)
  },

  async create(data: RepositoryCreateParams): Promise<ApiResponse<Repository>> {
    await delay()
    // 检查名称是否重复
    if (mockRepositories.some(r => r.user_id === currentUser?.id && r.name === data.name)) {
      return error('代码库名称已存在')
    }
    const repository: Repository = {
      id: generateId(),
      user_id: currentUser?.id || 1,
      name: data.name,
      local_path: data.local_path,
      description: data.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockRepositories.push(repository)
    return success(repository)
  },

  async get(id: number): Promise<ApiResponse<Repository>> {
    await delay(100)
    const repository = mockRepositories.find(r => r.id === id && r.user_id === currentUser?.id)
    if (!repository) {
      return error('代码库不存在')
    }
    return success(repository)
  },

  async update(id: number, data: RepositoryUpdateParams): Promise<ApiResponse<Repository>> {
    await delay()
    const index = mockRepositories.findIndex(r => r.id === id && r.user_id === currentUser?.id)
    if (index === -1) {
      return error('代码库不存在')
    }
    // 检查名称是否重复（排除自身）
    if (data.name && mockRepositories.some(r => r.user_id === currentUser?.id && r.name === data.name && r.id !== id)) {
      return error('代码库名称已存在')
    }
    const repository = { ...mockRepositories[index] }
    if (data.name !== undefined) repository.name = data.name
    if (data.local_path !== undefined) repository.local_path = data.local_path
    if (data.description !== undefined) repository.description = data.description
    repository.updated_at = new Date().toISOString()
    mockRepositories[index] = repository
    return success(repository)
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    await delay()
    const index = mockRepositories.findIndex(r => r.id === id && r.user_id === currentUser?.id)
    if (index === -1) {
      return error('代码库不存在')
    }
    mockRepositories.splice(index, 1)
    return success(null)
  },
}
```

- [ ] **Step 3: 验证无语法错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 4: 提交**

```bash
git add src/mock/index.ts
git commit -m "feat: add mock repository API"
```

---

## Task 4: 添加 API 接口封装

**Files:**
- Modify: `src/api/index.ts`

- [ ] **Step 1: 添加 repositoryApi**

在 `src/api/index.ts` 文件中，在 `attachmentApi` 之后添加：

```typescript
// 代码库相关
export const repositoryApi = {
  async list() {
    const api = await getApi()
    return api.mockRepositoryApi.list()
  },

  async create(data: import('@/types').RepositoryCreateParams) {
    const api = await getApi()
    return api.mockRepositoryApi.create(data)
  },

  async get(id: number) {
    const api = await getApi()
    return api.mockRepositoryApi.get(id)
  },

  async update(id: number, data: import('@/types').RepositoryUpdateParams) {
    const api = await getApi()
    return api.mockRepositoryApi.update(id, data)
  },

  async delete(id: number) {
    const api = await getApi()
    return api.mockRepositoryApi.delete(id)
  },
}
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/api/index.ts
git commit -m "feat: add repository API wrapper"
```

---

## Task 5: 创建 Repository Store

**Files:**
- Create: `src/stores/repository.ts`

- [ ] **Step 1: 创建 repository store**

创建文件 `src/stores/repository.ts`：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { repositoryApi } from '@/api'
import type { Repository, RepositoryCreateParams, RepositoryUpdateParams } from '@/types'

export const useRepositoryStore = defineStore('repository', () => {
  // 代码库列表
  const repositories = ref<Repository[]>([])

  // 加载状态
  const loading = ref(false)

  // 错误信息
  const error = ref<string | null>(null)

  // 获取代码库列表
  async function fetchRepositories() {
    loading.value = true
    error.value = null
    try {
      const res = await repositoryApi.list()
      if (res.code === 0) {
        repositories.value = res.data
      } else {
        error.value = res.message
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取代码库列表失败'
    } finally {
      loading.value = false
    }
  }

  // 创建代码库
  async function createRepository(params: RepositoryCreateParams): Promise<Repository> {
    const res = await repositoryApi.create(params)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    repositories.value.push(res.data)
    return res.data
  }

  // 更新代码库
  async function updateRepository(id: number, params: RepositoryUpdateParams): Promise<Repository> {
    const res = await repositoryApi.update(id, params)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    const index = repositories.value.findIndex(r => r.id === id)
    if (index !== -1) {
      repositories.value[index] = res.data
    }
    return res.data
  }

  // 删除代码库
  async function deleteRepository(id: number): Promise<void> {
    const res = await repositoryApi.delete(id)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    repositories.value = repositories.value.filter(r => r.id !== id)
  }

  // 检查名称是否存在
  function isNameExists(name: string, excludeId?: number): boolean {
    return repositories.value.some(r => r.name === name && r.id !== excludeId)
  }

  return {
    repositories,
    loading,
    error,
    fetchRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    isNameExists,
  }
})
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/stores/repository.ts
git commit -m "feat: add repository Pinia store"
```

---

## Task 6: 创建个人设置页面

**Files:**
- Create: `src/views/SettingsProfile.vue`

- [ ] **Step 1: 创建 SettingsProfile.vue**

创建文件 `src/views/SettingsProfile.vue`，将现有 `Settings.vue` 的内容迁移过来：

```vue
<template>
  <div class="settings-profile">
    <div class="page-header">
      <h1 class="page-title">个人设置</h1>
    </div>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <span>账户信息</span>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userStore.user?.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.user?.email }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userStore.user?.created_at) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="password-card">
          <template #header>
            <span>修改密码</span>
          </template>

          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 400px">
            <el-form-item label="当前密码" prop="old_password">
              <el-input v-model="form.old_password" type="password" placeholder="请输入当前密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="new_password">
              <el-input v-model="form.new_password" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirm_password">
              <el-input v-model="form.confirm_password" type="password" placeholder="请确认新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>快捷操作</span>
          </template>

          <div class="quick-actions">
            <el-button type="danger" plain @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== form.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

onMounted(() => {
  userStore.init()
})

async function handleChangePassword() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await userStore.changePassword(form.old_password, form.new_password)
    ElMessage.success('密码修改成功')
    formRef.value?.resetFields()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '修改失败')
  } finally {
    submitting.value = false
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.settings-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.password-card {
  margin-top: 24px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/views/SettingsProfile.vue
git commit -m "feat: create SettingsProfile page"
```

---

## Task 7: 改造 Settings.vue 为布局容器

**Files:**
- Modify: `src/views/Settings.vue`

- [ ] **Step 1: 重写 Settings.vue 为布局容器**

将 `src/views/Settings.vue` 替换为：

```vue
<template>
  <div class="settings-layout">
    <div class="settings-sidebar">
      <el-menu
        :default-active="currentPath"
        router
        class="settings-menu"
      >
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
      </el-menu>
    </div>
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { User, UserFilled, FolderOpened } from '@element-plus/icons-vue'

const route = useRoute()
const currentPath = computed(() => route.path)
</script>

<style scoped lang="scss">
.settings-layout {
  display: flex;
  gap: 24px;
  height: 100%;
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.settings-menu {
  border-right: none;
  height: 100%;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}
</style>
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/views/Settings.vue
git commit -m "refactor: convert Settings to layout container with sidebar"
```

---

## Task 8: 创建代码库设置页面

**Files:**
- Create: `src/views/Repositories.vue`

- [ ] **Step 1: 创建 Repositories.vue**

创建文件 `src/views/Repositories.vue`：

```vue
<template>
  <div class="repositories-page">
    <div class="page-header">
      <h1 class="page-title">代码库设置</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增代码库
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="repositoryStore.loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-else-if="repositoryStore.error"
      :title="repositoryStore.error"
      type="error"
      show-icon
      :closable="false"
    >
      <template #default>
        <el-button type="primary" size="small" @click="repositoryStore.fetchRepositories">
          重试
        </el-button>
      </template>
    </el-alert>

    <!-- 空状态 -->
    <el-empty
      v-else-if="repositoryStore.repositories.length === 0"
      description="暂无代码库，点击右上角新增按钮添加"
    />

    <!-- 卡片列表 -->
    <div v-else class="repository-list">
      <el-card
        v-for="repo in repositoryStore.repositories"
        :key="repo.id"
        shadow="hover"
        class="repository-card"
      >
        <template #header>
          <div class="card-header">
            <span class="repo-name">{{ repo.name }}</span>
          </div>
        </template>

        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="本地目录">
            <span class="path-text">{{ repo.local_path }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ repo.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(repo.created_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="card-actions">
          <el-button size="small" @click="handleEdit(repo)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(repo)">删除</el-button>
          <el-button size="small" @click="handleValidate(repo.local_path)">验证目录</el-button>
          <el-button size="small" @click="handleOpenDirectory(repo.local_path)">打开目录</el-button>
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑代码库' : '新增代码库'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="代码库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入代码库名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="本地目录" prop="local_path">
          <el-input v-model="form.local_path" placeholder="请输入本地目录路径">
            <template #append>
              <el-button @click="handleSelectDirectory" :disabled="!isTauriAvailable">
                选择目录
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="描述说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述说明（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRepositoryStore } from '@/stores/repository'
import type { Repository } from '@/types'

const repositoryStore = useRepositoryStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  local_path: '',
  description: '',
})

// 检测 Tauri 是否可用
const isTauriAvailable = computed(() => {
  return typeof window !== 'undefined' && '__TAURI__' in window
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入代码库名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度为 1-50 个字符', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (repositoryStore.isNameExists(value, editId.value || undefined)) {
          callback(new Error('代码库名称已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  local_path: [
    { required: true, message: '请输入本地目录路径', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  repositoryStore.fetchRepositories()
})

function handleAdd() {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.local_path = ''
  form.description = ''
  dialogVisible.value = true
}

function handleEdit(repo: Repository) {
  isEdit.value = true
  editId.value = repo.id
  form.name = repo.name
  form.local_path = repo.local_path
  form.description = repo.description || ''
  dialogVisible.value = true
}

async function handleDelete(repo: Repository) {
  try {
    await ElMessageBox.confirm(
      `确定要删除代码库"${repo.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await repositoryStore.deleteRepository(repo.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败')
    }
  }
}

async function handleValidate(path: string) {
  if (!isTauriAvailable.value) {
    // 非 Tauri 环境，无法验证
    ElMessage.info('目录验证需要 Tauri 环境')
    return
  }
  try {
    const { exists } = await import('@tauri-apps/plugin-fs')
    const valid = await exists(path)
    if (valid) {
      ElMessage.success('目录存在')
    } else {
      ElMessage.warning('目录不存在')
    }
  } catch (error) {
    ElMessage.error('验证失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function handleOpenDirectory(path: string) {
  if (!isTauriAvailable.value) {
    ElMessage.info('打开目录需要 Tauri 环境')
    return
  }
  try {
    const { open } = await import('@tauri-apps/plugin-shell')
    await open(path)
  } catch (error) {
    ElMessage.error('无法打开目录：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function handleSelectDirectory() {
  if (!isTauriAvailable.value) {
    ElMessage.info('目录选择需要 Tauri 环境')
    return
  }
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择代码库目录',
    })
    if (selected) {
      form.local_path = selected as string
    }
  } catch (error) {
    console.error('打开目录选择器失败:', error)
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const params = {
      name: form.name,
      local_path: form.local_path,
      description: form.description || undefined,
    }
    if (isEdit.value && editId.value) {
      await repositoryStore.updateRepository(editId.value, params)
      ElMessage.success('保存成功')
    } else {
      await repositoryStore.createRepository(params)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.repositories-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.loading-container {
  padding: 20px;
}

.repository-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.repository-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .repo-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .path-text {
    font-family: monospace;
    font-size: 13px;
    word-break: break-all;
  }

  .card-actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
  }
}
</style>
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/views/Repositories.vue
git commit -m "feat: create Repositories settings page"
```

---

## Task 9: 更新路由配置

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: 修改设置相关路由**

找到 `/settings` 相关路由（约 137-153 行），替换为嵌套结构：

```typescript
{
  path: 'settings',
  name: 'Settings',
  component: () => import('@/views/Settings.vue'),
  redirect: '/settings/profile',
  children: [
    {
      path: 'profile',
      name: 'SettingsProfile',
      component: () => import('@/views/SettingsProfile.vue'),
      meta: {
        title: '个人设置',
        requiresAuth: true,
      },
    },
    {
      path: 'users',
      name: 'UserManagement',
      component: () => import('@/views/UserManagement.vue'),
      meta: {
        title: '人员管理',
        requiresAuth: true,
      },
    },
    {
      path: 'repositories',
      name: 'Repositories',
      component: () => import('@/views/Repositories.vue'),
      meta: {
        title: '代码库设置',
        requiresAuth: true,
      },
    },
  ],
},
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/router/index.ts
git commit -m "refactor: convert settings routes to nested structure"
```

---

## Task 10: 更新 Layout 侧边栏菜单

**Files:**
- Modify: `src/views/Layout.vue`

- [ ] **Step 1: 添加代码库设置菜单项**

在 `<el-sub-menu index="/settings">` 内添加代码库设置菜单项：

```vue
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
```

需要在 script 部分导入 `FolderOpened` 图标：

```typescript
import {
  Folder,
  Monitor,
  Fold,
  Expand,
  Setting,
  User,
  UserFilled,
  SwitchButton,
  FolderOpened,  // 添加这行
} from '@element-plus/icons-vue'
```

同时更新顶部下拉菜单的"个人设置"跳转目标：

```typescript
function handleCommand(command: string) {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'settings') {
    router.push('/settings/profile')  // 修改为 /settings/profile
  }
}
```

- [ ] **Step 2: 验证无类型错误**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/views/Layout.vue
git commit -m "feat: add repositories menu item to Layout sidebar"
```

---

## Task 11: 验证和测试

- [ ] **Step 1: 运行类型检查**

运行: `npx vue-tsc --noEmit`
预期: 无类型错误

- [ ] **Step 2: 启动开发服务器测试**

运行: `npm run dev`
预期:
- 访问 `/settings` 自动跳转到 `/settings/profile`
- 个人设置页面正常显示
- 人员管理页面正常显示
- 代码库设置页面正常显示
- 新增、编辑、删除代码库功能正常

---

## 文件变更总结

| 文件 | 操作 | 行数 |
|------|------|------|
| `src/types/index.ts` | Modify | +24 |
| `src/mock/data.ts` | Modify | +21 |
| `src/mock/index.ts` | Modify | +65 |
| `src/api/index.ts` | Modify | +25 |
| `src/stores/repository.ts` | Create | +75 |
| `src/views/SettingsProfile.vue` | Create | +145 |
| `src/views/Settings.vue` | Rewrite | -161, +52 |
| `src/views/Repositories.vue` | Create | +320 |
| `src/router/index.ts` | Modify | +23 |
| `src/views/Layout.vue` | Modify | +7 |