<template>
  <el-card shadow="never" class="list-card">
    <template #header>
      <div class="card-header">
        <span>关联任务 ({{ tasks.length }})</span>
      </div>
    </template>
    <el-table :data="tasks" style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link type="primary" @click="$emit('view-task', row.id)">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getTaskStatusType(row.status)" size="small">
            {{ getTaskStatusText(row.status) }}
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
      <el-table-column label="截止日期" width="120">
        <template #default="{ row }">{{ row.due_date || '未设置' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column v-if="showActions" label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" :icon="View" @click="$emit('view-task', row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import type { Task } from '@/types'

withDefaults(defineProps<{
  tasks: Task[]
  showActions?: boolean
}>(), {
  tasks: () => [],
  showActions: true,
})

defineEmits<{
  (e: 'view-task', taskId: number): void
}>()

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
.list-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>