// API 基础类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// 认证相关类型
export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
}

export interface TokenData {
  access_token: string
  token_type: string
  expires_in: number
}

export interface UpdatePasswordParams {
  old_password: string
  new_password: string
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  status: 'active' | 'disabled'
  created_at: string
  updated_at: string
}

// 项目相关类型
export interface Project {
  id: number
  name: string
  description: string | null
  status: 'planning' | 'active' | 'completed' | 'archived'
  planned_start_date: string | null
  planned_end_date: string | null
  actual_start_date: string | null
  actual_end_date: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

export interface ProjectCreateParams {
  name: string
  description?: string
  status?: 'planning' | 'active' | 'completed' | 'archived'
  planned_start_date?: string
  planned_end_date?: string
}

export interface ProjectUpdateParams {
  name?: string
  description?: string
  status?: string
  planned_start_date?: string
  planned_end_date?: string
  actual_start_date?: string
  actual_end_date?: string
}

export interface ProjectMember {
  id: number
  user_id: number
  username: string
  email: string
  is_owner: boolean
  joined_at: string | null
}

export interface ProjectListParams {
  page?: number
  page_size?: number
  status?: string
  keyword?: string
}

export interface AddMemberParams {
  user_id: number
}

// 故事相关类型
export interface Story {
  id: number
  project_id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  creator_id: number
  created_at: string
  updated_at: string
}

export interface StoryCreateParams {
  title: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface StoryUpdateParams {
  title?: string
  description?: string
  status?: string
  priority?: string
}

export interface StoryListParams {
  page?: number
  page_size?: number
  status?: string
  priority?: string
  keyword?: string
}

// 需求相关类型 (基于文档推断)
export interface Requirement {
  id: number
  project_id: number
  story_id: number | null
  title: string
  description: string | null
  status: 'pending_confirmation' | 'wait_split' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  creator_id: number
  assignee_id: number | null
  created_at: string
  updated_at: string
}

export interface RequirementCreateParams {
  title: string
  description?: string
  story_id?: number
  status?: 'pending_confirmation' | 'wait_split' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: number
}

export interface RequirementUpdateParams {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignee_id?: number
}

export interface RequirementListParams {
  page?: number
  page_size?: number
  status?: string
  priority?: string
  story_id?: number
  keyword?: string
}

// 任务相关类型 (基于文档推断)
export interface Task {
  id: number
  project_id: number
  story_id: number | null
  requirement_id: number | null
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  creator_id: number
  assignee_id: number | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskCreateParams {
  title: string
  description?: string
  story_id?: number
  requirement_id?: number
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: number
  due_date?: string
}

export interface TaskUpdateParams {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignee_id?: number
  due_date?: string
}

export interface TaskListParams {
  page?: number
  page_size?: number
  status?: string
  priority?: string
  story_id?: number
  requirement_id?: number
  keyword?: string
}

// 附件相关类型
export interface Attachment {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  target_type: 'story' | 'requirement' | 'task'
  target_id: number
  uploader_id: number
  created_at: string
}

export interface AttachmentListParams {
  target_type: 'story' | 'requirement' | 'task'
  target_id: number
  page?: number
  page_size?: number
}

// 评论相关类型
export interface Comment {
  id: number
  content: string
  target_type: 'story' | 'requirement' | 'task'
  target_id: number
  parent_id: number | null
  author_id: number
  created_at: string
  updated_at: string
}

export interface CommentCreateParams {
  content: string
  target_type: 'story' | 'requirement' | 'task'
  target_id: number
  parent_id?: number
}

export interface CommentUpdateParams {
  content: string
}

export interface CommentListParams {
  target_type: 'story' | 'requirement' | 'task'
  target_id: number
  page?: number
  page_size?: number
}

// 错误类型
export interface ApiError {
  code: string
  message: string
}

// 代码库相关类型
export interface Repository {
  id: number
  user_id: number
  name: string
  local_path: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface RepositoryCreateParams {
  name: string
  local_path: string
  description?: string
}

export interface RepositoryUpdateParams {
  name?: string
  local_path?: string
  description?: string
}