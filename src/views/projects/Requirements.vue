<template>
  <div class="requirements-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">需求管理</h1>
      </div>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">新建需求</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索需求..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px" @change="fetchRequirements">
        <el-option label="待确认" value="pending_confirmation" />
        <el-option label="待拆解" value="wait_split" />
        <el-option label="开发中" value="in_progress" />
        <el-option label="已完成" value="completed" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchRequirements">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-table :data="requirements" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="req-title">
              <span class="title-text">{{ row.title }}</span>
              <span v-if="row.description" class="title-desc">{{ row.description }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务" width="80" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="goToTasks(row.id)">
              {{ getTaskCount(row.id) }} 个
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="View" @click="goToDetail(row.id)">详情</el-button>
            <el-button text size="small" :icon="Edit" @click="goToEdit(row.id)">编辑</el-button>
            <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
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
          @current-change="fetchRequirements"
          @size-change="fetchRequirements"
        />
      </div>
    </el-card>

    <!-- 新建需求对话框 -->
    <el-dialog v-model="dialogVisible" title="新建需求" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入需求描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待确认" value="pending_confirmation" />
            <el-option label="待拆解" value="wait_split" />
            <el-option label="开发中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 需求详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="需求详情" width="700px">
      <template v-if="currentRequirement">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{ currentRequirement.title }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRequirement.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentRequirement.status) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityText(currentRequirement.priority) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentRequirement.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentRequirement.updated_at) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>评论</h4>
          <CommentSection
            target-type="requirement"
            :target-id="currentRequirement.id"
            :allow-delete="false"
          />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, ArrowLeft, View, Edit, Delete } from '@element-plus/icons-vue'
import { requirementApi, taskApi } from '@/api'
import type { Requirement, RequirementCreateParams, Task } from '@/types'

const CommentSection = defineAsyncComponent(() => import('@/components/CommentSection.vue'))

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentRequirement = ref<Requirement | null>(null)
const formRef = ref()

const requirements = ref<Requirement[]>([])
const tasks = ref<Task[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const form = reactive<RequirementCreateParams>({
  title: '',
  description: '',
  status: 'pending_confirmation',
  priority: 'medium',
})

const rules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchRequirements()
  fetchTasks()
})

async function fetchRequirements() {
  loading.value = true
  try {
    const res = await requirementApi.list(projectId, {
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined,
      keyword: searchQuery.value || undefined,
    })
    if (res.code === 0) {
      requirements.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取需求列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchTasks() {
  try {
    const res = await taskApi.list(projectId, { page_size: 1000 })
    if (res.code === 0) {
      tasks.value = res.data.items
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchRequirements()
  }, 300)
}

function showCreateDialog() {
  Object.assign(form, {
    title: '',
    description: '',
    status: 'pending_confirmation',
    priority: 'medium',
  })
  dialogVisible.value = true
}

function goToEdit(requirementId: number) {
  router.push(`/projects/${projectId}/requirements/${requirementId}/edit`)
}

function goToDetail(requirementId: number) {
  router.push(`/projects/${projectId}/requirements/${requirementId}`)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await requirementApi.create(projectId, form)
    if (res.code === 0) {
      ElMessage.success('需求创建成功')
    } else {
      throw new Error(res.message)
    }
    dialogVisible.value = false
    fetchRequirements()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(requirement: Requirement) {
  await ElMessageBox.confirm(`确定要删除需求 "${requirement.title}" 吗？`, '删除确认', { type: 'warning' })
  try {
    const res = await requirementApi.delete(projectId, requirement.id)
    if (res.code === 0) {
      ElMessage.success('需求删除成功')
      fetchRequirements()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function getTaskCount(requirementId: number): number {
  return tasks.value.filter(t => t.requirement_id === requirementId).length
}

function goToTasks(requirementId: number) {
  router.push(`/projects/${projectId}/tasks?requirement_id=${requirementId}`)
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending_confirmation: 'info',
    wait_split: 'warning',
    in_progress: 'primary',
    completed: 'success',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending_confirmation: '待确认',
    wait_split: '待拆解',
    in_progress: '开发中',
    completed: '已完成',
  }
  return texts[status] || status
}

function getPriorityType(priority: string): 'danger' | 'warning' | 'info' {
  const types: Record<string, 'danger' | 'warning' | 'info'> = {
    urgent: 'danger', high: 'danger', medium: 'warning', low: 'info',
  }
  return types[priority] || 'info'
}

function getPriorityText(priority: string): string {
  const texts: Record<string, string> = {
    urgent: '紧急', high: '高', medium: '中', low: '低',
  }
  return texts[priority] || priority
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.requirements-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.req-title {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .title-text {
    font-weight: 500;
  }

  .title-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

.detail-section {
  margin-top: 24px;

  h4 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }
}
</style>