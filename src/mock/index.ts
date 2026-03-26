/**
 * Mock API 服务层
 * 模拟所有后端API接口，方便前端开发和测试
 * 后续可通过修改 USE_MOCK 配置切换到真实接口
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
  Repository,
  ProjectCreateParams,
  ProjectUpdateParams,
  StoryCreateParams,
  StoryUpdateParams,
  RequirementCreateParams,
  RequirementUpdateParams,
  TaskCreateParams,
  TaskUpdateParams,
  CommentCreateParams,
  CommentUpdateParams,
  RepositoryCreateParams,
  RepositoryUpdateParams,
} from '@/types'

import {
  mockUsers,
  mockProjects,
  mockProjectMembers,
  mockStories,
  mockRequirements,
  mockTasks,
  mockAttachments,
  mockComments,
  mockCredentials,
  mockRepositories,
} from './data'

// ==================== 工具函数 ====================

// 模拟网络延迟
function delay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 生成成功响应
function success<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

// 生成错误响应
function error(message: string): ApiResponse<never> {
  return { code: -1, message, data: undefined as never }
}

// 生成分页数据
function paginate<T>(items: T[], page: number = 1, pageSize: number = 10): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)
  return {
    items: paginatedItems,
    total: items.length,
    page,
    page_size: pageSize,
    pages: Math.ceil(items.length / pageSize),
  }
}

// 模拟自增ID
let nextId = 1000
function generateId(): number {
  return ++nextId
}

// ==================== Mock API 实现 ====================

// ----- 认证相关 -----
let currentUser: User | null = null

export const mockAuthApi = {
  async login(username: string, password: string): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    await delay()
    const credential = mockCredentials[username]
    if (!credential || credential.password !== password) {
      return error('用户名或密码错误')
    }
    currentUser = credential.user
    return success({
      access_token: `mock_token_${username}_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 86400,
    })
  },

  async register(username: string, password: string, email: string): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    await delay()
    // 检查用户名是否存在
    if (mockCredentials[username]) {
      return error('用户名已存在')
    }
    // 检查邮箱是否存在
    if (mockUsers.some(u => u.email === email)) {
      return error('邮箱已被注册')
    }
    // 创建新用户
    const newUser: User = {
      id: generateId(),
      username,
      email,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    mockCredentials[username] = { password, user: newUser }
    currentUser = newUser
    return success({
      access_token: `mock_token_${username}_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 86400,
    })
  },
}

// ----- 用户相关 -----
export const mockUserApi = {
  async me(): Promise<ApiResponse<User>> {
    await delay(100)
    if (!currentUser) {
      return error('未登录')
    }
    return success(currentUser)
  },

  async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    await delay()
    if (!currentUser) {
      return error('未登录')
    }
    const credential = mockCredentials[currentUser.username]
    if (credential.password !== oldPassword) {
      return error('原密码错误')
    }
    credential.password = newPassword
    return success(null)
  },

  async list(params?: { page?: number; page_size?: number; keyword?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay()
    let items = [...mockUsers]

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(u =>
        u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      )
    }

    if (params?.status) {
      items = items.filter(u => u.status === params.status)
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async create(data: { username: string; password: string; email: string }): Promise<ApiResponse<User>> {
    await delay()
    if (mockCredentials[data.username]) {
      return error('用户名已存在')
    }
    if (mockUsers.some(u => u.email === data.email)) {
      return error('邮箱已被注册')
    }
    const newUser: User = {
      id: generateId(),
      username: data.username,
      email: data.email,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    mockCredentials[data.username] = { password: data.password, user: newUser }
    return success(newUser)
  },

  async toggleStatus(userId: number): Promise<ApiResponse<User>> {
    await delay()
    const index = mockUsers.findIndex(u => u.id === userId)
    if (index === -1) {
      return error('用户不存在')
    }
    mockUsers[index].status = mockUsers[index].status === 'active' ? 'disabled' : 'active'
    mockUsers[index].updated_at = new Date().toISOString()
    return success(mockUsers[index])
  },
}

// ----- 项目相关 -----
export const mockProjectApi = {
  async list(params?: { page?: number; page_size?: number; status?: string; keyword?: string; member_only?: boolean }): Promise<ApiResponse<PaginatedResponse<Project>>> {
    await delay()
    let items = [...mockProjects]

    // 筛选我参与的项目
    if (params?.member_only && currentUser) {
      const myProjectIds = new Set<number>()
      Object.entries(mockProjectMembers).forEach(([projectId, members]) => {
        if (members.some(m => m.user_id === currentUser!.id)) {
          myProjectIds.add(Number(projectId))
        }
      })
      items = items.filter(p => myProjectIds.has(p.id))
    }

    if (params?.status) {
      items = items.filter(p => p.status === params.status)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        (p.description?.toLowerCase().includes(keyword))
      )
    }

    // 优先展示进行中的项目
    const statusPriority: Record<string, number> = { active: 0, planning: 1, completed: 2, archived: 3 }
    items.sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

    return success(paginate(items, params?.page, params?.page_size))
  },

  async create(data: ProjectCreateParams): Promise<ApiResponse<Project>> {
    await delay()
    const project: Project = {
      id: generateId(),
      name: data.name,
      description: data.description || null,
      status: data.status || 'planning',
      planned_start_date: data.planned_start_date || null,
      planned_end_date: data.planned_end_date || null,
      actual_start_date: null,
      actual_end_date: null,
      owner_id: currentUser?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockProjects.push(project)
    mockProjectMembers[project.id] = [{
      id: generateId(),
      user_id: currentUser?.id || 1,
      username: currentUser?.username || 'admin',
      email: currentUser?.email || 'admin@example.com',
      is_owner: true,
      joined_at: new Date().toISOString(),
    }]
    return success(project)
  },

  async get(projectId: number): Promise<ApiResponse<Project>> {
    await delay(100)
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      return error('项目不存在')
    }
    return success(project)
  },

  async update(projectId: number, data: ProjectUpdateParams): Promise<ApiResponse<Project>> {
    await delay()
    const index = mockProjects.findIndex(p => p.id === projectId)
    if (index === -1) {
      return error('项目不存在')
    }
    const project = { ...mockProjects[index] }
    if (data.name !== undefined) project.name = data.name
    if (data.description !== undefined) project.description = data.description
    if (data.status !== undefined) project.status = data.status as Project['status']
    if (data.planned_start_date !== undefined) project.planned_start_date = data.planned_start_date
    if (data.planned_end_date !== undefined) project.planned_end_date = data.planned_end_date
    if (data.actual_start_date !== undefined) project.actual_start_date = data.actual_start_date
    if (data.actual_end_date !== undefined) project.actual_end_date = data.actual_end_date
    project.updated_at = new Date().toISOString()
    mockProjects[index] = project
    return success(project)
  },

  async delete(projectId: number): Promise<ApiResponse<null>> {
    await delay()
    const index = mockProjects.findIndex(p => p.id === projectId)
    if (index === -1) {
      return error('项目不存在')
    }
    mockProjects.splice(index, 1)
    delete mockProjectMembers[projectId]
    delete mockStories[projectId]
    delete mockRequirements[projectId]
    delete mockTasks[projectId]
    return success(null)
  },

  async members(projectId: number, params?: { page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<ProjectMember>>> {
    await delay(100)
    const members = mockProjectMembers[projectId] || []
    return success(paginate(members, params?.page, params?.page_size))
  },

  async addMember(projectId: number, userId: number): Promise<ApiResponse<ProjectMember>> {
    await delay()
    const members = mockProjectMembers[projectId] || []
    if (members.some(m => m.user_id === userId)) {
      return error('该用户已是项目成员')
    }
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      return error('用户不存在')
    }
    const member: ProjectMember = {
      id: generateId(),
      user_id: userId,
      username: user.username,
      email: user.email,
      is_owner: false,
      joined_at: new Date().toISOString(),
    }
    members.push(member)
    mockProjectMembers[projectId] = members
    return success(member)
  },

  async removeMember(projectId: number, userId: number): Promise<ApiResponse<null>> {
    await delay()
    const members = mockProjectMembers[projectId] || []
    const index = members.findIndex(m => m.user_id === userId)
    if (index === -1) {
      return error('成员不存在')
    }
    members.splice(index, 1)
    return success(null)
  },

  async setOwner(projectId: number, userId: number): Promise<ApiResponse<null>> {
    await delay()
    const members = mockProjectMembers[projectId] || []
    // 移除旧的owner
    members.forEach(m => m.is_owner = false)
    // 设置新的owner
    const member = members.find(m => m.user_id === userId)
    if (!member) {
      return error('成员不存在')
    }
    member.is_owner = true
    // 更新项目owner
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      project.owner_id = userId
    }
    return success(null)
  },
}

// ----- 故事相关 -----
export const mockStoryApi = {
  async list(projectId: number, params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string }): Promise<ApiResponse<PaginatedResponse<Story>>> {
    await delay()
    let items = [...(mockStories[projectId] || [])]

    if (params?.status) {
      items = items.filter(s => s.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(s => s.priority === params.priority)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(s =>
        s.title.toLowerCase().includes(keyword) ||
        (s.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async listMyStories(params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string }): Promise<ApiResponse<PaginatedResponse<Story & { project_name?: string; requirement_count?: number }>>> {
    await delay()
    let items: (Story & { project_name?: string; requirement_count?: number })[] = []

    // 获取用户参与的项目
    if (currentUser) {
      const myProjectIds = new Set<number>()
      Object.entries(mockProjectMembers).forEach(([projectId, members]) => {
        if (members.some(m => m.user_id === currentUser!.id)) {
          myProjectIds.add(Number(projectId))
        }
      })

      // 获取这些项目的故事
      myProjectIds.forEach(projectId => {
        const projectStories = mockStories[projectId] || []
        const project = mockProjects.find(p => p.id === projectId)
        projectStories.forEach(story => {
          // 计算该故事的需求数量
          const projectRequirements = mockRequirements[projectId] || []
          const reqCount = projectRequirements.filter(r => r.story_id === story.id).length
          items.push({
            ...story,
            project_name: project?.name,
            requirement_count: reqCount,
          })
        })
      })
    }

    // 状态优先排序
    const statusPriority: Record<string, number> = { in_progress: 0, pending: 1, completed: 2 }
    items.sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

    // 筛选
    if (params?.status) {
      items = items.filter(s => s.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(s => s.priority === params.priority)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(s =>
        s.title.toLowerCase().includes(keyword) ||
        (s.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async create(projectId: number, data: StoryCreateParams): Promise<ApiResponse<Story>> {
    await delay()
    const story: Story = {
      id: generateId(),
      project_id: projectId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      creator_id: currentUser?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (!mockStories[projectId]) {
      mockStories[projectId] = []
    }
    mockStories[projectId].push(story)
    return success(story)
  },

  async get(projectId: number, storyId: number): Promise<ApiResponse<Story>> {
    await delay(100)
    const stories = mockStories[projectId] || []
    const story = stories.find(s => s.id === storyId)
    if (!story) {
      return error('故事不存在')
    }
    return success(story)
  },

  async update(projectId: number, storyId: number, data: StoryUpdateParams): Promise<ApiResponse<Story>> {
    await delay()
    const stories = mockStories[projectId] || []
    const index = stories.findIndex(s => s.id === storyId)
    if (index === -1) {
      return error('故事不存在')
    }
    const story = { ...stories[index] }
    if (data.title !== undefined) story.title = data.title
    if (data.description !== undefined) story.description = data.description
    if (data.status !== undefined) story.status = data.status as Story['status']
    if (data.priority !== undefined) story.priority = data.priority as Story['priority']
    story.updated_at = new Date().toISOString()
    stories[index] = story
    return success(story)
  },

  async delete(projectId: number, storyId: number): Promise<ApiResponse<null>> {
    await delay()
    const stories = mockStories[projectId] || []
    const index = stories.findIndex(s => s.id === storyId)
    if (index === -1) {
      return error('故事不存在')
    }
    stories.splice(index, 1)
    return success(null)
  },
}

// ----- 需求相关 -----
export const mockRequirementApi = {
  async list(projectId: number, params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string }): Promise<ApiResponse<PaginatedResponse<Requirement>>> {
    await delay()
    let items = [...(mockRequirements[projectId] || [])]

    if (params?.status) {
      items = items.filter(r => r.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(r => r.priority === params.priority)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(r =>
        r.title.toLowerCase().includes(keyword) ||
        (r.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async listMyRequirements(params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string }): Promise<ApiResponse<PaginatedResponse<Requirement & { project_name?: string; story_title?: string; task_count?: number }>>> {
    await delay()
    let items: (Requirement & { project_name?: string; story_title?: string; task_count?: number })[] = []

    // 获取用户参与的项目
    if (currentUser) {
      const myProjectIds = new Set<number>()
      Object.entries(mockProjectMembers).forEach(([projectId, members]) => {
        if (members.some(m => m.user_id === currentUser!.id)) {
          myProjectIds.add(Number(projectId))
        }
      })

      // 获取这些项目的需求
      myProjectIds.forEach(projectId => {
        const projectRequirements = mockRequirements[projectId] || []
        const projectTasks = mockTasks[projectId] || []
        const project = mockProjects.find(p => p.id === projectId)
        projectRequirements.forEach(req => {
          const story = mockStories[projectId]?.find(s => s.id === req.story_id)
          const taskCount = projectTasks.filter(t => t.requirement_id === req.id).length
          items.push({
            ...req,
            project_name: project?.name,
            story_title: story?.title,
            task_count: taskCount,
          })
        })
      })
    }

    // 状态优先排序
    const statusPriority: Record<string, number> = { pending_confirmation: 0, wait_split: 1, in_progress: 2, completed: 3 }
    items.sort((a, b) => (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99))

    // 筛选
    if (params?.status) {
      items = items.filter(r => r.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(r => r.priority === params.priority)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(r =>
        r.title.toLowerCase().includes(keyword) ||
        (r.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async create(projectId: number, data: RequirementCreateParams): Promise<ApiResponse<Requirement>> {
    await delay()
    const requirement: Requirement = {
      id: generateId(),
      project_id: projectId,
      story_id: data.story_id || null,
      title: data.title,
      description: data.description || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      creator_id: currentUser?.id || 1,
      assignee_id: data.assignee_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (!mockRequirements[projectId]) {
      mockRequirements[projectId] = []
    }
    mockRequirements[projectId].push(requirement)
    return success(requirement)
  },

  async get(projectId: number, requirementId: number): Promise<ApiResponse<Requirement>> {
    await delay(100)
    const requirements = mockRequirements[projectId] || []
    const requirement = requirements.find(r => r.id === requirementId)
    if (!requirement) {
      return error('需求不存在')
    }
    return success(requirement)
  },

  async update(projectId: number, requirementId: number, data: RequirementUpdateParams): Promise<ApiResponse<Requirement>> {
    await delay()
    const requirements = mockRequirements[projectId] || []
    const index = requirements.findIndex(r => r.id === requirementId)
    if (index === -1) {
      return error('需求不存在')
    }
    const requirement = { ...requirements[index] }
    if (data.title !== undefined) requirement.title = data.title
    if (data.description !== undefined) requirement.description = data.description
    if (data.status !== undefined) requirement.status = data.status as Requirement['status']
    if (data.priority !== undefined) requirement.priority = data.priority as Requirement['priority']
    if (data.assignee_id !== undefined) requirement.assignee_id = data.assignee_id
    requirement.updated_at = new Date().toISOString()
    requirements[index] = requirement
    return success(requirement)
  },

  async delete(projectId: number, requirementId: number): Promise<ApiResponse<null>> {
    await delay()
    const requirements = mockRequirements[projectId] || []
    const index = requirements.findIndex(r => r.id === requirementId)
    if (index === -1) {
      return error('需求不存在')
    }
    requirements.splice(index, 1)
    return success(null)
  },
}

// ----- 任务相关 -----
export const mockTaskApi = {
  async list(projectId: number, params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string; requirement_id?: number; story_id?: number }): Promise<ApiResponse<PaginatedResponse<Task>>> {
    await delay()
    let items = [...(mockTasks[projectId] || [])]

    if (params?.status) {
      items = items.filter(t => t.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(t => t.priority === params.priority)
    }
    if (params?.requirement_id) {
      items = items.filter(t => t.requirement_id === params.requirement_id)
    }
    if (params?.story_id) {
      items = items.filter(t => t.story_id === params.story_id)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(t =>
        t.title.toLowerCase().includes(keyword) ||
        (t.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async listMyTasks(params?: { page?: number; page_size?: number; status?: string; priority?: string; keyword?: string }): Promise<ApiResponse<PaginatedResponse<Task & { project_name?: string }>>> {
    await delay()
    let items: (Task & { project_name?: string })[] = []

    // 获取用户参与的项目
    if (currentUser) {
      const myProjectIds = new Set<number>()
      Object.entries(mockProjectMembers).forEach(([projectId, members]) => {
        if (members.some(m => m.user_id === currentUser!.id)) {
          myProjectIds.add(Number(projectId))
        }
      })

      // 获取这些项目的任务
      myProjectIds.forEach(projectId => {
        const projectTasks = mockTasks[projectId] || []
        const project = mockProjects.find(p => p.id === projectId)
        projectTasks.forEach(task => {
          items.push({
            ...task,
            project_name: project?.name,
          })
        })
      })
    }

    // 状态优先排序
    const statusPriority: Record<string, number> = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 }
    items.sort((a, b) => (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99))

    // 筛选
    if (params?.status) {
      items = items.filter(t => t.status === params.status)
    }
    if (params?.priority) {
      items = items.filter(t => t.priority === params.priority)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      items = items.filter(t =>
        t.title.toLowerCase().includes(keyword) ||
        (t.description?.toLowerCase().includes(keyword))
      )
    }

    return success(paginate(items, params?.page, params?.page_size))
  },

  async create(projectId: number, data: TaskCreateParams): Promise<ApiResponse<Task>> {
    await delay()
    const task: Task = {
      id: generateId(),
      project_id: projectId,
      story_id: data.story_id || null,
      requirement_id: data.requirement_id || null,
      title: data.title,
      description: data.description || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      creator_id: currentUser?.id || 1,
      assignee_id: data.assignee_id || null,
      due_date: data.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (!mockTasks[projectId]) {
      mockTasks[projectId] = []
    }
    mockTasks[projectId].push(task)
    return success(task)
  },

  async get(projectId: number, taskId: number): Promise<ApiResponse<Task>> {
    await delay(100)
    const tasks = mockTasks[projectId] || []
    const task = tasks.find(t => t.id === taskId)
    if (!task) {
      return error('任务不存在')
    }
    return success(task)
  },

  async update(projectId: number, taskId: number, data: TaskUpdateParams): Promise<ApiResponse<Task>> {
    await delay()
    const tasks = mockTasks[projectId] || []
    const index = tasks.findIndex(t => t.id === taskId)
    if (index === -1) {
      return error('任务不存在')
    }
    const task = { ...tasks[index] }
    if (data.title !== undefined) task.title = data.title
    if (data.description !== undefined) task.description = data.description
    if (data.status !== undefined) task.status = data.status as Task['status']
    if (data.priority !== undefined) task.priority = data.priority as Task['priority']
    if (data.assignee_id !== undefined) task.assignee_id = data.assignee_id
    if (data.due_date !== undefined) task.due_date = data.due_date
    task.updated_at = new Date().toISOString()
    tasks[index] = task
    return success(task)
  },

  async delete(projectId: number, taskId: number): Promise<ApiResponse<null>> {
    await delay()
    const tasks = mockTasks[projectId] || []
    const index = tasks.findIndex(t => t.id === taskId)
    if (index === -1) {
      return error('任务不存在')
    }
    tasks.splice(index, 1)
    return success(null)
  },
}

// ----- 评论相关 -----
export const mockCommentApi = {
  async list(params: { target_type: string; target_id: number; page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    await delay()
    const items = mockComments.filter(c =>
      c.target_type === params.target_type && c.target_id === params.target_id
    )
    return success(paginate(items, params.page, params.page_size))
  },

  async create(data: CommentCreateParams): Promise<ApiResponse<Comment>> {
    await delay()
    const comment: Comment = {
      id: generateId(),
      content: data.content,
      target_type: data.target_type,
      target_id: data.target_id,
      parent_id: data.parent_id || null,
      author_id: currentUser?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockComments.push(comment)
    return success(comment)
  },

  async get(commentId: number): Promise<ApiResponse<Comment>> {
    await delay(100)
    const comment = mockComments.find(c => c.id === commentId)
    if (!comment) {
      return error('评论不存在')
    }
    return success(comment)
  },

  async update(commentId: number, data: CommentUpdateParams): Promise<ApiResponse<Comment>> {
    await delay()
    const index = mockComments.findIndex(c => c.id === commentId)
    if (index === -1) {
      return error('评论不存在')
    }
    const comment = { ...mockComments[index] }
    comment.content = data.content
    comment.updated_at = new Date().toISOString()
    mockComments[index] = comment
    return success(comment)
  },

  async delete(commentId: number): Promise<ApiResponse<null>> {
    await delay()
    const index = mockComments.findIndex(c => c.id === commentId)
    if (index === -1) {
      return error('评论不存在')
    }
    mockComments.splice(index, 1)
    return success(null)
  },
}

// ----- 附件相关 -----
export const mockAttachmentApi = {
  async list(params: { target_type: string; target_id: number; page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<Attachment>>> {
    await delay()
    const items = mockAttachments.filter(a =>
      a.target_type === params.target_type && a.target_id === params.target_id
    )
    return success(paginate(items, params.page, params.page_size))
  },

  async upload(file: File, targetType: string, targetId: number): Promise<ApiResponse<Attachment>> {
    await delay(500)
    const attachment: Attachment = {
      id: generateId(),
      filename: `file_${Date.now()}_${file.name}`,
      original_filename: file.name,
      file_path: `/uploads/${new Date().getFullYear()}/${file.name}`,
      file_size: file.size,
      mime_type: file.type,
      target_type: targetType as Attachment['target_type'],
      target_id: targetId,
      uploader_id: currentUser?.id || 1,
      created_at: new Date().toISOString(),
    }
    mockAttachments.push(attachment)
    return success(attachment)
  },

  async delete(attId: number): Promise<ApiResponse<null>> {
    await delay()
    const index = mockAttachments.findIndex(a => a.id === attId)
    if (index === -1) {
      return error('附件不存在')
    }
    mockAttachments.splice(index, 1)
    return success(null)
  },
}

// 设置当前用户（用于测试）
export function setCurrentUser(user: User | null) {
  currentUser = user
}

// 获取当前用户
export function getCurrentUser(): User | null {
  return currentUser
}

// ----- 代码库相关 -----
export const mockRepositoryApi = {
  async list(): Promise<ApiResponse<Repository[]>> {
    await delay()
    // 返回当前用户的代码库
    const items = mockRepositories.filter(r => r.user_id === currentUser?.id)
    return success(items)
  },

  async create(data: RepositoryCreateParams): Promise<ApiResponse<Repository>> {
    await delay()
    // 检查名称是否重复
    if (mockRepositories.some(r => r.user_id === currentUser?.id && r.name === data.name)) {
      return error('代码库名称已存在')
    }
    const repository: Repository = {
      id: generateId(),
      user_id: currentUser?.id || 1,
      name: data.name,
      local_path: data.local_path,
      description: data.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockRepositories.push(repository)
    return success(repository)
  },

  async get(id: number): Promise<ApiResponse<Repository>> {
    await delay(100)
    const repository = mockRepositories.find(r => r.id === id && r.user_id === currentUser?.id)
    if (!repository) {
      return error('代码库不存在')
    }
    return success(repository)
  },

  async update(id: number, data: RepositoryUpdateParams): Promise<ApiResponse<Repository>> {
    await delay()
    const index = mockRepositories.findIndex(r => r.id === id && r.user_id === currentUser?.id)
    if (index === -1) {
      return error('代码库不存在')
    }
    // 检查名称是否重复（排除自身）
    if (data.name && mockRepositories.some(r => r.user_id === currentUser?.id && r.name === data.name && r.id !== id)) {
      return error('代码库名称已存在')
    }
    const repository = { ...mockRepositories[index] }
    if (data.name !== undefined) repository.name = data.name
    if (data.local_path !== undefined) repository.local_path = data.local_path
    if (data.description !== undefined) repository.description = data.description
    repository.updated_at = new Date().toISOString()
    mockRepositories[index] = repository
    return success(repository)
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    await delay()
    const index = mockRepositories.findIndex(r => r.id === id && r.user_id === currentUser?.id)
    if (index === -1) {
      return error('代码库不存在')
    }
    mockRepositories.splice(index, 1)
    return success(null)
  },
}