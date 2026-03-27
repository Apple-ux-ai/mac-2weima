<template>
  <div class="app">
    <!-- 背景水印 -->
    <div class="app-watermark"></div>

    <TopNav 
      v-if="!showDynamicManager && !showFolderList"
      :active-tab="activeTab"
      @change-tab="handleTabChange" 
      @open-server-config="showServerConfig = true"
      @open-storage-manager="showStorageManager = true"
      @open-login="showLoginModal = true"
    />
    <LoginModal
      v-if="showLoginModal"
      :show="showLoginModal"
      @close="showLoginModal = false"
    />
    <UpdateModal
      v-if="showUpdateModal"
      :show="showUpdateModal"
      :update-info="updateInfo"
      @close="showUpdateModal = false"
    />
    <LoadingModal
      v-if="showLoadingModal"
      :show="showLoadingModal"
      :text="loadingText"
    />
    <ServerConfig
      v-if="showServerConfig"
      @close="showServerConfig = false"
    />
    <StorageManager
      v-if="showStorageManager"
      @close="showStorageManager = false"
      @open-server-config="showServerConfig = true; showStorageManager = false"
    />
    <FolderList
      v-if="showFolderList"
      ref="folderListRef"
      @open-folder="handleOpenFolder"
      @create-folder="handleCreateFolder"
      @close="handleCloseFolderList"
      @single-code="handleSingleCode"
      @blank-qr="handleBlankQR"
      @batch-excel="handleBatchExcel"
    />
    <DynamicQRManager
      v-if="showDynamicManager"
      ref="dynamicManagerRef"
      @close="handleCloseManager"
    />
    
    <!-- 滚动容器 -->
    <div 
      v-if="!showDynamicManager && !showFolderList"
      class="scroll-wrapper"
    >
      <div :class="['main-container', { 'batch-mode': activeTab === 'batch', 'advanced-mode': activeTab === 'advanced' }]">
        <div class="content-view">
          <QRGenerator 
            v-if="activeTab !== 'advanced'"
            :active-tab="activeTab" 
            :qr-data-url="qrDataURL"
            :qr-info="qrInfo"
            :save-to-livecode-image="saveToLiveCodeImage"
            :save-to-livecode-file="saveToLiveCodeFile"
            @qr-generated="handleQRGenerated"
            @change-tab="handleTabChange"
            @batch-generated="handleBatchGenerated"
            @show-folder-list="handleShowFolderList"
            @save-to-livecode-change="handleSaveToLiveCodeChange"
          />
          <AdvancedEditor
            v-if="activeTab === 'advanced'"
            @qr-generated="handleQRGenerated"
          />
        </div>
        
        <!-- 页脚标识 -->
        <div class="app-footer">
          <div class="footer-content">
            <p class="footer-text">{{ t('app.footer.productLine') }}</p>
            <div class="version-area">
              <span class="footer-version" v-if="appVersion">v{{ appVersion }} (Pro)</span>
              <button class="check-update-btn" @click="manualCheckUpdate">{{ t('app.footer.checkUpdate') }}</button>
            </div>
            <img src="/footer_logo.ico" class="footer-logo" alt="logo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cleanOldFiles } from './common/utils/indexedDB'
import { getAdvertisement } from './utils/api.js'
import TopNav from './components/TopNav.vue'
import QRGenerator from './components/QRGenerator.vue'
import QRPreview from './components/QRPreview.vue'
import AdvancedEditor from './components/AdvancedEditor.vue'
import DynamicQRManager from './components/DynamicQRManager.vue'
import FolderList from './components/FolderList.vue'
import ServerConfig from './components/ServerConfig.vue'
import StorageManager from './components/StorageManager.vue'
import LoginModal from './components/LoginModal.vue'
import UpdateModal from './components/UpdateModal.vue'
import LoadingModal from './components/LoadingModal.vue'
import { userStore } from './modules/user'
import { licenseService } from './utils/license'
const { t } = useI18n()

const activeTab = ref('text')
const qrDataURL = ref('')
const qrInfo = ref(null)
const showDynamicManager = ref(false)
const showFolderList = ref(false)
const showServerConfig = ref(false)
const showStorageManager = ref(false)
const showLoginModal = ref(false)
const showUpdateModal = ref(false)
const showLoadingModal = ref(false)
const loadingText = ref(t('app.loading.checkingUpdate'))
const updateInfo = ref({})
const dynamicManagerRef = ref(null)
const folderListRef = ref(null)
const pendingBatchData = ref(null)
const saveToLiveCodeImage = ref(false)
const saveToLiveCodeFile = ref(false)

// 版本号
const appVersion = ref('')

// 广告相关状态
const advListBottom = ref([])
const currentAdvIndex = ref(0)
let carouselTimer = null

const advListLeft = ref([])
const advListRight = ref([])
const isLeftCollapsed = ref(false)
const isRightCollapsed = ref(false)

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleSaveToLiveCodeChange = ({ type, checked }) => {
  if (type === 'image') {
    saveToLiveCodeImage.value = checked
  } else if (type === 'file') {
    saveToLiveCodeFile.value = checked
  }
}

const handleQRGenerated = (data) => {
  console.log('收到二维码生成事件:', data)
  if (data && data.dataURL) {
    qrDataURL.value = data.dataURL
    qrInfo.value = data.info
    console.log('二维码已更新到预览组件')
  } else {
    console.error('二维码数据格式错误:', data)
  }
}

// 处理批量生成完成
const handleBatchGenerated = (batchData) => {
  console.log('收到批量生成事件:', batchData)
  if (batchData && batchData.type === 'dynamic') {
    // 保存批量数据，等待创建文件夹
    pendingBatchData.value = batchData
    // 显示文件夹列表
    showFolderList.value = true
    // 等待组件挂载后加载文件夹列表并显示创建对话框
    nextTick(() => {
      if (folderListRef.value) {
        // 重新加载文件夹列表
        if (folderListRef.value.loadFolders) {
          folderListRef.value.loadFolders()
        }
        // 显示创建对话框
        if (folderListRef.value.showCreateDialogForBatch) {
          folderListRef.value.showCreateDialogForBatch()
        }
      }
    })
  }
}

// 处理创建文件夹
const handleCreateFolder = async (folder) => {
  if (pendingBatchData.value) {
    // 临时显示活码管理界面来生成活码（但不显示给用户）
    showDynamicManager.value = true
    
    // 等待组件挂载后初始化数据并生成活码
    await nextTick()
    if (dynamicManagerRef.value && dynamicManagerRef.value.initFromBatchData) {
      await dynamicManagerRef.value.initFromBatchData(pendingBatchData.value, folder.id)
      // 生成完成后，隐藏活码管理界面，停留在文件夹列表
      showDynamicManager.value = false
      // 刷新文件夹列表以显示最新的二维码数量
      await nextTick()
      if (folderListRef.value && folderListRef.value.loadFolders) {
        folderListRef.value.loadFolders()
      }
    }
    
    pendingBatchData.value = null
  }
}

// 处理打开文件夹
const handleOpenFolder = (folder) => {
  // 隐藏文件夹列表，显示活码管理页面
  showFolderList.value = false
  showDynamicManager.value = true
  
  // 等待组件挂载后初始化文件夹数据
  nextTick(() => {
    if (dynamicManagerRef.value && dynamicManagerRef.value.initFromFolder) {
      dynamicManagerRef.value.initFromFolder(folder)
    }
  })
}

// 处理关闭活码管理页面
const handleCloseManager = () => {
  showDynamicManager.value = false
  // 返回文件夹列表
  showFolderList.value = true
  // 刷新文件夹列表以显示最新的二维码数量
  nextTick(() => {
    if (folderListRef.value && folderListRef.value.loadFolders) {
      folderListRef.value.loadFolders()
    }
  })
}

// 处理显示文件夹列表
const handleShowFolderList = () => {
  showFolderList.value = true
  // 等待组件挂载后加载文件夹列表
  nextTick(() => {
    if (folderListRef.value && folderListRef.value.loadFolders) {
      folderListRef.value.loadFolders()
    }
  })
}

// 处理关闭文件夹列表（返回批量生成界面）
const handleCloseFolderList = () => {
  showFolderList.value = false
  // 返回批量生成界面
  activeTab.value = 'batch'
  pendingBatchData.value = null
}

// 处理单码选项
const handleSingleCode = () => {
  // 切换到文件/图片/音视频标签页
  activeTab.value = 'file'
  showFolderList.value = false
}

// 处理空白二维码选项
const handleBlankQR = () => {
  // 切换到文本标签页
  activeTab.value = 'text'
  showFolderList.value = false
}

// 处理批量Excel选项
const handleBatchExcel = () => {
  // 切换到批量二维码标签页
  activeTab.value = 'batch'
  showFolderList.value = false
}

const openAdvLink = (adv) => {
  if (adv && adv.target_url) {
    if (window.electron && window.electron.openExternal) {
      window.electron.openExternal(adv.target_url)
    } else {
      window.open(adv.target_url, '_blank')
    }
  }
}

const startCarousel = () => {
  if (carouselTimer) return
  carouselTimer = setInterval(() => {
    if (advListBottom.value.length > 1) {
      currentAdvIndex.value = (currentAdvIndex.value + 1) % advListBottom.value.length
    }
  }, 3000)
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

const goToAdv = (index) => {
  currentAdvIndex.value = index
  // 重置定时器
  stopCarousel()
  startCarousel()
}

onMounted(async () => {
  // 启动时校验授权码
  try {
    const isValid = await licenseService.checkCurrentLicense()
    if (isValid) {
      console.log('启动授权校验成功')
    } else {
      // 只有在明确有授权码但校验不通过的情况下才提示或处理
      // 注意：如果是因为网络问题，checkCurrentLicense 内部已经处理并返回 false，
      // 但我们不应该在这里轻易删除 localStorage，除非确定是授权码过期/无效
      const savedCode = licenseService.getSavedLicense()
      if (savedCode) {
        console.warn('当前保存的授权码可能已失效')
      }
    }
  } catch (err) {
    console.error('启动授权校验异常:', err)
  }

  // 初始化用户信息
  await userStore.init()
  
  // 清理旧文件
  await cleanOldFiles()
  
  // 获取版本号
  getAppVersion()
  
  // 检查更新
  checkUpdate()

  // 获取广告
  const [bottomAdvs, leftAdvs, rightAdvs] = await Promise.all([
    getAdvertisement('10019', 'adv_position_02'),
    getAdvertisement('10019', 'adv_position_03'),
    getAdvertisement('10019', 'adv_position_04')
  ])

  if (bottomAdvs && bottomAdvs.length > 0) {
    advListBottom.value = bottomAdvs
    startCarousel()
  }

  if (leftAdvs && leftAdvs.length > 0) {
    advListLeft.value = leftAdvs
  }

  if (rightAdvs && rightAdvs.length > 0) {
    advListRight.value = rightAdvs
  }

  // 移动端键盘弹出处理
  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      const scrollWrapper = document.querySelector('.scroll-wrapper')
      if (scrollWrapper) {
        // 键盘弹出时，如果有活跃的输入框，滚动到它
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
        }
      }
    })
  }
})

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

// 手动检查更新
const manualCheckUpdate = async () => {
  if (window.electron && window.electron.checkUpdate) {
    try {
      // 1. 显示加载中
      loadingText.value = t('app.loading.checkingUpdate')
      showLoadingModal.value = true
      
      // 2. 请求检查
      const result = await window.electron.checkUpdate()
      
      // 3. 隐藏加载中 (稍微延迟一点以免闪烁)
      setTimeout(() => {
        showLoadingModal.value = false
        
        // 4. 处理结果
        if (result.success && result.data) {
          // 注意：API 返回结构直接在 data 下，或者 data.data 下，需要根据实际情况适配
          // 根据截图：result.data 包含了 has_update, version 等字段
          const apiData = result.data
          
          if (apiData.has_update) {
            // 数据映射适配
            updateInfo.value = {
              version_name: apiData.version,
              description: apiData.update_log,
              create_time: apiData.release_date,
              download_url: apiData.download_url,
              hash: apiData.package_hash
            }
            showUpdateModal.value = true
          } else {
            alert(t('app.footer.latest'))
          }
        } else {
          alert(t('app.update.fail', { reason: result.error || 'Unknown error' }))
        }
      }, 500)
      
    } catch (error) {
      showLoadingModal.value = false
      console.error('检查更新失败:', error)
      alert(t('app.update.exception', { reason: error.message }))
    }
  } else {
    alert(t('app.update.unsupported'))
  }
}

// 自动检查更新 (静默模式)
const checkUpdate = async () => {
  if (window.electron && window.electron.checkUpdate) {
    try {
      console.log('开始自动检查更新...')
      const result = await window.electron.checkUpdate()
      console.log('检查更新结果:', result)
      
      if (result.success && result.data && result.data.has_update) {
        const apiData = result.data
        // 数据映射适配
        updateInfo.value = {
          version_name: apiData.version,
          description: apiData.update_log,
          create_time: apiData.release_date,
          download_url: apiData.download_url,
          hash: apiData.package_hash
        }
        showUpdateModal.value = true
      }
    } catch (error) {
      console.error('检查更新失败:', error)
    }
  }
}

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
  /* 确保水印在底层 */
}

.version-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-update-btn {
  font-size: 12px;
  color: #666;
  background: transparent;
  border: 1px solid #ddd;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.check-update-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 背景水印样式 */
.app-watermark {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.08; 
  /* 使用多重背景，在指定点位放置 Logo，彻底杜绝密集 */
  background-image: 
    url('/footer_logo.ico'),
    url('/footer_logo.ico'),
    url('/footer_logo.ico'),
    url('/footer_logo.ico'),
    url('/footer_logo.ico');
  background-repeat: no-repeat;
  background-position: 
    10% 15%,   /* 左上 */
    90% 20%,   /* 右上 */
    92% 45%,   /* 红色区域（右侧中部） */
    15% 85%,   /* 左下 */
    85% 80%;   /* 右下 */
  background-size: 160px 160px;
  transform: rotate(-15deg);
  transform-origin: center;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* 平滑滚动 */
  scroll-behavior: smooth;
  z-index: 1; /* 确保内容在水印上方 */
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  gap: 20px;
  /* 确保 main-container 至少撑满高度，让广告位在底部 */
  min-height: calc(100vh - 60px); 
  position: relative;
}

.content-view {
  width: 100%;
  display: flex;
  justify-content: center;
  flex: 1; /* 撑开空间，将广告位推到底部 */
}

/* 页脚样式 */
.app-footer {
  margin-top: 40px;
  padding-bottom: 30px;
  display: flex;
  justify-content: center;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-text {
  font-size: 16px;
  color: #666;
  font-weight: 600;
  letter-spacing: 1.5px;
  opacity: 1;
  margin: 0;
}

.footer-logo {
  height: 20px;
  width: auto;
  display: block;
}

/* 广告轮播动画 */
.fade-carousel-enter-active,
.fade-carousel-leave-active {
  transition: opacity 0.5s ease;
}

.fade-carousel-enter-from,
.fade-carousel-leave-to {
  opacity: 0;
}



.main-container.batch-mode {
  grid-template-columns: 1fr;
  max-width: 1400px;
}

.main-container.advanced-mode {
  padding: 0;
  max-width: 100%;
  gap: 0;
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 15px;
  }
  
  .main-container.batch-mode {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 10px;
    gap: 10px;
  }
}
</style>