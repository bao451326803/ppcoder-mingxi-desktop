<template>
  <div class="login-page">
    <!-- 波浪背景 -->
    <canvas ref="waveCanvas" class="wave-canvas"></canvas>

    <!-- 左上角 Logo -->
    <div class="top-logo">
      <img src="/favicon.svg" alt="Logo" class="top-logo-icon" />
      <span class="top-logo-text">明析</span>
    </div>

    <div class="login-container">
      <div class="login-header">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <h1 class="title">明析</h1>
        <p class="subtitle">企业级项目管理解决方案</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- PPcoder 品牌区域 -->
      <div class="brand-area">
        <div class="brand-divider">
          <span class="brand-line"></span>
          <span class="brand-text">PPcoder 生态</span>
          <span class="brand-line"></span>
        </div>
        <div class="brand-products">
          <div class="product-item">
            <span class="product-icon">明析</span>
            <span class="product-name">项目管理</span>
          </div>
          <div class="product-item">
            <span class="product-icon">灵眸</span>
            <span class="product-name">智能助手</span>
          </div>
        </div>
        <p class="brand-slogan">PPcoder · 让开发更高效</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const waveCanvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

// 波纹效果
class WaveRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number

  constructor(x: number, y: number, maxRadius: number) {
    this.x = x
    this.y = y
    this.radius = 0
    this.maxRadius = maxRadius
    this.alpha = 0.4
    this.speed = Math.random() * 1.5 + 0.8
  }

  update() {
    this.radius += this.speed
    this.alpha = 0.4 * (1 - this.radius / this.maxRadius)
    return this.radius < this.maxRadius
  }
}

// 波浪系统 - 只有波浪线条和波纹
class WaveSystem {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private ripples: WaveRipple[] = []
  private time = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    this.init()
    this.bindEvents()
  }

  private resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  private init() {
    this.addRipple(this.width / 2, this.height / 2)
  }

  private bindEvents() {
    window.addEventListener('resize', () => this.resize())

    this.canvas.addEventListener('click', (e) => {
      this.addRipple(e.clientX, e.clientY)
    })

    // 自动产生波纹
    setInterval(() => {
      const x = Math.random() * this.width
      const y = Math.random() * this.height
      this.addRipple(x, y)
    }, 4000)
  }

  private addRipple(x: number, y: number) {
    this.ripples.push(new WaveRipple(x, y, Math.max(this.width, this.height) * 0.6))
  }

  private getWaveHeight(x: number, y: number, time: number): number {
    let totalHeight = 0

    // 柔和的多层波浪
    totalHeight += Math.sin(x * 0.008 + time * 1.5) * 15
    totalHeight += Math.sin(y * 0.008 + time * 1.2) * 15
    totalHeight += Math.sin((x + y) * 0.005 + time) * 10

    // 波纹影响
    this.ripples.forEach(ripple => {
      const dx = x - ripple.x
      const dy = y - ripple.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const rippleEffect = Math.sin((dist - ripple.radius) * 0.03) * Math.exp(-dist * 0.003)
      totalHeight += rippleEffect * ripple.alpha * 20
    })

    return totalHeight
  }

  animate() {
    this.time += 0.01

    // 渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, '#fafafa')
    gradient.addColorStop(0.5, '#f5f5f5')
    gradient.addColorStop(1, '#fafafa')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)

    // 更新波纹（用于影响波浪形状）
    this.ripples = this.ripples.filter(ripple => ripple.update())

    // 绘制波浪线条
    this.drawWaveLines()
  }

  private drawWaveLines() {
    const layers = 4
    for (let layer = 0; layer < layers; layer++) {
      this.ctx.beginPath()
      const layerOffset = layer * 0.4
      const yBase = this.height * 0.3 + layer * 80

      for (let x = 0; x <= this.width; x += 6) {
        const waveY = yBase + this.getWaveHeight(x, yBase, this.time + layerOffset)
        if (x === 0) {
          this.ctx.moveTo(x, waveY)
        } else {
          this.ctx.lineTo(x, waveY)
        }
      }

      const alpha = 0.15 - layer * 0.03
      this.ctx.strokeStyle = `rgba(243, 112, 33, ${alpha})`
      this.ctx.lineWidth = 1.5
      this.ctx.stroke()

      // 填充波浪下方
      this.ctx.lineTo(this.width, this.height)
      this.ctx.lineTo(0, this.height)
      this.ctx.closePath()
      this.ctx.fillStyle = `rgba(243, 112, 33, ${alpha * 0.4})`
      this.ctx.fill()
    }
  }

  destroy() {
    window.removeEventListener('resize', this.resize)
  }
}

let waveSystem: WaveSystem | null = null

onMounted(() => {
  if (waveCanvas.value) {
    waveSystem = new WaveSystem(waveCanvas.value)
    const animate = () => {
      waveSystem?.animate()
      animationId = requestAnimationFrame(animate)
    }
    animate()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  waveSystem?.destroy()
})

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/workspace')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.wave-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.top-logo {
  position: fixed;
  top: 20px;
  left: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-logo-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(243, 112, 33, 0.2));
}

.top-logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #F37021 0%, #D45F13 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  animation: floatIn 0.6s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  filter: drop-shadow(0 2px 4px rgba(243, 112, 33, 0.2));
}

.title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #F37021 0%, #D45F13 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #F37021 0%, #D45F13 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(243, 112, 33, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

// PPcoder 品牌区域
.brand-area {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.brand-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.brand-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #F37021, transparent);
}

.brand-text {
  font-size: 12px;
  color: #999;
  letter-spacing: 1px;
}

.brand-products {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.product-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF4E6 0%, #FED9B8 100%);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #D45F13;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(243, 112, 33, 0.2);
  }
}

.product-name {
  font-size: 11px;
  color: #999;
}

.brand-slogan {
  text-align: center;
  font-size: 12px;
  color: #bbb;
  letter-spacing: 0.5px;
}
</style>