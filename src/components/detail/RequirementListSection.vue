<template>
  <el-card shadow="never" class="list-card">
    <template #header>
      <div class="card-header">
        <span>关联需求 ({{ requirements.length }})</span>
      </div>
    </template>
    <el-table :data="requirements" style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link type="primary" @click="$emit('view-requirement', row.id)">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getReqStatusType(row.status)" size="small">
            {{ getReqStatusText(row.status) }}
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
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import type { Requirement } from '@/types'

withDefaults(defineProps<{
  requirements: Requirement[]
}>(), {
  requirements: () => [],
})

defineEmits<{
  (e: 'view-requirement', requirementId: number): void
}>()

function getReqStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    pending_confirmation: 'info', wait_split: 'warning', in_progress: 'primary', completed: 'success',
  }
  return types[status] || 'info'
}

function getReqStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending_confirmation: '待确认', wait_split: '待拆解', in_progress: '开发中', completed: '已完成',
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