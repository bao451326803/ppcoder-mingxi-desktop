import { defineStore } from 'pinia'
import { ref } from 'vue'
import { repositoryApi } from '@/api'
import type { Repository, RepositoryCreateParams, RepositoryUpdateParams } from '@/types'

export const useRepositoryStore = defineStore('repository', () => {
  // 代码库列表
  const repositories = ref<Repository[]>([])

  // 加载状态
  const loading = ref(false)

  // 错误信息
  const error = ref<string | null>(null)

  // 获取代码库列表
  async function fetchRepositories() {
    loading.value = true
    error.value = null
    try {
      const res = await repositoryApi.list()
      if (res.code === 0) {
        repositories.value = res.data
      } else {
        error.value = res.message
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取代码库列表失败'
    } finally {
      loading.value = false
    }
  }

  // 创建代码库
  async function createRepository(params: RepositoryCreateParams): Promise<Repository> {
    const res = await repositoryApi.create(params)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    repositories.value.push(res.data)
    return res.data
  }

  // 更新代码库
  async function updateRepository(id: number, params: RepositoryUpdateParams): Promise<Repository> {
    const res = await repositoryApi.update(id, params)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    const index = repositories.value.findIndex(r => r.id === id)
    if (index !== -1) {
      repositories.value[index] = res.data
    }
    return res.data
  }

  // 删除代码库
  async function deleteRepository(id: number): Promise<void> {
    const res = await repositoryApi.delete(id)
    if (res.code !== 0) {
      throw new Error(res.message)
    }
    repositories.value = repositories.value.filter(r => r.id !== id)
  }

  // 检查名称是否存在
  function isNameExists(name: string, excludeId?: number): boolean {
    return repositories.value.some(r => r.name === name && r.id !== excludeId)
  }

  return {
    repositories,
    loading,
    error,
    fetchRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    isNameExists,
  }
})