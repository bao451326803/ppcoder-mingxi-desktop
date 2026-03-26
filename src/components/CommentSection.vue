<template>
  <div class="comment-section">
    <!-- 评论列表 -->
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <el-avatar :size="32">{{ getAvatarText(comment.author_id) }}</el-avatar>
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">用户 {{ comment.author_id }}</span>
            <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div v-if="editingId === comment.id" class="comment-edit">
            <el-input
              v-model="editContent"
              type="textarea"
              :rows="2"
              placeholder="请输入评论内容"
            />
            <div class="edit-actions">
              <el-button size="small" @click="cancelEdit">取消</el-button>
              <el-button type="primary" size="small" :loading="submitting" @click="handleUpdate(comment.id)">
                保存
              </el-button>
            </div>
          </div>
          <div v-else class="comment-text">{{ comment.content }}</div>
          <div v-if="editingId !== comment.id" class="comment-actions">
            <el-button text size="small" :icon="Edit" @click="startEdit(comment)">编辑</el-button>
            <el-button v-if="allowDelete" text type="danger" size="small" :icon="Delete" @click="handleDelete(comment.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无评论" :image-size="60" />

    <!-- 添加评论 -->
    <div class="add-comment">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="2"
        placeholder="添加评论..."
      />
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!newComment.trim()"
        @click="handleCreate"
      >
        发表评论
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { commentApi } from '@/api'
import type { Comment } from '@/types'

const props = withDefaults(defineProps<{
  targetType: 'story' | 'requirement' | 'task'
  targetId: number
  allowDelete?: boolean
}>(), {
  allowDelete: true,
})

const comments = ref<Comment[]>([])
const newComment = ref('')
const editContent = ref('')
const editingId = ref<number | null>(null)
const submitting = ref(false)

onMounted(() => {
  fetchComments()
})

async function fetchComments() {
  try {
    const res = await commentApi.list({
      target_type: props.targetType,
      target_id: props.targetId,
      page_size: 100,
    })
    if (res.code === 0) {
      comments.value = res.data.items
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

async function handleCreate() {
  if (!newComment.value.trim()) return

  submitting.value = true
  try {
    const res = await commentApi.create({
      content: newComment.value,
      target_type: props.targetType,
      target_id: props.targetId,
    })
    if (res.code === 0) {
      newComment.value = ''
      ElMessage.success('评论发表成功')
      fetchComments()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '发表失败')
  } finally {
    submitting.value = false
  }
}

function startEdit(comment: Comment) {
  editingId.value = comment.id
  editContent.value = comment.content
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

async function handleUpdate(commentId: number) {
  if (!editContent.value.trim()) return

  submitting.value = true
  try {
    const res = await commentApi.update(commentId, { content: editContent.value })
    if (res.code === 0) {
      ElMessage.success('评论更新成功')
      cancelEdit()
      fetchComments()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(commentId: number) {
  await ElMessageBox.confirm('确定要删除这条评论吗？', '删除确认', { type: 'warning' })
  try {
    const res = await commentApi.delete(commentId)
    if (res.code === 0) {
      ElMessage.success('评论删除成功')
      fetchComments()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function getAvatarText(authorId: number): string {
  return String(authorId).charAt(0).toUpperCase()
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.comment-section {
  .comment-list {
    margin-bottom: 20px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-avatar {
    flex-shrink: 0;
  }

  .comment-content {
    flex: 1;
    min-width: 0;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .comment-author {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .comment-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .comment-text {
    color: var(--el-text-color-regular);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .comment-edit {
    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
  }

  .comment-actions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
  }

  .add-comment {
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
}
</style>