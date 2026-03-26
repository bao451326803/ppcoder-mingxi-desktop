import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/workspace',
    children: [
      {
        path: 'workspace',
        name: 'Workspace',
        component: () => import('@/views/workspace/Workspace.vue'),
        meta: {
          title: '工作站',
          requiresAuth: true,
        },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/projects/Projects.vue'),
        meta: {
          title: '项目管理',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/projects/ProjectDetail.vue'),
        meta: {
          title: '项目详情',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:id/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/projects/ProjectEdit.vue'),
        meta: {
          title: '编辑项目',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/stories',
        name: 'Stories',
        component: () => import('@/views/projects/Stories.vue'),
        meta: {
          title: '故事管理',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/stories/:storyId',
        name: 'StoryDetail',
        component: () => import('@/views/projects/StoryDetail.vue'),
        meta: {
          title: '故事详情',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/stories/:storyId/edit',
        name: 'StoryEdit',
        component: () => import('@/views/projects/StoryEdit.vue'),
        meta: {
          title: '编辑故事',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/requirements',
        name: 'Requirements',
        component: () => import('@/views/projects/Requirements.vue'),
        meta: {
          title: '需求管理',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/requirements/:requirementId',
        name: 'RequirementDetail',
        component: () => import('@/views/projects/RequirementDetail.vue'),
        meta: {
          title: '需求详情',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/requirements/:requirementId/edit',
        name: 'RequirementEdit',
        component: () => import('@/views/projects/RequirementEdit.vue'),
        meta: {
          title: '编辑需求',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/tasks',
        name: 'Tasks',
        component: () => import('@/views/projects/Tasks.vue'),
        meta: {
          title: '任务管理',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/tasks/:taskId',
        name: 'TaskDetail',
        component: () => import('@/views/projects/TaskDetail.vue'),
        meta: {
          title: '任务详情',
          requiresAuth: true,
        },
      },
      {
        path: 'projects/:projectId/tasks/:taskId/edit',
        name: 'TaskEdit',
        component: () => import('@/views/projects/TaskEdit.vue'),
        meta: {
          title: '编辑任务',
          requiresAuth: true,
        },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Settings.vue'),
        redirect: '/settings/profile',
        children: [
          {
            path: 'profile',
            name: 'SettingsProfile',
            component: () => import('@/views/settings/SettingsProfile.vue'),
            meta: {
              title: '个人设置',
              requiresAuth: true,
            },
          },
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/settings/UserManagement.vue'),
            meta: {
              title: '人员管理',
              requiresAuth: true,
            },
          },
          {
            path: 'repositories',
            name: 'Repositories',
            component: () => import('@/views/settings/Repositories.vue'),
            meta: {
              title: '代码库设置',
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 明析`
  }

  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false
  const token = localStorage.getItem('access_token')

  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (!requiresAuth && token && (to.name === 'Login' || to.name === 'Register')) {
    // 已登录但访问登录/注册页，跳转到首页
    next({ name: 'Projects' })
  } else {
    next()
  }
})

export default router