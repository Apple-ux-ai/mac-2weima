<template>
  <div class="dynamic-qr-manager">
    <!-- 头部 -->
    <div class="manager-header">
      <h1>{{ tt('dynamicManager.title', { name: currentFolder?.name || tt('dynamicManager.defaultFolder') }) }}</h1>
      <button class="return-btn" @click="goBack">{{ tt('dynamicManager.actions.back') }}</button>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-left">
        <span class="total-count">{{ tt('dynamicManager.totalCount', { count: filteredQRList.length }) }}</span>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">{{ tt('dynamicManager.filter.all') }}</option>
          <option value="normal">{{ tt('dynamicManager.status.normal') }}</option>
          <option value="disabled">{{ tt('dynamicManager.status.disabled') }}</option>
        </select>
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            :placeholder="tt('dynamicManager.search.placeholder')"
            class="search-input"
          />
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
      </div>
      <div class="control-right">
        <button class="batch-btn" @click="handleBeautify">{{ tt('dynamicManager.actions.beautify') }}</button>
        <button class="batch-btn" @click="handleAppendData">{{ tt('dynamicManager.actions.appendData') }}</button>
        <button class="batch-btn" @click="handleBatchDownload">{{ tt('dynamicManager.actions.batchDownload') }}</button>
        <button class="batch-btn danger" @click="handleBatchDelete">{{ tt('dynamicManager.actions.batchDelete') }}</button>
      </div>
    </div>

    <!-- 主内容区域：左右分栏 -->
    <div class="main-content">
      <!-- 左侧：二维码列表表格 -->
      <div class="left-panel">
        <div class="table-container">
          <table class="qr-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    v-model="selectAll"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>{{ tt('dynamicManager.table.qrInfo') }}</th>
                <th>{{ tt('dynamicManager.table.fileName') }}</th>
                <th>{{ tt('dynamicManager.table.scanCount') }}</th>
                <th>{{ tt('dynamicManager.table.status') }}</th>
                <th>{{ tt('dynamicManager.table.editData') }}</th>
                <th>{{ tt('dynamicManager.table.createTime') }}</th>
                <th>{{ tt('dynamicManager.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(qr, index) in filteredQRList" 
                :key="qr.id"
                :class="{ selected: selectedQR?.id === qr.id }"
                @click="selectQR(qr)"
              >
                <td>
                  <input 
                    type="checkbox" 
                    v-model="qr.selected"
                    @click.stop
                  />
                </td>
                <td>
                  <div class="qr-info-cell">
                    <span class="qr-icon">📱</span>
                    <span class="qr-title">{{ qr.title }}</span>
                  </div>
                </td>
                <td :title="qr.fileName">{{ qr.fileName }}</td>
                <td>
                  <div class="scan-count">
                    <span>{{ tt('dynamicManager.scan.today', { count: qr.scanCountToday }) }}</span>
                    <span>{{ tt('dynamicManager.scan.total', { count: qr.scanCountTotal }) }}</span>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', qr.status]">{{ getStatusText(qr.status) }}</span>
                </td>
                <td>
                  <button class="edit-btn" @click.stop="editQRData(qr)">{{ tt('dynamicManager.actions.editData') }}</button>
                </td>
                <td>{{ formatTime(qr.createTime) }}</td>
                <td>
                  <div class="action-buttons" @click.stop>
                    <button class="action-btn" @click="downloadQR(qr)">{{ tt('dynamicManager.actions.download') }}</button>
                    <button class="action-btn preview-btn" @click="showPreview(qr)">{{ tt('dynamicManager.actions.preview') }}</button>
                    <button class="action-btn danger" @click="deleteQR(qr)">{{ tt('dynamicManager.actions.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 右侧：预览区域（已整合到二级菜单，保留用于兼容性） -->
      <div class="right-panel" style="display: none;">
        <div class="preview-container">
          <!-- 二维码预览 -->
          <div class="qr-preview-section">
            <h3>{{ tt('dynamicManager.preview.qrTitle') }}</h3>
            <div class="qr-preview-box">
              <img 
                v-if="selectedQR?.qrCodeUrl" 
                :src="selectedQR.qrCodeUrl" 
                :alt="tt('dynamicManager.preview.qrAlt')"
                class="qr-preview-image"
              />
              <div v-else class="qr-placeholder">
                <p>{{ tt('dynamicManager.preview.selectQrHint') }}</p>
              </div>
            </div>
          </div>

          <!-- 内容预览 -->
          <div class="content-preview-section">
            <h3>{{ tt('dynamicManager.preview.contentTitle') }}</h3>
            <div class="content-preview-box">
              <div v-if="selectedQR" class="content-preview">
                <!-- 如果是图片文件夹，显示图片列表 -->
                <div v-if="selectedQR.imageList && selectedQR.imageList.length > 0" class="image-list-preview">
                  <div class="image-list-header">
                    <span class="image-count">{{ tt('dynamicManager.preview.imageCount', { count: selectedQR.imageList.length }) }}</span>
                  </div>
                  <div class="image-list-items">
                    <div 
                      v-for="(image, index) in selectedQR.imageList" 
                      :key="image.id || index"
                      class="image-list-item"
                    >
                      <span class="image-index">{{ index + 1 }}</span>
                      <span class="image-name" :title="image.fileName">{{ image.fileName }}</span>
                    </div>
                  </div>
                </div>
                <!-- 普通内容预览 -->
                <div v-else class="preview-template">
                  <table class="spec-table">
                    <tbody>
                      <tr v-for="(value, key) in selectedQR.data" :key="key">
                        <td class="spec-label">{{ getFieldLabel(key) }}</td>
                        <td class="spec-value">{{ value }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="content-placeholder">
                <p>{{ tt('dynamicManager.preview.selectQrContentHint') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑数据对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay" @click.self="closeEditDialog">
      <div class="edit-dialog">
        <div class="edit-dialog-header">
          <h3>{{ tt('dynamicManager.editDialog.title') }}</h3>
          <button class="close-btn" @click="closeEditDialog">✕</button>
        </div>
        <div class="edit-dialog-body">
          <div v-if="editingQR" class="edit-form">
            <div class="edit-field">
              <label class="edit-label">{{ tt('dynamicManager.editDialog.fields.title') }}</label>
              <input 
                v-model="editingQR.title" 
                type="text" 
                class="edit-input"
                @input="onTitleInput"
                :placeholder="tt('dynamicManager.editDialog.placeholders.title')"
              />
              <span class="edit-hint">{{ tt('dynamicManager.editDialog.titleHint') }}</span>
            </div>
            <div class="edit-divider"></div>
            <div class="edit-field" v-for="(value, key) in editingQR.data" :key="key">
              <label class="edit-label">{{ getFieldLabel(key) }}</label>
              <input 
                v-model="editingQR.data[key]" 
                type="text" 
                class="edit-input"
                @input="onDataInput"
                :placeholder="tt('dynamicManager.editDialog.placeholders.field', { field: getFieldLabel(key) })"
              />
            </div>
          </div>
        </div>
        <div class="edit-dialog-footer">
          <button class="cancel-btn" @click="closeEditDialog">{{ tt('toast.cancel') }}</button>
          <button class="save-btn" @click="saveEditData">{{ tt('dynamicManager.common.save') }}</button>
        </div>
      </div>
    </div>

    <!-- 美化二维码对话框 -->
    <div v-if="showBeautifyDialog" class="beautify-dialog-overlay" @click.self="closeBeautifyDialog">
      <div class="beautify-dialog">
        <div class="beautify-dialog-header">
          <h3>{{ tt('dynamicManager.beautifyDialog.title') }}</h3>
          <button class="close-btn" @click="closeBeautifyDialog">✕</button>
        </div>
        <div class="beautify-dialog-body">
          <div class="beautify-content">
            <!-- 左侧：配置区域 -->
            <div class="beautify-config">
              <!-- 背景设置 -->
              <div class="config-group">
                <h4>{{ tt('dynamicManager.beautifyDialog.background.title') }}</h4>
                <div class="config-row">
                  <div class="upload-box">
                    <label>{{ tt('dynamicManager.beautifyDialog.background.image') }}</label>
                    <div class="image-upload" @click="selectBackgroundImage">
                      <div v-if="!beautifyStyle.backgroundImage" class="upload-placeholder">
                        <span class="plus-icon">+</span>
                      </div>
                      <img v-else :src="beautifyStyle.backgroundImage" :alt="tt('dynamicManager.beautifyDialog.background.image')" />
                    </div>
                    <p class="upload-hint">240×240</p>
                    <button v-if="beautifyStyle.backgroundImage" class="delete-icon" @click.stop="removeBackgroundImage">
                      🗑️
                    </button>
                  </div>
                  
                  <div class="color-picker-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.background.color') }}</label>
                    <input 
                      v-model="beautifyStyle.backgroundColor" 
                      type="color" 
                      class="color-input"
                      @change="updateBeautifyPreview"
                    />
                  </div>
                </div>
              </div>

              <!-- 二维码设置 -->
              <div class="config-group">
                <h4>{{ tt('dynamicManager.beautifyDialog.qr.title') }}</h4>
                
                <div class="config-row">
                  <div class="upload-box">
                    <label>Logo</label>
                    <div class="image-upload small" @click="selectLogo">
                      <div v-if="!beautifyStyle.logo" class="upload-placeholder">
                        <span class="plus-icon">+</span>
                      </div>
                      <img v-else :src="beautifyStyle.logo" alt="Logo" />
                    </div>
                    <button v-if="beautifyStyle.logo" class="delete-icon" @click.stop="removeLogo">
                      🗑️
                    </button>
                  </div>
                  
                  <div class="form-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.logoSize') }}</label>
                    <select v-model="beautifyStyle.logoSize" @change="updateBeautifyPreview">
                      <option value="small">{{ tt('dynamicManager.common.sizeSmall') }}</option>
                      <option value="medium">{{ tt('dynamicManager.common.sizeMedium') }}</option>
                      <option value="large">{{ tt('dynamicManager.common.sizeLarge') }}</option>
                    </select>
                  </div>
                </div>

                <div class="config-row">
                  <div class="form-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.logoMargin') }}</label>
                    <input v-model.number="beautifyStyle.logoMargin" type="number" min="0" max="20" @input="updateBeautifyPreview" />
                  </div>
                  
                  <div class="form-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.codeMargin') }}</label>
                    <input v-model.number="beautifyStyle.codeMargin" type="number" min="0" max="10" @input="updateBeautifyPreview" />
                  </div>
                </div>

                <div class="config-row">
                  <div class="color-picker-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.codeColor') }}</label>
                    <input v-model="beautifyStyle.codeColor" type="color" class="color-input" @change="updateBeautifyPreview" />
                  </div>
                  
                  <div class="color-picker-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.codeBgColor') }}</label>
                    <input v-model="beautifyStyle.codeBgColor" type="color" class="color-input" @change="updateBeautifyPreview" />
                  </div>
                </div>

                <div class="config-row">
                  <div class="form-group">
                    <label>{{ tt('dynamicManager.beautifyDialog.qr.errorLevel') }}</label>
                    <select v-model="beautifyStyle.errorLevel" @change="updateBeautifyPreview">
                      <option value="L">7%</option>
                      <option value="M">15%</option>
                      <option value="Q">25%</option>
                      <option value="H">30%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：预览区域 -->
            <div class="beautify-preview">
              <h4>{{ tt('dynamicManager.actions.preview') }}</h4>
              <div class="preview-box">
                <canvas ref="beautifyPreviewCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="beautify-dialog-footer">
          <button class="cancel-btn" @click="closeBeautifyDialog">{{ tt('toast.cancel') }}</button>
          <button class="save-btn" @click="applyBeautify">{{ tt('dynamicManager.common.apply') }}</button>
        </div>
      </div>
    </div>

    <!-- 追加数据对话框 -->
    <div v-if="showAppendDialog" class="append-dialog-overlay" @click.self="closeAppendDialog">
      <div class="append-dialog">
        <div class="append-dialog-header">
          <h3>{{ tt('dynamicManager.appendDialog.title') }}</h3>
          <button class="close-btn" @click="closeAppendDialog">✕</button>
        </div>
        <div class="append-dialog-body">
          <!-- 标签页 -->
          <div class="append-tabs">
            <button 
              :class="['append-tab', { active: appendMode === 'single' }]"
              @click="appendMode = 'single'"
            >
              {{ tt('dynamicManager.appendDialog.tabs.single') }}
            </button>
            <button 
              :class="['append-tab', { active: appendMode === 'batch' }]"
              @click="appendMode = 'batch'"
            >
              {{ tt('dynamicManager.appendDialog.tabs.batch') }}
            </button>
          </div>

          <!-- 单条追加 -->
          <div v-if="appendMode === 'single'" class="append-single">
            <div class="info-box">
              <span class="info-icon">ℹ️</span>
              <span class="info-text">{{ tt('dynamicManager.appendDialog.singleHint') }}</span>
            </div>
            <div class="form-field">
              <label>{{ tt('dynamicManager.appendDialog.qrName') }}</label>
              <input 
                v-model="appendQRName" 
                type="text" 
                :placeholder="tt('dynamicManager.appendDialog.qrNamePlaceholder')"
                class="form-input"
              />
            </div>
          </div>

          <!-- 批量追加 -->
          <div v-if="appendMode === 'batch'" class="append-batch">
            <div 
              class="upload-area"
              @click="selectExcelFile"
              :class="{ 'has-file': appendExcelFile }"
            >
              <div v-if="!appendExcelFile" class="upload-placeholder">
                <div class="upload-icon">☁️</div>
                <p class="upload-text">{{ tt('dynamicManager.appendDialog.uploadText') }}</p>
                <p class="upload-hint">{{ tt('dynamicManager.appendDialog.uploadHint') }}</p>
              </div>
              <div v-else class="upload-file-info">
                <div class="file-icon">📊</div>
                <div class="file-details">
                  <p class="file-name">{{ appendExcelFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(appendExcelFile.size) }}</p>
                </div>
                <button class="remove-file-btn" @click.stop="removeExcelFile">✕</button>
              </div>
              <div class="upload-status">{{ tt('dynamicManager.appendDialog.pendingUpload') }}</div>
            </div>
          </div>
        </div>
        <div class="append-dialog-footer">
          <button class="cancel-btn" @click="closeAppendDialog">{{ tt('toast.cancel') }}</button>
          <button class="confirm-btn" @click="confirmAppend">{{ tt('dynamicManager.appendDialog.confirmAppend') }}</button>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="previewQR" class="preview-modal-overlay" @click.self="closePreview">
      <div class="preview-modal">
        <div class="preview-modal-header">
          <h3>{{ tt('dynamicManager.preview.modalTitle', { title: previewQR.title }) }}</h3>
          <button class="preview-close-btn" @click="closePreview">✕</button>
        </div>
        <div class="preview-modal-body">
          <div class="preview-modal-content">
            <!-- 二维码预览 -->
            <div class="preview-section qr-preview-section">
              <h4>{{ tt('dynamicManager.preview.qrTitle') }}</h4>
              <div class="preview-qr-box">
                <img 
                  v-if="previewQR.qrCodeUrl" 
                  :src="previewQR.qrCodeUrl" 
                  :alt="tt('dynamicManager.preview.qrAlt')"
                  class="preview-qr-image"
                />
                <div v-else class="preview-placeholder">
                  <p>{{ tt('dynamicManager.preview.notGenerated') }}</p>
                </div>
              </div>
            </div>
            <!-- 内容预览 -->
            <div class="preview-section content-preview-section">
              <h4>{{ tt('dynamicManager.preview.contentTitle') }}</h4>
              <div class="preview-content-box">
                <div v-if="previewQR.imageList && previewQR.imageList.length > 0" class="image-list-preview">
                  <div class="image-list-header">
                    <span class="image-count">{{ tt('dynamicManager.preview.imageCount', { count: previewQR.imageList.length }) }}</span>
                  </div>
                  <div class="image-list-items">
                    <div 
                      v-for="(image, index) in previewQR.imageList" 
                      :key="image.id || index"
                      class="image-list-item"
                    >
                      <span class="image-index">{{ index + 1 }}</span>
                      <span class="image-name" :title="image.fileName">{{ image.fileName }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="preview-template">
                  <table class="spec-table">
                    <tbody>
                      <tr v-for="(value, key) in previewQR.data" :key="key">
                        <td class="spec-label">{{ getFieldLabel(key) }}</td>
                        <td class="spec-value">{{ value }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="preview-modal-footer">
          <button class="preview-close-action-btn" @click="closePreview">{{ tt('dynamicManager.common.close') }}</button>
        </div>
      </div>
    </div>

    <!-- 删除二维码确认对话框 -->
    <div v-if="showDeleteQRDialog" class="delete-qr-dialog-overlay" @click.self="closeDeleteQRDialog">
      <div class="delete-qr-dialog">
        <div class="delete-qr-dialog-icon">⚠️</div>
        <div class="delete-qr-dialog-title">{{ tt('dynamicManager.deleteDialog.title') }}</div>
        <div class="delete-qr-dialog-message">
          <p v-if="deleteQRMode === 'single'">
            {{ tt('dynamicManager.deleteDialog.single', { title: qrToDelete?.title || '' }) }}
          </p>
          <p v-else>
            {{ tt('dynamicManager.deleteDialog.batch', { count: qrToDeleteList?.length || 0 }) }}
          </p>
          <p class="warning-text">{{ tt('dynamicManager.deleteDialog.warning') }}</p>
        </div>
        <div class="delete-qr-dialog-footer">
          <button class="delete-qr-cancel-btn" @click="closeDeleteQRDialog">{{ tt('toast.cancel') }}</button>
          <button class="delete-qr-confirm-btn" @click="confirmDeleteQR">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
import { getServerBaseUrl } from '../utils/serverConfig.js'
import { getApiBaseUrl, saveContentToServer, deleteContentFromServer, checkApiServer } from '../utils/api.js'
import { formatDateTime } from '../i18n/datetime'
const { t, locale } = useI18n()
const tt = (key, fallbackOrParams, maybeParams) => {
  const isParamsOnly = fallbackOrParams && typeof fallbackOrParams === 'object' && !Array.isArray(fallbackOrParams) && maybeParams === undefined
  const params = isParamsOnly ? fallbackOrParams : (maybeParams || {})
  const fallback = isParamsOnly ? undefined : fallbackOrParams
  const value = t(key, params)
  return value === key ? (fallback || key) : value
}

const emit = defineEmits(['close'])

// 辅助函数：将十六进制颜色转换为RGB
const hexToRgb = (hex) => {
  // 处理空字符串或无效值
  if (!hex || typeof hex !== 'string' || hex.trim() === '') {
    return { r: 0, g: 0, b: 0 }
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// 数据
const qrList = ref([])
const selectedQR = ref(null)
const searchKeyword = ref('')
const filterStatus = ref('all')
const selectAll = ref(false)
const showEditDialog = ref(false)
const editingQR = ref(null)
const showBeautifyDialog = ref(false)
const beautifyPreviewCanvas = ref(null)
const currentFolder = ref(null) // 当前文件夹
const showAppendDialog = ref(false)
const appendMode = ref('single') // 'single' 或 'batch'
const appendQRName = ref('1')
const appendExcelFile = ref(null)
const showDeleteQRDialog = ref(false)
const deleteQRMode = ref('single') // 'single' 或 'batch'
const qrToDelete = ref(null)
const qrToDeleteList = ref([])
const previewQR = ref(null) // 当前预览的二维码
const beautifyStyle = ref({
  backgroundImage: null,
  backgroundColor: '#ffffff',
  logo: null,
  logoSize: 'medium',
  logoMargin: 0,
  codeMargin: 2,
  codeColor: '#000000',
  codeBgColor: '#ffffff',
  outerEyeColor: '#000000',
  innerEyeColor: '#000000',
  errorLevel: 'H'
})

// 从localStorage加载数据
onMounted(() => {
  loadQRList()
  setTimeout(() => {
    syncFolderQRsToServer()
  }, 0)
})

// 加载二维码列表（如果没有文件夹，加载所有）
const loadQRList = () => {
  if (currentFolder.value) {
    qrList.value = loadQRListByFolder(currentFolder.value.id)
  } else {
    const savedData = localStorage.getItem('dynamicQRList')
    if (savedData) {
      qrList.value = JSON.parse(savedData)
    }
  }
  
  // 为每个二维码生成二维码图片
  qrList.value.forEach(qr => {
    if (!qr.qrCodeUrl) {
      generateQRCode(qr)
    }
  })
}

// 生成二维码
const generateQRCode = async (qr) => {
  try {
    const baseUrl = getServerBaseUrl()
    const apiBaseUrl = getApiBaseUrl()
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const qrUrl = `${cleanBaseUrl}/viewer.html?api=${encodeURIComponent(apiBaseUrl)}#/dynamic/${qr.id}`
    qr.qrUrl = qrUrl
    
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
    qr.qrCodeUrl = qrDataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

const syncDynamicQRToServer = async (qr) => {
  if (!qr?.id) return { success: false, skipped: true, error: new Error(tt('dynamicManager.errors.missingDynamicId')) }
  try {
    await saveContentToServer(qr.id, {
      title: qr.title,
      data: qr.data,
      columns: qr.columns,
      template: qr.template,
      style: qr.style,
      folderId: qr.folderId,
      createTime: qr.createTime,
      type: 'dynamic'
    })
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

const syncFolderQRsToServer = async () => {
  const list = Array.isArray(qrList.value) ? qrList.value : []
  if (list.length === 0) return
  const apiAvailable = await checkApiServer()
  if (!apiAvailable) return

  let failedCount = 0
  for (let i = 0; i < list.length; i++) {
    const result = await syncDynamicQRToServer(list[i])
    if (!result?.success) failedCount++
  }
  if (failedCount > 0) {
    console.warn(`活码同步到服务器失败：${failedCount}/${list.length}`)
  }
}

// 安全的保存函数，包含错误处理
const safeSaveQRList = (dataToSave) => {
  try {
    const dataString = JSON.stringify(dataToSave)
    const dataSize = new Blob([dataString]).size
    
    // 检查数据大小（localStorage通常限制5-10MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (dataSize > maxSize) {
      console.warn('数据过大，尝试清理旧数据')
      // 尝试清理没有二维码图片的旧数据
      const cleanedData = dataToSave.map(qr => {
        // 移除大的base64图片数据，只保留必要信息
        const cleaned = { ...qr }
        if (cleaned.qrCodeUrl && cleaned.qrCodeUrl.length > 100000) {
          // 如果二维码图片太大，只保留一个标记
          cleaned.qrCodeUrl = null
          cleaned._hasQRCode = true
        }
        return cleaned
      })
      const cleanedString = JSON.stringify(cleanedData)
      const cleanedSize = new Blob([cleanedString]).size
      
      if (cleanedSize > maxSize) {
        throw new Error(tt('dynamicManager.errors.dataTooLarge', { size: (dataSize / 1024 / 1024).toFixed(2) }))
      }
      
      localStorage.setItem('dynamicQRList', cleanedString)
      console.log('已清理并保存数据，大小:', (cleanedSize / 1024 / 1024).toFixed(2), 'MB')
      return true
    }
    
    localStorage.setItem('dynamicQRList', dataString)
    console.log('保存成功，数据大小:', (dataSize / 1024 / 1024).toFixed(2), 'MB')
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.message.includes('过大')) {
      console.error('存储空间不足:', error)
      alert(tt('dynamicManager.errors.storageInsufficient', { size: (new Blob([JSON.stringify(dataToSave)]).size / 1024 / 1024).toFixed(2) }))
      return false
    } else {
      console.error('保存失败:', error)
      alert(tt('dynamicManager.errors.saveFailedWithReason', { reason: error.message }))
      return false
    }
  }
}

// 保存二维码列表
const saveQRList = () => {
  return safeSaveQRList(qrList.value)
}

// 过滤后的列表
const filteredQRList = computed(() => {
  let filtered = qrList.value

  // 状态过滤
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(qr => qr.status === filterStatus.value)
  }

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(qr => 
      qr.title.toLowerCase().includes(keyword) ||
      qr.fileName.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 选择二维码
const selectQR = (qr) => {
  selectedQR.value = qr
}

// 全选/取消全选
const toggleSelectAll = () => {
  filteredQRList.value.forEach(qr => {
    qr.selected = selectAll.value
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    normal: tt('dynamicManager.status.normal'),
    disabled: tt('dynamicManager.status.disabled')
  }
  return statusMap[status] || tt('dynamicManager.status.unknown')
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return formatDateTime(timestamp, locale.value)
}

// 获取字段标签
const getFieldLabel = (key) => {
  // 这里可以根据字段配置获取显示名称
  return key
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

// 批量操作
// 美化二维码
const handleBeautify = () => {
  if (!selectedQR.value) {
    alert(tt('dynamicManager.messages.selectQrFirst'))
    return
  }
  
  // 如果二维码有保存的样式，加载它
  if (selectedQR.value.style) {
    beautifyStyle.value = { ...selectedQR.value.style }
  } else {
    // 否则使用默认样式
    beautifyStyle.value = {
      backgroundImage: null,
      backgroundColor: '#ffffff',
      logo: null,
      logoSize: 'medium',
      logoMargin: 0,
      codeMargin: 2,
      codeColor: '#000000',
      codeBgColor: '#ffffff',
      errorLevel: 'H'
    }
  }
  
  showBeautifyDialog.value = true
  
  // 等待DOM更新后生成预览
  setTimeout(() => {
    updateBeautifyPreview()
  }, 100)
}

// 关闭美化对话框
const closeBeautifyDialog = () => {
  showBeautifyDialog.value = false
}

// 选择背景图
const selectBackgroundImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        beautifyStyle.value.backgroundImage = event.target.result
        updateBeautifyPreview()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除背景图
const removeBackgroundImage = () => {
  beautifyStyle.value.backgroundImage = null
  updateBeautifyPreview()
}

// 选择Logo
const selectLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        beautifyStyle.value.logo = event.target.result
        updateBeautifyPreview()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除Logo
const removeLogo = () => {
  beautifyStyle.value.logo = null
  updateBeautifyPreview()
}

// 更新美化预览
const updateBeautifyPreview = async () => {
  if (!beautifyPreviewCanvas.value || !selectedQR.value) return
  
  try {
    const canvas = beautifyPreviewCanvas.value
    const ctx = canvas.getContext('2d')
    const previewSize = 300
    
    canvas.width = previewSize
    canvas.height = previewSize
    
    ctx.clearRect(0, 0, previewSize, previewSize)
    
    // 绘制背景色
    ctx.fillStyle = beautifyStyle.value.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, previewSize, previewSize)
    
    // 绘制背景图
    if (beautifyStyle.value.backgroundImage) {
      const bgImg = new Image()
      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, previewSize, previewSize)
          resolve()
        }
        bgImg.onerror = reject
        bgImg.src = beautifyStyle.value.backgroundImage
      })
    }
    
    // 生成二维码
    const qrCanvas = document.createElement('canvas')
    const qrSize = previewSize - 40
    qrCanvas.width = qrSize
    qrCanvas.height = qrSize
    
    const qrUrl = selectedQR.value.qrUrl || `${getServerBaseUrl()}/viewer.html#/dynamic/${selectedQR.value.id}`
    
    await QRCode.toCanvas(qrCanvas, qrUrl, {
      width: qrSize,
      margin: beautifyStyle.value.codeMargin || 2,
      errorCorrectionLevel: beautifyStyle.value.errorLevel || 'H',
      color: {
        dark: beautifyStyle.value.codeColor || '#000000',
        light: beautifyStyle.value.codeBgColor || '#ffffff'
      }
    })
    
    // 将二维码的白色背景转为透明并应用眼部颜色
    const qrCtx = qrCanvas.getContext('2d')
    const imageData = qrCtx.getImageData(0, 0, qrSize, qrSize)
    const data = imageData.data
    
    // 确保颜色值有效，避免空字符串
    const codeColorValue = (beautifyStyle.value.codeColor && beautifyStyle.value.codeColor.trim()) || '#000000'
    const outerEyeColorValue = (beautifyStyle.value.outerEyeColor && beautifyStyle.value.outerEyeColor.trim()) || codeColorValue || '#000000'
    const innerEyeColorValue = (beautifyStyle.value.innerEyeColor && beautifyStyle.value.innerEyeColor.trim()) || codeColorValue || '#000000'
    const codeBgColorValue = (beautifyStyle.value.codeBgColor && beautifyStyle.value.codeBgColor.trim()) || '#ffffff'
    
    const bgColor = hexToRgb(codeBgColorValue)
    const outerEyeColor = hexToRgb(outerEyeColorValue)
    const innerEyeColor = hexToRgb(innerEyeColorValue)
    const codeColor = hexToRgb(codeColorValue)
    
    // 计算 finder pattern 位置
    const margin = beautifyStyle.value.codeMargin || 2
    const moduleCount = 21 + (beautifyStyle.value.errorLevel === 'L' ? 0 : beautifyStyle.value.errorLevel === 'M' ? 4 : beautifyStyle.value.errorLevel === 'Q' ? 6 : 8)
    const moduleSize = (qrSize - margin * 2) / moduleCount
    const finderModuleSize = 7
    const finderPixelSize = moduleSize * finderModuleSize
    
    const finderPatterns = [
      { startX: margin, startY: margin, moduleSize: moduleSize, pixelSize: finderPixelSize },
      { startX: qrSize - margin - finderPixelSize, startY: margin, moduleSize: moduleSize, pixelSize: finderPixelSize },
      { startX: margin, startY: qrSize - margin - finderPixelSize, moduleSize: moduleSize, pixelSize: finderPixelSize }
    ]
    
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        const i = (y * qrSize + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // 先判断是否是背景色
        const isBackground = Math.abs(r - bgColor.r) < 10 && Math.abs(g - bgColor.g) < 10 && Math.abs(b - bgColor.b) < 10
        
        if (isBackground) {
          // 保持背景色，不设置为透明，以便用户可以看到码背景色的效果
          // 确保背景色使用用户设置的颜色
          data[i] = bgColor.r
          data[i + 1] = bgColor.g
          data[i + 2] = bgColor.b
          data[i + 3] = 255 // 保持不透明
          continue
        }
        
        // 判断是否是黑色像素（二维码模块）
        const isDark = Math.abs(r - codeColor.r) < 10 && Math.abs(g - codeColor.g) < 10 && Math.abs(b - codeColor.b) < 10
        
        if (!isDark) {
          // 不是黑色像素，保持原色
          continue
        }
        
        // 检查是否在finder pattern区域内
        let isOuterEye = false
        let isInnerEye = false
        
        for (const pattern of finderPatterns) {
          const relX = x - pattern.startX
          const relY = y - pattern.startY
          
          if (relX >= 0 && relX < pattern.pixelSize && relY >= 0 && relY < pattern.pixelSize) {
            const moduleX = Math.floor(relX / pattern.moduleSize)
            const moduleY = Math.floor(relY / pattern.moduleSize)
            
            if (moduleX >= 0 && moduleX <= 6 && moduleY >= 0 && moduleY <= 6) {
              // 内眼：中心3x3区域（模块索引2-4）
              if (moduleX >= 2 && moduleX <= 4 && moduleY >= 2 && moduleY <= 4) {
                isInnerEye = true
              } 
              // 外眼：最外层边框（模块索引0或6），但不包括中心3x3
              else if ((moduleX === 0 || moduleX === 6 || moduleY === 0 || moduleY === 6) && 
                       !(moduleX >= 2 && moduleX <= 4 && moduleY >= 2 && moduleY <= 4)) {
                isOuterEye = true
              }
            }
            break
          }
        }
        
        // 应用颜色（统一使用码颜色）
        data[i] = codeColor.r
        data[i + 1] = codeColor.g
        data[i + 2] = codeColor.b
      }
    }
    qrCtx.putImageData(imageData, 0, 0)
    
    // 绘制二维码
    const qrX = (previewSize - qrSize) / 2
    const qrY = (previewSize - qrSize) / 2
    ctx.drawImage(qrCanvas, qrX, qrY)
    
    // 绘制Logo
    if (beautifyStyle.value.logo) {
      const logoImg = new Image()
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoSizeMap = {
            small: qrSize * 0.15,
            medium: qrSize * 0.20,
            large: qrSize * 0.25
          }
          const logoSize = logoSizeMap[beautifyStyle.value.logoSize || 'medium']
          const logoMargin = beautifyStyle.value.logoMargin || 0
          const logoX = previewSize / 2 - logoSize / 2
          const logoY = previewSize / 2 - logoSize / 2
          
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(previewSize / 2, previewSize / 2, logoSize / 2 + logoMargin, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
          resolve()
        }
        logoImg.onerror = reject
        logoImg.src = beautifyStyle.value.logo
      })
    }
  } catch (error) {
    console.error('生成预览失败:', error)
  }
}

// 应用美化
const applyBeautify = async () => {
  if (!selectedQR.value) return
  
  try {
    // 生成美化后的二维码
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    // 绘制背景
    ctx.fillStyle = beautifyStyle.value.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, size, size)
    
    // 绘制背景图
    if (beautifyStyle.value.backgroundImage) {
      const bgImg = new Image()
      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, size, size)
          resolve()
        }
        bgImg.onerror = reject
        bgImg.src = beautifyStyle.value.backgroundImage
      })
    }
    
    // 生成二维码
    const qrCanvas = document.createElement('canvas')
    const qrSize = size - 40
    qrCanvas.width = qrSize
    qrCanvas.height = qrSize
    
    const qrUrl = selectedQR.value.qrUrl || `${getServerBaseUrl()}/viewer.html#/dynamic/${selectedQR.value.id}`
    
    await QRCode.toCanvas(qrCanvas, qrUrl, {
      width: qrSize,
      margin: beautifyStyle.value.codeMargin || 2,
      errorCorrectionLevel: beautifyStyle.value.errorLevel || 'H',
      color: {
        dark: beautifyStyle.value.codeColor || '#000000',
        light: beautifyStyle.value.codeBgColor || '#ffffff'
      }
    })
    
    // 处理透明背景并应用颜色
    const qrCtx = qrCanvas.getContext('2d')
    const imageData = qrCtx.getImageData(0, 0, qrSize, qrSize)
    const data = imageData.data
    
    // 确保颜色值有效，避免空字符串
    const codeColorValue = (beautifyStyle.value.codeColor && beautifyStyle.value.codeColor.trim()) || '#000000'
    const codeBgColorValue = (beautifyStyle.value.codeBgColor && beautifyStyle.value.codeBgColor.trim()) || '#ffffff'
    
    const bgColor = hexToRgb(codeBgColorValue)
    const codeColor = hexToRgb(codeColorValue)
    
    // 计算 finder pattern 位置
    const margin = beautifyStyle.value.codeMargin || 2
    const moduleCount = 21 + (beautifyStyle.value.errorLevel === 'L' ? 0 : beautifyStyle.value.errorLevel === 'M' ? 4 : beautifyStyle.value.errorLevel === 'Q' ? 6 : 8)
    const moduleSize = (qrSize - margin * 2) / moduleCount
    
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        const i = (y * qrSize + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // 先判断是否是背景色
        const isBackground = Math.abs(r - bgColor.r) < 10 && Math.abs(g - bgColor.g) < 10 && Math.abs(b - bgColor.b) < 10
        
        if (isBackground) {
          // 保持背景色，不设置为透明，以便用户可以看到码背景色的效果
          // 确保背景色使用用户设置的颜色
          data[i] = bgColor.r
          data[i + 1] = bgColor.g
          data[i + 2] = bgColor.b
          data[i + 3] = 255 // 保持不透明
          continue
        }
        
        // 判断是否是黑色像素（二维码模块）
        const isDark = Math.abs(r - codeColor.r) < 10 && Math.abs(g - codeColor.g) < 10 && Math.abs(b - codeColor.b) < 10
        
        if (!isDark) {
          // 不是黑色像素，保持原色
          continue
        }
        
        // 应用颜色（统一使用码颜色）
        data[i] = codeColor.r
        data[i + 1] = codeColor.g
        data[i + 2] = codeColor.b
      }
    }
    qrCtx.putImageData(imageData, 0, 0)
    
    // 绘制二维码
    const qrX = (size - qrSize) / 2
    const qrY = (size - qrSize) / 2
    ctx.drawImage(qrCanvas, qrX, qrY)
    
    // 绘制Logo
    if (beautifyStyle.value.logo) {
      const logoImg = new Image()
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoSizeMap = {
            small: qrSize * 0.15,
            medium: qrSize * 0.20,
            large: qrSize * 0.25
          }
          const logoSize = logoSizeMap[beautifyStyle.value.logoSize || 'medium']
          const logoMargin = beautifyStyle.value.logoMargin || 0
          const logoX = size / 2 - logoSize / 2
          const logoY = size / 2 - logoSize / 2
          
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, logoSize / 2 + logoMargin, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
          resolve()
        }
        logoImg.onerror = reject
        logoImg.src = beautifyStyle.value.logo
      })
    }
    
    // 转换为dataURL
    const dataURL = canvas.toDataURL('image/png')
    
    // 更新二维码
    const index = qrList.value.findIndex(qr => qr.id === selectedQR.value.id)
    if (index > -1) {
      qrList.value[index].qrCodeUrl = dataURL
      qrList.value[index].style = { ...beautifyStyle.value }
      selectedQR.value.qrCodeUrl = dataURL
      selectedQR.value.style = { ...beautifyStyle.value }
      
      const saveSuccess = saveQRList()
      if (saveSuccess) {
        const syncResult = await syncDynamicQRToServer(qrList.value[index])
        if (syncResult?.success) {
          alert(tt('dynamicManager.messages.beautifyApplied'))
        } else {
          alert(tt('dynamicManager.messages.beautifyAppliedSyncFailed', { reason: syncResult?.error?.message || tt('dynamicManager.common.unknownError') }))
        }
      } else {
        alert(tt('dynamicManager.messages.beautifyAppliedSaveFailed'))
      }
    }
    
    closeBeautifyDialog()
  } catch (error) {
    console.error('应用美化失败:', error)
    alert(tt('dynamicManager.messages.applyBeautifyFailed', { reason: error.message }))
  }
}

// 追加数据
const handleAppendData = () => {
  if (!currentFolder.value) {
    alert(tt('dynamicManager.messages.selectFolderFirst'))
    return
  }
  
  // 重置表单
  appendMode.value = 'single'
  appendQRName.value = '1'
  appendExcelFile.value = null
  
  showAppendDialog.value = true
}

// 关闭追加数据对话框
const closeAppendDialog = () => {
  showAppendDialog.value = false
  appendQRName.value = '1'
  appendExcelFile.value = null
}

// 选择Excel文件
const selectExcelFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls,.csv'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      appendExcelFile.value = file
    }
  }
  input.click()
}

// 移除Excel文件
const removeExcelFile = () => {
  appendExcelFile.value = null
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 确认追加
const confirmAppend = async () => {
  if (!currentFolder.value) {
    alert(tt('dynamicManager.messages.selectFolderFirst'))
    return
  }

  if (appendMode.value === 'single') {
    // 单条追加
    if (!appendQRName.value.trim()) {
      alert(tt('dynamicManager.messages.enterQrName'))
      return
    }

    // 获取当前模板（从第一个二维码获取，如果有的话）
    const templateQR = qrList.value.length > 0 ? qrList.value[0] : null
    const columns = templateQR?.columns || []
    const selectedQRColumn = templateQR?.selectedQRColumn || columns[0] || ''

    // 创建空数据对象
    const emptyData = {}
    columns.forEach(col => {
      emptyData[col] = ''
    })

    // 创建新二维码
    const qrId = `dynamic_${Date.now()}`
    const newQR = {
      id: qrId,
      title: appendQRName.value.trim(),
      fileName: tt('dynamicManager.common.manualCreate'),
      data: emptyData,
      columns: columns,
      selectedQRColumn: selectedQRColumn,
      template: templateQR?.template || null,
      style: templateQR?.style || null,
      folderId: currentFolder.value.id,
      status: 'normal',
      scanCountToday: 0,
      scanCountTotal: 0,
      createTime: Date.now(),
      selected: false,
      qrCodeUrl: null,
      qrUrl: null
    }

    // 生成二维码
    await generateQRCode(newQR)

    // 添加到列表
    qrList.value.push(newQR)
    const saveSuccess = saveQRList()
    
    if (!saveSuccess) {
      // 保存失败，回滚操作
      qrList.value.pop()
      alert(tt('dynamicManager.errors.createQrSaveFailed'))
      return
    }

    const syncResult = await syncDynamicQRToServer(newQR)
    if (!syncResult?.success) {
      alert(tt('dynamicManager.messages.savedLocalSyncFailed', { reason: syncResult?.error?.message || tt('dynamicManager.common.unknownError') }))
    }

    // 更新文件夹信息（只有在保存成功后才更新）
    updateFolderInfo(currentFolder.value.id)

    // 选择新创建的二维码
    selectedQR.value = newQR

    // 关闭追加对话框
    closeAppendDialog()
    
    // 自动打开编辑对话框，让用户编辑二维码内容
    setTimeout(() => {
      editQRData(newQR)
    }, 100)
  } else {
    // 批量追加
    if (!appendExcelFile.value) {
      alert(tt('dynamicManager.messages.uploadExcelFirst'))
      return
    }

    try {
      // 解析Excel文件
      const reader = new FileReader()
      reader.onerror = (error) => {
        console.error('文件读取失败:', error)
        alert(tt('dynamicManager.errors.fileReadFailed'))
      }
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error(tt('dynamicManager.errors.fileReadEmpty'))
          }

          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          // 读取第一个工作表
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // 将工作表转换为JSON格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            raw: false
          })

          if (jsonData.length === 0) {
            alert(tt('dynamicManager.errors.excelEmpty'))
            return
          }

          // 第一行是列名
          const columns = jsonData[0].map(col => String(col || '').trim()).filter(col => col)

          if (columns.length === 0) {
            alert(tt('dynamicManager.errors.excelNoHeaders'))
            return
          }

          // 从第二行开始是数据
          const rows = jsonData.slice(1)

          // 转换为对象数组
          const dataArray = rows.map((row) => {
            const rowObj = {}
            columns.forEach((col, colIndex) => {
              const cellValue = row[colIndex]
              // 由于使用了 raw: false，cellValue 已经是字符串
              rowObj[col] = cellValue === null || cellValue === undefined ? '' : String(cellValue).trim()
            })
            return rowObj
          }).filter(row => {
            return Object.values(row).some(val => val && String(val).trim())
          })

          if (dataArray.length === 0) {
            alert(tt('dynamicManager.errors.excelNoData'))
            return
          }

          // 获取当前模板信息
          const templateQR = qrList.value.length > 0 ? qrList.value[0] : null
          const selectedQRColumn = templateQR?.selectedQRColumn || columns[0] || ''

          // 创建新二维码列表
          const newQRList = dataArray.map((row, index) => {
            const qrId = `dynamic_${Date.now()}_${index}`
            const title = row[selectedQRColumn] || row[columns[0]] || tt('dynamicManager.common.qrWithIndex', { index: index + 1 })

            return {
              id: qrId,
              title: title,
              fileName: appendExcelFile.value.name,
              data: row,
              columns: columns,
              selectedQRColumn: selectedQRColumn,
              template: templateQR?.template || null,
              style: templateQR?.style || null,
              folderId: currentFolder.value.id,
              status: 'normal',
              scanCountToday: 0,
              scanCountTotal: 0,
              createTime: Date.now(),
              selected: false,
              qrCodeUrl: null,
              qrUrl: null
            }
          })

          // 生成所有二维码
          console.log('开始生成追加的二维码，共', newQRList.length, '个')
          for (let i = 0; i < newQRList.length; i++) {
            const qr = newQRList[i]
            await generateQRCode(qr)
          }

          // 添加到列表
          qrList.value.push(...newQRList)
          const saveSuccess = saveQRList()
          
          if (!saveSuccess) {
            // 保存失败，回滚操作
            for (let i = 0; i < newQRList.length; i++) {
              qrList.value.pop()
            }
            alert(tt('dynamicManager.errors.createQrSaveFailed'))
            return
          }

          let failedSyncCount = 0
          for (let i = 0; i < newQRList.length; i++) {
            const syncResult = await syncDynamicQRToServer(newQRList[i])
            if (!syncResult?.success) failedSyncCount++
          }

          // 更新文件夹信息（只有在保存成功后才更新）
          updateFolderInfo(currentFolder.value.id)

          // 选择第一个新创建的二维码
          if (newQRList.length > 0) {
            selectedQR.value = newQRList[0]
          }

          if (failedSyncCount > 0) {
            alert(tt('dynamicManager.messages.appendedWithSyncFailed', { count: newQRList.length, failed: failedSyncCount }))
          } else {
            alert(tt('dynamicManager.messages.appendedSuccess', { count: newQRList.length }))
          }
          closeAppendDialog()
        } catch (error) {
          console.error('Excel解析失败:', error)
          alert(tt('dynamicManager.errors.excelParseFailed', { reason: error.message }))
        }
      }

      reader.readAsArrayBuffer(appendExcelFile.value)
    } catch (error) {
      console.error('导入XLSX库失败:', error)
      alert(tt('dynamicManager.errors.importFailed', { reason: error.message }))
    }
  }
}

const handleBatchDownload = async () => {
  const selected = qrList.value.filter(qr => qr.selected)
  if (selected.length === 0) {
    alert(tt('dynamicManager.messages.selectQrForDownload'))
    return
  }

  try {
    // 动态导入JSZip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // 确保所有选中的二维码都已生成
    for (const qr of selected) {
      if (!qr.qrCodeUrl) {
        await generateQRCode(qr)
      }
      
      if (qr.qrCodeUrl) {
        // 将base64转换为blob
        const base64Data = qr.qrCodeUrl.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        
        // 使用标题作为文件名，清理非法字符
        const fileName = (qr.title || tt('dynamicManager.common.qrFileName', { id: qr.id })).replace(/[<>:"/\\|?*]/g, '_') + '.png'
        zip.file(fileName, blob)
      }
    }

    // 生成zip文件并下载
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipFileName = tt('dynamicManager.common.batchZipName', { timestamp: Date.now() })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = zipFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert(tt('dynamicManager.messages.batchDownloadSuccess', { count: selected.length, fileName: zipFileName }))
  } catch (error) {
    console.error('批量下载失败:', error)
    alert(tt('dynamicManager.errors.downloadFailed', { reason: error.message }))
  }
}

const handleBatchDelete = () => {
  const selected = qrList.value.filter(qr => qr.selected)
  if (selected.length === 0) {
    alert(tt('dynamicManager.messages.selectQrForDelete'))
    return
  }
  deleteQRMode.value = 'batch'
  qrToDeleteList.value = selected
  qrToDelete.value = null
  showDeleteQRDialog.value = true
}

// 单个操作
const downloadQR = (qr) => {
  if (!qr.qrCodeUrl) {
    alert(tt('dynamicManager.messages.qrNotGeneratedYet'))
    return
  }
  const link = document.createElement('a')
  link.href = qr.qrCodeUrl
  link.download = `${qr.title || tt('dynamicManager.common.qr')}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 编辑二维码数据
const editQRData = (qr) => {
  // 深拷贝二维码数据，避免直接修改原数据
  editingQR.value = {
    ...qr,
    data: { ...qr.data }
  }
  titleManuallyEdited.value = false // 重置标题编辑标记
  showEditDialog.value = true
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false
  editingQR.value = null
}

// 防抖定时器
let editDebounceTimer = null
const titleManuallyEdited = ref(false) // 标记标题是否被手动编辑过

// 编辑标题时实时更新预览
const onTitleInput = () => {
  if (!editingQR.value) return
  titleManuallyEdited.value = true
  
  // 实时更新右侧预览（如果正在编辑的是当前选中的二维码）
  if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
    selectedQR.value.title = editingQR.value.title
  }
  
  // 防抖：延迟重新生成二维码（用户停止输入500ms后）
  if (editDebounceTimer) {
    clearTimeout(editDebounceTimer)
  }
  
  editDebounceTimer = setTimeout(async () => {
    // 重新生成二维码
    await generateQRCode(editingQR.value)
    
    // 如果正在编辑的是当前选中的二维码，更新预览
    if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
      selectedQR.value.qrCodeUrl = editingQR.value.qrCodeUrl
    }
  }, 500)
}

// 编辑数据内容时实时更新预览
const onDataInput = () => {
  if (!editingQR.value) return
  
  // 如果标题没有被手动编辑过，且标题字段在数据中，可以自动更新标题
  // 但为了保持独立性，这里不自动更新标题，让用户独立控制
  
  // 实时更新右侧预览（如果正在编辑的是当前选中的二维码）
  if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
    selectedQR.value.data = { ...editingQR.value.data }
  }
  
  // 防抖：延迟重新生成二维码（用户停止输入500ms后）
  if (editDebounceTimer) {
    clearTimeout(editDebounceTimer)
  }
  
  editDebounceTimer = setTimeout(async () => {
    // 重新生成二维码
    await generateQRCode(editingQR.value)
    
    // 如果正在编辑的是当前选中的二维码，更新预览
    if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
      selectedQR.value.qrCodeUrl = editingQR.value.qrCodeUrl
    }
  }, 500)
}

// 保存编辑的数据
const saveEditData = async () => {
  if (!editingQR.value) return
  
  // 找到原二维码并更新
  const index = qrList.value.findIndex(qr => qr.id === editingQR.value.id)
  if (index > -1) {
    // 更新数据
    qrList.value[index].data = { ...editingQR.value.data }
    qrList.value[index].title = editingQR.value.title
    
    // 重新生成二维码
    await generateQRCode(qrList.value[index])
    
    // 如果当前选中的是这个二维码，更新预览
    if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
      selectedQR.value = { ...qrList.value[index] }
    }
    
    // 保存到localStorage
    const saveSuccess = saveQRList()
    
    if (saveSuccess) {
      const syncResult = await syncDynamicQRToServer(qrList.value[index])
      if (syncResult?.success) {
        alert(tt('dynamicManager.messages.dataSavedUpdated'))
      } else {
        alert(tt('dynamicManager.messages.savedDataSyncFailed', { reason: syncResult?.error?.message || tt('dynamicManager.common.unknownError') }))
      }
    } else {
      // 保存失败，回滚编辑
      const originalIndex = qrList.value.findIndex(qr => qr.id === editingQR.value.id)
      if (originalIndex > -1) {
        qrList.value[originalIndex] = { ...editingQR.value }
        if (selectedQR.value && selectedQR.value.id === editingQR.value.id) {
          selectedQR.value = { ...editingQR.value }
        }
      }
      alert(tt('dynamicManager.errors.dataSaveFailedNoUpdate'))
    }
  }
  
  closeEditDialog()
}

// 显示预览
const showPreview = (qr) => {
  previewQR.value = qr
}

// 关闭预览
const closePreview = () => {
  previewQR.value = null
}

const deleteQR = (qr) => {
  deleteQRMode.value = 'single'
  qrToDelete.value = qr
  qrToDeleteList.value = []
  showDeleteQRDialog.value = true
}

// 确认删除二维码
const confirmDeleteQR = () => {
  if (deleteQRMode.value === 'single' && qrToDelete.value) {
    // 单个删除
    const index = qrList.value.findIndex(item => item.id === qrToDelete.value.id)
    if (index > -1) {
      const deletedQR = qrList.value[index]
      qrList.value.splice(index, 1)
      const saveSuccess = saveQRList()
      
      if (!saveSuccess) {
        // 保存失败，回滚删除
        qrList.value.splice(index, 0, deletedQR)
        alert(tt('dynamicManager.errors.deleteFailed'))
        closeDeleteQRDialog()
        return
      }
      
      if (selectedQR.value?.id === qrToDelete.value.id) {
        selectedQR.value = null
      }
      
      // 更新文件夹信息（只有在保存成功后才更新）
      if (currentFolder.value) {
        updateFolderInfo(currentFolder.value.id)
      }

      deleteContentFromServer(deletedQR.id)
    }
  } else if (deleteQRMode.value === 'batch' && qrToDeleteList.value.length > 0) {
    // 批量删除
    const deletedQRs = []
    qrToDeleteList.value.forEach(qr => {
      const index = qrList.value.findIndex(item => item.id === qr.id)
      if (index > -1) {
        deletedQRs.push({ index, qr: qrList.value[index] })
        qrList.value.splice(index, 1)
      }
    })
    
    const saveSuccess = saveQRList()
    
    if (!saveSuccess) {
      // 保存失败，回滚删除
      deletedQRs.reverse().forEach(({ index, qr }) => {
        qrList.value.splice(index, 0, qr)
      })
      alert(tt('dynamicManager.errors.deleteFailed'))
      closeDeleteQRDialog()
      return
    }
    
    if (selectedQR.value && qrToDeleteList.value.find(qr => qr.id === selectedQR.value.id)) {
      selectedQR.value = null
    }
    
    // 更新文件夹信息（只有在保存成功后才更新）
    if (currentFolder.value) {
      updateFolderInfo(currentFolder.value.id)
    }

    qrToDeleteList.value.forEach((qr) => {
      deleteContentFromServer(qr.id)
    })
  }
  closeDeleteQRDialog()
}

// 关闭删除二维码对话框
const closeDeleteQRDialog = () => {
  showDeleteQRDialog.value = false
  qrToDelete.value = null
  qrToDeleteList.value = []
  deleteQRMode.value = 'single'
}

// 返回
const goBack = () => {
  emit('close')
}

// 根据文件夹ID加载二维码列表
const loadQRListByFolder = (folderId) => {
  const savedData = localStorage.getItem('dynamicQRList')
  if (!savedData) return []
  const allQRList = JSON.parse(savedData)
  return allQRList.filter(qr => qr.folderId === folderId)
}

// 更新文件夹信息
const updateFolderInfo = (folderId) => {
  const savedFolders = localStorage.getItem('dynamicQRFolders')
  if (savedFolders) {
    const folders = JSON.parse(savedFolders)
    const folder = folders.find(f => f.id === folderId)
    if (folder) {
      const folderQRList = loadQRListByFolder(folderId)
      folder.qrCount = folderQRList.length
      folder.updateTime = Date.now()
      localStorage.setItem('dynamicQRFolders', JSON.stringify(folders))
    }
  }
}

// 接收批量生成的数据
const initFromBatchData = async (batchData, folderId) => {
  if (!batchData || !batchData.data) return

  const excelData = batchData.data
  const dataArray = excelData.data || [] // 使用data数组而不是rows
  const columns = excelData.columns || []
  const fileName = excelData.fileName || tt('dynamicManager.common.unknownFile')
  const selectedQRColumn = batchData.selectedQRColumn || columns[0] || ''

  if (dataArray.length === 0) {
    alert(tt('dynamicManager.errors.noDataToGenerate'))
    return
  }

  // 加载当前文件夹信息
  if (folderId) {
    const savedFolders = localStorage.getItem('dynamicQRFolders')
    if (savedFolders) {
      const folders = JSON.parse(savedFolders)
      currentFolder.value = folders.find(f => f.id === folderId)
    }
  }

  // 创建二维码列表
  const newQRList = dataArray.map((row, index) => {
    const qrId = `dynamic_${Date.now()}_${index}`
    // 使用二维码列的内容作为标题
    const title = row[selectedQRColumn] || row[columns[0]] || tt('dynamicManager.common.qrWithIndex', { index: index + 1 })
    
    return {
      id: qrId,
      title: title,
      fileName: fileName,
      data: row,
      columns: columns,
      selectedQRColumn: selectedQRColumn,
      template: batchData.template,
      style: batchData.style,
      folderId: folderId, // 关联文件夹ID
      status: 'normal',
      scanCountToday: 0,
      scanCountTotal: 0,
      createTime: Date.now(),
      selected: false,
      qrCodeUrl: null,
      qrUrl: null // 二维码链接URL
    }
  })

  // 加载所有二维码（避免覆盖其他文件夹的数据）
  const savedData = localStorage.getItem('dynamicQRList')
  let allQRList = []
  if (savedData) {
    try {
      allQRList = JSON.parse(savedData)
    } catch (error) {
      console.error('加载二维码列表失败:', error)
      allQRList = []
    }
  }
  
  // 移除当前文件夹的旧二维码（如果有）
  if (folderId) {
    allQRList = allQRList.filter(qr => qr.folderId !== folderId)
  }
  
  // 添加新创建的二维码
  allQRList = [...allQRList, ...newQRList]
  
  // 保存所有二维码（包括其他文件夹的），使用安全保存函数
  const saveSuccess = safeSaveQRList(allQRList)
  if (!saveSuccess) {
    // 保存失败，回滚操作
    alert(tt('dynamicManager.errors.createQrSaveFailed'))
    return
  }
  
  // 更新当前组件的qrList（仅用于显示）
  qrList.value = folderId ? allQRList.filter(qr => qr.folderId === folderId) : allQRList
  
  console.log('已创建', newQRList.length, '个二维码对象，文件夹ID:', folderId)
  console.log('当前文件夹二维码数量:', qrList.value.length)
  console.log('所有二维码总数:', allQRList.length)

  // 在界面中生成所有二维码（不下载）
  console.log('开始生成二维码，共', newQRList.length, '个')
  
  // 检查 API 服务器状态（仅用于日志，不再阻止后续同步）
  const apiAvailable = await checkApiServer()
  if (!apiAvailable) {
    console.warn('API 服务器健康检查未通过，将仍然尝试同步到服务器')
  }

  let failedSyncCount = 0
  for (let i = 0; i < newQRList.length; i++) {
    const qr = newQRList[i]
    await generateQRCode(qr)
    
    const syncResult = await syncDynamicQRToServer(qr)
    if (syncResult?.success) {
      console.log(`✓ 活码 ${qr.id} 已同步到服务器`)
    } else {
      failedSyncCount++
      console.error(`✗ 活码 ${qr.id} 同步到服务器失败:`, syncResult?.error)
    }

    // 每生成 10 个或最后一个时保存一次，确保数据不丢失
    if ((i + 1) % 10 === 0 || i === newQRList.length - 1) {
      console.log(`已生成 ${i + 1}/${newQRList.length} 个二维码`)
      // 更新所有二维码列表并保存
      const currentSavedData = localStorage.getItem('dynamicQRList')
      let currentAllQRList = []
      if (currentSavedData) {
        try {
          currentAllQRList = JSON.parse(currentSavedData)
        } catch (error) {
          currentAllQRList = []
        }
      }
      // 更新新生成的二维码数据
      newQRList.forEach(newQR => {
        const index = currentAllQRList.findIndex(qr => qr.id === newQR.id)
        if (index > -1) {
          currentAllQRList[index] = newQR
        }
      })
      // 使用安全保存函数
      const saveSuccess = safeSaveQRList(currentAllQRList)
      if (!saveSuccess) {
        console.warn('保存失败，但继续生成二维码')
      }
    }
  }

  // 最后再保存一次，确保所有数据都已保存
  const finalSavedData = localStorage.getItem('dynamicQRList')
  let finalAllQRList = []
  if (finalSavedData) {
    try {
      finalAllQRList = JSON.parse(finalSavedData)
    } catch (error) {
      finalAllQRList = []
    }
  }
  // 更新新生成的二维码数据
  newQRList.forEach(newQR => {
    const index = finalAllQRList.findIndex(qr => qr.id === newQR.id)
    if (index > -1) {
      finalAllQRList[index] = newQR
    }
  })
  
  // 使用安全保存函数，确保保存成功
  const finalSaveSuccess = safeSaveQRList(finalAllQRList)
  if (!finalSaveSuccess) {
    alert(tt('dynamicManager.errors.finalSaveFailed'))
    return
  }

  if (failedSyncCount > 0) {
    alert(tt('dynamicManager.messages.partialSyncFailed', { failed: failedSyncCount, total: newQRList.length }))
  }

  // 更新文件夹的二维码数量和修改时间（只有在保存成功后才更新）
  if (folderId) {
    // 验证保存的数据
    const savedQRList = loadQRListByFolder(folderId)
    console.log('保存后验证：文件夹', folderId, '中的二维码数量:', savedQRList.length)
    
    if (savedQRList.length === newQRList.length) {
      // 验证通过，更新文件夹信息
      updateFolderInfo(folderId)
      // 再次验证文件夹信息
      const savedFolders = localStorage.getItem('dynamicQRFolders')
      if (savedFolders) {
        const folders = JSON.parse(savedFolders)
        const folder = folders.find(f => f.id === folderId)
        if (folder) {
          console.log('文件夹信息已更新，二维码数量:', folder.qrCount)
        }
      }
    } else {
      console.error('验证失败：保存的二维码数量不匹配，期望:', newQRList.length, '实际:', savedQRList.length)
      alert(tt('dynamicManager.errors.verifyCountFailed'))
    }
  }
  
  alert(tt('dynamicManager.messages.generatedSuccess', { count: newQRList.length }))

  // 默认选择第一个
  if (qrList.value.length > 0) {
    selectedQR.value = qrList.value[0]
  }
}

// 初始化文件夹的二维码列表
const initFromFolder = (folder) => {
  currentFolder.value = folder
  const folderQRList = loadQRListByFolder(folder.id)
  qrList.value = folderQRList
  
  // 为每个二维码生成二维码图片（如果还没有）
  qrList.value.forEach(qr => {
    if (!qr.qrCodeUrl) {
      generateQRCode(qr)
    }
  })
  
  // 默认选择第一个
  if (qrList.value.length > 0) {
    selectedQR.value = qrList.value[0]
  }
}

// 暴露方法供父组件调用
defineExpose({
  initFromBatchData,
  initFromFolder
})
</script>

<style scoped>
.dynamic-qr-manager {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.manager-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.return-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
}

.control-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-count {
  font-size: 14px;
  color: #666;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.search-btn {
  padding: 8px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.batch-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s;
}

.batch-btn:hover {
  background: #1976D2;
}

.batch-btn.danger {
  background: #f44336;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.left-panel {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 0; /* 防止内容溢出 */
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* 平滑滚动 */
}

.qr-table {
  width: 100%;
  border-collapse: collapse;
}

.qr-table th,
.qr-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  word-break: break-word;
  overflow-wrap: break-word;
  vertical-align: middle;
}

.qr-table td:nth-child(2) {
  min-width: 150px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qr-table td:nth-child(3) {
  min-width: 120px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-table td:nth-child(4) {
  min-width: 100px;
  white-space: nowrap;
}

.qr-table td:nth-child(5) {
  min-width: 80px;
  white-space: nowrap;
}

.qr-table td:nth-child(6) {
  min-width: 90px;
  white-space: nowrap;
}

.qr-table td:nth-child(7) {
  min-width: 140px;
  white-space: nowrap;
}

.qr-table td:nth-child(8) {
  min-width: 180px;
  white-space: nowrap;
}

.qr-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.qr-table tbody tr {
  cursor: pointer;
  transition: background 0.2s;
}

.qr-table tbody tr:hover {
  background: #f5f5f5;
}

.qr-table tbody tr.selected {
  background: #e3f2fd;
}

.qr-table tbody tr.selected td {
  background: #e3f2fd;
}

.qr-table tbody tr.selected th:first-child,
.qr-table tbody tr.selected td:first-child {
  background: #e3f2fd;
}

.qr-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-icon {
  font-size: 20px;
}

.qr-title {
  font-weight: 500;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 200px;
}

.scan-count {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.normal {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.disabled {
  background: #ffebee;
  color: #c62828;
}

.edit-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  width: 50px;
}

.action-btn.danger {
  background: #f44336;
}

.preview-btn {
  background: #4CAF50;
}

.preview-btn:hover {
  background: #45a049;
}

/* 预览弹窗样式 */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(4px);
}

.preview-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.preview-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.preview-close-btn {
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
  transition: all 0.3s;
}

.preview-close-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.preview-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.preview-modal-content {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  vertical-align: middle;
  text-align: left;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-section.qr-preview-section {
  width: 450px;
}

.preview-section.content-preview-section {
  width: 450px;
  text-align: left;
  vertical-align: top;
}

.preview-section h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #2196F3;
}

.preview-qr-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 30px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.preview-qr-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  padding: 10px;
}

.preview-placeholder {
  text-align: center;
  color: #999;
  padding: 60px 20px;
  font-size: 14px;
}

.preview-content-box {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.preview-content-box .spec-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-content-box .spec-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.preview-content-box .spec-label {
  font-weight: 500;
  color: #666;
  width: 40%;
}

.preview-content-box .spec-value {
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
}

.preview-content-box .image-list-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-content-box .image-list-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 12px;
}

.preview-content-box .image-count {
  font-size: 14px;
  font-weight: 600;
  color: #2196F3;
}

.preview-content-box .image-list-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-content-box .image-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.preview-content-box .image-list-item:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  transform: translateX(4px);
}

.preview-content-box .image-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #2196F3;
  color: white;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.preview-content-box .image-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  overflow-wrap: break-word;
  font-weight: 500;
}

.preview-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.preview-close-action-btn {
  padding: 10px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.preview-close-action-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qr-preview-section,
.content-preview-section {
  background: white;
  border-radius: 8px;
  padding: 50px;
  width: 100%;
  height: 100%;
}

.qr-preview-section h3,
.content-preview-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.qr-preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.qr-preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.qr-placeholder,
.content-placeholder {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
  line-height: 1.6;
}

.content-preview-box {
  min-height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
}

.spec-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.spec-label {
  font-weight: 500;
  color: #666;
  width: 40%;
}

.spec-value {
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 60%;
}

/* 图片列表预览样式 */
.image-list-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-list-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.image-count {
  font-size: 14px;
  font-weight: 600;
  color: #2196F3;
}

.image-list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background 0.2s;
}

.image-list-item:hover {
  background: #e9ecef;
}

.image-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #2196F3;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.image-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  overflow-wrap: break-word;
}

/* 编辑对话框样式 */
.edit-dialog-overlay {
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

.edit-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.edit-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.edit-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
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
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.edit-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.edit-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.edit-input:focus {
  outline: none;
  border-color: #2196F3;
}

.edit-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.edit-divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
}

.edit-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.save-btn:hover {
  background: #1976D2;
}

/* 美化对话框样式 */
.beautify-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.beautify-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.beautify-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.beautify-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.beautify-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.beautify-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.beautify-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-group {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.config-group h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.config-row:last-child {
  margin-bottom: 0;
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-box label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.image-upload {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.image-upload.small {
  width: 80px;
  height: 80px;
}

.image-upload:hover {
  border-color: #2196F3;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.plus-icon {
  font-size: 32px;
  line-height: 1;
}

.image-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.delete-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-picker-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-picker-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.beautify-preview {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.beautify-preview h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.preview-box {
  width: 100%;
  height: 300px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.preview-box canvas {
  max-width: 100%;
  max-height: 100%;
}

.beautify-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

/* 追加数据对话框样式 */
.append-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
}

.append-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.append-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.append-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.append-dialog-body {
  padding: 20px;
}

.append-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.append-tab {
  flex: 1;
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.append-tab.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.append-single,
.append-batch {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 15px;
  background: #fff9e6;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.info-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.info-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.upload-area:hover {
  border-color: #2196F3;
  background: #f5f5f5;
}

.upload-area.has-file {
  border-color: #4caf50;
  background: #f1f8f4;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.remove-file-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #999;
}

.append-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.confirm-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #1976D2;
}

/* 中等屏幕：调整布局 */
@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-panel {
    order: 1; /* 放在下方 */
    position: static; /* 取消 sticky */
    max-height: none;
  }
  
  .left-panel {
    order: 0;
  }
  
  .beautify-content {
    grid-template-columns: 1fr;
  }
  
  .beautify-preview {
    order: -1;
  }
  
  .preview-modal-content {
    grid-template-columns: 1fr;
  }
}

/* 小屏幕：优化表格和控制面板 */
@media (max-width: 1024px) {
  .dynamic-qr-manager {
    padding: 15px;
  }
  
  .manager-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
  
  .manager-header h1 {
    font-size: 20px;
  }
  
  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 15px;
  }
  
  .control-left {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .control-right {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .batch-btn {
    padding: 8px 16px;
    font-size: 13px;
    flex: 1;
    min-width: 120px;
  }
  
  .search-input {
    width: 100%;
    min-width: 150px;
  }
  
  /* 表格优化：隐藏部分列 */
  .qr-table th:nth-child(3),
  .qr-table td:nth-child(3) {
    display: none; /* 隐藏上传文件名称 */
  }
  
  .qr-table th:nth-child(7),
  .qr-table td:nth-child(7) {
    display: none; /* 隐藏创建时间 */
  }
  
  .qr-table th,
  .qr-table td {
    padding: 10px 8px;
    font-size: 13px;
  }
  
  .qr-title {
    max-width: 150px;
  }
  
  .right-panel {
    margin-top: 20px;
  }
  
  .preview-container {
    gap: 15px;
  }
  
  .qr-preview-section,
  .content-preview-section {
    padding: 15px;
  }
}

/* 超小屏幕：进一步优化 */
@media (max-width: 768px) {
  .dynamic-qr-manager {
    padding: 10px;
  }
  
  .manager-header {
    padding: 12px;
  }
  
  .manager-header h1 {
    font-size: 18px;
  }
  
  .return-btn {
    padding: 8px 16px;
    font-size: 13px;
    width: 100%;
  }
  
  .control-panel {
    padding: 12px;
  }
  
  .control-left {
    width: 100%;
  }
  
  .total-count {
    font-size: 13px;
  }
  
  .filter-select,
  .search-input {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .batch-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-width: 100px;
  }
  
  /* 表格进一步优化 */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }
  
  .table-container::before {
    content: '';
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
    width: 50px;
    height: 100%;
    pointer-events: none;
  }
  
  .qr-table {
    min-width: 600px; /* 确保表格最小宽度，允许横向滚动 */
  }
  
  /* 第一列（复选框）保持可见 */
  .qr-table th:first-child,
  .qr-table td:first-child {
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }
  
  .qr-table th:first-child {
    background: #f8f9fa;
  }
  
  .qr-table th:nth-child(4),
  .qr-table td:nth-child(4) {
    display: none; /* 隐藏扫码次数 */
  }
  
  .qr-table th:nth-child(5),
  .qr-table td:nth-child(5) {
    display: none; /* 隐藏状态 */
  }
  
  .qr-table th,
  .qr-table td {
    padding: 8px 6px;
    font-size: 12px;
  }
  
  .qr-title {
    max-width: 120px;
    font-size: 13px;
  }
  
  .edit-btn,
  .action-btn {
    padding: 5px 10px;
    font-size: 11px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .preview-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .preview-modal-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .preview-qr-box {
    min-height: 250px;
    padding: 20px;
  }
  
  .preview-content-box {
    max-height: 300px;
  }
  
  .qr-preview-section,
  .content-preview-section {
    padding: 12px;
  }
  
  .qr-preview-section h3,
  .content-preview-section h3 {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .qr-preview-box {
    min-height: 150px;
    padding: 15px;
  }
  
  .content-preview-box {
    min-height: 300px;
    padding: 15px;
  }
  
  .spec-table td {
    padding: 8px;
    font-size: 12px;
  }
  
  .spec-label {
    width: 35%;
    font-size: 12px;
  }
  
  .spec-value {
    font-size: 12px;
    word-break: break-word;
  }
}

/* 超超小屏幕：移动端优化 */
@media (max-width: 480px) {
  .dynamic-qr-manager {
    padding: 8px;
  }
  
  .manager-header {
    padding: 10px;
  }
  
  .manager-header h1 {
    font-size: 16px;
  }
  
  .control-panel {
    padding: 10px;
  }
  
  .control-left {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-input {
    flex: 1;
  }
  
  .control-right {
    width: 100%;
  }
  
  .batch-btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .qr-table {
    min-width: 500px;
  }
  
  /* 第一列（复选框）保持可见 */
  .qr-table th:first-child,
  .qr-table td:first-child {
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }
  
  .qr-table th:first-child {
    background: #f8f9fa;
  }
  
  .qr-table th:nth-child(6),
  .qr-table td:nth-child(6) {
    display: none; /* 隐藏编辑数据列 */
  }
  
  .qr-table th,
  .qr-table td {
    padding: 6px 4px;
    font-size: 11px;
  }
  
  .qr-title {
    max-width: 100px;
    font-size: 12px;
  }
  
  /* 确保第一列（复选框）在小屏幕上也能正常显示 */
  .qr-table th:first-child,
  .qr-table td:first-child {
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .qr-table th:first-child {
    background: #f8f9fa;
  }
  
  .qr-table tbody tr.selected th:first-child,
  .qr-table tbody tr.selected td:first-child {
    background: #e3f2fd;
  }
  
  .qr-preview-section,
  .content-preview-section {
    padding: 10px;
  }
  
  .qr-preview-box {
    min-height: 120px;
    padding: 10px;
  }
  
  .content-preview-box {
    min-height: 250px;
    padding: 10px;
  }
}

/* 删除二维码确认对话框样式 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.delete-qr-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10003;
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(4px);
}

.delete-qr-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.delete-qr-dialog-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: scaleIn 0.3s ease-out 0.1s both;
}

.delete-qr-dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.delete-qr-dialog-message {
  margin-bottom: 32px;
  line-height: 1.6;
  width: 100%;
}

.delete-qr-dialog-message p {
  margin: 8px 0;
  font-size: 15px;
  color: #666;
}

.delete-qr-dialog-message strong {
  color: #f44336;
  font-weight: 600;
  word-break: break-word;
}

.delete-qr-dialog-message .warning-text {
  color: #f44336 !important;
  font-weight: 500;
  font-size: 14px !important;
  margin-top: 12px;
}

.delete-qr-dialog-footer {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.delete-qr-cancel-btn,
.delete-qr-confirm-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.delete-qr-cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.delete-qr-cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.delete-qr-confirm-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-qr-confirm-btn:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

.delete-qr-confirm-btn:active {
  transform: translateY(0);
}
</style>