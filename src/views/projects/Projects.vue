<template>
  <div class="projects-page">
    <div class="page-header">
      <h1 class="page-title">项目管理</h1>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">新建项目</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索项目..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px" @change="fetchProjects">
        <el-option label="计划中" value="planning" />
        <el-option label="进行中" value="active" />
        <el-option label="已完成" value="completed" />
        <el-option label="已归档" value="archived" />
      </el-select>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-table :data="projects" style="width: 100%">
        <el-table-column prop="name" label="项目名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="goToProject(row.id)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.description || '暂无描述' }}</template>
        </el-table-column>
        <el-table-column label="截止日期" width="120" align="center">
          <template #default="{ row }">{{ row.planned_end_date || '未设置' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="120" align="center">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" :icon="Edit" @click="goToEdit(row.id)">编辑</el-button>
            <el-button v-if="row.status === 'completed' || row.status === 'archived'" text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="fetchProjects"
          @size-change="fetchProjects"
        />
      </div>
    </el-card>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建项目"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择项目状态">
            <el-option label="计划中" value="planning" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="planned_start_date">
          <el-date-picker
            v-model="form.planned_start_date"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="planned_end_date">
          <el-date-picker
            v-model="form.planned_end_date"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { projectApi } from '@/api'
import type { Project, ProjectCreateParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const projects = ref<Project[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')

const form = reactive<ProjectCreateParams>({
  name: '',
  description: '',
  status: 'planning',
  planned_start_date: '',
  planned_end_date: '',
})

const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 100, message: '项目名称长度在 1 到 100 个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchProjects()
})

async function fetchProjects() {
  loading.value = true
  try {
    const res = await projectApi.list({
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
      keyword: searchQuery.value || undefined,
    })
    if (res.code === 0) {
      projects.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取项目列表失败')
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProjects()
  }, 300)
}

function showCreateDialog() {
  Object.assign(form, {
    name: '',
    description: '',
    status: 'planning',
    planned_start_date: '',
    planned_end_date: '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await projectApi.create(form)
    if (res.code === 0) {
      ElMessage.success('项目创建成功')
      dialogVisible.value = false
      fetchProjects()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '创建失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(project: Project) {
  await ElMessageBox.confirm(`确定要删除项目 "${project.name}" 吗？`, '删除确认', {
    type: 'warning',
  })
  try {
    const res = await projectApi.delete(project.id)
    if (res.code === 0) {
      ElMessage.success('项目删除成功')
      fetchProjects()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}

function goToEdit(id: number) {
  router.push(`/projects/${id}/edit`)
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    planning: 'info',
    active: 'primary',
    completed: 'success',
    archived: 'warning',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    planning: '计划中',
    active: '进行中',
    completed: '已完成',
    archived: '已归档',
  }
  return texts[status] || status
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.projects-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}
</style>