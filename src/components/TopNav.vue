<!--
  功能：顶部导航栏组件，包含页面切换、定制、反馈、登录及窗口控制
  作者：FullStack-Guardian
  更新时间：2026-02-09
-->
<template>
  <header class="top-nav">
    <div class="nav-container">
      <div class="logo">
        <div class="logo-icon">
          <img src="/二维码生成器.png" alt="logo" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <span class="logo-text">{{ t('topNav.brand') }}</span>
      </div>

      <nav class="nav-links">
        <a 
          v-for="item in navItems" 
          :key="item.id"
          :class="['nav-link', { active: activeTab === item.id }]"
          :title="t(item.key)"
          @click="selectTab(item.id)"
        >
          {{ t(item.key) }}
        </a>
      </nav>

      <!-- 动态占位符：占据中间所有剩余空间，并将后续元素推向右侧 -->
      <div class="nav-spacer"></div>

      <div class="nav-actions">
        <!-- 定制软件按钮 -->
        <button class="custom-software-btn" :title="t('topNav.actions.customSoftware')" @click="handleCustomSoftware">
          {{ t('topNav.actions.customSoftware') }}
        </button>

        <!-- 反馈问题按钮 -->
        <button class="feedback-btn" :title="t('topNav.actions.feedback')" @click="handleFeedback">
          {{ t('topNav.actions.feedback') }}
        </button>

        <select class="locale-select" :value="localeStore.state.locale" @change="handleLocaleChange">
          <option v-for="item in localeStore.supportedLocales" :key="item.code" :value="item.code">
            {{ item.label }}
          </option>
        </select>

        <!-- 广告位 -->
        <div v-if="advData" class="adv-section" @click="openAdvLink">
          <img :src="advData.adv_url" :alt="t('topNav.adAlt')" class="adv-image">
        </div>

        <!-- 用户登录部分 -->
        <div class="user-auth-section">
          <template v-if="userStore.isLoggedIn && userStore.userInfo">
            <div class="user-info-wrapper" @click.stop="showUserPanel = !showUserPanel">
              <img :src="userStore.userInfo.avatar || '/default-avatar.png'" class="user-avatar" alt="avatar">
              <span class="user-nickname">{{ userStore.userInfo.nickname }}</span>
            </div>
            
            <div v-if="showUserPanel" class="user-panel">
              <div class="panel-header">
                <img :src="userStore.userInfo.avatar || '/default-avatar.png'" class="panel-avatar" alt="avatar">
                <div class="panel-nickname">{{ userStore.userInfo.nickname }}</div>
              </div>
              <div class="panel-actions">
                <button class="logout-btn" @click="handleLogout">{{ t('topNav.actions.logout') }}</button>
              </div>
            </div>
          </template>
          <template v-else>
            <button class="login-btn" :title="t('topNav.actions.login')" @click="$emit('open-login')">
              👤 {{ t('topNav.actions.login') }}
            </button>
          </template>
        </div>

        <!-- 窗口控制按钮 (Electron模式下显示) -->
        <div v-if="isElectron" class="window-controls">
          <button class="control-btn minimize" @click="minimizeWindow" :title="t('topNav.window.minimize')">
            <svg viewBox="0 0 10 1" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="1" fill="currentColor"/></svg>
          </button>
          <button class="control-btn maximize" @click="maximizeWindow" :title="t('topNav.window.maximize')">
            <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 v10 h10 v-10 z M1,1 h8 v8 h-8 z" fill="currentColor"/></svg>
          </button>
          <button class="control-btn close" @click="closeWindow" :title="t('topNav.window.close')">
            <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userStore } from '../modules/user';
import { localeStore } from '../modules/settings/localeStore'
import { getAdvertisement, getCustomUrl, getFeedbackUrl } from '../utils/api';
const { t } = useI18n()

const props = defineProps({
  activeTab: {
    type: String,
    default: 'text'
  }
})

// 定制软件功能
const handleCustomSoftware = async () => {
  try {
    const url = await getCustomUrl()
    if (window.electron) {
      window.electron.openExternal(url)
    } else {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('打开定制链接失败:', error)
  }
}

// 反馈问题功能
const handleFeedback = async () => {
  try {
    const baseUrl = await getFeedbackUrl()
    // TODO-Guardian: 10019 为当前软件编号，未来可提取为全局配置
    const finalUrl = baseUrl.includes('soft_number=') ? `${baseUrl}10019` : `${baseUrl}?soft_number=10019`
    
    if (window.electron) {
      window.electron.openExternal(finalUrl)
    } else {
      window.open(finalUrl, '_blank')
    }
  } catch (error) {
    console.error('打开反馈链接失败:', error)
  }
}

const emit = defineEmits(['change-tab', 'open-server-config', 'open-storage-manager', 'open-login'])

const showUserPanel = ref(false)
const appVersion = ref('')
const advData = ref(null)

const handleLogout = async () => {
  if (await confirm(t('topNav.confirmLogout'))) {
    await userStore.logout()
    showUserPanel.value = false
  }
}

const handleLocaleChange = (event) => {
  localeStore.setLocale(event.target.value)
}

// 点击外部关闭面板
const closePanel = (e) => {
  if (showUserPanel.value && !e.target.closest('.user-info-wrapper')) {
    showUserPanel.value = false
  }
}

// 获取应用版本号
const getAppVersion = async () => {
  if (window.electron) {
    try {
      const result = await window.electron.getCurrentVersion()
      if (result.success) {
        appVersion.value = result.version
      }
    } catch (error) {
      console.error('获取版本号失败:', error)
    }
  }
}

onMounted(async () => {
  // 获取版本号
  getAppVersion()
  window.addEventListener('click', closePanel)
  // 获取广告数据
  const result = await getAdvertisement('10019', 'adv_position_01')
  if (result && result.length > 0) {
    advData.value = result[0]
  }
})

const openAdvLink = () => {
  if (advData.value && advData.value.target_url) {
    if (window.electron) {
      window.electron.openExternal(advData.value.target_url)
    } else {
      window.open(advData.value.target_url, '_blank')
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('click', closePanel)
})

const isElectron = computed(() => window.electron !== undefined)

const minimizeWindow = () => {
  if (window.electron) {
    window.electron.minimizeWindow()
  }
}

const maximizeWindow = () => {
  if (window.electron) {
    window.electron.maximizeWindow()
  }
}

const closeWindow = () => {
  if (window.electron) {
    window.electron.closeWindow()
  }
}

const navItems = [
  { id: 'text', key: 'topNav.tabs.text' },
  { id: 'file', key: 'topNav.tabs.file' },
  { id: 'image', key: 'topNav.tabs.image' },
  { id: 'media', key: 'topNav.tabs.media' },
  { id: 'batch', key: 'topNav.tabs.batch' },
  { id: 'advanced', key: 'topNav.tabs.advanced' }
]

const selectTab = (tabId) => {
  emit('change-tab', tabId)
}
</script>

<style scoped>
.top-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  -webkit-app-region: drag; /* 允许拖拽窗口 */
}

.nav-container {
  width: 100%; /* 铺满全宽 */
  margin: 0;
  padding: 0 16px; /* 稍微缩小边距，更贴合边缘 */
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.logo, .nav-links, .nav-actions, .window-controls, .adv-section {
  -webkit-app-region: no-drag; /* 内部元素禁止拖拽，否则点击事件失效 */
}

.adv-section {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 260px;
  height: 36px;
  margin-right: 20px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 1;
  min-width: 0;
}

.nav-spacer {
  flex: 1; /* 占据所有剩余空间 */
  min-width: 8px;
  height: 60px;
  -webkit-app-region: drag; /* 占位符区域允许拖拽 */
}

/* 当窗口宽度小于 1500px 时隐藏广告位，防止遮挡 */
@media (max-width: 1500px) {
  .adv-section {
    display: none;
  }
}

.adv-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.window-controls {
  display: flex;
  margin-left: 12px;
  border-left: 1px solid #eee;
  padding-left: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.control-btn svg {
  width: 12px;
  height: 12px;
}

.control-btn:hover {
  background: #f0f0f0;
}

.control-btn.close:hover {
  background: #ff4d4f;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  flex-shrink: 0;
  min-width: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  white-space: nowrap;
}

.custom-software-btn {
  background: linear-gradient(135deg, #1a237e, #0d47a1);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin: 0;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 6px rgba(13, 71, 161, 0.3);
  -webkit-app-region: no-drag;
}

.custom-software-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(13, 71, 161, 0.4);
}

.feedback-btn {
  background: linear-gradient(135deg, #00796b, #004d40);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 121, 107, 0.2);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 8px;
}

.feedback-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 121, 107, 0.3);
  opacity: 0.9;
}

.custom-software-btn:active {
  transform: translateY(0);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px; /* 减小间距 */
  flex-wrap: nowrap;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.nav-link {
  flex: 0 1 auto;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  text-decoration: none;
  white-space: nowrap;
  min-width: 0;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link.active {
  background: #2196F3;
  color: white;
}

.nav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 0 0 auto;
  min-width: 0;
  /* 移除 flex: 1，让出中间空白区域给父容器拖拽 */
  justify-content: flex-end;
}

.adv-section, .storage-btn, .server-config-btn, .login-btn, .user-auth-section, .locale-select {
  -webkit-app-region: no-drag;
}

.locale-select {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 8px;
  background: #fff;
  color: #333;
  font-size: 12px;
  width: 120px;
  min-width: 0;
}

.storage-btn, .server-config-btn, .login-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: 0;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.storage-btn:hover, .server-config-btn:hover, .login-btn:hover {
  border-color: #2196F3;
  color: #2196F3;
  background: #f0f7ff;
}

.user-auth-section {
  position: relative;
  flex-shrink: 0;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border: 1px solid #eee;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info-wrapper:hover {
  background: #f9f9f9;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-nickname {
  font-size: 14px;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #eee;
}

.panel-header {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
  background: #fcfcfc;
}

.panel-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.panel-nickname {
  font-weight: 600;
  color: #333;
}

.panel-actions {
  padding: 12px;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #ff4d4f;
  background: white;
  color: #ff4d4f;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ff4d4f;
  color: white;
}


@media (max-width: 1360px) {
  .nav-container {
    padding: 0 10px;
    gap: 6px;
  }

  .nav-links {
    margin-left: 10px;
    gap: 4px;
  }

  .nav-link {
    max-width: 80px;
    padding: 7px 10px;
    font-size: 0.9rem;
  }

  .custom-software-btn,
  .feedback-btn {
    max-width: 100px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .locale-select {
    width: 110px;
  }

  .login-btn {
    max-width: 78px;
    padding: 7px 12px;
    font-size: 13px;
  }
}

@media (max-width: 1220px) {
  .logo-text {
    display: none;
  }

  .nav-links {
    margin-left: 6px;
  }

  .nav-link {
    max-width: 70px;
    padding: 6px 8px;
    font-size: 0.85rem;
  }

  .custom-software-btn {
    display: none;
  }

  .feedback-btn {
    max-width: 88px;
  }

  .locale-select {
    width: 96px;
  }

  .window-controls {
    margin-left: 6px;
    padding-left: 6px;
  }
}
</style>
