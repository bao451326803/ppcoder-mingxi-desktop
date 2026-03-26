<template>
  <div v-loading="loading" class="task-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">{{ task?.title || '任务详情' }}</h1>
        <el-tag v-if="task" :type="getStatusType(task.status)" size="small">
          {{ getStatusText(task.status) }}
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
      v-if="requirement"
      :requirement="requirement"
      :image-attachments="reqImageAttachments"
      :audio-attachments="reqAudioAttachments"
      :video-attachments="reqVideoAttachments"
    />

    <!-- 任务信息 -->
    <TaskInfoSection :task="task" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { taskApi, storyApi, requirementApi, attachmentApi } from '@/api'
import { StoryInfoSection, RequirementInfoSection, TaskInfoSection } from '@/components/detail'
import type { Task, Story, Requirement, Attachment } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)
const taskId = Number(route.params.taskId)

const loading = ref(false)
const task = ref<Task | null>(null)
const story = ref<Story | null>(null)
const requirement = ref<Requirement | null>(null)
// 故事附件
const storyImageAttachments = ref<Attachment[]>([])
const storyAudioAttachments = ref<Attachment[]>([])
const storyVideoAttachments = ref<Attachment[]>([])
// 需求附件
const reqImageAttachments = ref<Attachment[]>([])
const reqAudioAttachments = ref<Attachment[]>([])
const reqVideoAttachments = ref<Attachment[]>([])

onMounted(() => {
  fetchTask()
})

async function fetchTask() {
  loading.value = true
  try {
    const res = await taskApi.get(projectId, taskId)
    if (res.code === 0) {
      task.value = res.data
      // 获取关联的故事信息
      if (res.data.story_id) {
        await fetchStory(res.data.story_id)
      }
      // 获取关联的需求信息
      if (res.data.requirement_id) {
        await fetchRequirement(res.data.requirement_id)
      }
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取任务信息失败')
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

async function fetchRequirement(requirementId: number) {
  try {
    const res = await requirementApi.get(projectId, requirementId)
    if (res.code === 0) {
      requirement.value = res.data
    }
    // 获取需求的附件
    await fetchRequirementAttachments(requirementId)
  } catch (error) {
    console.error('获取需求信息失败:', error)
  }
}

async function fetchRequirementAttachments(requirementId: number) {
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
</script>

<style scoped lang="scss">
.task-detail-page {
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