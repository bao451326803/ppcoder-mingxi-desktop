<template>
  <div v-loading="loading" class="project-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">{{ project?.name || '项目详情' }}</h1>
        <el-tag v-if="project" :type="getStatusType(project.status)" size="small">
          {{ getStatusText(project.status) }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button :icon="Edit" @click="showEditDialog">编辑项目</el-button>
        <el-button type="primary" @click="showAddMemberDialog">添加成员</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="content-tabs">
      <!-- 故事列表 -->
      <el-tab-pane label="故事列表" name="stories">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>故事列表</span>
              <el-button type="primary" size="small" @click="goToStories">管理故事</el-button>
            </div>
          </template>
          <el-table :data="stories" style="width: 100%">
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template #default="{ row }">
                <el-link type="primary" @click="goToStoryDetail(row.id)">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStoryStatusType(row.status)" size="small">
                  {{ getStoryStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 需求列表 -->
      <el-tab-pane label="需求列表" name="requirements">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>需求列表</span>
              <el-button type="primary" size="small" @click="goToRequirements">管理需求</el-button>
            </div>
          </template>
          <el-table :data="requirements" style="width: 100%">
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template #default="{ row }">
                <el-link type="primary" @click="goToRequirementDetail(row.id)">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getReqStatusType(row.status)" size="small">
                  {{ getReqStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 任务列表 -->
      <el-tab-pane label="任务列表" name="tasks">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>任务列表</span>
              <el-button type="primary" size="small" @click="goToTasks">管理任务</el-button>
            </div>
          </template>
          <el-table :data="tasks" style="width: 100%">
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template #default="{ row }">
                <el-link type="primary" @click="goToTaskDetail(row.id)">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)" size="small">
                  {{ getTaskStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="due_date" label="截止日期" width="120">
              <template #default="{ row }">{{ row.due_date || '未设置' }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 项目信息 -->
      <el-tab-pane label="项目信息" name="info">
        <el-card shadow="never">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">{{ project?.name }}</el-descriptions-item>
            <el-descriptions-item label="项目状态">{{ getStatusText(project?.status || '') }}</el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">{{ project?.description || '暂无描述' }}</el-descriptions-item>
            <el-descriptions-item label="计划开始日期">{{ project?.planned_start_date || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="计划结束日期">{{ project?.planned_end_date || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="实际开始日期">{{ project?.actual_start_date || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="实际结束日期">{{ project?.actual_end_date || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(project?.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(project?.updated_at) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <!-- 项目成员 -->
      <el-tab-pane label="项目成员" name="members">
        <el-card shadow="never">
          <el-table :data="members" style="width: 100%">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="row.is_owner ? 'warning' : 'info'" size="small">
                  {{ row.is_owner ? '负责人' : '成员' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joined_at" label="加入时间" width="180">
              <template #default="{ row }">{{ formatDate(row.joined_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="!row.is_owner"
                  text
                  type="primary"
                  size="small"
                  @click="handleSetOwner(row)"
                >
                  设为负责人
                </el-button>
                <el-button
                  v-if="!row.is_owner"
                  text
                  type="danger"
                  size="small"
                  @click="handleRemoveMember(row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑项目对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑项目" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择项目状态">
            <el-option label="计划中" value="planning" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始日期">
          <el-date-picker v-model="editForm.planned_start_date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="计划结束日期">
          <el-date-picker v-model="editForm.planned_end_date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleUpdateProject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="memberDialogVisible" title="添加成员" width="400px">
      <el-form :model="memberForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model.number="memberForm.user_id" placeholder="请输入用户ID" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAddMember">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { projectApi, storyApi, taskApi, requirementApi } from '@/api'
import type { Project, ProjectMember, Story, Requirement, Task } from '@/types'

const route = useRoute()
const router = useRouter()

const projectId = Number(route.params.id)

const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('stories')
const project = ref<Project | null>(null)
const members = ref<ProjectMember[]>([])
const stories = ref<Story[]>([])
const requirements = ref<Requirement[]>([])
const tasks = ref<Task[]>([])

const editDialogVisible = ref(false)
const memberDialogVisible = ref(false)
const editFormRef = ref()

const editForm = reactive({
  name: '',
  description: '',
  status: 'planning' as string,
  planned_start_date: '',
  planned_end_date: '',
})

const editRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

const memberForm = reactive({
  user_id: null as number | null,
})

onMounted(() => {
  fetchProject()
  fetchMembers()
  fetchStories()
  fetchRequirements()
  fetchTasks()
})

async function fetchProject() {
  loading.value = true
  try {
    const res = await projectApi.get(projectId)
    if (res.code === 0) {
      project.value = res.data
      Object.assign(editForm, {
        name: res.data.name,
        description: res.data.description || '',
        status: res.data.status,
        planned_start_date: res.data.planned_start_date || '',
        planned_end_date: res.data.planned_end_date || '',
      })
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取项目信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchMembers() {
  try {
    const res = await projectApi.members(projectId)
    if (res.code === 0) {
      members.value = res.data.items
    }
  } catch (error) {
    console.error('获取成员列表失败:', error)
  }
}

async function fetchStories() {
  try {
    const res = await storyApi.list(projectId, { page_size: 5 })
    if (res.code === 0) {
      stories.value = res.data.items
    }
  } catch (error) {
    console.error('获取故事列表失败:', error)
  }
}

async function fetchRequirements() {
  try {
    const res = await requirementApi.list(projectId, { page_size: 5 })
    if (res.code === 0) {
      requirements.value = res.data.items
    }
  } catch (error) {
    console.error('获取需求列表失败:', error)
  }
}

async function fetchTasks() {
  try {
    const res = await taskApi.list(projectId, { page_size: 5 })
    if (res.code === 0) {
      tasks.value = res.data.items
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

function showEditDialog() {
  editDialogVisible.value = true
}

async function handleUpdateProject() {
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await projectApi.update(projectId, editForm)
    if (res.code === 0) {
      ElMessage.success('项目更新成功')
      editDialogVisible.value = false
      fetchProject()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  } finally {
    submitting.value = false
  }
}

function showAddMemberDialog() {
  memberForm.user_id = null
  memberDialogVisible.value = true
}

async function handleAddMember() {
  if (!memberForm.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }

  submitting.value = true
  try {
    const res = await projectApi.addMember(projectId, memberForm.user_id)
    if (res.code === 0) {
      ElMessage.success('添加成员成功')
      memberDialogVisible.value = false
      fetchMembers()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '添加失败')
  } finally {
    submitting.value = false
  }
}

async function handleSetOwner(member: ProjectMember) {
  await ElMessageBox.confirm(`确定要将 "${member.username}" 设为项目负责人吗？`, '确认', { type: 'warning' })
  try {
    const res = await projectApi.setOwner(projectId, member.user_id)
    if (res.code === 0) {
      ElMessage.success('设置成功')
      fetchMembers()
      fetchProject()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '设置失败')
  }
}

async function handleRemoveMember(member: ProjectMember) {
  await ElMessageBox.confirm(`确定要移除成员 "${member.username}" 吗？`, '确认', { type: 'warning' })
  try {
    const res = await projectApi.removeMember(projectId, member.user_id)
    if (res.code === 0) {
      ElMessage.success('移除成功')
      fetchMembers()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '移除失败')
  }
}

function goToStories() {
  router.push(`/projects/${projectId}/stories`)
}

function goToStoryDetail(storyId: number) {
  router.push(`/projects/${projectId}/stories/${storyId}`)
}

function goToRequirements() {
  router.push(`/projects/${projectId}/requirements`)
}

function goToTasks() {
  router.push(`/projects/${projectId}/tasks`)
}

function goToRequirementDetail(requirementId: number) {
  router.push(`/projects/${projectId}/requirements/${requirementId}`)
}

function goToTaskDetail(taskId: number) {
  router.push(`/projects/${projectId}/tasks/${taskId}`)
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    planning: 'info', active: 'primary', completed: 'success', archived: 'warning',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    planning: '计划中', active: '进行中', completed: '已完成', archived: '已归档',
  }
  return texts[status] || status
}

function getStoryStatusType(status: string): 'primary' | 'success' | 'warning' {
  const types: Record<string, 'primary' | 'success' | 'warning'> = {
    pending: 'warning', in_progress: 'primary', completed: 'success',
  }
  return types[status] || 'warning'
}

function getStoryStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待处理', in_progress: '进行中', completed: '已完成',
  }
  return texts[status] || status
}

function getReqStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending_confirmation: 'info',
    wait_split: 'warning',
    in_progress: 'primary',
    completed: 'success',
  }
  return types[status] || 'info'
}

function getReqStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending_confirmation: '待确认',
    wait_split: '待拆解',
    in_progress: '开发中',
    completed: '已完成',
  }
  return texts[status] || status
}

function getTaskStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending: 'info', in_progress: 'primary', completed: 'success', cancelled: 'warning',
  }
  return types[status] || 'info'
}

function getTaskStatusText(status: string): string {
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

function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.project-detail-page {
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

.header-right {
  display: flex;
  gap: 12px;
}

.content-tabs {
  background-color: var(--el-bg-color);
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>