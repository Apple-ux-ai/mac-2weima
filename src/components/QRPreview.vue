<template>
  <div class="qr-preview">
    <div class="preview-card">
      <div class="preview-header">
        <h3>{{ t('qrGenerator.preview.title') }}</h3>
        <button 
          v-if="qrDataUrl" 
          class="save-btn" 
          @click="saveQRCode"
        >
          {{ isElectron ? t('qrGenerator.preview.saveToLocal') : t('qrGenerator.preview.download') }}
        </button>
      </div>

      <div class="preview-area">
        <div v-if="!qrDataUrl" class="placeholder">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <p class="placeholder-text">{{ t('qrGenerator.preview.placeholderText') }}</p>
          <p class="placeholder-hint">{{ t('qrGenerator.preview.placeholderHint') }}</p>
        </div>
        
        <div v-else class="qr-display">
          <img :src="qrDataUrl" :alt="t('qrGenerator.preview.qrAlt')" class="qr-image" />
          <div class="qr-actions">
            <button @click="copyQRCode" class="action-btn copy-btn">
              {{ t('qrGenerator.preview.copy') }}
            </button>
            <button @click="printQRCode" class="action-btn print-btn">
              {{ t('qrGenerator.preview.print') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="qrInfo" class="qr-info-panel">
        <div class="info-header">
          <span class="success-icon">✅</span>
          <span>{{ t('qrGenerator.preview.generateSuccess') }}</span>
        </div>
        
        <div class="info-details">
          <div class="info-row">
            <span class="info-label">{{ t('qrGenerator.preview.typeLabel') }}</span>
            <span class="info-value">{{ getTypeLabel(qrInfo.type) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('qrGenerator.preview.sizeLabel') }}</span>
            <span class="info-value">{{ qrInfo.size }} × {{ qrInfo.size }}px</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('qrGenerator.preview.timestampLabel') }}</span>
            <span class="info-value">{{ qrInfo.timestamp }}</span>
          </div>
          <div class="info-row content-row">
            <span class="info-label">{{ t('qrGenerator.preview.displayContentLabel') }}</span>
            <span class="info-value">{{ qrInfo.content }}</span>
          </div>
          <div v-if="qrInfo.actualContent" class="info-row content-row">
            <span class="info-label">{{ t('qrGenerator.preview.actualContentLabel') }}</span>
            <span class="info-value actual-content">{{ qrInfo.actualContent }}</span>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <h4>{{ t('qrGenerator.preview.tipsTitle') }}</h4>
        <ul>
          <li>{{ t('qrGenerator.preview.tip1') }}</li>
          <li>{{ t('qrGenerator.preview.tip2') }}</li>
          <li>{{ t('qrGenerator.preview.tip3') }}</li>
          <li>{{ t('qrGenerator.preview.tip4') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  qrDataUrl: String,
  qrInfo: Object
})

const isElectron = computed(() => window.electron !== undefined)

const getTypeLabel = (type) => {
  const typeMap = {
    text: '文本/网址',
    file: '文档',
    image: '图片',
    media: '音视频',
    batch: '批量'
  }
  return typeMap[type] || type
}

const saveQRCode = async () => {
  if (!props.qrDataUrl) return

  if (isElectron.value) {
    // Electron环境
    const result = await window.electron.saveQRCode(props.qrDataUrl)
    if (result.success) {
      alert(t('qrPreviewExtra.savedToPath', { path: result.filePath }))
    } else {
      alert(t('qrPreviewExtra.saveFailed'))
    }
  } else {
    // Web环境：浏览器下载
    const link = document.createElement('a')
    link.download = `qrcode_${Date.now()}.png`
    link.href = props.qrDataUrl
    link.click()
  }
}

const copyQRCode = async () => {
  try {
    // 获取二维码的实际编码内容
    const contentToCopy = props.qrInfo?.actualContent || props.qrInfo?.content || ''
    
    if (!contentToCopy) {
      alert(t('qrPreviewExtra.qrContentEmpty'))
      return
    }
    
    // 复制文本内容到剪贴板
    await navigator.clipboard.writeText(contentToCopy)
    
    alert(t('qrPreviewExtra.copiedToClipboard'))
  } catch (error) {
    console.error('复制失败:', error)
    
    // 降级方案：使用传统方法
    try {
      const contentToCopy = props.qrInfo?.actualContent || props.qrInfo?.content || ''
      if (!contentToCopy) {
        alert(t('qrPreviewExtra.qrContentEmpty'))
        return
      }
      
      const textArea = document.createElement('textarea')
      textArea.value = contentToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        alert(t('qrPreviewExtra.copiedToClipboard'))
      } else {
        alert(t('qrPreviewExtra.copyFailed'))
      }
    } catch (fallbackError) {
      console.error('降级复制方法也失败:', fallbackError)
      alert(t('qrPreviewExtra.copyFailed'))
    }
  }
}

const printQRCode = async () => {
  if (!props.qrDataUrl) return
  
  if (isElectron.value) {
    // Electron 环境：调用主进程打印接口，避免白屏
    const result = await window.electron.printQRCode(props.qrDataUrl)
    if (!result.success) {
      alert(t('qrPreviewExtra.printFailed', { error: result.error || t('dynamicManager.common.unknownError') }))
    }
    return
  }
  
  // Web 环境：使用新窗口打印
  const printWindow = window.open('', '_blank')
  const htmlContent = [
    '<html>',
    '<head>',
    '<title>打印二维码</title>',
    '<style>',
    'body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }',
    'img { max-width: 100%; height: auto; }',
    '@media print { body { padding: 0; } }',
    '</style>',
    '</head>',
    '<body>',
    `<img src="${props.qrDataUrl}" alt="二维码" />`,
    '<' + 'script>',
    'window.onload = () => { window.print(); window.onafterprint = () => window.close(); };',
    '</' + 'script>',
    '</body>',
    '</html>'
  ].join('')
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
</script>

<style scoped>
.qr-preview {
  position: sticky;
  top: 80px;
}

.preview-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.save-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.3);
}

.preview-area {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  background: #fafafa;
}

.placeholder {
  text-align: center;
  color: #bbb;
}

.placeholder svg {
  stroke: #ddd;
  margin-bottom: 20px;
}

.placeholder-text {
  font-size: 1.2rem;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.placeholder-hint {
  font-size: 0.9rem;
  color: #bbb;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 10px;
}

.qr-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #2196F3;
  background: #e3f2fd;
  transform: translateY(-1px);
}

.qr-info-panel {
  background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 15px;
  font-size: 1rem;
}

.success-icon {
  font-size: 1.2rem;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.content-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 400;
}

.actual-content {
  font-family: 'Courier New', monospace;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.85rem;
}

.tips-section {
  background: #fff3e0;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #ff9800;
}

.tips-section h4 {
  font-size: 1rem;
  color: #e65100;
  margin-bottom: 12px;
  font-weight: 600;
}

.tips-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-section li {
  padding: 6px 0;
  color: #666;
  font-size: 0.9rem;
  position: relative;
  padding-left: 20px;
}

.tips-section li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #ff9800;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .qr-preview {
    position: static;
  }
}

@media (max-width: 768px) {
  .preview-card {
    padding: 20px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .save-btn {
    width: 100%;
  }
}
</style>


