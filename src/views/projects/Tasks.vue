<template>
  <div class="tasks-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">任务管理</h1>
      </div>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">新建任务</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索任务..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px" @change="fetchTasks">
        <el-option label="待开始" value="pending" />
        <el-option label="进行中" value="in_progress" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchTasks">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-table :data="tasks" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="task-title">
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
        <el-table-column prop="due_date" label="截止日期" width="120">
          <template #default="{ row }">{{ row.due_date || '未设置' }}</template>
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
          @current-change="fetchTasks"
          @size-change="fetchTasks"
        />
      </div>
    </el-card>

    <!-- 新建任务对话框 -->
    <el-dialog v-model="dialogVisible" title="新建任务" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.due_date" type="date" placeholder="选择截止日期" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="任务详情" width="700px">
      <template v-if="currentTask">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{ currentTask.title }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentTask.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentTask.status) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityText(currentTask.priority) }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ currentTask.due_date || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentTask.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentTask.updated_at) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>评论</h4>
          <CommentSection
            target-type="task"
            :target-id="currentTask.id"
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
import { taskApi } from '@/api'
import type { Task, TaskCreateParams } from '@/types'

const CommentSection = defineAsyncComponent(() => import('@/components/CommentSection.vue'))

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentTask = ref<Task | null>(null)
const formRef = ref()

const tasks = ref<Task[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const requirementIdFilter = ref<number | null>(null)
const storyIdFilter = ref<number | null>(null)

const form = reactive<TaskCreateParams>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
})

const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  // 从 URL 参数获取筛选条件
  const reqId = route.query.requirement_id
  const storyId = route.query.story_id
  if (reqId) {
    requirementIdFilter.value = Number(reqId)
  }
  if (storyId) {
    storyIdFilter.value = Number(storyId)
  }
  fetchTasks()
})

async function fetchTasks() {
  loading.value = true
  try {
    const res = await taskApi.list(projectId, {
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined,
      keyword: searchQuery.value || undefined,
      requirement_id: requirementIdFilter.value || undefined,
      story_id: storyIdFilter.value || undefined,
    })
    if (res.code === 0) {
      tasks.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取任务列表失败')
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchTasks()
  }, 300)
}

function goToEdit(taskId: number) {
  router.push(`/projects/${projectId}/tasks/${taskId}/edit`)
}

function showCreateDialog() {
  Object.assign(form, {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
  })
  dialogVisible.value = true
}

function goToDetail(taskId: number) {
  router.push(`/projects/${projectId}/tasks/${taskId}`)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await taskApi.create(projectId, form)
    if (res.code === 0) {
      ElMessage.success('任务创建成功')
    } else {
      throw new Error(res.message)
    }
    dialogVisible.value = false
    fetchTasks()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(task: Task) {
  await ElMessageBox.confirm(`确定要删除任务 "${task.title}" 吗？`, '删除确认', { type: 'warning' })
  try {
    const res = await taskApi.delete(projectId, task.id)
    if (res.code === 0) {
      ElMessage.success('任务删除成功')
      fetchTasks()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending: 'info', in_progress: 'primary', completed: 'success', cancelled: 'warning',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
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
.tasks-page {
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

.task-title {
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