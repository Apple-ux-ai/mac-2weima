<template>
  <div class="qr-generator">
    <div class="generator-card">
      <!-- 文本/网址 -->
      <div v-if="activeTab === 'text'" class="input-section">
        <div class="input-header">
          <h3>{{ t('qrGenerator.text.title') }}</h3>
          <button class="advanced-btn" @click="$emit('change-tab', 'advanced')">
            {{ t('qrGenerator.text.advanced') }}
          </button>
        </div>
        <textarea 
          v-model="textInput"
          :placeholder="t('qrGenerator.text.placeholder')"
          rows="8"
        ></textarea>
      </div>

      <!-- 文件 -->
      <div v-else-if="activeTab === 'file'" class="input-section">
        <div class="input-header">
          <h3>{{ t('qrGenerator.file.title') }}</h3>
          <div class="header-actions">
            <label class="save-to-livecode-checkbox">
              <input 
                type="checkbox" 
                v-model="saveToLiveCodeFile"
              />
              <span>{{ t('qrGenerator.file.saveToLiveCode') }}</span>
            </label>
          </div>
        </div>

        <!-- 文件选项 -->
        <div v-if="uploadedFiles.length > 0" class="file-options">
          <div class="option-row">
            <label>{{ t('qrGenerator.file.titleLabel') }}</label>
            <input 
              v-model="fileTitle" 
              type="text" 
              :placeholder="t('qrGenerator.file.titlePlaceholder')"
              class="title-input"
            />
          </div>
          <div class="option-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="allowDownload" />
              <span>{{ t('qrGenerator.file.allowDownload') }}</span>
              <span class="help-icon" :title="t('qrGenerator.file.allowDownloadTip')">?</span>
            </label>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="files-grid">
          <div 
            v-for="(file, index) in uploadedFiles" 
            :key="index"
            class="file-card"
          >
            <div class="file-icon-large">{{ getDocumentIcon(file.fileName) }}</div>
            <p class="file-name">{{ file.fileName }}</p>
            <p class="file-size">{{ formatFileSize(file.fileSize) }}</p>
            <button class="remove-btn" @click="removeFileByIndex(index)">✕</button>
          </div>
          
          <div class="file-card add-file" @click="selectFile">
            <div class="add-icon">+</div>
            <p>{{ t('qrGenerator.file.addFile') }}</p>
          </div>
        </div>

        <p class="hint">{{ t('qrGenerator.file.hint') }}</p>
      </div>

      <!-- 图片 -->
      <div v-else-if="activeTab === 'image'" class="input-section">
        <div class="input-header">
          <h3>{{ t('qrGenerator.image.title') }}</h3>
          <label class="save-to-livecode-checkbox">
            <input 
              type="checkbox" 
              v-model="saveToLiveCodeImage"
            />
            <span>{{ t('qrGenerator.file.saveToLiveCode') }}</span>
          </label>
        </div>
        <!-- 图片列表 -->
        <div class="images-grid">
          <div 
            v-for="(image, index) in uploadedImages" 
            :key="index"
            class="image-card"
          >
            <div class="image-preview">
              <img :src="image.dataURL" :alt="image.fileName" />
              <button class="remove-btn" @click.stop="removeImage(index)">✕</button>
            </div>
            <p class="image-name" :title="image.fileName">{{ image.fileName }}</p>
          </div>
          
          <div class="image-card add-image" @click="selectImage">
            <div class="upload-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>{{ t('qrGenerator.image.addImage') }}</p>
            </div>
          </div>
        </div>
        <p class="hint">{{ t('qrGenerator.image.hint') }}</p>
      </div>

      <!-- 音视频 -->
      <div v-else-if="activeTab === 'media'" class="input-section">
        <div class="input-header">
          <h3>{{ t('qrGenerator.media.title') }}</h3>
        </div>
        
        <!-- 模式选择 -->
        <div class="media-mode-selector">
          <button 
            :class="['mode-btn', { active: mediaMode === 'url' }]"
            @click="mediaMode = 'url'"
          >
            🔗 {{ t('qrGenerator.media.online') }}
          </button>
          <button 
            :class="['mode-btn', { active: mediaMode === 'file' }]"
            @click="mediaMode = 'file'"
          >
            📁 {{ t('qrGenerator.media.local') }}
          </button>
        </div>

        <!-- 在线链接模式 -->
        <div v-if="mediaMode === 'url'" class="media-url-mode">
          <textarea 
            v-model="mediaUrl"
            :placeholder="t('qrGenerator.media.placeholder')"
            rows="5"
          ></textarea>
          <p class="hint">✅ {{ t('qrGenerator.media.onlineHint') }}</p>
        </div>

        <!-- 本地文件模式 -->
        <div v-else class="media-file-mode">
          <div class="file-upload-area" @click="selectMedia">
            <div v-if="!mediaData" class="upload-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <p>{{ t('qrGenerator.media.selectMedia') }}</p>
              <span>{{ t('qrGenerator.media.support') }}</span>
            </div>
            <div v-else class="file-info">
              <div class="file-icon">{{ getMediaIcon(mediaData.fileName) }}</div>
              <div class="file-details">
                <p class="file-name">{{ mediaData.fileName }}</p>
                <p class="file-size">{{ formatFileSize(mediaData.fileSize) }}</p>
              </div>
              <button class="remove-btn" @click.stop="removeMedia">✕</button>
            </div>
          </div>
          <p class="hint">⚠️ {{ t('qrGenerator.media.localHint') }}</p>
        </div>
      </div>

      <!-- 批量二维码 -->
      <div v-else-if="activeTab === 'batch'" class="batch-section">
        <BatchQRGenerator @batch-generated="handleBatchGenerated" @show-folder-list="handleShowFolderList" />
      </div>

      <!-- 快捷按钮 -->
      <div v-if="activeTab === 'text'" class="quick-actions">
        <button class="quick-btn file-btn" @click="$emit('change-tab', 'file')">
          <span class="btn-icon">📄</span>
          <span class="btn-text">{{ t('qrGenerator.quick.file') }}</span>
        </button>
        <button class="quick-btn image-btn" @click="$emit('change-tab', 'image')">
          <span class="btn-icon">🖼️</span>
          <span class="btn-text">{{ t('qrGenerator.quick.image') }}</span>
        </button>
        <button class="quick-btn video-btn" @click="$emit('change-tab', 'media')">
          <span class="btn-icon">🎬</span>
          <span class="btn-text">{{ t('qrGenerator.quick.media') }}</span>
        </button>
      </div>

      <!-- 设置按钮 -->
      <div v-if="activeTab !== 'batch'" class="settings-bar">
        <button class="settings-trigger-btn" @click="showSettingsModal = true">
          ⚙️ {{ t('qrGenerator.common.settingsPreview') }}
        </button>
      </div>

      <!-- 生成按钮（批量二维码标签页不显示） -->
      <button 
        v-if="activeTab !== 'batch'"
        class="generate-btn" 
        :class="{ 'generating': isGenerating }"
        :disabled="isGenerating"
        @click="generateQR"
      >
        <span v-if="isGenerating" class="loading-spinner"></span>
        <span>{{ isGenerating ? t('qrGenerator.common.generating') : t('qrGenerator.common.generate') }}</span>
      </button>
      
      <!-- 加载遮罩层 -->
      <div v-if="isGenerating" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner-large"></div>
          <p class="loading-text">{{ t('qrGenerator.common.loadingText') }}</p>
          <p class="loading-hint" v-if="activeTab === 'media' && mediaMode === 'file'">{{ t('qrGenerator.common.mediaHint') }}</p>
        </div>
      </div>

      <!-- 设置与预览弹窗 -->
      <QRSettingsModal
        v-if="showSettingsModal"
        :qr-size="qrSize"
        :qr-color="qrColor"
        :qr-bg-color="qrBgColor"
        :error-level="errorLevel"
        :qr-data-url="qrDataUrl"
        :qr-info="qrInfo"
        @update:qrSize="qrSize = $event"
        @update:qrColor="qrColor = $event"
        @update:qrBgColor="qrBgColor = $event"
        @update:errorLevel="errorLevel = $event"
        @regenerate="generateQR"
        @close="showSettingsModal = false"
      />

      <!-- 创建文件夹对话框 -->
      <div v-if="showCreateFolderDialog" class="create-folder-dialog-overlay" @click.self="closeCreateFolderDialog">
        <div class="create-folder-dialog">
          <div class="create-folder-dialog-header">
            <h3>{{ t('folderList.createFolderTitle') }}</h3>
            <button class="close-btn" @click="closeCreateFolderDialog">✕</button>
          </div>
          <div class="create-folder-dialog-body">
            <div class="form-field">
              <label>{{ t('folderList.folderNameLabel') }}</label>
              <input 
                v-model="newFolderName" 
                type="text" 
                :placeholder="t('folderList.folderNamePlaceholder')"
                class="form-input"
                @keyup.enter="confirmCreateFolder"
              />
            </div>
          </div>
          <div class="create-folder-dialog-footer">
            <button class="cancel-btn" @click="closeCreateFolderDialog">{{ t('folderList.cancel') }}</button>
            <button class="save-btn" @click="confirmCreateFolder">{{ t('folderList.confirm') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 授权验证弹窗 -->
    <LicenseModal 
      v-model:visible="showLicenseModal"
      @success="onLicenseSuccess"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import BatchQRGenerator from './BatchQRGenerator.vue'
import QRSettingsModal from './QRSettingsModal.vue'
import LicenseModal from './LicenseModal.vue'
import { licenseService } from '../utils/license.js'
import { storeFile as storeFileInIndexedDB, isIndexedDBAvailable } from '../utils/indexedDB.js'
import { getServerBaseUrl } from '../utils/serverConfig.js'
import { getApiBaseUrl, saveContentToServer, checkApiServer, getAdvertisement } from '../utils/api.js'
const { t } = useI18n()

const props = defineProps({
  activeTab: String,
  qrDataUrl: String,
  qrInfo: Object,
  saveToLiveCodeImage: {
    type: Boolean,
    default: false
  },
  saveToLiveCodeFile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['qr-generated', 'change-tab', 'batch-generated', 'show-folder-list', 'save-to-livecode-change'])

// 输入数据
const textInput = ref('')
const uploadedFiles = ref([]) // 多文件数组
const fileGenerateMode = ref('single') // 'single' 或 'batch'
const fileTitle = ref('')
const allowDownload = ref(true)
const uploadedImages = ref([]) // 多图片数组
const mediaMode = ref('url') // 'url' 或 'file'
const mediaUrl = ref('')
const mediaData = ref(null)

// 加载状态
const isGenerating = ref(false)
const showSettingsModal = ref(false)
const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
const pendingQRData = ref(null)
// 授权弹窗状态
const showLicenseModal = ref(false)

// 保存到活码状态（从 props 同步）
const saveToLiveCodeImage = ref(false)
const saveToLiveCodeFile = ref(false)

// 监听 props 变化，同步到内部状态
watch(() => props.saveToLiveCodeImage, (newVal) => {
  saveToLiveCodeImage.value = newVal
}, { immediate: true })

watch(() => props.saveToLiveCodeFile, (newVal) => {
  saveToLiveCodeFile.value = newVal
}, { immediate: true })

// 监听内部状态变化，同步到父组件（用于导航栏复选框同步）
watch(saveToLiveCodeImage, (newVal) => {
  if (newVal !== props.saveToLiveCodeImage) {
    emit('save-to-livecode-change', { type: 'image', checked: newVal })
  }
})

watch(saveToLiveCodeFile, (newVal) => {
  if (newVal !== props.saveToLiveCodeFile) {
    emit('save-to-livecode-change', { type: 'file', checked: newVal })
  }
})

// 二维码设置
const qrSize = ref(400)
const qrColor = ref('#000000')
const qrBgColor = ref('#ffffff')
const errorLevel = ref('M')

// 监听标签切换，清空之前的输入
watch(() => props.activeTab, () => {
  textInput.value = ''
  uploadedFiles.value = []
  fileGenerateMode.value = 'single'
  fileTitle.value = ''
  allowDownload.value = true
  uploadedImages.value = []
  mediaMode.value = 'url'
  mediaUrl.value = ''
  mediaData.value = null
  // 不清空保存到活码状态，保持用户选择
})

// 选择文件（支持多文件）
const selectFile = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true // 支持多文件选择
  // 只接受文档类型
  input.accept = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf'
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      // 验证文件类型
      const fileName = file.name.toLowerCase()
      const validExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf']
      const isValidType = validExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isValidType) {
        alert(t('qrGeneratorExtra.fileTypeNotSupported', { name: file.name }))
        return
      }
      
      // 检查文件大小（限制50MB）
      if (file.size > 50 * 1024 * 1024) {
        alert(t('qrGeneratorExtra.fileTooLarge50', { name: file.name }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        uploadedFiles.value.push({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          dataURL: event.target.result
        })
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

// 获取文档图标
const getDocumentIcon = (fileName) => {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop().toLowerCase()
  
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (ext === 'pdf') return '📕'
  
  return '📄'
}

// 移除指定文件
const removeFileByIndex = (index) => {
  uploadedFiles.value.splice(index, 1)
  if (uploadedFiles.value.length === 0) {
    fileTitle.value = ''
    fileGenerateMode.value = 'single'
  }
}

// 选择图片（支持多图片）
const selectImage = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true // 支持多文件选择
  input.accept = 'image/*'
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    let loadedCount = 0
    const totalFiles = files.length
    
    files.forEach((file, index) => {
      // 检查文件大小（限制10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert(t('qrGeneratorExtra.imageTooLargeName', { name: file.name }))
        return
      }
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert(t('qrGeneratorExtra.notValidImage', { name: file.name }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        uploadedImages.value.push({
          fileName: file.name,
          fileType: file.type,
          dataURL: event.target.result
        })
        loadedCount++
        
        if (loadedCount === totalFiles) {
          console.log(`✓ 已加载 ${loadedCount} 张图片`)
        }
      }
      reader.onerror = () => {
        alert(t('qrGeneratorExtra.readImageFailed', { name: file.name }))
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

// 移除图片
const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

// 选择音视频文件
const selectMedia = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*,audio/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 文件大小限制配置
      const maxFileSize = 200 * 1024 * 1024 // 200MB - 文件选择限制
      const warningSize = 20 * 1024 * 1024 // 20MB - 警告阈值
      const localStorageLimit = 10 * 1024 * 1024 // 10MB - localStorage大致限制
      
      // 检查文件大小
      if (file.size > maxFileSize) {
        alert(t('qrGeneratorExtra.fileTooLargeSize', { size: formatFileSize(maxFileSize) }))
        return
      }
      
      // 如果文件较大，给出提示
      if (file.size > localStorageLimit) {
        if (!confirm(t('qrGeneratorExtra.confirmSaveLargeFile', { size: formatFileSize(file.size) }))) {
          return
        }
      } else if (file.size > warningSize) {
        console.warn('文件较大，存储可能失败，建议使用"在线链接"模式')
      }
      
      console.log('开始读取文件:', file.name, formatFileSize(file.size))
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataURL = event.target.result
        const dataSize = dataURL.length
        console.log('文件读取完成，dataURL大小:', formatFileSize(dataSize))
        
        // 检查数据大小
        if (dataSize > localStorageLimit * 1.5) {
          console.warn('数据大小超过建议限制，存储可能失败')
        }
        
        mediaData.value = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          dataURL: dataURL // 完整的data URL
        }
      }
      reader.onerror = (error) => {
        console.error('文件读取失败:', error)
        alert(t('qrGeneratorExtra.fileReadFailed'))
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除音视频
const removeMedia = () => {
  mediaData.value = null
}

// 获取媒体文件图标
const getMediaIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(ext)) {
    return '🎬'
  } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
    return '🎵'
  }
  return '🎞️'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 处理批量生成
const handleBatchGenerated = (batchData) => {
  console.log('批量二维码生成完成:', batchData)
  // 如果是活码，触发跳转到活码管理页面
  if (batchData && batchData.type === 'dynamic') {
    // 通过emit传递数据给父组件
    emit('batch-generated', batchData)
  }
}

const handleShowFolderList = () => {
  emit('show-folder-list')
}

// 保存文件数据到服务器或本地存储（优先服务器）
const saveFileData = async (fileId, fileData) => {
  console.log('========== 开始保存文件 ==========')
  console.log('文件ID:', fileId)
  console.log('文件名:', fileData.fileName)
  console.log('文件大小:', fileData.fileSize, '字节')
  console.log('文件类型:', fileData.fileType)
  
  // 先尝试保存到服务器（必须成功才能跨设备访问）
  try {
    console.log('步骤1: 检查API服务器可用性...')
    const apiAvailable = await checkApiServer()
    console.log('API服务器检查结果:', apiAvailable ? '✓ 可用' : '✗ 不可用')
    
    if (apiAvailable) {
      console.log('步骤2: API服务器可用，开始保存到服务器...')
      const saveResult = await saveContentToServer(fileId, fileData)
      console.log('步骤3: 保存请求完成，验证文件是否真的在服务器上...')
      
      // 验证文件是否真的保存到服务器（通过尝试获取）
      const { getContentFromServer } = await import('../utils/api.js')
      const verifyData = await getContentFromServer(fileId)
      
      if (!verifyData) {
        console.error('验证失败：文件未在服务器上找到')
        throw new Error(t('qrGeneratorExtra.saveToServerVerifyFailed'))
      }
      
      console.log('步骤4: ✓ 文件已成功保存到服务器并验证通过')
      console.log('保存结果:', saveResult)
      // 服务器保存成功，同时保存到本地存储作为备份（确保本地也能访问）
      try {
        const fileDataStr = JSON.stringify(fileData)
        const dataSize = fileDataStr.length
        
        // 如果数据较大（>5MB），尝试使用IndexedDB
        if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
          try {
            await storeFileInIndexedDB(fileId, fileData)
            localStorage.setItem(fileId, JSON.stringify({ _indexedDB: true }))
            console.log(`✓ 文件 ${fileId} 已同时保存到IndexedDB作为备份`)
          } catch (indexedDBError) {
            console.warn('IndexedDB备份保存失败，使用localStorage:', indexedDBError)
            localStorage.setItem(fileId, fileDataStr)
            console.log(`✓ 文件 ${fileId} 已同时保存到localStorage作为备份`)
          }
        } else {
          localStorage.setItem(fileId, fileDataStr)
          console.log(`✓ 文件 ${fileId} 已同时保存到localStorage作为备份`)
        }
      } catch (backupError) {
        console.warn('本地存储备份失败，但不影响服务器保存:', backupError)
      }
      return { success: true, savedToServer: true }
    } else {
      console.warn('API服务器不可用，无法跨设备访问')
      throw new Error(t('qrGeneratorExtra.apiUnavailable'))
    }
  } catch (error) {
    console.error('========== 保存到服务器失败 ==========')
    console.error('错误类型:', error.name)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    // 如果服务器保存失败，询问用户是否继续
    const errorMessage = error.message || t('dynamicManager.common.unknownError')
    const shouldContinue = confirm(t('qrGeneratorExtra.confirmSaveToLocal', { msg: errorMessage }))
    
    if (!shouldContinue) {
      console.log('用户取消保存')
      throw new Error(t('qrGeneratorExtra.userCancelSave'))
    }
    
    // 用户选择继续，保存到本地存储
    console.warn('用户选择继续，降级到本地存储（仅当前设备可访问）')
  }
  
  // 降级到本地存储（仅当前设备可访问）
  try {
    // 对于大文件，尝试使用IndexedDB
    const fileDataStr = JSON.stringify(fileData)
    const dataSize = fileDataStr.length
    
    // 如果数据较大（>5MB），尝试使用IndexedDB
    if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
      try {
        await storeFileInIndexedDB(fileId, fileData)
        // 在localStorage中保存一个标记，表示文件存储在IndexedDB中
        localStorage.setItem(fileId, JSON.stringify({ _indexedDB: true }))
        console.log(`✓ 文件 ${fileId} 已保存到IndexedDB`)
        return { success: true, savedToServer: false, savedToIndexedDB: true }
      } catch (indexedDBError) {
        console.warn('IndexedDB存储失败，降级到localStorage:', indexedDBError)
      }
    }
    
    // 使用localStorage存储
    localStorage.setItem(fileId, fileDataStr)
    console.log(`✓ 文件 ${fileId} 已保存到本地存储`)
    return { success: true, savedToServer: false, savedToIndexedDB: false }
  } catch (error) {
    console.error('保存到本地存储失败:', error)
    if (error.name === 'QuotaExceededError') {
      throw new Error(t('qrGeneratorExtra.storageInsufficientFile'))
    }
    throw error
  }
}

const onLicenseSuccess = () => {
  generateQR()
}

// 生成二维码
const generateQR = async () => {
  // 授权检查 - 优先使用缓存，减少 API 调用和可能的失效风险
  let isLicensed = licenseService.getIsAuthed()
  
  if (!isLicensed) {
    // 如果缓存没有，再尝试在线校验一次
    isLicensed = await licenseService.checkCurrentLicense()
  }

  if (!isLicensed) {
    // 如果校验依然失败，清除可能过期的授权码并显示弹窗
    localStorage.removeItem('auth_code')
    showLicenseModal.value = true
    return
  }

  // 防止重复点击
  if (isGenerating.value) {
    return
  }
  
  // 设置加载状态
  isGenerating.value = true
  
  try {
    let content = ''
    let displayContent = ''
    
    // 根据不同标签页获取内容
    console.log('========== 开始生成二维码 ==========')
    console.log('当前标签页:', props.activeTab)
    console.log('uploadedFiles数量:', uploadedFiles.value.length)
    
    switch (props.activeTab) {
    case 'text':
      content = textInput.value.trim()
      displayContent = content
      break
    case 'file':
      console.log('处理文件类型，uploadedFiles数量:', uploadedFiles.value.length)
      if (uploadedFiles.value.length > 0) {
        // 如果有多个文件，自动使用批量模式生成文件夹二维码
        if (uploadedFiles.value.length > 1) {
          // 创建文件夹ID
          const folderId = 'folder_' + Date.now()
          
          let successCount = 0
          for (let index = 0; index < uploadedFiles.value.length; index++) {
            const file = uploadedFiles.value[index]
            const fileId = `${folderId}_file_${index}`
            
            try {
              const fileData = {
                fileName: file.fileName,
                fileSize: file.fileSize,
                fileType: file.fileType,
                dataURL: file.dataURL,
                title: fileTitle.value || file.fileName,
                allowDownload: allowDownload.value,
                folderId: folderId,
                folderName: fileTitle.value || t('qrGeneratorExtra.defaultFolderName'),
                timestamp: Date.now()
              }
              
              console.log(`存储文件 ${index + 1}/${uploadedFiles.value.length}: ${file.fileName}`)
              console.log(`文件ID: ${fileId}`)
              
              const saveResult = await saveFileData(fileId, fileData)
              successCount++
              console.log(`✓ 文件 ${file.fileName} 存储成功`, saveResult.savedToServer ? '(服务器)' : '(本地)')
            } catch (error) {
              console.error(`存储文件 ${file.fileName} 失败:`, error)
              if (error.name === 'QuotaExceededError') {
                alert(t('qrGeneratorExtra.storageInsufficientFileName', { name: file.fileName }))
              } else {
                alert(t('qrGeneratorExtra.storeFileFailed', { name: file.fileName, msg: error.message }))
              }
            }
          }
          
          console.log(`文件夹存储完成: ${successCount}/${uploadedFiles.value.length} 个文件成功`)
          if (successCount < uploadedFiles.value.length) {
            alert(t('qrGeneratorExtra.filesStorageFailed', { failed: uploadedFiles.value.length - successCount, success: successCount }))
          }
          
          // 生成文件夹索引二维码
          const baseUrl = getServerBaseUrl()
          // 确保baseUrl末尾没有斜杠，避免双斜杠
          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
          const v = Date.now()
          const apiBaseUrl = getApiBaseUrl()
          const folderUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/folder/${folderId}`
          content = folderUrl
          displayContent = t('qrGeneratorExtra.folderDisplay', { name: fileTitle.value || t('qrGeneratorExtra.untitled'), count: uploadedFiles.value.length })
        } else {
          // 单文件模式
          console.log('进入单文件模式分支')
          const file = uploadedFiles.value[0]
          const fileId = 'file_' + Date.now()
          
          console.log('开始处理单文件模式，文件ID:', fileId, '文件名:', file.fileName)
          console.log('文件信息:', {
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            hasDataURL: !!file.dataURL
          })
          
          try {
            const fileData = {
              fileName: file.fileName,
              fileSize: file.fileSize,
              fileType: file.fileType,
              dataURL: file.dataURL,
              title: fileTitle.value || file.fileName,
              allowDownload: allowDownload.value,
              timestamp: Date.now()
            }
            
            console.log('准备保存文件，文件大小:', file.fileSize, '字节')
            const saveResult = await saveFileData(fileId, fileData)
            console.log('文件保存完成，结果:', saveResult)
            
            const baseUrl = getServerBaseUrl()
            // 确保baseUrl末尾没有斜杠，避免双斜杠
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
            const v = Date.now()
            const apiBaseUrl = getApiBaseUrl()
            const viewerUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/view/${fileId}`
            content = viewerUrl
            displayContent = t('qrGeneratorExtra.docDisplay', { title: fileTitle.value || file.fileName, size: formatFileSize(file.fileSize) })
            
            console.log('生成的查看器URL:', viewerUrl)
            
            if (!saveResult.savedToServer) {
              alert(t('qrGeneratorExtra.docSavedLocalWarning'))
            } else {
              console.log('✓ 文件已成功保存到服务器，其他设备可以访问')
            }
          } catch (error) {
            console.error('存储失败:', error)
            console.error('错误详情:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            })
            alert(t('qrGeneratorExtra.fileStoreFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
            isGenerating.value = false
            return
          }
        }
      } else {
        console.error('activeTab是file但uploadedFiles为空')
        alert(t('qrGeneratorExtra.uploadFileFirst'))
        isGenerating.value = false
        return
      }
      break
    case 'image':
      if (uploadedImages.value.length > 0) {
        // 如果有多个图片，自动使用批量模式生成文件夹二维码
        if (uploadedImages.value.length > 1) {
          // 创建文件夹ID
          const folderId = 'folder_' + Date.now()
          
          let successCount = 0
          for (let index = 0; index < uploadedImages.value.length; index++) {
            const image = uploadedImages.value[index]
            // 注意：这里使用 _file_ 前缀而不是 _image_
            // 目的：兼容旧版 viewer.html（旧版只会按 folderId + '_file_' 去查找文件夹内容）
            const imageId = `${folderId}_file_${index}`
            
            try {
              const imageDataObj = {
                fileName: image.fileName,
                fileType: image.fileType || 'image/' + image.fileName.split('.').pop(),
                dataURL: image.dataURL,
                folderId: folderId,
                folderName: t('qrGeneratorExtra.imageFolderName'),
                timestamp: Date.now()
              }
              
              console.log(`存储图片 ${index + 1}/${uploadedImages.value.length}: ${image.fileName}`)
              console.log(`图片ID: ${imageId}`)
              
              const saveResult = await saveFileData(imageId, imageDataObj)
              successCount++
              console.log(`✓ 图片 ${image.fileName} 存储成功`, saveResult.savedToServer ? '(服务器)' : '(本地)')
            } catch (error) {
              console.error(`存储图片 ${image.fileName} 失败:`, error)
              if (error.name === 'QuotaExceededError') {
                alert(t('qrGeneratorExtra.imageStorageInsufficient', { name: image.fileName }))
              } else {
                alert(t('qrGeneratorExtra.storeImageFailed', { name: image.fileName, msg: error.message }))
              }
            }
          }
          
          console.log(`图片文件夹存储完成: ${successCount}/${uploadedImages.value.length} 张图片成功`)
          if (successCount < uploadedImages.value.length) {
            alert(t('qrGeneratorExtra.imagesStorageFailed', { failed: uploadedImages.value.length - successCount, success: successCount }))
          }
          
          // 生成文件夹索引二维码
          const baseUrl = getServerBaseUrl()
          // 确保baseUrl末尾没有斜杠，避免双斜杠
          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
          const v = Date.now()
          const apiBaseUrl = getApiBaseUrl()
          const folderUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/folder/${folderId}`
          content = folderUrl
          displayContent = t('qrGeneratorExtra.imageFolderDisplay', { count: uploadedImages.value.length })
          
          // 记录图片文件夹信息，用于后续保存到活码时验证
          console.log(`✓ 图片文件夹创建成功，ID: ${folderId}，包含 ${successCount} 张图片`)
          console.log(`✓ 文件夹URL: ${folderUrl}`)
          console.log(`✓ 图片文件ID列表:`, Array.from({ length: successCount }, (_, i) => `${folderId}_file_${i}`))
        } else {
          // 单图片模式
          const image = uploadedImages.value[0]
          const imageId = 'image_' + Date.now()
          
          try {
            const imageDataObj = {
              fileName: image.fileName,
              fileType: image.fileType || 'image/' + image.fileName.split('.').pop(),
              dataURL: image.dataURL,
              timestamp: Date.now()
            }
            
            const saveResult = await saveFileData(imageId, imageDataObj)
            
            const baseUrl = getServerBaseUrl()
            // 确保baseUrl末尾没有斜杠，避免双斜杠
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
            const v = Date.now()
            const apiBaseUrl = getApiBaseUrl()
            const viewerUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/view/${imageId}`
            content = viewerUrl
            displayContent = t('qrGeneratorExtra.imageDisplay', { name: image.fileName })
            
            if (!saveResult.savedToServer) {
              alert(t('qrGeneratorExtra.imageSavedLocalWarning'))
            }
          } catch (error) {
            console.error('存储失败:', error)
            alert(t('qrGeneratorExtra.imageStoreFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
            isGenerating.value = false
            return
          }
        }
      }
      break
    case 'media':
      if (mediaMode.value === 'url') {
        // 在线链接模式：直接编码URL
        content = mediaUrl.value.trim()
        displayContent = t('qrGeneratorExtra.videoLinkDisplay', { content })
      } else if (mediaData.value) {
        // 本地文件模式：生成查看器链接
        const mediaId = 'media_' + Date.now()
        
        const mediaDataObj = {
          fileName: mediaData.value.fileName,
          fileSize: mediaData.value.fileSize,
          fileType: mediaData.value.fileType,
          dataURL: mediaData.value.dataURL,
          timestamp: Date.now()
        }
        
        try {
          // 优先保存到服务器
          const saveResult = await saveFileData(mediaId, mediaDataObj)
          
          const baseUrl = getServerBaseUrl()
          // 确保baseUrl末尾没有斜杠，避免双斜杠
          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
          const v = Date.now()
          const apiBaseUrl = getApiBaseUrl()
          const viewerUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/view/${mediaId}`
          content = viewerUrl
          
          if (saveResult.savedToServer) {
            displayContent = t('qrGeneratorExtra.onlinePlayDisplay', { name: mediaData.value.fileName, size: formatFileSize(mediaData.value.fileSize) })
            console.log('✓ 文件已保存到服务器，其他设备可以访问')
          } else {
            displayContent = t('qrGeneratorExtra.localPlayDisplay', { name: mediaData.value.fileName, size: formatFileSize(mediaData.value.fileSize) })
            alert(t('qrGeneratorExtra.fileSavedLocalWarning'))
          }
        } catch (error) {
          console.error('存储失败:', error)
          alert(t('qrGeneratorExtra.mediaStoreFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
          isGenerating.value = false
          return
        }
      }
      break
    case 'batch':
      // 批量二维码由专门的组件处理
      // 不显示弹窗，直接返回
      isGenerating.value = false
      return
  }

    if (!content) {
      const pleaseKey = {
        text: 'qrGeneratorExtra.pleaseInputText',
        file: 'qrGeneratorExtra.pleaseUploadDoc',
        image: 'qrGeneratorExtra.pleaseUploadImage',
        media: 'qrGeneratorExtra.pleaseInputMedia'
      }[props.activeTab] || 'qrGeneratorExtra.pleaseInputDefault'
      alert(t(pleaseKey) + '！')
      return
    }

    try {
      console.log('开始生成二维码，内容长度:', content.length)
      
      // 创建临时canvas
      const canvas = document.createElement('canvas')
      
      await QRCode.toCanvas(canvas, content, {
        width: qrSize.value,
        margin: 2,
        errorCorrectionLevel: errorLevel.value,
        color: {
          dark: qrColor.value,
          light: qrBgColor.value
        }
      })

      const dataURL = canvas.toDataURL('image/png')
      
      console.log('二维码生成成功，数据URL长度:', dataURL.length)
      
      const qrData = {
        dataURL,
        info: {
          type: props.activeTab,
          size: qrSize.value,
          content: displayContent.substring(0, 100) + (displayContent.length > 100 ? '...' : ''),
          actualContent: content, // 实际编码的原始内容
          timestamp: new Date().toLocaleString('zh-CN')
        }
      }
      
      emit('qr-generated', qrData)
      
      // 检查是否需要保存到活码
      const shouldSaveToLiveCode = (props.activeTab === 'image' && saveToLiveCodeImage.value) ||
                                   (props.activeTab === 'file' && saveToLiveCodeFile.value)
      
      if (shouldSaveToLiveCode) {
        // 如果是多图片/多文件模式，需要为每个图片/文件生成独立的二维码
        if (props.activeTab === 'image' && uploadedImages.value.length > 1) {
          // 多图片模式：为每张图片生成独立的二维码
          console.log('多图片模式 + 保存到活码：为每张图片生成独立二维码')
          const qrDataList = []
          
          for (let index = 0; index < uploadedImages.value.length; index++) {
            const image = uploadedImages.value[index]
            const imageId = 'image_' + Date.now() + '_' + index
            
            try {
              // 保存图片数据
              const imageDataObj = {
                fileName: image.fileName,
                fileType: image.fileType || 'image/' + image.fileName.split('.').pop(),
                dataURL: image.dataURL,
                timestamp: Date.now()
              }
              
              await saveFileData(imageId, imageDataObj)
              
              // 生成单个图片的查看URL
              const baseUrl = getServerBaseUrl()
              const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
              const v = Date.now()
              const apiBaseUrl = getApiBaseUrl()
              const viewerUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/view/${imageId}`
              
              // 生成单个图片的二维码
              const canvas = document.createElement('canvas')
              await QRCode.toCanvas(canvas, viewerUrl, {
                width: qrSize.value,
                margin: 2,
                errorCorrectionLevel: errorLevel.value,
                color: {
                  dark: qrColor.value,
                  light: qrBgColor.value
                }
              })
              
              const singleQRDataURL = canvas.toDataURL('image/png')
              
              qrDataList.push({
                dataURL: singleQRDataURL,
                content: viewerUrl,
                displayContent: `图片: ${image.fileName}`,
                info: {
                  type: 'image',
                  size: qrSize.value,
                  content: `图片: ${image.fileName}`,
                  actualContent: viewerUrl,
                  timestamp: new Date().toLocaleString('zh-CN')
                },
                fileName: image.fileName,
                title: image.fileName
              })
              
              console.log(`✓ 已为图片 ${index + 1}/${uploadedImages.value.length} 生成二维码: ${image.fileName}`)
            } catch (error) {
              console.error(`为图片 ${image.fileName} 生成二维码失败:`, error)
              alert(t('qrGeneratorExtra.generateQrForImageFailed', { name: image.fileName, msg: error.message }))
            }
          }
          
          if (qrDataList.length > 0) {
            pendingQRData.value = {
              isMultiple: true,
              qrDataList: qrDataList
            }
            // 弹出创建文件夹对话框
            showCreateFolderDialog.value = true
          } else {
            alert(t('qrGeneratorExtra.noQrGenerated'))
            isGenerating.value = false
            return
          }
        } else if (props.activeTab === 'file' && uploadedFiles.value.length > 1) {
          // 多文件模式：为每个文件生成独立的二维码
          console.log('多文件模式 + 保存到活码：为每个文件生成独立二维码')
          const qrDataList = []
          
          for (let index = 0; index < uploadedFiles.value.length; index++) {
            const file = uploadedFiles.value[index]
            const fileId = 'file_' + Date.now() + '_' + index
            
            try {
              // 保存文件数据
              const fileData = {
                fileName: file.fileName,
                fileSize: file.fileSize,
                fileType: file.type || 'application/octet-stream',
                dataURL: file.dataURL,
                title: fileTitle.value || file.fileName,
                allowDownload: allowDownload.value,
                timestamp: Date.now()
              }
              
              await saveFileData(fileId, fileData)
              
              // 生成单个文件的查看URL
              const baseUrl = getServerBaseUrl()
              const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
              const v = Date.now()
              const apiBaseUrl = getApiBaseUrl()
              const viewerUrl = `${cleanBaseUrl}/viewer.html?v=${v}&api=${encodeURIComponent(apiBaseUrl)}#/view/${fileId}`
              
              // 生成单个文件的二维码
              const canvas = document.createElement('canvas')
              await QRCode.toCanvas(canvas, viewerUrl, {
                width: qrSize.value,
                margin: 2,
                errorCorrectionLevel: errorLevel.value,
                color: {
                  dark: qrColor.value,
                  light: qrBgColor.value
                }
              })
              
              const singleQRDataURL = canvas.toDataURL('image/png')
              
              qrDataList.push({
                dataURL: singleQRDataURL,
                content: viewerUrl,
                displayContent: `文档: ${fileTitle.value || file.fileName}`,
                info: {
                  type: 'file',
                  size: qrSize.value,
                  content: `文档: ${fileTitle.value || file.fileName}`,
                  actualContent: viewerUrl,
                  timestamp: new Date().toLocaleString('zh-CN')
                },
                fileName: file.fileName,
                title: fileTitle.value || file.fileName
              })
              
              console.log(`✓ 已为文件 ${index + 1}/${uploadedFiles.value.length} 生成二维码: ${file.fileName}`)
            } catch (error) {
              console.error(`为文件 ${file.fileName} 生成二维码失败:`, error)
              alert(t('qrGeneratorExtra.generateQrForFileFailed', { name: file.fileName, msg: error.message }))
            }
          }
          
          if (qrDataList.length > 0) {
            pendingQRData.value = {
              isMultiple: true,
              qrDataList: qrDataList
            }
            // 弹出创建文件夹对话框
            showCreateFolderDialog.value = true
          } else {
            alert(t('qrGeneratorExtra.noQrGenerated'))
            isGenerating.value = false
            return
          }
        } else {
          // 单图片/单文件模式：保持原有逻辑
          pendingQRData.value = {
            isMultiple: false,
            ...qrData,
            content: content,
            displayContent: displayContent
          }
          // 弹出创建文件夹对话框
          showCreateFolderDialog.value = true
        }
      } else {
        // 生成成功后自动打开预览弹窗
        showSettingsModal.value = true
      }
      
      console.log('二维码数据已发送到预览组件')
    } catch (error) {
      console.error('生成二维码失败:', error)
      alert(t('qrGeneratorExtra.generateQrFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
    }
  } catch (error) {
    console.error('生成二维码过程出错:', error)
    alert(t('qrGeneratorExtra.generateQrFailedShort', { msg: error.message || t('dynamicManager.common.unknownError') }))
  } finally {
    // 无论成功或失败，都要取消加载状态
    isGenerating.value = false
  }
}

// 关闭创建文件夹对话框
const closeCreateFolderDialog = () => {
  showCreateFolderDialog.value = false
  newFolderName.value = ''
  pendingQRData.value = null
}

// 安全保存文件夹列表
const safeSaveFolders = (folders) => {
  try {
    const dataString = JSON.stringify(folders)
    const dataSize = new Blob([dataString]).size
    
    // 检查数据大小（localStorage通常限制5-10MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (dataSize > maxSize) {
      throw new Error(t('qrGeneratorExtra.folderDataTooLarge', { size: (dataSize / 1024 / 1024).toFixed(2) }))
    }
    
    localStorage.setItem('dynamicQRFolders', dataString)
    console.log('文件夹列表保存成功，大小:', (dataSize / 1024).toFixed(2), 'KB')
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.message.includes('过大')) {
      console.error('存储空间不足:', error)
      const dataSize = new Blob([JSON.stringify(folders)]).size
      alert(t('qrGeneratorExtra.storageInsufficientFolder', { size: (dataSize / 1024 / 1024).toFixed(2) }))
      return false
    } else {
      console.error('保存文件夹失败:', error)
      alert(t('qrGeneratorExtra.saveFolderFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
      return false
    }
  }
}

// 确认创建文件夹并保存二维码
const confirmCreateFolder = async () => {
  if (!newFolderName.value.trim()) {
    alert(t('qrGeneratorExtra.enterFolderName'))
    return
  }
  
  if (!pendingQRData.value) {
    alert(t('qrGeneratorExtra.qrDataLost'))
    closeCreateFolderDialog()
    return
  }
  
  try {
    // 创建文件夹
    const folderId = 'folder_' + Date.now()
    const folder = {
      id: folderId,
      name: newFolderName.value.trim(),
      createTime: Date.now(),
      updateTime: Date.now(),
      qrCount: 0
    }
    
    // 安全保存文件夹到localStorage
    const savedFolders = localStorage.getItem('dynamicQRFolders')
    const folders = savedFolders ? JSON.parse(savedFolders) : []
    folders.push(folder)
    
    const saveFoldersSuccess = safeSaveFolders(folders)
    if (!saveFoldersSuccess) {
      // 保存文件夹失败，不继续保存二维码
      return
    }
    
    // 保存 pendingQRData 的引用，避免在关闭对话框时被清空
    const currentPendingData = { ...pendingQRData.value }
    const isMultiple = currentPendingData.isMultiple || false
    
    // 如果是多个二维码，批量保存
    if (isMultiple && currentPendingData.qrDataList) {
      console.log(`开始保存 ${currentPendingData.qrDataList.length} 个二维码到活码文件夹`)
      let successCount = 0
      const failedIndexes = []
      
      for (let i = 0; i < currentPendingData.qrDataList.length; i++) {
        const qrData = currentPendingData.qrDataList[i]
        try {
          await saveQRToLiveCode(qrData, folderId, folder.name)
          successCount++
          console.log(`✓ 二维码 ${i + 1}/${currentPendingData.qrDataList.length} 保存成功`)
        } catch (error) {
          console.error(`保存二维码 ${i + 1} 失败:`, error)
          failedIndexes.push(i + 1)
          // 不立即弹出alert，避免打断保存流程
        }
      }
      
      // 更新文件夹的二维码数量
      folder.qrCount = successCount
      const updatedFolders = folders.map(f => f.id === folderId ? folder : f)
      const updateFoldersSuccess = safeSaveFolders(updatedFolders)
      if (!updateFoldersSuccess) {
        console.warn('文件夹信息更新失败，但二维码已保存')
      }
      
      // 关闭对话框
      closeCreateFolderDialog()
      
      // 显示保存结果
      if (successCount === currentPendingData.qrDataList.length) {
        alert(t('qrGeneratorExtra.savedToFolderSuccess', { count: successCount, name: folder.name }))
      } else if (successCount > 0) {
        alert(t('qrGeneratorExtra.savedToFolderPartial', { success: successCount, total: currentPendingData.qrDataList.length, name: folder.name, failed: failedIndexes.join(', ') }))
      } else {
        alert(t('qrGeneratorExtra.allQrSaveFailed'))
      }
    } else {
      // 单个二维码：保持原有逻辑
      try {
        await saveQRToLiveCode(currentPendingData, folderId, folder.name)
        
        // 更新文件夹的二维码数量
        folder.qrCount = 1
        const updatedFolders = folders.map(f => f.id === folderId ? folder : f)
        const updateFoldersSuccess = safeSaveFolders(updatedFolders)
        if (!updateFoldersSuccess) {
          console.warn('文件夹信息更新失败，但二维码已保存')
        }
        
        // 关闭对话框
        closeCreateFolderDialog()
        
        alert(t('qrGeneratorExtra.qrSavedToFolder', { name: folder.name }))
        
        // 打开预览弹窗（只对单个二维码有效）
        showSettingsModal.value = true
      } catch (error) {
        // 单个二维码保存失败，不关闭对话框，让用户重试
        console.error('保存单个二维码失败:', error)
        throw error // 重新抛出，让外层catch处理
      }
    }
  } catch (error) {
    console.error('保存到活码失败:', error)
    if (error.name === 'QuotaExceededError') {
      alert(t('qrGeneratorExtra.storageInsufficientLiveCode'))
    } else {
      alert(t('qrGeneratorExtra.saveFailed', { msg: error.message || t('dynamicManager.common.unknownError') }))
    }
  }
}

// 保存二维码到活码
const saveQRToLiveCode = async (qrData, folderId, folderName) => {
  try {
    const baseUrl = getServerBaseUrl()
    const apiBaseUrl = getApiBaseUrl()
    const qrId = `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 根据类型确定文件名和标题
    const qrType = qrData.info?.type || props.activeTab
    let fileName = ''
    let title = ''
    
    // 如果qrData中有fileName和title，优先使用（多图片/多文件模式）
    if (qrData.fileName) {
      fileName = qrData.fileName
      title = qrData.title || qrData.fileName
    } else if (qrType === 'image') {
      if (uploadedImages.value.length > 0) {
        fileName = uploadedImages.value[0].fileName || t('qrGeneratorExtra.defaultImage')
        title = uploadedImages.value[0].fileName || t('qrGeneratorExtra.defaultImageQR')
      } else {
        fileName = t('qrGeneratorExtra.defaultImage')
        title = t('qrGeneratorExtra.defaultImageQR')
      }
    } else if (qrType === 'file') {
      if (uploadedFiles.value.length > 0) {
        fileName = uploadedFiles.value[0].fileName || t('qrGeneratorExtra.defaultDoc')
        title = fileTitle.value || uploadedFiles.value[0].fileName || t('qrGeneratorExtra.defaultDocQR')
      } else {
        fileName = t('qrGeneratorExtra.defaultDoc')
        title = t('qrGeneratorExtra.defaultDocQR')
      }
    }
    
    // 对于图片和文档，content已经是viewer.html链接，直接使用
    // 如果不是URL格式，生成一个查看链接
    let actualUrl = qrData.content
    console.log('保存到活码 - 原始content:', actualUrl)
    console.log('保存到活码 - 是否为URL:', actualUrl && actualUrl.startsWith('http'))
    
    // 修复URL中的双斜杠问题
    if (actualUrl && actualUrl.startsWith('http')) {
      actualUrl = actualUrl.replace(/([^:]\/)\/+/g, '$1')
    }

    const appendApiParamToViewerUrl = (url) => {
      if (!url || !url.startsWith('http')) return url
      if (url.includes('api=') || url.includes('apiBaseUrl=')) return url
      const hashIndex = url.indexOf('#')
      const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url
      const hashPart = hashIndex >= 0 ? url.slice(hashIndex) : ''
      const joiner = beforeHash.includes('?') ? '&' : '?'
      return `${beforeHash}${joiner}api=${encodeURIComponent(apiBaseUrl)}${hashPart}`
    }
    
    if (!actualUrl || !actualUrl.startsWith('http')) {
      console.warn('content不是有效的URL，生成新的查看链接')
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      actualUrl = `${cleanBaseUrl}/viewer.html?api=${encodeURIComponent(apiBaseUrl)}#/view/${qrId}`
    }

    actualUrl = appendApiParamToViewerUrl(actualUrl)
    
    console.log('保存到活码 - 最终使用的URL:', actualUrl)
    
    // 生成二维码图片（使用QRCode库，使用实际URL）
    const qrCodeUrl = await QRCode.toDataURL(actualUrl, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
    
    // 创建二维码对象
    const qrObject = {
      id: qrId,
      title: title,
      fileName: fileName,
      data: {
        content: qrData.content,
        displayContent: qrData.displayContent
      },
      columns: ['content'],
      selectedQRColumn: 'content',
      template: null,
      style: null,
      folderId: folderId, // 活码文件夹ID
      status: 'normal',
      scanCountToday: 0,
      scanCountTotal: 0,
      createTime: Date.now(),
      selected: false,
      qrCodeUrl: qrCodeUrl,
      qrUrl: actualUrl
    }
    
    // 保存到 dynamicQRList
    const savedQRList = localStorage.getItem('dynamicQRList')
    const qrList = savedQRList ? JSON.parse(savedQRList) : []
    
    // 检查 API 服务器状态并同步
    const apiAvailable = await checkApiServer()
    if (apiAvailable) {
      try {
        await saveContentToServer(qrId, {
          title: title,
          data: qrObject.data,
          columns: qrObject.columns,
          template: qrObject.template,
          style: qrObject.style,
          createTime: qrObject.createTime,
          type: 'dynamic'
        })
        console.log(`✓ 活码 ${qrId} 已同步到服务器`)
      } catch (serverError) {
        console.error(`✗ 活码 ${qrId} 同步到服务器失败:`, serverError)
      }
    } else {
      console.warn('API 服务器不可用，活码将仅保存在本地')
    }

    // 先尝试清理旧的大图片数据，为新二维码腾出空间
    const cleanedExistingList = qrList.map(qr => {
      const cleaned = { ...qr }
      if (cleaned.qrCodeUrl && cleaned.qrCodeUrl.length > 100000) {
        // 如果二维码图片太大，只保留一个标记
        cleaned.qrCodeUrl = null
        cleaned._hasQRCode = true
      }
      return cleaned
    })
    
    // 添加新二维码（也清理大图片数据）
    const newQRObject = { ...qrObject }
    if (newQRObject.qrCodeUrl && newQRObject.qrCodeUrl.length > 100000) {
      newQRObject.qrCodeUrl = null
      newQRObject._hasQRCode = true
    }
    cleanedExistingList.push(newQRObject)
    
    // 尝试保存，如果失败则进一步清理
    try {
      const dataString = JSON.stringify(cleanedExistingList)
      const dataSize = new Blob([dataString]).size
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (dataSize > maxSize) {
        // 如果清理后仍然过大，尝试删除一些旧的二维码
        console.warn('数据仍然过大，尝试删除最旧的二维码...')
        // 按创建时间排序，删除最旧的
        cleanedExistingList.sort((a, b) => (a.createTime || 0) - (b.createTime || 0))
        const targetSize = maxSize * 0.8 // 保留80%的空间
        let currentSize = 0
        let keepCount = 0
        
        for (let i = cleanedExistingList.length - 1; i >= 0; i--) {
          const testList = cleanedExistingList.slice(i)
          const testSize = new Blob([JSON.stringify(testList)]).size
          if (testSize <= targetSize) {
            keepCount = cleanedExistingList.length - i
            break
          }
        }
        
        if (keepCount > 0) {
          const finalList = cleanedExistingList.slice(-keepCount)
          const finalString = JSON.stringify(finalList)
          const finalSize = new Blob([finalString]).size
          
          if (finalSize > maxSize) {
            throw new Error(t('qrGeneratorExtra.storageInsufficientAfterClean'))
          }
          
          localStorage.setItem('dynamicQRList', finalString)
          console.log(`已清理并保存二维码列表，保留 ${keepCount} 个最新二维码，大小:`, (finalSize / 1024 / 1024).toFixed(2), 'MB')
        } else {
          throw new Error(t('qrGeneratorExtra.storageInsufficientDataSize', { size: (dataSize / 1024 / 1024).toFixed(2) }))
        }
      } else {
        localStorage.setItem('dynamicQRList', dataString)
        console.log('二维码列表保存成功，大小:', (dataSize / 1024 / 1024).toFixed(2), 'MB')
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.message.includes('过大') || error.message.includes('存储空间不足')) {
        // 存储空间不足，抛出错误
        const dataSize = new Blob([JSON.stringify(cleanedExistingList)]).size
        throw new Error(t('qrGeneratorExtra.storageInsufficientDataSize2', { size: (dataSize / 1024 / 1024).toFixed(2) }))
      } else {
        throw error
      }
    }
    
    console.log('二维码已保存到活码，ID:', qrId, '文件夹ID:', folderId)
  } catch (error) {
    console.error('保存二维码到活码失败:', error)
    throw error
  }
}
</script>

<style scoped>
.qr-generator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.generator-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-height: 0; /* 允许 flex 子项缩小 */
  overflow-y: auto; /* 内容过多时可滚动 */
}

.input-section {
  margin-bottom: 30px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.input-header h3 {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.save-to-livecode-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.save-to-livecode-checkbox:hover {
  background: rgba(33, 150, 243, 0.05);
}

.save-to-livecode-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  margin: 0;
}

.save-to-livecode-checkbox span {
  font-size: 0.9rem;
  color: #666;
}

.advanced-btn {
  padding: 6px 16px;
  border: 1px dashed #2196F3;
  background: transparent;
  color: #2196F3;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.advanced-btn:hover {
  background: #e3f2fd;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
}

textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.file-upload-area,
.image-upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover,
.image-upload-area:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.upload-placeholder {
  color: #999;
}

.upload-placeholder svg {
  color: #bbb;
  margin-bottom: 15px;
}

.upload-placeholder p {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #666;
}

.upload-placeholder span {
  font-size: 0.9rem;
  color: #999;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.file-icon {
  font-size: 3rem;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.file-size {
  font-size: 0.9rem;
  color: #999;
}

/* 图片网格 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.image-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  background: white;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-card:hover {
  border-color: #2196F3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.image-card.add-image {
  border-style: dashed;
  cursor: pointer;
  background: #f9f9f9;
}

.image-card.add-image:hover {
  background: #f0f7ff;
}

.image-card .image-preview {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.image-card .image-preview img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 8px;
  object-fit: contain;
}

.image-card .image-name {
  font-size: 0.85rem;
  color: #666;
  word-break: break-word;
  line-height: 1.4;
  margin: 0;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.image-card .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.image-preview {
  position: relative;
  max-width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.hint {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #999;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.quick-btn {
  padding: 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: white;
  font-weight: 500;
}

.file-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.image-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.video-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.quick-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 2rem;
}

.btn-text {
  font-size: 0.95rem;
}

.media-mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: 500;
}

.mode-btn:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.mode-btn.active {
  border-color: #2196F3;
  background: #2196F3;
  color: white;
}

.media-url-mode,
.media-file-mode {
  margin-top: 15px;
}

.batch-section {
  width: 100%;
}


.file-options {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.option-row:last-child {
  margin-bottom: 0;
}

.option-row label {
  min-width: 60px;
  font-size: 0.95rem;
  color: #666;
}

.title-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.title-input:focus {
  outline: none;
  border-color: #2196F3;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #999;
  color: white;
  font-size: 0.75rem;
  cursor: help;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.file-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  background: white;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-card:hover {
  border-color: #2196F3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.file-card.add-file {
  border-style: dashed;
  cursor: pointer;
  background: #f9f9f9;
}

.file-card.add-file:hover {
  background: #f0f7ff;
}

.file-icon-large {
  font-size: 3.5rem;
  margin-bottom: 12px;
}

.add-icon {
  font-size: 3rem;
  color: #999;
  margin-bottom: 8px;
}

.file-card .file-name {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 6px;
  word-break: break-word;
  line-height: 1.4;
}

.file-card .file-size {
  font-size: 0.85rem;
  color: #999;
}

.file-card .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.qr-options {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
}

.qr-options h4 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.settings-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.settings-trigger-btn {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.settings-trigger-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  color: #2196F3;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.option-item label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-control input[type="range"] {
  flex: 1;
}

.size-value {
  min-width: 70px;
  text-align: right;
  font-weight: 500;
  color: #333;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
  transition: all 0.3s;
}

select:focus {
  outline: none;
  border-color: #2196F3;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.generate-btn:active {
  transform: translateY(0);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-btn.generating {
  position: relative;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 加载遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-content {
  background: white;
  border-radius: 16px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 300px;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.loading-hint {
  font-size: 14px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .generator-card {
    padding: 20px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
}

/* 创建文件夹对话框样式 */
.create-folder-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.create-folder-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.create-folder-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.create-folder-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.create-folder-dialog-header .close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-folder-dialog-header .close-btn:hover {
  background: #e0e0e0;
}

.create-folder-dialog-body {
  padding: 20px;
}

.create-folder-dialog-body .form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-folder-dialog-body .form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.create-folder-dialog-body .form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.create-folder-dialog-body .form-input:focus {
  outline: none;
  border-color: #2196F3;
}

.create-folder-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.create-folder-dialog-footer .cancel-btn,
.create-folder-dialog-footer .save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.create-folder-dialog-footer .cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.create-folder-dialog-footer .save-btn {
  background: #2196F3;
  color: white;
}

.create-folder-dialog-footer .cancel-btn:hover {
  background: #e0e0e0;
}

.create-folder-dialog-footer .save-btn:hover {
  background: #1976D2;
}
</style>

