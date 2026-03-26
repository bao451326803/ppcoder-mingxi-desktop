# 代码库设置功能设计

## 概述

在设置模块下新增代码库设置功能，支持用户管理代码库配置。设置页面改造为侧边菜单布局，代码库以卡片列表形式展示。

## 前置条件

### 后端 API 状态

代码库相关 API 需要后端提供支持。如果后端 API 尚未实现，前端将使用 Mock 数据进行开发和测试。

### 数据所有权模型

代码库为**用户级别资源**，每个用户管理自己的代码库列表。数据模型需要添加 `user_id` 字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | number | 所属用户 ID |

API 会自动关联当前登录用户，前端无需手动传递 `user_id`。

### 权限控制

- 用户只能查看、编辑、删除自己创建的代码库
- 所有 API 操作都需要用户登录认证（通过 token）

## 功能需求

### 代码库数据字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | - | 主键（系统生成） |
| user_id | number | - | 所属用户 ID（后端自动关联） |
| name | string | 是 | 代码库名称 |
| local_path | string | 是 | 本地目录路径 |
| description | string | 否 | 描述说明 |
| created_at | string | - | 创建时间（系统生成） |
| updated_at | string | - | 更新时间（系统生成） |

### 操作功能

1. **新增** - 弹窗表单，填写名称、本地目录、描述
2. **编辑** - 弹窗表单，修改已有代码库信息
3. **删除** - 二次确认后删除
4. **验证目录** - 检查本地目录是否存在，显示验证结果提示
5. **打开目录** - 调用系统文件管理器打开目录

### 表单验证规则

| 字段 | 规则 | 验证时机 |
|------|------|----------|
| name | 必填，长度 1-50 字符，当前用户范围内不允许重复 | blur + submit |
| local_path | 必填，不能为空 | blur + submit |
| description | 可选，最大 200 字符 | submit |

### 验证行为详情

**名称重复验证**
- 在 blur 时触发，检查本地已加载的代码库列表
- 编辑时排除当前编辑的代码库
- 重复时显示错误提示"代码库名称已存在"
- 不阻止用户继续填写其他字段
- 最终以后端 API 返回为准（后端保证唯一性约束）

**目录验证**
- 点击"验证目录"按钮手动触发
- 验证结果通过 ElMessage 显示
- 目录不存在仅显示警告，**不阻止保存**
- 用户可以保存一个不存在的目录路径（可能目录尚未创建）

**选择目录行为**
- 点击"选择目录"按钮打开 Tauri 目录选择器
- 选择成功后自动填充 local_path 字段
- 不自动填充名称字段（由用户手动输入）

### 状态处理

| 状态 | 处理方式 |
|------|----------|
| 加载中 | 显示 el-skeleton 或 el-card 内的 loading 状态 |
| 加载失败 | 显示错误提示，提供"重试"按钮 |
| 空列表 | 显示空状态提示"暂无代码库，点击右上角新增按钮添加" |
| 操作中 | 按钮显示 loading 状态，禁用其他操作 |

### 错误处理

| 场景 | 处理 |
|------|------|
| 目录选择取消 | 无操作，保持表单原有值 |
| 目录不存在 | 验证目录时提示"目录不存在"，卡片上可显示警告标识 |
| 目录打开失败 | ElMessage.error 提示"无法打开目录：{错误信息}" |
| 网络错误 | ElMessage.error 提示具体错误信息 |
| 名称重复 | 表单验证提示"代码库名称已存在" |
| 删除确认 | 使用 ElMessageBox.confirm 二次确认 |
| Tauri 插件不可用 | 降级处理：隐藏"选择目录"按钮，改为手动输入路径 |
| 权限不足 | ElMessage.error 提示"权限不足，无法访问该目录" |

### 操作成功后行为

| 操作 | 成功后行为 |
|------|----------|
| 新增 | 关闭弹窗，刷新列表，ElMessage.success 提示"新增成功" |
| 编辑 | 关闭弹窗，更新列表项，ElMessage.success 提示"保存成功" |
| 删除 | 从列表移除，ElMessage.success 提示"删除成功" |

## 技术设计

### 数据模型

**新增类型定义** (`src/types/index.ts`)

```typescript
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

### 路由配置

**现有路由结构**

当前 `/settings` 和 `/settings/users` 是 Layout 的同级子路由：

```typescript
// 当前结构
{ path: 'settings', name: 'Settings', component: Settings.vue },
{ path: 'settings/users', name: 'UserManagement', component: UserManagement.vue },
```

**路由迁移方案**

将设置相关路由改为嵌套结构，Settings.vue 变为布局容器：

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
      meta: { title: '个人设置', requiresAuth: true },
    },
    {
      path: 'users',
      name: 'UserManagement',
      component: () => import('@/views/UserManagement.vue'),
      meta: { title: '人员管理', requiresAuth: true },
    },
    {
      path: 'repositories',
      name: 'Repositories',
      component: () => import('@/views/Repositories.vue'),
      meta: { title: '代码库设置', requiresAuth: true },
    },
  ],
}
```

**URL 兼容性**

- `/settings` → 重定向到 `/settings/profile`（个人设置）
- `/settings/users` → 保持不变（人员管理）
- 现有书签和链接无需更新

### 页面布局

**设置页面侧边菜单布局**

```
┌─────────────────────────────────────────────────────────┐
│  设置                                                    │
├──────────┬──────────────────────────────────────────────┤
│  侧边菜单 │         内容区域                              │
│          │                                              │
│  个人设置 │                                              │
│  人员管理 │                                              │
│  代码库   │                                              │
│  设置    │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**代码库卡片组件** (`el-card`)

```
┌─────────────────────────────────────────────────────────┐
│  代码库名称                                    [操作按钮] │
├─────────────────────────────────────────────────────────┤
│  本地目录：/path/to/directory                           │
│  描述：代码库描述说明                                    │
│  创建时间：2026-03-23 10:00                             │
│                                                         │
│  [编辑] [删除] [验证目录] [打开目录]                     │
└─────────────────────────────────────────────────────────┘
```

**新增/编辑弹窗** (`el-dialog` + `el-form`)

```
┌─────────────────────────────────────────────────────────┐
│  新增代码库 / 编辑代码库                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  代码库名称 *   [________________]                       │
│                                                         │
│  本地目录 *     [________________] [选择目录]            │
│                                                         │
│  描述说明       [________________]                       │
│                [________________]                       │
│                                                         │
│                              [取消] [确定]               │
└─────────────────────────────────────────────────────────┘
```

### 状态管理

**新增 Pinia Store** (`src/stores/repository.ts`)

```typescript
export const useRepositoryStore = defineStore('repository', {
  state: () => ({
    repositories: [] as Repository[],
    loading: false,
  }),
  actions: {
    async fetchRepositories() { ... },
    async createRepository(params: RepositoryCreateParams) { ... },
    async updateRepository(id: number, params: RepositoryUpdateParams) { ... },
    async deleteRepository(id: number) { ... },
  },
})
```

### API 接口

| 方法 | 路径 | 请求体 | 响应体 |
|------|------|--------|--------|
| GET | /api/repositories | - | `Repository[]` |
| POST | /api/repositories | `RepositoryCreateParams` | `Repository` |
| PUT | /api/repositories/:id | `RepositoryUpdateParams` | `Repository` |
| DELETE | /api/repositories/:id | - | `{ success: boolean }` |

**错误响应格式**

```typescript
{
  code: number,      // 错误码
  message: string    // 错误信息
}
```

### Mock 实现

在 `src/mock/index.ts` 添加代码库相关 mock 数据和接口：

```typescript
// Mock 数据
const mockRepositories: Repository[] = [
  {
    id: 1,
    user_id: 1,
    name: '主项目代码库',
    local_path: '/Users/dev/projects/main-project',
    description: '主要业务项目',
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
]

// Mock API 实现
mockApi.getRepositories = () => mockRepositories
mockApi.createRepository = (params) => { ... }
mockApi.updateRepository = (id, params) => { ... }
mockApi.deleteRepository = (id) => { ... }
```

### Tauri 集成

**所需插件**

```bash
# 安装 Tauri 插件
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-shell @tauri-apps/plugin-fs
```

**Tauri 配置变更** (`src-tauri/tauri.conf.json`)

需要在 `plugins` 部分添加：

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

**Rust 依赖** (`src-tauri/Cargo.toml`)

```toml
[dependencies]
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
tauri-plugin-fs = "2"
```

**插件使用**

```typescript
import { open } from '@tauri-apps/plugin-dialog'
import { open as openPath } from '@tauri-apps/plugin-shell'
import { exists } from '@tauri-apps/plugin-fs'

// 选择目录
async function selectDirectory(): Promise<string | null> {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择代码库目录',
    })
    return selected as string | null
  } catch (error) {
    console.error('打开目录选择器失败:', error)
    return null
  }
}

// 打开目录
async function openInExplorer(path: string): Promise<boolean> {
  try {
    await openPath(path)
    return true
  } catch (error) {
    console.error('打开目录失败:', error)
    return false
  }
}

// 验证目录是否存在
async function validateDirectory(path: string): Promise<boolean> {
  try {
    return await exists(path)
  } catch {
    return false
  }
}
```

### 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `src/views/Settings.vue` | 改造为带侧边菜单的布局容器（原有内容迁移至 SettingsProfile.vue） |
| 新增 | `src/views/SettingsProfile.vue` | 个人设置内容（从 Settings.vue 迁移账户信息和修改密码功能） |
| 新增 | `src/views/Repositories.vue` | 代码库设置页面 |
| 修改 | `src/router/index.ts` | 调整设置路由为嵌套结构 |
| 修改 | `src/types/index.ts` | 添加 Repository 相关类型 |
| 修改 | `src/api/index.ts` | 添加代码库相关 API 接口 |
| 新增 | `src/stores/repository.ts` | 代码库状态管理 |
| 修改 | `src/mock/index.ts` | 添加代码库 mock 数据和接口 |