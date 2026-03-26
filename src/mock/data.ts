// Mock 数据配置
import type {
  User,
  Project,
  ProjectMember,
  Story,
  Requirement,
  Task,
  Attachment,
  Comment,
  Repository,
} from '@/types'

// ==================== 用户数据 ====================
export const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', status: 'active', created_at: '2024-01-01T00:00:00', updated_at: '2024-01-01T00:00:00' },
  { id: 2, username: 'zhangsan', email: 'zhangsan@example.com', status: 'active', created_at: '2024-01-15T00:00:00', updated_at: '2024-01-15T00:00:00' },
  { id: 3, username: 'lisi', email: 'lisi@example.com', status: 'active', created_at: '2024-02-01T00:00:00', updated_at: '2024-02-01T00:00:00' },
  { id: 4, username: 'wangwu', email: 'wangwu@example.com', status: 'active', created_at: '2024-02-15T00:00:00', updated_at: '2024-02-15T00:00:00' },
]

// ==================== 项目数据 ====================
export const mockProjects: Project[] = [
  {
    id: 1,
    name: '产品重构项目',
    description: '对现有产品进行全面重构，提升用户体验和系统性能，采用最新的技术栈进行开发',
    status: 'active',
    planned_start_date: '2024-01-01',
    planned_end_date: '2024-06-30',
    actual_start_date: '2024-01-15',
    actual_end_date: null,
    owner_id: 1,
    created_at: '2024-01-01T10:00:00',
    updated_at: '2024-03-15T14:30:00',
  },
  {
    id: 2,
    name: '移动端App开发',
    description: '开发iOS和Android移动应用程序，支持消息推送、离线缓存等功能',
    status: 'active',
    planned_start_date: '2024-02-01',
    planned_end_date: '2024-08-31',
    actual_start_date: '2024-02-15',
    actual_end_date: null,
    owner_id: 1,
    created_at: '2024-02-01T09:00:00',
    updated_at: '2024-03-10T11:20:00',
  },
  {
    id: 3,
    name: '数据平台搭建',
    description: '搭建企业级数据分析和可视化平台，支持多数据源接入和自定义报表',
    status: 'completed',
    planned_start_date: '2023-06-01',
    planned_end_date: '2024-01-31',
    actual_start_date: '2023-06-15',
    actual_end_date: '2024-02-01',
    owner_id: 2,
    created_at: '2023-06-01T08:00:00',
    updated_at: '2024-02-01T16:00:00',
  },
  {
    id: 4,
    name: 'API网关升级',
    description: '升级API网关架构，提升系统稳定性和安全性，支持限流熔断等功能',
    status: 'planning',
    planned_start_date: '2024-04-01',
    planned_end_date: '2024-05-31',
    actual_start_date: null,
    actual_end_date: null,
    owner_id: 1,
    created_at: '2024-03-01T10:00:00',
    updated_at: '2024-03-01T10:00:00',
  },
  {
    id: 5,
    name: '客户服务系统',
    description: '构建智能客服系统，集成AI对话、工单管理、知识库等功能',
    status: 'archived',
    planned_start_date: '2023-01-01',
    planned_end_date: '2023-06-30',
    actual_start_date: '2023-01-15',
    actual_end_date: '2023-07-01',
    owner_id: 3,
    created_at: '2023-01-01T09:00:00',
    updated_at: '2023-07-01T18:00:00',
  },
]

// ==================== 项目成员数据 ====================
export const mockProjectMembers: Record<number, ProjectMember[]> = {
  1: [
    { id: 1, user_id: 1, username: 'admin', email: 'admin@example.com', is_owner: true, joined_at: '2024-01-01T10:00:00' },
    { id: 2, user_id: 2, username: 'zhangsan', email: 'zhangsan@example.com', is_owner: false, joined_at: '2024-01-10T14:00:00' },
    { id: 3, user_id: 3, username: 'lisi', email: 'lisi@example.com', is_owner: false, joined_at: '2024-01-20T09:00:00' },
  ],
  2: [
    { id: 1, user_id: 1, username: 'admin', email: 'admin@example.com', is_owner: true, joined_at: '2024-02-01T09:00:00' },
    { id: 2, user_id: 4, username: 'wangwu', email: 'wangwu@example.com', is_owner: false, joined_at: '2024-02-10T11:00:00' },
  ],
  3: [
    { id: 1, user_id: 2, username: 'zhangsan', email: 'zhangsan@example.com', is_owner: true, joined_at: '2023-06-01T08:00:00' },
  ],
  4: [
    { id: 1, user_id: 1, username: 'admin', email: 'admin@example.com', is_owner: true, joined_at: '2024-03-01T10:00:00' },
  ],
  5: [
    { id: 1, user_id: 3, username: 'lisi', email: 'lisi@example.com', is_owner: true, joined_at: '2023-01-01T09:00:00' },
    { id: 2, user_id: 4, username: 'wangwu', email: 'wangwu@example.com', is_owner: false, joined_at: '2023-02-15T10:00:00' },
  ],
}

// ==================== 故事数据 ====================
export const mockStories: Record<number, Story[]> = {
  1: [
    { id: 1, project_id: 1, title: '用户登录功能优化', description: '优化登录流程，支持第三方登录、短信验证码登录等方式', status: 'completed', priority: 'high', creator_id: 1, created_at: '2024-01-20T10:00:00', updated_at: '2024-02-15T16:00:00' },
    { id: 2, project_id: 1, title: '首页UI改版', description: '重新设计首页布局，提升用户视觉体验', status: 'in_progress', priority: 'high', creator_id: 2, created_at: '2024-02-01T09:00:00', updated_at: '2024-03-10T14:00:00' },
    { id: 3, project_id: 1, title: '性能优化', description: '优化页面加载速度，减少首屏渲染时间', status: 'pending', priority: 'medium', creator_id: 1, created_at: '2024-02-15T11:00:00', updated_at: '2024-02-15T11:00:00' },
    { id: 4, project_id: 1, title: '消息通知系统', description: '实现站内消息、邮件通知、浏览器推送等功能', status: 'pending', priority: 'low', creator_id: 3, created_at: '2024-03-01T10:00:00', updated_at: '2024-03-01T10:00:00' },
    { id: 5, project_id: 1, title: '数据导出功能', description: '支持导出Excel、PDF等格式的报表数据', status: 'completed', priority: 'medium', creator_id: 2, created_at: '2024-01-25T14:00:00', updated_at: '2024-02-20T17:00:00' },
  ],
  2: [
    { id: 1, project_id: 2, title: '用户注册流程', description: '实现手机号注册、邮箱注册两种方式', status: 'completed', priority: 'urgent', creator_id: 1, created_at: '2024-02-20T10:00:00', updated_at: '2024-03-01T15:00:00' },
    { id: 2, project_id: 2, title: '推送消息集成', description: '集成极光推送SDK，实现消息推送功能', status: 'in_progress', priority: 'high', creator_id: 4, created_at: '2024-03-01T09:00:00', updated_at: '2024-03-15T11:00:00' },
    { id: 3, project_id: 2, title: '离线缓存功能', description: '实现本地数据缓存，支持离线浏览', status: 'pending', priority: 'medium', creator_id: 1, created_at: '2024-03-10T14:00:00', updated_at: '2024-03-10T14:00:00' },
  ],
  3: [
    { id: 1, project_id: 3, title: '数据源配置', description: '支持MySQL、PostgreSQL、MongoDB等数据源配置', status: 'completed', priority: 'high', creator_id: 2, created_at: '2023-06-15T10:00:00', updated_at: '2023-07-20T16:00:00' },
    { id: 2, project_id: 3, title: '可视化图表', description: '实现折线图、柱状图、饼图等多种图表组件', status: 'completed', priority: 'high', creator_id: 2, created_at: '2023-08-01T09:00:00', updated_at: '2023-10-15T14:00:00' },
  ],
  4: [
    { id: 1, project_id: 4, title: '限流功能', description: '实现基于令牌桶算法的限流功能', status: 'pending', priority: 'high', creator_id: 1, created_at: '2024-03-05T10:00:00', updated_at: '2024-03-05T10:00:00' },
    { id: 2, project_id: 4, title: '熔断降级', description: '实现服务熔断和降级策略', status: 'pending', priority: 'high', creator_id: 1, created_at: '2024-03-05T10:30:00', updated_at: '2024-03-05T10:30:00' },
  ],
  5: [
    { id: 1, project_id: 5, title: 'AI对话模块', description: '集成GPT模型实现智能对话功能', status: 'completed', priority: 'urgent', creator_id: 3, created_at: '2023-02-01T10:00:00', updated_at: '2023-04-15T16:00:00' },
    { id: 2, project_id: 5, title: '工单管理系统', description: '实现工单创建、分配、处理、关闭全流程', status: 'completed', priority: 'high', creator_id: 3, created_at: '2023-03-01T09:00:00', updated_at: '2023-05-20T14:00:00' },
  ],
}

// ==================== 需求数据 ====================
export const mockRequirements: Record<number, Requirement[]> = {
  1: [
    { id: 1, project_id: 1, story_id: 1, title: '支持微信登录', description: '集成微信OAuth2.0登录接口', status: 'completed', priority: 'high', creator_id: 1, assignee_id: 2, created_at: '2024-01-21T10:00:00', updated_at: '2024-01-28T16:00:00' },
    { id: 2, project_id: 1, story_id: 1, title: '支持短信验证码登录', description: '集成短信服务商API，实现验证码登录', status: 'completed', priority: 'high', creator_id: 1, assignee_id: 2, created_at: '2024-01-22T09:00:00', updated_at: '2024-02-01T14:00:00' },
    { id: 3, project_id: 1, story_id: 2, title: '设计首页新布局', description: '参考最新设计规范，重新设计首页', status: 'in_progress', priority: 'high', creator_id: 2, assignee_id: 2, created_at: '2024-02-02T10:00:00', updated_at: '2024-03-05T11:00:00' },
    { id: 4, project_id: 1, story_id: 3, title: '前端资源压缩', description: '配置webpack/vite进行资源压缩优化', status: 'wait_split', priority: 'medium', creator_id: 1, assignee_id: 3, created_at: '2024-02-16T10:00:00', updated_at: '2024-02-16T10:00:00' },
    { id: 5, project_id: 1, story_id: 3, title: '图片懒加载', description: '实现页面图片懒加载优化', status: 'pending_confirmation', priority: 'medium', creator_id: 1, assignee_id: 3, created_at: '2024-02-17T10:00:00', updated_at: '2024-02-17T10:00:00' },
  ],
  2: [
    { id: 1, project_id: 2, story_id: 1, title: '手机号注册页面', description: '开发手机号注册表单和验证逻辑', status: 'completed', priority: 'urgent', creator_id: 1, assignee_id: 4, created_at: '2024-02-21T10:00:00', updated_at: '2024-02-28T17:00:00' },
    { id: 2, project_id: 2, story_id: 2, title: '集成极光推送SDK', description: '在iOS和Android端集成极光推送', status: 'in_progress', priority: 'high', creator_id: 4, assignee_id: 4, created_at: '2024-03-02T09:00:00', updated_at: '2024-03-12T15:00:00' },
  ],
  3: [
    { id: 1, project_id: 3, story_id: 1, title: 'MySQL数据源连接', description: '实现MySQL数据库连接池管理', status: 'completed', priority: 'high', creator_id: 2, assignee_id: 2, created_at: '2023-06-16T10:00:00', updated_at: '2023-07-01T16:00:00' },
    { id: 2, project_id: 3, story_id: 2, title: 'ECharts图表集成', description: '集成ECharts库实现基础图表', status: 'completed', priority: 'high', creator_id: 2, assignee_id: 2, created_at: '2023-08-02T09:00:00', updated_at: '2023-08-20T14:00:00' },
  ],
  4: [],
  5: [],
}

// ==================== 任务数据 ====================
export const mockTasks: Record<number, Task[]> = {
  1: [
    { id: 1, project_id: 1, story_id: 1, requirement_id: 1, title: '申请微信开放平台账号', description: '完成企业认证，获取AppID和AppSecret', status: 'completed', priority: 'high', creator_id: 1, assignee_id: 1, due_date: '2024-01-22', created_at: '2024-01-21T11:00:00', updated_at: '2024-01-22T10:00:00' },
    { id: 2, project_id: 1, story_id: 1, requirement_id: 1, title: '开发微信登录接口', description: '实现OAuth2.0授权流程', status: 'completed', priority: 'high', creator_id: 1, assignee_id: 2, due_date: '2024-01-26', created_at: '2024-01-22T10:00:00', updated_at: '2024-01-26T18:00:00' },
    { id: 3, project_id: 1, story_id: 1, requirement_id: 2, title: '选择短信服务商', description: '对比阿里云、腾讯云短信服务', status: 'completed', priority: 'medium', creator_id: 1, assignee_id: 1, due_date: '2024-01-23', created_at: '2024-01-22T14:00:00', updated_at: '2024-01-23T09:00:00' },
    { id: 4, project_id: 1, story_id: 2, requirement_id: 3, title: '设计首页线框图', description: '使用Figma设计首页新布局', status: 'in_progress', priority: 'high', creator_id: 2, assignee_id: 2, due_date: '2024-03-20', created_at: '2024-02-03T10:00:00', updated_at: '2024-03-10T14:00:00' },
    { id: 5, project_id: 1, story_id: 3, requirement_id: 4, title: '配置Vite打包优化', description: '配置代码分割和资源压缩', status: 'pending', priority: 'medium', creator_id: 1, assignee_id: 3, due_date: '2024-03-25', created_at: '2024-02-17T10:00:00', updated_at: '2024-02-17T10:00:00' },
  ],
  2: [
    { id: 1, project_id: 2, story_id: 1, requirement_id: 1, title: '开发注册表单UI', description: '实现手机号输入和验证码输入组件', status: 'completed', priority: 'urgent', creator_id: 1, assignee_id: 4, due_date: '2024-02-25', created_at: '2024-02-22T10:00:00', updated_at: '2024-02-25T17:00:00' },
    { id: 2, project_id: 2, story_id: 2, requirement_id: 2, title: 'iOS推送证书配置', description: '配置APNs推送证书', status: 'in_progress', priority: 'high', creator_id: 4, assignee_id: 4, due_date: '2024-03-18', created_at: '2024-03-03T09:00:00', updated_at: '2024-03-12T16:00:00' },
    { id: 3, project_id: 2, story_id: 3, requirement_id: null, title: '设计缓存策略', description: '确定哪些数据需要本地缓存', status: 'pending', priority: 'medium', creator_id: 1, assignee_id: 1, due_date: '2024-03-25', created_at: '2024-03-11T10:00:00', updated_at: '2024-03-11T10:00:00' },
  ],
  3: [
    { id: 1, project_id: 3, story_id: 1, requirement_id: 1, title: '实现连接池管理', description: '使用HikariCP实现连接池', status: 'completed', priority: 'high', creator_id: 2, assignee_id: 2, due_date: '2023-06-25', created_at: '2023-06-17T10:00:00', updated_at: '2023-06-25T16:00:00' },
    { id: 2, project_id: 3, story_id: 2, requirement_id: 2, title: '开发折线图组件', description: '基于ECharts实现折线图', status: 'completed', priority: 'high', creator_id: 2, assignee_id: 2, due_date: '2023-08-10', created_at: '2023-08-03T09:00:00', updated_at: '2023-08-10T15:00:00' },
  ],
  4: [
    { id: 1, project_id: 4, story_id: 1, requirement_id: null, title: '实现令牌桶算法', description: '基于Redis实现分布式限流', status: 'pending', priority: 'high', creator_id: 1, assignee_id: 1, due_date: '2024-04-15', created_at: '2024-03-06T10:00:00', updated_at: '2024-03-06T10:00:00' },
  ],
  5: [
    { id: 1, project_id: 5, story_id: 1, requirement_id: null, title: '接入GPT API', description: '集成OpenAI GPT-3.5接口', status: 'completed', priority: 'urgent', creator_id: 3, assignee_id: 3, due_date: '2023-02-20', created_at: '2023-02-02T10:00:00', updated_at: '2023-02-20T18:00:00' },
    { id: 2, project_id: 5, story_id: 2, requirement_id: null, title: '设计工单状态机', description: '定义工单状态流转规则', status: 'completed', priority: 'high', creator_id: 3, assignee_id: 4, due_date: '2023-03-15', created_at: '2023-03-02T09:00:00', updated_at: '2023-03-15T14:00:00' },
  ],
}

// ==================== 附件数据 ====================
export const mockAttachments: Attachment[] = [
  // 图片附件 - 故事1
  { id: 1, filename: 'login_flow.png', original_filename: '登录流程图.png', file_path: '/uploads/2024/01/login_flow.png', file_size: 204800, mime_type: 'image/png', target_type: 'story', target_id: 1, uploader_id: 1, created_at: '2024-01-21T10:00:00' },
  { id: 2, filename: 'ui_mockup.jpg', original_filename: 'UI原型图.jpg', file_path: '/uploads/2024/01/ui_mockup.jpg', file_size: 512000, mime_type: 'image/jpeg', target_type: 'story', target_id: 1, uploader_id: 2, created_at: '2024-01-23T14:00:00' },
  // 图片附件 - 故事2
  { id: 3, filename: 'design_v1.png', original_filename: '首页设计稿.png', file_path: '/uploads/2024/02/design_v1.png', file_size: 1024000, mime_type: 'image/png', target_type: 'story', target_id: 2, uploader_id: 2, created_at: '2024-02-05T14:00:00' },
  { id: 4, filename: 'design_v2.png', original_filename: '首页设计稿v2.png', file_path: '/uploads/2024/02/design_v2.png', file_size: 1152000, mime_type: 'image/png', target_type: 'story', target_id: 2, uploader_id: 2, created_at: '2024-02-10T16:00:00' },
  // 音频附件 - 故事1
  { id: 5, filename: 'meeting_record_01.mp3', original_filename: '需求讨论会议录音.mp3', file_path: '/uploads/2024/01/meeting_record_01.mp3', file_size: 5242880, mime_type: 'audio/mpeg', target_type: 'story', target_id: 1, uploader_id: 1, created_at: '2024-01-22T15:00:00' },
  { id: 6, filename: 'feedback_01.mp3', original_filename: '用户反馈录音.mp3', file_path: '/uploads/2024/01/feedback_01.mp3', file_size: 3145728, mime_type: 'audio/mpeg', target_type: 'story', target_id: 1, uploader_id: 2, created_at: '2024-01-26T11:00:00' },
  // 视频附件 - 故事1
  { id: 7, filename: 'demo_video_01.mp4', original_filename: '登录功能演示视频.mp4', file_path: '/uploads/2024/01/demo_video_01.mp4', file_size: 15728640, mime_type: 'video/mp4', target_type: 'story', target_id: 1, uploader_id: 1, created_at: '2024-01-28T16:00:00' },
  // 音频附件 - 故事2
  { id: 8, filename: 'design_review.mp3', original_filename: '设计评审录音.mp3', file_path: '/uploads/2024/02/design_review.mp3', file_size: 4194304, mime_type: 'audio/mpeg', target_type: 'story', target_id: 2, uploader_id: 2, created_at: '2024-02-10T14:00:00' },
  // 视频附件 - 故事2
  { id: 9, filename: 'ui_demo.mp4', original_filename: '首页UI演示.mp4', file_path: '/uploads/2024/02/ui_demo.mp4', file_size: 20971520, mime_type: 'video/mp4', target_type: 'story', target_id: 2, uploader_id: 2, created_at: '2024-03-12T10:00:00' },
  { id: 10, filename: 'animation_demo.webm', original_filename: '动画效果演示.webm', file_path: '/uploads/2024/03/animation_demo.webm', file_size: 10485760, mime_type: 'video/webm', target_type: 'story', target_id: 2, uploader_id: 3, created_at: '2024-03-15T09:00:00' },
  // 图片附件 - 需求1
  { id: 11, filename: 'wechat_flow.png', original_filename: '微信登录流程图.png', file_path: '/uploads/2024/01/wechat_flow.png', file_size: 307200, mime_type: 'image/png', target_type: 'requirement', target_id: 1, uploader_id: 1, created_at: '2024-01-21T16:00:00' },
  { id: 12, filename: 'wechat_ui.png', original_filename: '微信登录UI设计.png', file_path: '/uploads/2024/01/wechat_ui.png', file_size: 409600, mime_type: 'image/png', target_type: 'requirement', target_id: 1, uploader_id: 2, created_at: '2024-01-24T11:00:00' },
  // 音频附件 - 需求1
  { id: 13, filename: 'wechat_discussion.mp3', original_filename: '微信登录接口讨论.mp3', file_path: '/uploads/2024/01/wechat_discussion.mp3', file_size: 3670016, mime_type: 'audio/mpeg', target_type: 'requirement', target_id: 1, uploader_id: 1, created_at: '2024-01-21T16:00:00' },
  // 视频附件 - 需求1
  { id: 14, filename: 'wechat_demo.mp4', original_filename: '微信登录演示.mp4', file_path: '/uploads/2024/01/wechat_demo.mp4', file_size: 12582912, mime_type: 'video/mp4', target_type: 'requirement', target_id: 1, uploader_id: 2, created_at: '2024-01-28T14:00:00' },
  // 图片附件 - 需求3
  { id: 15, filename: 'homepage_wireframe.png', original_filename: '首页线框图.png', file_path: '/uploads/2024/02/homepage_wireframe.png', file_size: 256000, mime_type: 'image/png', target_type: 'requirement', target_id: 3, uploader_id: 2, created_at: '2024-02-03T10:00:00' },
  // 音频附件 - 需求3
  { id: 16, filename: 'design_meeting.mp3', original_filename: '首页设计会议录音.mp3', file_path: '/uploads/2024/02/design_meeting.mp3', file_size: 4718592, mime_type: 'audio/mpeg', target_type: 'requirement', target_id: 3, uploader_id: 2, created_at: '2024-02-03T15:00:00' },
  // 视频附件 - 需求3
  { id: 17, filename: 'design_walkthrough.mp4', original_filename: '设计稿 walkthrough.mp4', file_path: '/uploads/2024/02/design_walkthrough.mp4', file_size: 18874368, mime_type: 'video/mp4', target_type: 'requirement', target_id: 3, uploader_id: 2, created_at: '2024-02-06T10:00:00' },
  // 音频附件 - 任务1
  { id: 18, filename: 'task_discussion_01.mp3', original_filename: 'Redis集群讨论.mp3', file_path: '/uploads/2024/03/task_discussion_01.mp3', file_size: 2883584, mime_type: 'audio/mpeg', target_type: 'task', target_id: 1, uploader_id: 1, created_at: '2024-03-07T11:00:00' },
  // 视频附件 - 任务4
  { id: 19, filename: 'figma_tutorial.mp4', original_filename: 'Figma使用教程.mp4', file_path: '/uploads/2024/02/figma_tutorial.mp4', file_size: 26214400, mime_type: 'video/mp4', target_type: 'task', target_id: 4, uploader_id: 2, created_at: '2024-02-10T09:00:00' },
  { id: 20, filename: 'wireframe_demo.mp4', original_filename: '线框图演示.mp4', file_path: '/uploads/2024/02/wireframe_demo.mp4', file_size: 14680064, mime_type: 'video/mp4', target_type: 'task', target_id: 4, uploader_id: 2, created_at: '2024-03-08T16:00:00' },
]

// ==================== 评论数据 ====================
export const mockComments: Comment[] = [
  // 故事评论
  { id: 1, content: '这个功能很重要，需要优先完成', target_type: 'story', target_id: 1, parent_id: null, author_id: 1, created_at: '2024-01-22T10:30:00', updated_at: '2024-01-22T10:30:00' },
  { id: 2, content: '已经完成了微信登录的接口开发，请测试', target_type: 'story', target_id: 1, parent_id: null, author_id: 2, created_at: '2024-01-26T18:30:00', updated_at: '2024-01-26T18:30:00' },
  { id: 3, content: '测试通过，可以上线', target_type: 'story', target_id: 1, parent_id: 2, author_id: 1, created_at: '2024-01-27T09:00:00', updated_at: '2024-01-27T09:00:00' },
  { id: 4, content: '首页设计需要考虑移动端适配', target_type: 'story', target_id: 2, parent_id: null, author_id: 3, created_at: '2024-02-10T14:00:00', updated_at: '2024-02-10T14:00:00' },
  // 需求评论
  { id: 7, content: '微信登录需要申请企业认证，预计需要3个工作日', target_type: 'requirement', target_id: 1, parent_id: null, author_id: 1, created_at: '2024-01-21T14:00:00', updated_at: '2024-01-21T14:00:00' },
  { id: 8, content: '微信开放平台文档已查阅，接口对接难度不大', target_type: 'requirement', target_id: 1, parent_id: null, author_id: 2, created_at: '2024-01-22T09:30:00', updated_at: '2024-01-22T09:30:00' },
  { id: 9, content: '短信服务商建议使用阿里云，价格更优惠', target_type: 'requirement', target_id: 2, parent_id: null, author_id: 1, created_at: '2024-01-22T15:00:00', updated_at: '2024-01-22T15:00:00' },
  { id: 10, content: '验证码有效期建议设置为5分钟', target_type: 'requirement', target_id: 2, parent_id: null, author_id: 3, created_at: '2024-01-23T10:00:00', updated_at: '2024-01-23T10:00:00' },
  { id: 11, content: '首页布局设计稿已完成，请查看附件', target_type: 'requirement', target_id: 3, parent_id: null, author_id: 2, created_at: '2024-02-05T16:00:00', updated_at: '2024-02-05T16:00:00' },
  { id: 12, content: '设计稿已评审通过，可以开始开发', target_type: 'requirement', target_id: 3, parent_id: null, author_id: 1, created_at: '2024-02-06T10:00:00', updated_at: '2024-02-06T10:00:00' },
  { id: 13, content: '前端压缩建议使用Vite内置的压缩插件', target_type: 'requirement', target_id: 4, parent_id: null, author_id: 3, created_at: '2024-02-17T11:00:00', updated_at: '2024-02-17T11:00:00' },
  { id: 14, content: '图片懒加载可以使用IntersectionObserver API实现', target_type: 'requirement', target_id: 5, parent_id: null, author_id: 3, created_at: '2024-02-18T09:00:00', updated_at: '2024-02-18T09:00:00' },
  { id: 15, content: '需要确认懒加载的触发阈值是多少', target_type: 'requirement', target_id: 5, parent_id: null, author_id: 1, created_at: '2024-02-18T14:00:00', updated_at: '2024-02-18T14:00:00' },
  // 任务评论
  { id: 5, content: '任务已分配给张三', target_type: 'task', target_id: 4, parent_id: null, author_id: 1, created_at: '2024-02-03T11:00:00', updated_at: '2024-02-03T11:00:00' },
  { id: 6, content: '需要注意Redis集群的高可用配置', target_type: 'task', target_id: 1, parent_id: null, author_id: 1, created_at: '2024-03-07T10:00:00', updated_at: '2024-03-07T10:00:00' },
]

// ==================== 用户凭证（用于登录验证） ====================
export const mockCredentials: Record<string, { password: string; user: User }> = {
  'admin': { password: '123456', user: mockUsers[0] },
  'zhangsan': { password: '123456', user: mockUsers[1] },
  'lisi': { password: '123456', user: mockUsers[2] },
  'wangwu': { password: '123456', user: mockUsers[3] },
}

// ==================== 代码库数据 ====================
export const mockRepositories: Repository[] = [
  {
    id: 1,
    user_id: 1,
    name: '主项目代码库',
    local_path: '/Users/dev/projects/main-project',
    description: '主要业务项目代码库',
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: '工具库',
    local_path: '/Users/dev/projects/utils',
    description: '通用工具函数库',
    created_at: '2026-03-21T14:30:00Z',
    updated_at: '2026-03-21T14:30:00Z',
  },
]