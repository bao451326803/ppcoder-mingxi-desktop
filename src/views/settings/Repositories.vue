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