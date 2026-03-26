<template>
  <div class="story-edit-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="router.back()">返回</el-button>
        <h1 class="page-title">编辑故事</h1>
      </div>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" style="max-width: 600px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入故事标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入故事描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%;">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { storyApi } from '@/api'
import type { StoryUpdateParams } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.projectId)
const storyId = Number(route.params.storyId)

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive<StoryUpdateParams>({
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
  fetchStory()
})

async function fetchStory() {
  loading.value = true
  try {
    const res = await storyApi.get(projectId, storyId)
    if (res.code === 0) {
      Object.assign(form, {
        title: res.data.title,
        description: res.data.description || '',
        status: res.data.status,
        priority: res.data.priority,
      })
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取故事信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await storyApi.update(projectId, storyId, form)
    if (res.code === 0) {
      ElMessage.success('故事更新成功')
      router.back()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.story-edit-page {
  max-width: 800px;
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