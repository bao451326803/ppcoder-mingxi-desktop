<template>
  <div class="workspace-page">
    <div class="page-header">
      <h1 class="page-title">工作站</h1>
    </div>

    <el-tabs v-model="activeTab" class="workspace-tabs">
      <!-- 项目列表 -->
      <el-tab-pane label="我的项目" name="projects">
        <div class="filters">
          <el-input
            v-model="projectSearchQuery"
            placeholder="搜索项目..."
            :prefix-icon="Search"
            clearable
            style="width: 300px"
            @input="handleProjectSearch"
          />
          <el-select v-model="projectStatusFilter" placeholder="状态筛选" clearable style="width: 150px" @change="fetchProjects">
            <el-option label="进行中" value="active" />
            <el-option label="计划中" value="planning" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </div>

        <el-table v-loading="projectsLoading" :data="projects" style="width: 100%">
          <el-table-column prop="name" label="项目名称" min-width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToProject(row.id)">{{ row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getProjectStatusType(row.status)" size="small">
                {{ getProjectStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">{{ row.description || '暂无描述' }}</template>
          </el-table-column>
          <el-table-column label="截止日期" width="120">
            <template #default="{ row }">{{ row.planned_end_date || '未设置' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="120">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>

        <div v-if="projectsTotal > projectsPageSize" class="pagination">
          <el-pagination
            v-model:current-page="projectsCurrentPage"
            v-model:page-size="projectsPageSize"
            :total="projectsTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="fetchProjects"
            @size-change="fetchProjects"
          />
        </div>
      </el-tab-pane>

      <!-- 故事列表 -->
      <el-tab-pane label="我的故事" name="stories">
        <div class="filters">
          <el-input
            v-model="storySearchQuery"
            placeholder="搜索故事..."
            :prefix-icon="Search"
            clearable
            style="width: 300px"
            @input="handleStorySearch"
          />
          <el-select v-model="storyStatusFilter" placeholder="状态筛选" clearable style="width: 120px" @change="fetchStories">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-select v-model="storyPriorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchStories">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>

        <el-table v-loading="storyLoading" :data="stories" style="width: 100%">
          <el-table-column prop="title" label="故事标题" min-width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToStoryDetail(row)">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStoryStatusType(row.status)" size="small">
                {{ getStoryStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="project_name" label="所属项目" width="150" show-overflow-tooltip />
          <el-table-column label="创建时间" width="120">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>

        <div v-if="storyTotal > storyPageSize" class="pagination">
          <el-pagination
            v-model:current-page="storyCurrentPage"
            v-model:page-size="storyPageSize"
            :total="storyTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="fetchStories"
            @size-change="fetchStories"
          />
        </div>
      </el-tab-pane>

      <!-- 需求列表 -->
      <el-tab-pane label="我的需求" name="requirements">
        <div class="filters">
          <el-input
            v-model="reqSearchQuery"
            placeholder="搜索需求..."
            :prefix-icon="Search"
            clearable
            style="width: 300px"
            @input="handleReqSearch"
          />
          <el-select v-model="reqStatusFilter" placeholder="状态筛选" clearable style="width: 120px" @change="fetchRequirements">
            <el-option label="待确认" value="pending_confirmation" />
            <el-option label="待拆解" value="wait_split" />
            <el-option label="开发中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-select v-model="reqPriorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchRequirements">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>

        <el-table v-loading="reqLoading" :data="requirements" style="width: 100%">
          <el-table-column prop="title" label="需求标题" min-width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToRequirement(row)">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getReqStatusType(row.status)" size="small">
                {{ getReqStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="project_name" label="所属项目" width="150" show-overflow-tooltip />
          <el-table-column prop="story_title" label="所属故事" width="150" show-overflow-tooltip />
          <el-table-column label="创建时间" width="120">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>

        <div v-if="reqTotal > reqPageSize" class="pagination">
          <el-pagination
            v-model:current-page="reqCurrentPage"
            v-model:page-size="reqPageSize"
            :total="reqTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="fetchRequirements"
            @size-change="fetchRequirements"
          />
        </div>
      </el-tab-pane>

      <!-- 任务列表 -->
      <el-tab-pane label="我的任务" name="tasks">
        <div class="filters">
          <el-input
            v-model="taskSearchQuery"
            placeholder="搜索任务..."
            :prefix-icon="Search"
            clearable
            style="width: 300px"
            @input="handleTaskSearch"
          />
          <el-select v-model="taskStatusFilter" placeholder="状态筛选" clearable style="width: 120px" @change="fetchTasks">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="taskPriorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchTasks">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>

        <el-table v-loading="taskLoading" :data="tasks" style="width: 100%">
          <el-table-column prop="title" label="任务标题" min-width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToTask(row)">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTaskStatusType(row.status)" size="small">
                {{ getTaskStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="project_name" label="所属项目" width="150" show-overflow-tooltip />
          <el-table-column label="截止日期" width="100" align="center">
            <template #default="{ row }">{{ row.due_date || '未设置' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="120">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>

        <div v-if="taskTotal > taskPageSize" class="pagination">
          <el-pagination
            v-model:current-page="taskCurrentPage"
            v-model:page-size="taskPageSize"
            :total="taskTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="fetchTasks"
            @size-change="fetchTasks"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { projectApi, storyApi, requirementApi, taskApi } from '@/api'
import type { Project, Story, Requirement, Task } from '@/types'

const router = useRouter()

const activeTab = ref('projects')

// 项目列表状态
const projectsLoading = ref(false)
const projects = ref<Project[]>([])
const projectsCurrentPage = ref(1)
const projectsPageSize = ref(10)
const projectsTotal = ref(0)
const projectSearchQuery = ref('')
const projectStatusFilter = ref('')

// 故事列表状态
const storyLoading = ref(false)
const stories = ref<(Story & { project_name?: string; requirement_count?: number })[]>([])
const storyCurrentPage = ref(1)
const storyPageSize = ref(10)
const storyTotal = ref(0)
const storySearchQuery = ref('')
const storyStatusFilter = ref('')
const storyPriorityFilter = ref('')

// 需求列表状态
const reqLoading = ref(false)
const requirements = ref<(Requirement & { project_name?: string; story_title?: string; task_count?: number })[]>([])
const reqCurrentPage = ref(1)
const reqPageSize = ref(10)
const reqTotal = ref(0)
const reqSearchQuery = ref('')
const reqStatusFilter = ref('')
const reqPriorityFilter = ref('')

// 任务列表状态
const taskLoading = ref(false)
const tasks = ref<(Task & { project_name?: string })[]>([])
const taskCurrentPage = ref(1)
const taskPageSize = ref(10)
const taskTotal = ref(0)
const taskSearchQuery = ref('')
const taskStatusFilter = ref('')
const taskPriorityFilter = ref('')

onMounted(() => {
  fetchProjects()
})

watch(activeTab, (val) => {
  if (val === 'stories' && stories.value.length === 0) {
    fetchStories()
  }
  if (val === 'requirements' && requirements.value.length === 0) {
    fetchRequirements()
  }
  if (val === 'tasks' && tasks.value.length === 0) {
    fetchTasks()
  }
})

async function fetchProjects() {
  projectsLoading.value = true
  try {
    const res = await projectApi.list({
      page: projectsCurrentPage.value,
      page_size: projectsPageSize.value,
      status: projectStatusFilter.value || undefined,
      keyword: projectSearchQuery.value || undefined,
      member_only: true,
    })
    if (res.code === 0) {
      projects.value = res.data.items
      projectsTotal.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

async function fetchStories() {
  storyLoading.value = true
  try {
    const res = await storyApi.listMyStories({
      page: storyCurrentPage.value,
      page_size: storyPageSize.value,
      status: storyStatusFilter.value || undefined,
      priority: storyPriorityFilter.value || undefined,
      keyword: storySearchQuery.value || undefined,
    })
    if (res.code === 0) {
      stories.value = res.data.items
      storyTotal.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取故事列表失败')
  } finally {
    storyLoading.value = false
  }
}

async function fetchRequirements() {
  reqLoading.value = true
  try {
    const res = await requirementApi.listMyRequirements({
      page: reqCurrentPage.value,
      page_size: reqPageSize.value,
      status: reqStatusFilter.value || undefined,
      priority: reqPriorityFilter.value || undefined,
      keyword: reqSearchQuery.value || undefined,
    })
    if (res.code === 0) {
      requirements.value = res.data.items
      reqTotal.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取需求列表失败')
  } finally {
    reqLoading.value = false
  }
}

async function fetchTasks() {
  taskLoading.value = true
  try {
    const res = await taskApi.listMyTasks({
      page: taskCurrentPage.value,
      page_size: taskPageSize.value,
      status: taskStatusFilter.value || undefined,
      priority: taskPriorityFilter.value || undefined,
      keyword: taskSearchQuery.value || undefined,
    })
    if (res.code === 0) {
      tasks.value = res.data.items
      taskTotal.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取任务列表失败')
  } finally {
    taskLoading.value = false
  }
}

let projectSearchTimeout: ReturnType<typeof setTimeout>
function handleProjectSearch() {
  clearTimeout(projectSearchTimeout)
  projectSearchTimeout = setTimeout(() => {
    projectsCurrentPage.value = 1
    fetchProjects()
  }, 300)
}

let storySearchTimeout: ReturnType<typeof setTimeout>
function handleStorySearch() {
  clearTimeout(storySearchTimeout)
  storySearchTimeout = setTimeout(() => {
    storyCurrentPage.value = 1
    fetchStories()
  }, 300)
}

let reqSearchTimeout: ReturnType<typeof setTimeout>
function handleReqSearch() {
  clearTimeout(reqSearchTimeout)
  reqSearchTimeout = setTimeout(() => {
    reqCurrentPage.value = 1
    fetchRequirements()
  }, 300)
}

let taskSearchTimeout: ReturnType<typeof setTimeout>
function handleTaskSearch() {
  clearTimeout(taskSearchTimeout)
  taskSearchTimeout = setTimeout(() => {
    taskCurrentPage.value = 1
    fetchTasks()
  }, 300)
}

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}

function goToStoryDetail(story: Story & { project_id?: number }) {
  if (story.project_id) {
    router.push(`/projects/${story.project_id}/stories/${story.id}`)
  }
}

function goToRequirement(req: Requirement & { project_name?: string }) {
  if (req.project_id) {
    router.push(`/projects/${req.project_id}/requirements/${req.id}`)
  }
}

function goToTask(task: Task & { project_id?: number }) {
  if (task.project_id) {
    router.push(`/projects/${task.project_id}/tasks/${task.id}`)
  }
}

function getProjectStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    planning: 'info',
    active: 'primary',
    completed: 'success',
    archived: 'warning',
  }
  return types[status] || 'info'
}

function getProjectStatusText(status: string): string {
  const texts: Record<string, string> = {
    planning: '计划中',
    active: '进行中',
    completed: '已完成',
    archived: '已归档',
  }
  return texts[status] || status
}

function getStoryStatusType(status: string): 'primary' | 'success' | 'warning' {
  const types: Record<string, 'primary' | 'success' | 'warning'> = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
  }
  return types[status] || 'warning'
}

function getStoryStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
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

function getPriorityType(priority: string): 'danger' | 'warning' | 'info' {
  const types: Record<string, 'danger' | 'warning' | 'info'> = {
    urgent: 'danger',
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return types[priority] || 'info'
}

function getPriorityText(priority: string): string {
  const texts: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低',
  }
  return texts[priority] || priority
}

function getTaskStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'warning',
  }
  return types[status] || 'info'
}

function getTaskStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.workspace-page {
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

.workspace-tabs {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
}
</style>