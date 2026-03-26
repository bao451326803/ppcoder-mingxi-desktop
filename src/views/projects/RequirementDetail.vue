<template>
  <div v-loading="loading" class="requirement-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">{{ requirement?.title || '需求详情' }}</h1>
        <el-tag v-if="requirement" :type="getStatusType(requirement.status)" size="small">
          {{ getStatusText(requirement.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 故事信息（包含附件） -->
    <StoryInfoSection
      v-if="story"
      :story="story"
      :image-attachments="storyImageAttachments"
      :audio-attachments="storyAudioAttachments"
      :video-attachments="storyVideoAttachments"
    />

    <!-- 需求信息（包含附件） -->
    <RequirementInfoSection
      :requirement="requirement"
      :image-attachments="reqImageAttachments"
      :audio-attachments="reqAudioAttachments"
      :video-attachments="reqVideoAttachments"
    />

    <!-- 关联任务列表 -->
    <TaskListSection :tasks="tasks" @view-task="goToTaskDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { requirementApi, taskApi, storyApi, attachmentApi } from '@/api'
import { StoryInfoSection, RequirementInfoSection, TaskListSection } from '@/components/detail'
import type { Requirement, Task, Story, Attachment } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)
const requirementId = Number(route.params.requirementId)

const loading = ref(false)
const requirement = ref<Requirement | null>(null)
const story = ref<Story | null>(null)
const tasks = ref<Task[]>([])
// 故事附件
const storyImageAttachments = ref<Attachment[]>([])
const storyAudioAttachments = ref<Attachment[]>([])
const storyVideoAttachments = ref<Attachment[]>([])
// 需求附件
const reqImageAttachments = ref<Attachment[]>([])
const reqAudioAttachments = ref<Attachment[]>([])
const reqVideoAttachments = ref<Attachment[]>([])

onMounted(() => {
  fetchRequirement()
})

async function fetchRequirement() {
  loading.value = true
  try {
    const res = await requirementApi.get(projectId, requirementId)
    if (res.code === 0) {
      requirement.value = res.data
      // 获取关联的故事信息
      if (res.data.story_id) {
        await fetchStory(res.data.story_id)
      }
      // 获取需求附件
      await fetchRequirementAttachments()
      // 获取关联任务
      await fetchTasks()
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取需求信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchStory(storyId: number) {
  try {
    const res = await storyApi.get(projectId, storyId)
    if (res.code === 0) {
      story.value = res.data
    }
    // 获取故事的附件
    await fetchStoryAttachments(storyId)
  } catch (error) {
    console.error('获取故事信息失败:', error)
  }
}

async function fetchStoryAttachments(storyId: number) {
  try {
    const res = await attachmentApi.list({ target_type: 'story', target_id: storyId, page_size: 100 })
    if (res.code === 0) {
      const allAttachments = res.data.items
      storyImageAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('image/'))
      storyAudioAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('audio/'))
      storyVideoAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('video/'))
    }
  } catch (error) {
    console.error('获取附件列表失败:', error)
  }
}

async function fetchRequirementAttachments() {
  try {
    const res = await attachmentApi.list({ target_type: 'requirement', target_id: requirementId, page_size: 100 })
    if (res.code === 0) {
      const allAttachments = res.data.items
      reqImageAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('image/'))
      reqAudioAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('audio/'))
      reqVideoAttachments.value = allAttachments.filter(a => a.mime_type.startsWith('video/'))
    }
  } catch (error) {
    console.error('获取需求附件列表失败:', error)
  }
}

async function fetchTasks() {
  try {
    const res = await taskApi.list(projectId, { requirement_id: requirementId, page_size: 100 })
    if (res.code === 0) {
      tasks.value = res.data.items
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

function goToTaskDetail(taskId: number) {
  router.push(`/projects/${projectId}/tasks/${taskId}`)
}

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending_confirmation: 'info', wait_split: 'warning', in_progress: 'primary', completed: 'success',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending_confirmation: '待确认', wait_split: '待拆解', in_progress: '开发中', completed: '已完成',
  }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.requirement-detail-page {
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