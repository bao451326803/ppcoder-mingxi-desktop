<template>
  <div v-loading="loading" class="story-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">{{ story?.title || '故事详情' }}</h1>
        <el-tag v-if="story" :type="getStatusType(story.status)" size="small">
          {{ getStatusText(story.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 故事信息（包含附件） -->
    <StoryInfoSection
      :story="story"
      :image-attachments="imageAttachments"
      :audio-attachments="audioAttachments"
      :video-attachments="videoAttachments"
    />

    <!-- 关联需求列表 -->
    <RequirementListSection :requirements="requirements" @view-requirement="goToRequirementDetail" />

    <!-- 关联任务列表 -->
    <TaskListSection :tasks="tasks" :show-actions="false" @view-task="goToTaskDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { storyApi, requirementApi, taskApi, attachmentApi } from '@/api'
import { StoryInfoSection, RequirementListSection, TaskListSection } from '@/components/detail'
import type { Story, Requirement, Task, Attachment } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)
const storyId = Number(route.params.storyId)

const loading = ref(false)
const story = ref<Story | null>(null)
const requirements = ref<Requirement[]>([])
const tasks = ref<Task[]>([])
const imageAttachments = ref<Attachment[]>([])
const audioAttachments = ref<Attachment[]>([])
const videoAttachments = ref<Attachment[]>([])

onMounted(() => {
  fetchStory()
  fetchRequirements()
  fetchTasks()
  fetchAttachments()
})

async function fetchStory() {
  loading.value = true
  try {
    const res = await storyApi.get(projectId, storyId)
    if (res.code === 0) {
      story.value = res.data
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取故事信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchRequirements() {
  try {
    const res = await requirementApi.list(projectId, { story_id: storyId, page_size: 100 })
    if (res.code === 0) {
      requirements.value = res.data.items
    }
  } catch (error) {
    console.error('获取需求列表失败:', error)
  }
}

async function fetchTasks() {
  try {
    const res = await taskApi.list(projectId, { story_id: storyId, page_size: 100 })
    if (res.code === 0) {
      tasks.value = res.data.items
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

async function fetchAttachments() {
  try {
    const res = await attachmentApi.list({ target_type: 'story', target_id: storyId, page_size: 100 })
    if (res.code === 0) {
      const allAttachments = res.data.items
      imageAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('image/'))
      audioAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('audio/'))
      videoAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('video/'))
    }
  } catch (error) {
    console.error('获取附件列表失败:', error)
  }
}

function goToRequirementDetail(requirementId: number) {
  router.push(`/projects/${projectId}/requirements/${requirementId}`)
}

function goToTaskDetail(taskId: number) {
  router.push(`/projects/${projectId}/tasks/${taskId}`)
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
</script>

<style scoped lang="scss">
.story-detail-page {
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
</style>