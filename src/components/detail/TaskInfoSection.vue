<template>
  <el-card shadow="never" class="info-card">
    <template #header>
      <span>任务信息</span>
    </template>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题">{{ task?.title }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ getStatusText(task?.status || '') }}</el-descriptions-item>
      <el-descriptions-item label="优先级">{{ getPriorityText(task?.priority || '') }}</el-descriptions-item>
      <el-descriptions-item label="截止日期">{{ task?.due_date || '未设置' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(task?.created_at) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatDate(task?.updated_at) }}</el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        <div class="description-content">{{ task?.description || '暂无描述' }}</div>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

defineProps<{
  task: Task | null
}>()

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
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
</style>