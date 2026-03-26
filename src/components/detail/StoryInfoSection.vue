<template>
  <el-card shadow="never" class="info-card">
    <template #header>
      <span>故事信息</span>
    </template>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题">{{ story?.title }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ getStatusText(story?.status || '') }}</el-descriptions-item>
      <el-descriptions-item label="优先级">{{ getPriorityText(story?.priority || '') }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(story?.created_at) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间" :span="2">{{ formatDate(story?.updated_at) }}</el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        <div class="description-content">{{ story?.description || '暂无描述' }}</div>
      </el-descriptions-item>
      <el-descriptions-item v-if="hasAttachments" label="附件" :span="2">
        <el-button type="primary" size="small" @click="drawerVisible = true">
          查看 ({{ totalCount }})
        </el-button>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>

  <!-- 附件抽屉 -->
  <el-drawer
    v-model="drawerVisible"
    title="附件列表"
    direction="rtl"
    :size="'50%'"
  >
    <!-- 图片附件 -->
    <div v-if="imageAttachments.length > 0" class="attachment-section">
      <h3 class="section-title">图片附件 ({{ imageAttachments.length }})</h3>
      <div class="image-list">
        <div v-for="image in imageAttachments" :key="image.id" class="image-item">
          <div class="image-info">
            <el-icon class="attachment-icon"><Picture /></el-icon>
            <div class="attachment-details">
              <span class="attachment-name">{{ image.original_filename }}</span>
              <span class="attachment-meta">{{ formatFileSize(image.file_size) }} · {{ formatDate(image.created_at) }}</span>
            </div>
          </div>
          <el-image
            :src="image.file_path"
            :preview-src-list="imagePreviewList"
            fit="contain"
            class="image-preview"
          />
        </div>
      </div>
    </div>

    <!-- 音频附件 -->
    <div v-if="audioAttachments.length > 0" class="attachment-section">
      <h3 class="section-title">音频附件 ({{ audioAttachments.length }})</h3>
      <div class="attachment-list">
        <div v-for="audio in audioAttachments" :key="audio.id" class="attachment-item">
          <div class="attachment-info">
            <el-icon class="attachment-icon"><Headset /></el-icon>
            <div class="attachment-details">
              <span class="attachment-name">{{ audio.original_filename }}</span>
              <span class="attachment-meta">{{ formatFileSize(audio.file_size) }} · {{ formatDate(audio.created_at) }}</span>
            </div>
          </div>
          <audio controls class="audio-player">
            <source :src="audio.file_path" :type="audio.mime_type">
            您的浏览器不支持音频播放
          </audio>
        </div>
      </div>
    </div>

    <!-- 视频附件 -->
    <div v-if="videoAttachments.length > 0" class="attachment-section">
      <h3 class="section-title">视频附件 ({{ videoAttachments.length }})</h3>
      <div class="video-list">
        <div v-for="video in videoAttachments" :key="video.id" class="video-item">
          <div class="video-info">
            <el-icon class="attachment-icon"><VideoCamera /></el-icon>
            <span class="attachment-name">{{ video.original_filename }}</span>
            <span class="attachment-meta">{{ formatFileSize(video.file_size) }} · {{ formatDate(video.created_at) }}</span>
          </div>
          <video controls class="video-player">
            <source :src="video.file_path" :type="video.mime_type">
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>
    </div>

    <!-- 无附件提示 -->
    <el-empty v-if="!hasAttachments" description="暂无附件" />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Headset, VideoCamera, Picture } from '@element-plus/icons-vue'
import type { Story, Attachment } from '@/types'

const props = withDefaults(defineProps<{
  story: Story | null
  imageAttachments?: Attachment[]
  audioAttachments?: Attachment[]
  videoAttachments?: Attachment[]
}>(), {
  imageAttachments: () => [],
  audioAttachments: () => [],
  videoAttachments: () => [],
})

const drawerVisible = ref(false)

const hasAttachments = computed(() => {
  return props.imageAttachments.length > 0 || props.audioAttachments.length > 0 || props.videoAttachments.length > 0
})

const totalCount = computed(() => {
  return props.imageAttachments.length + props.audioAttachments.length + props.videoAttachments.length
})

const imagePreviewList = computed(() => {
  return props.imageAttachments.map(img => img.file_path)
})

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待处理', in_progress: '进行中', completed: '已完成',
  }
  return texts[status] || status
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}
</script>

<style scoped lang="scss">
.info-card {
  margin-bottom: 24px;
}

.description-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

// 附件抽屉样式
.attachment-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color);
}

// 图片附件样式
.image-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.image-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

// 音频附件样式
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attachment-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.attachment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.attachment-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 4px;
}

// 视频附件样式
.video-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.video-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.video-player {
  width: 100%;
  border-radius: 8px;
  background-color: #000;
}
</style>