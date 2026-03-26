<template>
  <div class="stories-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">故事管理</h1>
      </div>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">新建故事</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索故事..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px" @change="fetchStories">
        <el-option label="待处理" value="pending" />
        <el-option label="进行中" value="in_progress" />
        <el-option label="已完成" value="completed" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="优先级" clearable style="width: 120px" @change="fetchStories">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-table :data="stories" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="story-title">
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
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
          @current-change="fetchStories"
          @size-change="fetchStories"
        />
      </div>
    </el-card>

    <!-- 新建故事对话框 -->
    <el-dialog v-model="dialogVisible" title="新建故事" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入故事标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入故事描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
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

    <!-- 故事详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="故事详情" width="700px">
      <template v-if="currentStory">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{ currentStory.title }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentStory.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentStory.status) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityText(currentStory.priority) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentStory.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentStory.updated_at) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>评论</h4>
          <CommentSection
            target-type="story"
            :target-id="currentStory.id"
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
import { storyApi } from '@/api'
import type { Story, StoryCreateParams } from '@/types'

const CommentSection = defineAsyncComponent(() => import('@/components/CommentSection.vue'))

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentStory = ref<Story | null>(null)
const formRef = ref()

const stories = ref<Story[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const form = reactive<StoryCreateParams>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
})

const rules = {
  title: [
    { required: true, message: '请输入故事标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchStories()
})

async function fetchStories() {
  loading.value = true
  try {
    const res = await storyApi.list(projectId, {
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined,
      keyword: searchQuery.value || undefined,
    })
    if (res.code === 0) {
      stories.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取故事列表失败')
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchStories()
  }, 300)
}

function showCreateDialog() {
  Object.assign(form, {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  })
  dialogVisible.value = true
}

function goToEdit(storyId: number) {
  router.push(`/projects/${projectId}/stories/${storyId}/edit`)
}

function goToDetail(storyId: number) {
  router.push(`/projects/${projectId}/stories/${storyId}`)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await storyApi.create(projectId, form)
    if (res.code === 0) {
      ElMessage.success('故事创建成功')
    } else {
      throw new Error(res.message)
    }
    dialogVisible.value = false
    fetchStories()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(story: Story) {
  await ElMessageBox.confirm(`确定要删除故事 "${story.title}" 吗？`, '删除确认', { type: 'warning' })
  try {
    const res = await storyApi.delete(projectId, story.id)
    if (res.code === 0) {
      ElMessage.success('故事删除成功')
      fetchStories()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' {
  const types: Record<string, 'primary' | 'success' | 'warning'> = {
    pending: 'warning', in_progress: 'primary', completed: 'success',
  }
  return types[status] || 'warning'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待处理', in_progress: '进行中', completed: '已完成',
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
.stories-page {
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

.story-title {
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