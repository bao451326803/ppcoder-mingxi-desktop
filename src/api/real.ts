/**
 * 真实 API 服务层
 * 当 USE_MOCK = false 时使用此文件中的 API 实现
 */

import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Project,
  ProjectMember,
  Story,
  Requirement,
  Task,
  Attachment,
  Comment,
  ProjectCreateParams,
  ProjectUpdateParams,
  StoryCreateParams,
  StoryUpdateParams,
  StoryListParams,
  RequirementCreateParams,
  RequirementUpdateParams,
  RequirementListParams,
  TaskCreateParams,
  TaskUpdateParams,
  TaskListParams,
  CommentCreateParams,
  CommentUpdateParams,
  CommentListParams,
  AttachmentListParams,
} from '@/types'

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem('access_token')
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data: ApiResponse<T> = await response.json()
  return data
}

// GET 请求
async function get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  let url = endpoint
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  return request<T>(url)
}

// POST 请求
async function post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// PUT 请求
async function put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// DELETE 请求
async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'DELETE',
  })
}

// ==================== 认证 API ====================
export const mockAuthApi = {
  async login(username: string, password: string) {
    return post<{ access_token: string; token_type: string; expires_in: number }>(
      '/api/v1/users/login',
      { username, password }
    )
  },

  async register(username: string, password: string, email: string) {
    return post<{ access_token: string; token_type: string; expires_in: number }>(
      '/api/v1/users/register',
      { username, password, email }
    )
  },
}

// ==================== 用户 API ====================
export const mockUserApi = {
  async me() {
    return get<User>('/api/v1/users/me')
  },

  async updatePassword(oldPassword: string, newPassword: string) {
    return put('/api/v1/users/password', { old_password: oldPassword, new_password: newPassword })
  },

  async list(params?: { page?: number; page_size?: number; keyword?: string; status?: string }) {
    return get<PaginatedResponse<User>>('/api/v1/users', params as Record<string, unknown>)
  },

  async create(data: { username: string; password: string; email: string }) {
    return post<User>('/api/v1/users', data)
  },

  async toggleStatus(userId: number) {
    return put<User>(`/api/v1/users/${userId}/status`, {})
  },
}

// ==================== 项目 API ====================
export const mockProjectApi = {
  async list(params?: { page?: number; page_size?: number; status?: string; keyword?: string }) {
    return get<PaginatedResponse<Project>>('/api/v1/projects/', params)
  },

  async create(data: ProjectCreateParams) {
    return post<Project>('/api/v1/projects/', data)
  },

  async get(projectId: number) {
    return get<Project>(`/api/v1/projects/${projectId}`)
  },

  async update(projectId: number, data: ProjectUpdateParams) {
    return put<Project>(`/api/v1/projects/${projectId}`, data)
  },

  async delete(projectId: number) {
    return del(`/api/v1/projects/${projectId}`)
  },

  async members(projectId: number, params?: { page?: number; page_size?: number }) {
    return get<PaginatedResponse<ProjectMember>>(`/api/v1/projects/${projectId}/members`, params)
  },

  async addMember(projectId: number, userId: number) {
    return post<ProjectMember>(`/api/v1/projects/${projectId}/members`, { user_id: userId })
  },

  async removeMember(projectId: number, userId: number) {
    return del(`/api/v1/projects/${projectId}/members/${userId}`)
  },

  async setOwner(projectId: number, userId: number) {
    return put(`/api/v1/projects/${projectId}/members/${userId}/owner`)
  },
}

// ==================== 故事 API ====================
export const mockStoryApi = {
  async list(projectId: number, params?: StoryListParams) {
    return get<PaginatedResponse<Story>>(`/projects/${projectId}/stories/`, params)
  },

  async listMyStories(params?: StoryListParams) {
    return get<PaginatedResponse<Story & { project_name?: string; requirement_count?: number }>>('/api/v1/users/me/stories/', params as Record<string, unknown>)
  },

  async create(projectId: number, data: StoryCreateParams) {
    return post<Story>(`/projects/${projectId}/stories/`, data)
  },

  async get(projectId: number, storyId: number) {
    return get<Story>(`/projects/${projectId}/stories/${storyId}`)
  },

  async update(projectId: number, storyId: number, data: StoryUpdateParams) {
    return put<Story>(`/projects/${projectId}/stories/${storyId}`, data)
  },

  async delete(projectId: number, storyId: number) {
    return del(`/projects/${projectId}/stories/${storyId}`)
  },
}

// ==================== 需求 API ====================
export const mockRequirementApi = {
  async list(projectId: number, params?: RequirementListParams) {
    return get<PaginatedResponse<Requirement>>(`/api/v1/projects/${projectId}/requirements/`, params)
  },

  async listMyRequirements(params?: RequirementListParams) {
    return get<PaginatedResponse<Requirement & { project_name?: string; story_title?: string; task_count?: number }>>('/api/v1/users/me/requirements/', params as Record<string, unknown>)
  },

  async create(projectId: number, data: RequirementCreateParams) {
    return post<Requirement>(`/api/v1/projects/${projectId}/requirements/`, data)
  },

  async get(projectId: number, requirementId: number) {
    return get<Requirement>(`/api/v1/projects/${projectId}/requirements/${requirementId}`)
  },

  async update(projectId: number, requirementId: number, data: RequirementUpdateParams) {
    return put<Requirement>(`/api/v1/projects/${projectId}/requirements/${requirementId}`, data)
  },

  async delete(projectId: number, requirementId: number) {
    return del(`/api/v1/projects/${projectId}/requirements/${requirementId}`)
  },
}

// ==================== 任务 API ====================
export const mockTaskApi = {
  async list(projectId: number, params?: TaskListParams) {
    return get<PaginatedResponse<Task>>(`/api/v1/projects/${projectId}/tasks/`, params)
  },

  async listMyTasks(params?: TaskListParams) {
    return get<PaginatedResponse<Task & { project_name?: string }>>('/api/v1/users/me/tasks/', params as Record<string, unknown>)
  },

  async create(projectId: number, data: TaskCreateParams) {
    return post<Task>(`/api/v1/projects/${projectId}/tasks/`, data)
  },

  async get(projectId: number, taskId: number) {
    return get<Task>(`/api/v1/projects/${projectId}/tasks/${taskId}`)
  },

  async update(projectId: number, taskId: number, data: TaskUpdateParams) {
    return put<Task>(`/api/v1/projects/${projectId}/tasks/${taskId}`, data)
  },

  async delete(projectId: number, taskId: number) {
    return del(`/api/v1/projects/${projectId}/tasks/${taskId}`)
  },
}

// ==================== 评论 API ====================
export const mockCommentApi = {
  async list(params: CommentListParams) {
    return get<PaginatedResponse<Comment>>('/api/v1/comments/', params)
  },

  async create(data: CommentCreateParams) {
    return post<Comment>('/api/v1/comments/', data)
  },

  async get(commentId: number) {
    return get<Comment>(`/api/v1/comments/${commentId}`)
  },

  async update(commentId: number, data: CommentUpdateParams) {
    return put<Comment>(`/api/v1/comments/${commentId}`, data)
  },

  async delete(commentId: number) {
    return del(`/api/v1/comments/${commentId}`)
  },
}

// ==================== 附件 API ====================
export const mockAttachmentApi = {
  async upload(file: File, targetType: 'story' | 'requirement' | 'task', targetId: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_type', targetType)
    formData.append('target_id', String(targetId))

    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/api/v1/attachments/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const data: ApiResponse<Attachment> = await response.json()
    return data
  },

  async list(params: AttachmentListParams) {
    return get<PaginatedResponse<Attachment>>('/api/v1/attachments/', params)
  },

  async delete(attId: number) {
    return del(`/api/v1/attachments/${attId}`)
  },
}