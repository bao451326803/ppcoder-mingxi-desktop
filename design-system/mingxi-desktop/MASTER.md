# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** MingXi Desktop (明析-桌面端)
**Generated:** 2026-03-22
**Category:** Enterprise Project Management Software
**Platform:** Desktop Application (Tauri + Vue3)

---

## Design Philosophy

明析是一款企业级项目管理桌面软件，设计理念遵循**时尚、高端、高效**的原则：

- **时尚**：爱玛仕橙主色调，传达品质与品位
- **高端**：简洁的瑞士风格，清晰的信息层次
- **高效**：流畅的交互，快速的响应

---

## Global Rules

### Color Palette

#### Primary Colors (品牌色 - 爱玛仕橙)

| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#F37021` | 主按钮、选中状态、重要操作 |
| Primary Light-3 | `#F5843F` | 悬停状态 |
| Primary Light-5 | `#F8985C` | 次要悬停 |
| Primary Light-7 | `#FBAD7A` | 标签背景 |
| Primary Light-8 | `#FDC198` | 边框高亮 |
| Primary Light-9 | `#FED9B8` | 选中背景 |
| Primary Dark-2 | `#D45F13` | 按下状态 |

#### Functional Colors (功能色)

| Role | Hex | Usage |
|------|-----|-------|
| Success | `#059669` | 成功状态、完成标记 |
| Warning | `#D97706` | 警告、待处理 |
| Danger | `#DC2626` | 错误、删除 |
| Info | `#0284C7` | 信息提示 |

#### Neutral Colors (中性色)

| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | `#1A1A1A` | 主要文字 |
| Text Regular | `#333333` | 常规文字 |
| Text Secondary | `#666666` | 次要文字、标签 |
| Text Placeholder | `#999999` | 占位符 |
| Border | `#E5E5E5` | 边框 |
| Border Light | `#F0F0F0` | 浅边框 |
| Fill | `#F5F5F5` | 填充背景 |
| Background | `#FFFFFF` | 主背景 |
| Background Page | `#FAFAFA` | 页面背景 |

### CSS Variables

```css
:root {
  /* Primary - 爱玛仕橙 */
  --el-color-primary: #F37021;
  --el-color-primary-light-3: #F5843F;
  --el-color-primary-light-5: #F8985C;
  --el-color-primary-light-7: #FBAD7A;
  --el-color-primary-light-8: #FDC198;
  --el-color-primary-light-9: #FED9B8;
  --el-color-primary-dark-2: #D45F13;

  /* Functional */
  --el-color-success: #059669;
  --el-color-warning: #D97706;
  --el-color-danger: #DC2626;
  --el-color-info: #0284C7;

  /* Text */
  --el-text-color-primary: #1A1A1A;
  --el-text-color-regular: #333333;
  --el-text-color-secondary: #666666;
  --el-text-color-placeholder: #999999;

  /* Border */
  --el-border-color: #E5E5E5;
  --el-border-color-light: #F0F0F0;

  /* Fill */
  --el-fill-color: #F5F5F5;
  --el-fill-color-light: #FAFAFA;

  /* Background */
  --el-bg-color: #FFFFFF;
  --el-bg-color-page: #FAFAFA;
}
```

### Typography

- **Primary Font:** Fira Sans (推荐用于界面文字)
- **Monospace Font:** Fira Code (推荐用于代码、数据)
- **Chinese Font:** PingFang SC, Microsoft YaHei (中文回退)

**Font Sizes:**

| Token | Size | Usage |
|-------|------|-------|
| Extra Large | 20px | 页面标题 |
| Large | 18px | 区块标题 |
| Medium | 16px | 子标题 |
| Base | 14px | 正文 |
| Small | 13px | 辅助文字 |
| Extra Small | 12px | 标签、提示 |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--mx-spacing-xs` | 4px | 紧凑间距 |
| `--mx-spacing-sm` | 8px | 图标间距、行内间距 |
| `--mx-spacing-md` | 12px | 内边距 |
| `--mx-spacing-lg` | 16px | 标准内边距 |
| `--mx-spacing-xl` | 20px | 区块内边距 |
| `--mx-spacing-xxl` | 24px | 大间距 |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Base | 6px | 按钮、输入框、卡片 |
| Small | 4px | 标签、小按钮 |
| Large | 12px | 对话框 |
| Round | 20px | 胶囊按钮 |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| Light | `0 1px 2px rgba(0, 0, 0, 0.04)` | 轻微抬起 |
| Base | `0 1px 3px rgba(0, 0, 0, 0.08)` | 卡片、按钮 |
| Dark | `0 4px 6px rgba(0, 0, 0, 0.08)` | 悬浮卡片 |

---

## Component Specs

### Buttons - 爱玛仕橙风格

```scss
// Primary Button - 爱玛仕橙
.el-button--primary {
  background: #F37021;
  border-color: #F37021;
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #F5843F;
    border-color: #F5843F;
  }

  &:active {
    background: #D45F13;
    border-color: #D45F13;
  }

  &:disabled {
    background: #FBAD7A;
    border-color: #FBAD7A;
  }
}

// Default Button - 悬停时使用爱玛仕橙边框
.el-button--default {
  &:hover {
    color: #F37021;
    border-color: #F37021;
    background-color: #FED9B8;
  }
}

// Text Button - 爱玛仕橙
.el-button--text {
  color: #F37021;

  &:hover {
    color: #F5843F;
  }
}
```

### Links - 爱玛仕橙

```scss
.el-link {
  color: #F37021;

  &:hover {
    color: #F5843F;
  }
}
```

### Menu - 爱玛仕橙选中状态

```scss
.el-menu-item {
  &:hover {
    background-color: #FED9B8;
  }

  &.is-active {
    color: #F37021;
    background-color: #FED9B8;
    border-right: 3px solid #F37021;
  }
}
```

### Cards

```scss
.el-card {
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  padding: 20px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}
```

### Inputs

```scss
.el-input__wrapper {
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #D0D0D0;
  }

  &.is-focus {
    border-color: #F37021;
    box-shadow: 0 0 0 1px #F37021 inset;
  }
}
```

### Tables

```scss
.el-table {
  border-radius: 8px;
  overflow: hidden;

  th.el-table__cell {
    background-color: #FAFAFA;
    font-weight: 600;
    color: #1A1A1A;
  }

  .el-table__row:hover td {
    background-color: #FED9B8;
  }
}
```

### Sidebar

```scss
.sidebar {
  width: 240px;
  background: #FFFFFF;
  border-right: 1px solid #E5E5E5;

  .el-menu-item.is-active {
    color: #F37021;
    background-color: #FED9B8;
    border-right: 3px solid #F37021;
  }
}
```

### Tags - 状态颜色

```scss
// Primary Tag - 爱玛仕橙
.el-tag--primary {
  background-color: #FED9B8;
  border-color: #FDC198;
  color: #F37021;
}

.el-tag--success {
  background-color: #D1FAE5;
  border-color: #A7F3D0;
  color: #059669;
}

.el-tag--warning {
  background-color: #FEF3C7;
  border-color: #FDE68A;
  color: #D97706;
}

.el-tag--danger {
  background-color: #FEE2E2;
  border-color: #FECACA;
  color: #DC2626;
}

.el-tag--info {
  background-color: #E0F2FE;
  border-color: #BAE6FD;
  color: #0284C7;
}
```

### Checkbox & Radio - 爱玛仕橙

```scss
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-radio__input.is-checked .el-radio__inner {
  background-color: #F37021;
  border-color: #F37021;
}
```

### Switch - 爱玛仕橙

```scss
.el-switch.is-checked .el-switch__core {
  background-color: #F37021;
  border-color: #F37021;
}
```

### Pagination - 爱玛仕橙

```scss
.el-pagination.is-background .el-pager li.is-active {
  background-color: #F37021;
  color: white;
}
```

### Tabs - 爱玛仕橙

```scss
.el-tabs__item.is-active {
  color: #F37021;
  font-weight: 600;
}

.el-tabs__active-bar {
  background-color: #F37021;
}
```

### Avatar - 爱玛仕橙背景

```scss
.el-avatar {
  background-color: #FDC198;
  color: #F37021;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:**
- Subtle hover (200ms)
- Smooth transitions
- Clear type hierarchy
- Fast loading
- Minimal shadows

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — Use SVG icons (Element Plus Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Complex animations** — Keep animations minimal and functional

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use Element Plus Icons instead)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at minimum widths (1024px, 1280px, 1440px)
- [ ] No horizontal scroll
- [ ] Consistent spacing using spacing tokens

---

## File Structure

```
src/
├── styles/
│   ├── index.scss        # 样式入口
│   ├── element-override.scss  # Element Plus覆盖
│   └── global.scss       # 全局样式
├── components/
│   ├── common/           # 公共组件
│   └── detail/           # 详情组件
│       ├── StoryInfoSection.vue
│       ├── RequirementInfoSection.vue
│       ├── TaskInfoSection.vue
│       ├── TaskListSection.vue
│       └── RequirementListSection.vue
├── views/
│   ├── Login.vue         # 登录页
│   ├── Layout.vue        # 布局
│   ├── Workspace.vue     # 工作站
│   ├── Projects.vue      # 项目管理
│   ├── StoryDetail.vue   # 故事详情
│   ├── RequirementDetail.vue # 需求详情
│   ├── TaskDetail.vue    # 任务详情
│   └── NotFound.vue      # 404页面
├── stores/
│   └── app.ts            # 应用状态
└── router/
    └── index.ts          # 路由配置
```