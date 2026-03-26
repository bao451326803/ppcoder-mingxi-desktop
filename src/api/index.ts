/**
 * API 服务层
 * 通过 USE_MOCK 配置切换 mock 数据和真实接口
 */

// 是否使用 Mock 数据（开发阶段设为 true，接口开发完成后设为 false）
const USE_MOCK = true

// 动态导入 mock 或真实 API
async function getApi() {
  if (USE_MOCK) {
    return import('@/mock')
  }
  return import('@/api/real')
}

// ==================== 统一导出的 API 接口 ====================

// 认证相关
export const authApi = {
  async login(username: string, password: string) {
    const api = await getApi()
    return api.mockAuthApi.login(username, password)
  },

  async register(username: string, password: string, email: string) {
    const api = await getApi()
    return api.mockAuthApi.register(username, password, email)
  },
}

// 用户相关
export const userApi = {
  async me() {
    const api = await getApi()
    return api.mockUserApi.me()
  },

  async updatePassword(oldPassword: string, newPassword: string) {
    const api = await getApi()
    return api.mockUserApi.updatePassword(oldPassword, newPassword)
  },

  async list(params?: { page?: number; page_size?: number; keyword?: string; status?: string }) {
    const api = await getApi()
    return api.mockUserApi.list(params)
  },

  async create(data: { username: string; password: string; email: string }) {
    const api = await getApi()
    return api.mockUserApi.create(data)
  },

  async toggleStatus(userId: number) {
    const api = await getApi()
    return api.mockUserApi.toggleStatus(userId)
  },
}

// 项目相关
export const projectApi = {
  async list(params?: { page?: number; page_size?: number; status?: string; keyword?: string; member_only?: boolean }) {
    const api = await getApi()
    return api.mockProjectApi.list(params)
  },

  async create(data: import('@/types').ProjectCreateParams) {
    const api = await getApi()
    return api.mockProjectApi.create(data)
  },

  async get(projectId: number) {
    const api = await getApi()
    return api.mockProjectApi.get(projectId)
  },

  async update(projectId: number, data: import('@/types').ProjectUpdateParams) {
    const api = await getApi()
    return api.mockProjectApi.update(projectId, data)
  },

  async delete(projectId: number) {
    const api = await getApi()
    return api.mockProjectApi.delete(projectId)
  },

  async members(projectId: number, params?: { page?: number; page_size?: number }) {
    const api = await getApi()
    return api.mockProjectApi.members(projectId, params)
  },

  async addMember(projectId: number, userId: number) {
    const api = await getApi()
    return api.mockProjectApi.addMember(projectId, userId)
  },

  async removeMember(projectId: number, userId: number) {
    const api = await getApi()
    return api.mockProjectApi.removeMember(projectId, userId)
  },

  async setOwner(projectId: number, userId: number) {
    const api = await getApi()
    return api.mockProjectApi.setOwner(projectId, userId)
  },
}

// 故事相关
export const storyApi = {
  async list(projectId: number, params?: import('@/types').StoryListParams) {
    const api = await getApi()
    return api.mockStoryApi.list(projectId, params)
  },

  async listMyStories(params?: import('@/types').StoryListParams) {
    const api = await getApi()
    return api.mockStoryApi.listMyStories(params)
  },

  async create(projectId: number, data: import('@/types').StoryCreateParams) {
    const api = await getApi()
    return api.mockStoryApi.create(projectId, data)
  },

  async get(projectId: number, storyId: number) {
    const api = await getApi()
    return api.mockStoryApi.get(projectId, storyId)
  },

  async update(projectId: number, storyId: number, data: import('@/types').StoryUpdateParams) {
    const api = await getApi()
    return api.mockStoryApi.update(projectId, storyId, data)
  },

  async delete(projectId: number, storyId: number) {
    const api = await getApi()
    return api.mockStoryApi.delete(projectId, storyId)
  },
}

// 需求相关
export const requirementApi = {
  async list(projectId: number, params?: import('@/types').RequirementListParams) {
    const api = await getApi()
    return api.mockRequirementApi.list(projectId, params)
  },

  async listMyRequirements(params?: import('@/types').RequirementListParams) {
    const api = await getApi()
    return api.mockRequirementApi.listMyRequirements(params)
  },

  async create(projectId: number, data: import('@/types').RequirementCreateParams) {
    const api = await getApi()
    return api.mockRequirementApi.create(projectId, data)
  },

  async get(projectId: number, requirementId: number) {
    const api = await getApi()
    return api.mockRequirementApi.get(projectId, requirementId)
  },

  async update(projectId: number, requirementId: number, data: import('@/types').RequirementUpdateParams) {
    const api = await getApi()
    return api.mockRequirementApi.update(projectId, requirementId, data)
  },

  async delete(projectId: number, requirementId: number) {
    const api = await getApi()
    return api.mockRequirementApi.delete(projectId, requirementId)
  },
}

// 任务相关
export const taskApi = {
  async list(projectId: number, params?: import('@/types').TaskListParams) {
    const api = await getApi()
    return api.mockTaskApi.list(projectId, params)
  },

  async listMyTasks(params?: import('@/types').TaskListParams) {
    const api = await getApi()
    return api.mockTaskApi.listMyTasks(params)
  },

  async create(projectId: number, data: import('@/types').TaskCreateParams) {
    const api = await getApi()
    return api.mockTaskApi.create(projectId, data)
  },

  async get(projectId: number, taskId: number) {
    const api = await getApi()
    return api.mockTaskApi.get(projectId, taskId)
  },

  async update(projectId: number, taskId: number, data: import('@/types').TaskUpdateParams) {
    const api = await getApi()
    return api.mockTaskApi.update(projectId, taskId, data)
  },

  async delete(projectId: number, taskId: number) {
    const api = await getApi()
    return api.mockTaskApi.delete(projectId, taskId)
  },
}

// 评论相关
export const commentApi = {
  async list(params: import('@/types').CommentListParams) {
    const api = await getApi()
    return api.mockCommentApi.list(params)
  },

  async create(data: import('@/types').CommentCreateParams) {
    const api = await getApi()
    return api.mockCommentApi.create(data)
  },

  async get(commentId: number) {
    const api = await getApi()
    return api.mockCommentApi.get(commentId)
  },

  async update(commentId: number, data: import('@/types').CommentUpdateParams) {
    const api = await getApi()
    return api.mockCommentApi.update(commentId, data)
  },

  async delete(commentId: number) {
    const api = await getApi()
    return api.mockCommentApi.delete(commentId)
  },
}

// 附件相关
export const attachmentApi = {
  async upload(file: File, targetType: 'story' | 'requirement' | 'task', targetId: number) {
    const api = await getApi()
    return api.mockAttachmentApi.upload(file, targetType, targetId)
  },

  async list(params: import('@/types').AttachmentListParams) {
    const api = await getApi()
    return api.mockAttachmentApi.list(params)
  },

  async delete(attId: number) {
    const api = await getApi()
    return api.mockAttachmentApi.delete(attId)
  },
}

// 代码库相关
export const repositoryApi = {
  async list() {
    const api = await getApi()
    return api.mockRepositoryApi.list()
  },

  async create(data: import('@/types').RepositoryCreateParams) {
    const api = await getApi()
    return api.mockRepositoryApi.create(data)
  },

  async get(id: number) {
    const api = await getApi()
    return api.mockRepositoryApi.get(id)
  },

  async update(id: number, data: import('@/types').RepositoryUpdateParams) {
    const api = await getApi()
    return api.mockRepositoryApi.update(id, data)
  },

  async delete(id: number) {
    const api = await getApi()
    return api.mockRepositoryApi.delete(id)
  },
}

// Token 管理
export function setToken(token: string): void {
  localStorage.setItem('access_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('access_token')
}