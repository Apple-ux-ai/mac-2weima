<template>
  <div class="batch-qr-generator">
    <!-- 批量类型选择 -->
    <div class="section">
      <div class="tabs">
        <button 
          :class="['tab', { active: batchType === 'dynamic' }]"
          @click="batchType = 'dynamic'"
        >
          {{ t('batchGenerator.tabs.dynamic') }}
        </button>
        <button 
          :class="['tab', { active: batchType === 'static' }]"
          @click="batchType = 'static'"
        >
          {{ t('batchGenerator.tabs.static') }}
        </button>
        <button 
          class="tab live-code-btn"
          @click="showFolderList"
        >
          {{ t('batchGenerator.tabs.liveCode') }}
        </button>
      </div>
      
      <div class="section-content">
        <div class="description">
          <p v-if="batchType === 'dynamic'">
            {{ t('batchGenerator.desc.dynamic') }}
          </p>
          <p v-else>
            {{ t('batchGenerator.desc.static') }}
          </p>
        </div>
        
        <div class="upload-section">
          <button class="upload-btn" @click="selectExcel">
            <span class="icon">📊</span>
            <span>{{ t('batchGenerator.actions.uploadExcel') }}</span>
          </button>
          
          <div v-if="excelData" class="file-uploaded">
            <span class="success-icon">✅</span>
            <span>{{ excelData.fileName }}</span>
            <span class="data-count">{{ t('batchGenerator.messages.rows', { count: excelData.rows }) }}</span>
            <button class="remove-btn" @click="removeExcel">✕</button>
          </div>
          
          <div class="excel-icon">📑</div>
        </div>
      </div>
    </div>

    <!-- 设置入口按钮 -->
    <div v-if="excelData" class="settings-entry">
      <button class="settings-trigger-btn" @click="openSettings">
        ⚙️ {{ t('batchGenerator.actions.settingsAndStart') }}
      </button>
    </div>

    <!-- 样式编辑 -->
    <div v-if="showSettings" class="settings-modal-overlay" @click.self="closeSettings">
      <div class="settings-modal-content">
        <div class="settings-modal-header">
          <h3>{{ t('batchGenerator.modal.settingsTitle') }}</h3>
          <button class="close-btn-icon" @click="closeSettings">✕</button>
        </div>
        
        <div class="settings-modal-body">
          <!-- 模板选择（仅活码模式显示） -->
          <div v-if="batchType === 'dynamic'" class="section inner-section">
            <h3>{{ t('batchGenerator.modal.selectTemplate') }}</h3>
            <div class="section-content template-section">
              <div class="template-info">
                <div class="current-template">
                  <span>{{ t('batchGenerator.modal.currentTemplate') }}</span>
                  <strong>{{ selectedTemplate.name }}</strong>
                </div>
                <button class="change-btn" @click="showTemplateSelector = true">
                  {{ t('batchGenerator.modal.changeTemplate') }}
                </button>
              </div>
              
              <button class="preview-btn" @click="previewTemplate">
                {{ t('batchGenerator.actions.previewPage') }}
              </button>
              
              <div class="template-icon">📄</div>
            </div>
          </div>

          <div class="section inner-section">
            <h3>{{ t('batchGenerator.modal.editStyle') }}</h3>
            
            <div class="style-header-wrapper">
              <!-- 字段设置 -->
              <div class="field-settings-section">
          <h4 class="blue-heading">{{ t('batchGenerator.modal.fieldSettings') }}</h4>
          <div v-if="!excelData || !currentFieldConfig" class="no-data">{{ t('batchGenerator.modal.noDataField') }}</div>
          <div v-else class="field-config-list">
            <!-- 单个字段配置 -->
            <div v-if="currentFieldConfig" class="field-config-item">
              <div class="field-config-header">
                <label class="field-checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="currentFieldConfig.enabled"
                  />
                  <span class="field-name">
                    {{ currentFieldConfig.displayName || currentFieldConfig.name }}
                  </span>
                </label>
              </div>
              
              <div class="field-config-options">
                <div class="config-option-row">
                  <input 
                    type="text" 
                    v-model="currentFieldConfig.displayName" 
                    class="field-display-input"
                    :placeholder="t('batchGenerator.modal.displayName')"
                    @input="updatePreview"
                  />
                  <select v-model="currentFieldConfig.name" class="field-select-small" @change="handleFieldNameChange">
                    <option value="__empty__">{{ t('batchGenerator.modal.noContent') }}</option>
                    <option v-for="col in excelData.columns" :key="col" :value="col">
                      {{ formatColumnOption(col) }}
                    </option>
                  </select>
                  <select v-model="currentFieldConfig.fontSize" class="field-select-small" @change="updatePreview">
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="22">22</option>
                    <option value="24">24</option>
                    <option value="26">26</option>
                    <option value="28">28</option>
                    <option value="30">30</option>
                    <option value="32">32</option>
                    <option value="34">34</option>
                    <option value="36">36</option>
                    <option value="40">40</option>
                    <option value="44">44</option>
                    <option value="48">48</option>
                  </select>
                  <select v-model="currentFieldConfig.fontWeight" class="field-select-small" @change="updatePreview">
                    <option value="正常">{{ t('batchGenerator.modal.fontWeightNormal') }}</option>
                    <option value="加粗">{{ t('batchGenerator.modal.fontWeightBold') }}</option>
                  </select>
                  <select v-model="currentFieldConfig.align" class="field-select-small" @change="updatePreview">
                    <option value="左对齐">{{ t('batchGenerator.modal.alignLeft') }}</option>
                    <option value="居中">{{ t('batchGenerator.modal.alignCenter') }}</option>
                    <option value="右对齐">{{ t('batchGenerator.modal.alignRight') }}</option>
                  </select>
                  <input 
                    type="color" 
                    v-model="currentFieldConfig.color" 
                    class="field-color-picker"
                    @change="updatePreview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="style-config">
        <div class="config-left">
          <!-- 背景设置 -->
          <div class="config-group">
            <h4>背景设置</h4>
            <div class="config-row">
              <div class="upload-box">
                <label>背景图</label>
                <div class="image-upload" @click="selectBackgroundImage">
                  <div v-if="!qrStyle.backgroundImage" class="upload-placeholder">
                    <span class="plus-icon">+</span>
                  </div>
                  <img v-else :src="qrStyle.backgroundImage" alt="背景图" />
                </div>
                <p class="upload-hint">建议尺寸 240×281</p>
                <button v-if="qrStyle.backgroundImage" class="delete-icon" @click.stop="removeBackgroundImage">
                  🗑️
                </button>
              </div>
              
              <div class="color-picker-group">
                <label>背景色</label>
                <input 
                  v-model="qrStyle.backgroundColor" 
                  type="color" 
                  class="color-input"
                  @change="updatePreview"
                />
              </div>
            </div>
          </div>

          <!-- 二维码设置 -->
          <div class="config-group">
            <h4>二维码设置</h4>
            
            <div class="config-row">
              <div class="upload-box">
                <label>Logo</label>
                <div class="image-upload small" @click="selectLogo">
                  <div v-if="!qrStyle.logo" class="upload-placeholder">
                    <span class="plus-icon">+</span>
                  </div>
                  <img v-else :src="qrStyle.logo" alt="Logo" />
                </div>
                <button v-if="qrStyle.logo" class="delete-icon" @click.stop="removeLogo">
                  🗑️
                </button>
              </div>
              
              <div class="form-group">
                <label>Logo尺寸</label>
                <select v-model="qrStyle.logoSize" @change="updatePreview">
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
            </div>

            <div class="config-row">
              <div class="form-group">
                <label>Logo边距</label>
                <input v-model.number="qrStyle.logoMargin" type="number" min="0" max="20" @input="updatePreview" />
              </div>
              
              <div class="form-group">
                <label>码边距</label>
                <input v-model.number="qrStyle.codeMargin" type="number" min="0" max="10" @input="updatePreview" />
              </div>
            </div>

            <div class="config-row">
              <div class="color-picker-group">
                <label>码颜色</label>
                <input v-model="qrStyle.codeColor" type="color" class="color-input" @change="updatePreview" />
              </div>
              
              <div class="color-picker-group">
                <label>码背景色</label>
                <input v-model="qrStyle.codeBgColor" type="color" class="color-input" @change="updatePreview" />
              </div>
            </div>


            <div class="config-row">
              <div class="form-group">
                <label>容错率</label>
                <select v-model="qrStyle.errorLevel" @change="updatePreview">
                  <option value="L">7%</option>
                  <option value="M">15%</option>
                  <option value="Q">25%</option>
                  <option value="H">30%</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="config-right">
          <div class="preview-area">
            <div class="style-info">
              <span>当前样式：</span>
              <strong>{{ qrStyle.name }}</strong>
              <button class="change-btn" @click="showStyleSelector = true">
                更换样式
              </button>
            </div>
            <div class="qr-preview">
              <canvas ref="previewCanvas"></canvas>
              <p v-if="!previewGenerated" class="preview-hint">
                样式预览
              </p>
            </div>
            
            <!-- 字段内容预览 -->
            <div v-if="previewGenerated && excelData && currentFieldConfig && currentFieldConfig.enabled" class="field-content-preview">
              <div 
                class="field-preview-item"
                :style="{
                  fontSize: currentFieldConfig.fontSize + 'px',
                  textAlign: currentFieldConfig.align === '居中' ? 'center' : currentFieldConfig.align === '右对齐' ? 'right' : 'left',
                  color: currentFieldConfig.color,
                  fontWeight: currentFieldConfig.fontWeight === '加粗' ? 'bold' : 'normal'
                }"
              >
                <template v-if="currentFieldConfig.name === '__empty__'">
                  {{ currentFieldConfig.displayName.replace(/\s*\[T\]$/, '') || '字段名' }}: 
                </template>
                <template v-else>
                  {{ currentFieldConfig.displayName || currentFieldConfig.name }}: 
                  <span class="empty-field-icon">[T]</span>
                  {{ currentFieldConfig.displayName || currentFieldConfig.name }}
                </template>
              </div>
            </div>
          </div>
          
          <button class="generate-btn" @click="generateBatchQR">
            生成二维码
          </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

    <!-- 模板选择器弹窗 -->
    <div v-if="showTemplateSelector" class="modal" @click="showTemplateSelector = false">
      <div class="modal-content" @click.stop>
        <h3>选择模板</h3>
        <div class="template-list">
          <div 
            v-for="template in templates" 
            :key="template.id"
            :class="['template-item', { active: selectedTemplate.id === template.id }]"
            :title="template.title || template.name"
            :draggable="true"
            @click="selectTemplate(template)"
          >
            <div class="template-preview">{{ template.icon }}</div>
            <p>{{ template.name }}</p>
          </div>
        </div>
        <button class="close-btn" @click="showTemplateSelector = false">关闭</button>
      </div>
    </div>

    <!-- 样式选择器弹窗 -->
    <div v-if="showStyleSelector" class="modal" @click="showStyleSelector = false">
      <div class="modal-content" @click.stop>
        <h3>选择样式</h3>
        <div class="style-list">
          <div 
            v-for="style in stylePresets" 
            :key="style.id"
            :class="['style-item', { active: qrStyle.name === style.name }]"
            @click="applyStylePreset(style)"
          >
            <div class="style-preview" :style="{ background: style.backgroundColor }">
              <div class="qr-demo" :style="{ background: style.codeColor }"></div>
            </div>
            <p>{{ style.name }}</p>
          </div>
        </div>
        <button class="close-btn" @click="showStyleSelector = false">关闭</button>
      </div>
    </div>

    <!-- 模板预览弹窗 -->
    <div v-if="showPreviewModal" class="modal" @click="showPreviewModal = false">
      <div class="modal-content preview-modal" @click.stop>
        <div class="preview-header">
          <h3>预览</h3>
          <button class="close-icon" @click="showPreviewModal = false">✕</button>
        </div>
        
        <div class="preview-warning">
          <span>⚠️</span>
          <span>当前页面数据尚未保存,扫码仅供样式参考!</span>
        </div>

        <div class="preview-body">
          <div class="template-preview-content">
            <!-- 数据表格模板 -->
            <div v-if="selectedTemplate.id === 'data-table' || selectedTemplate.id === 'info-list'" class="data-table-template">
              <table class="spec-table">
                <tbody>
                  <tr>
                    <td class="spec-label">认证型号</td>
                    <td class="spec-value">MRA-561</td>
                  </tr>
                  <tr>
                    <td class="spec-label">名称</td>
                    <td class="spec-value">荣耀MagicBook Art 14</td>
                  </tr>
                  <tr>
                    <td class="spec-label">类别</td>
                    <td class="spec-value">笔记本电脑</td>
                  </tr>
                  <tr>
                    <td class="spec-label">操作系统</td>
                    <td class="spec-value">Windows 11 家庭中文版</td>
                  </tr>
                  <tr>
                    <td class="spec-label">CPU型号</td>
                    <td class="spec-value">第1代英特尔® 酷睿™ Ultra 5 处理器 125H</td>
                  </tr>
                  <tr>
                    <td class="spec-label">屏幕尺寸</td>
                    <td class="spec-value">14.6英寸</td>
                  </tr>
                  <tr>
                    <td class="spec-label">内存容量</td>
                    <td class="spec-value">16GB LPDDR5X 7467MHz</td>
                  </tr>
                  <tr>
                    <td class="spec-label">显卡</td>
                    <td class="spec-value">Intel® Arc™ graphics 2.2 GHz</td>
                  </tr>
                  <tr>
                    <td class="spec-label">硬盘</td>
                    <td class="spec-value">1TB SSD</td>
                  </tr>
                  <tr>
                    <td class="spec-label">机身重量</td>
                    <td class="spec-value">约1.03kg</td>
                  </tr>
                  <tr>
                    <td class="spec-label">价格</td>
                    <td class="spec-value">7799.00</td>
                  </tr>
                  <tr>
                    <td class="spec-label">上市时间</td>
                    <td class="spec-value">2024年7月</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 其他模板可以在这里添加 -->
            <div v-else class="template-placeholder">
              <p>{{ selectedTemplate.name }} 预览</p>
              <p class="hint-text">此模板的预览内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStaticRowSelector" class="modal" @click="showStaticRowSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header-with-action">
          <h3>选择生成静态码的数据行</h3>
          <label class="select-all-label">
            <input 
              type="checkbox" 
              :checked="isAllRowsSelected" 
              @change="toggleSelectAllRows"
            />
            <span>全选</span>
          </label>
        </div>
        <div class="row-selector-list">
          <label
            v-for="(row, idx) in excelData?.data || []"
            :key="idx"
            class="row-selector-item"
            :class="{ selected: selectedStaticRowIndices.includes(idx) }"
          >
            <input type="checkbox" :value="idx" v-model="selectedStaticRowIndices" />
            <div class="row-selector-text">
              <div class="row-selector-title">第 {{ idx + 1 }} 行</div>
              <div class="row-selector-preview">{{ getRowPreviewText(row, idx) }}</div>
            </div>
          </label>
        </div>
        <div class="row-selector-actions">
          <div class="selection-info">已选择 {{ selectedStaticRowIndices.length }} 行</div>
          <button class="close-btn" @click="showStaticRowSelector = false">取消</button>
          <button 
            class="close-btn primary" 
            :disabled="selectedStaticRowIndices.length === 0"
            @click="confirmStaticRowSelection"
          >
            确定 ({{ selectedStaticRowIndices.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
const { t } = useI18n()

// 辅助函数：将十六进制颜色转换为RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// 查找二维码的三个 finder pattern 中心位置（基于固定结构）
const findFinderPatterns = (data, size, bgColor) => {
  const patterns = []
  
  // 二维码的 finder pattern 位置是固定的，在三个角
  // 由于有 margin，实际位置需要从边缘计算
  // 通常 finder pattern 距离边缘约 margin 个模块的距离
  // 我们通过检测边缘附近的黑色像素来找到 finder pattern
  
  const margin = size * 0.05 // 大约 margin 区域
  const finderSize = size * 0.2 // finder pattern 大约占 20% 的尺寸
  
  // 左上角 finder pattern 中心（大约在 margin + finderSize/2 位置）
  const topLeft = {
    x: margin + finderSize / 2,
    y: margin + finderSize / 2
  }
  
  // 右上角 finder pattern 中心
  const topRight = {
    x: size - margin - finderSize / 2,
    y: margin + finderSize / 2
  }
  
  // 左下角 finder pattern 中心
  const bottomLeft = {
    x: margin + finderSize / 2,
    y: size - margin - finderSize / 2
  }
  
  patterns.push(topLeft, topRight, bottomLeft)
  
  return patterns
}

// 获取所有可用的IP地址和端口
const getAllNetworkAddresses = async () => {
  const addresses = []
  const port = window.location.port || '5173'
  
  // 1. 添加当前访问的地址
  const currentHost = window.location.hostname
  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    addresses.push(`http://${currentHost}:${port}`)
  }
  
  // 2. 添加localhost地址
  addresses.push(`http://localhost:${port}`)
  addresses.push(`http://127.0.0.1:${port}`)
  
  // 3. 尝试通过WebRTC获取本地IP地址
  try {
    const localIPs = await getLocalIPs()
    localIPs.forEach(ip => {
      if (ip && ip !== '127.0.0.1' && !addresses.some(addr => addr.includes(ip))) {
        addresses.push(`http://${ip}:${port}`)
      }
    })
  } catch (error) {
    console.warn('获取本地IP地址失败:', error)
  }
  
  // 4. 从URL参数中读取可能的IP地址（如果开发服务器提供了）
  const urlParams = new URLSearchParams(window.location.search)
  const serverIP = urlParams.get('serverIP')
  if (serverIP && !addresses.some(addr => addr.includes(serverIP))) {
    addresses.push(`http://${serverIP}:${port}`)
  }
  
  // 去重并返回
  return [...new Set(addresses)]
}

// 通过WebRTC获取本地IP地址
const getLocalIPs = () => {
  return new Promise((resolve) => {
    const ips = []
    const RTCPeerConnection = window.RTCPeerConnection || 
                             window.mozRTCPeerConnection || 
                             window.webkitRTCPeerConnection
    
    if (!RTCPeerConnection) {
      resolve([])
      return
    }
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    
    pc.createDataChannel('')
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate
        const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/)
        if (match) {
          const ip = match[1]
          // 只添加私有IP地址（192.168.x.x, 10.x.x.x, 172.16-31.x.x）
          if (isPrivateIP(ip) && !ips.includes(ip)) {
            ips.push(ip)
          }
        }
      }
    }
    
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => resolve([]))
    
    // 超时后返回已收集的IP
    setTimeout(() => {
      pc.close()
      resolve(ips)
    }, 2000)
  })
}

// 检查是否为私有IP地址
const isPrivateIP = (ip) => {
  const parts = ip.split('.').map(Number)
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 169 && parts[1] === 254) // 链路本地地址
  )
}

const emit = defineEmits(['batch-generated', 'show-folder-list'])

// 显示文件夹列表
const showFolderList = () => {
  emit('show-folder-list')
}

// 批量类型
const batchType = ref('dynamic')

// Excel数据
const excelData = ref(null)
const selectedQRColumn = ref('') // 选择用于生成二维码的列
const displayColumns = ref([]) // 选择显示在二维码下方的列
const currentFieldConfig = ref(null) // 当前字段配置（只有一个）

// 模板
const selectedTemplate = ref({
  id: 'data-table',
  name: '数据表格模板',
  icon: '📋'
})

const templates = ref([
  { id: 'data-table', name: '数据表格模板', icon: '📋' },
  { id: 'info-list', name: '信息列表模板', icon: '📋' }
])

// 样式配置
const qrStyle = ref({
  name: '基本样式',
  backgroundImage: null,
  backgroundColor: '#ffffff',
  logo: null,
  logoSize: 'medium',
  logoMargin: 0,
  codeMargin: 2,
  codeColor: '#000000',
  codeBgColor: '#ffffff',
  errorLevel: 'H'
})

const stylePresets = ref([
  {
    id: 'basic',
    name: '基本样式',
    backgroundColor: '#ffffff',
    codeColor: '#000000',
    codeBgColor: '#ffffff'
  },
  {
    id: 'blue',
    name: '商务蓝',
    backgroundColor: '#e3f2fd',
    codeColor: '#1976d2',
    codeBgColor: '#ffffff'
  },
  {
    id: 'green',
    name: '清新绿',
    backgroundColor: '#e8f5e9',
    codeColor: '#388e3c',
    codeBgColor: '#ffffff'
  },
  {
    id: 'purple',
    name: '优雅紫',
    backgroundColor: '#f3e5f5',
    codeColor: '#7b1fa2',
    codeBgColor: '#ffffff'
  }
])

const showTemplateSelector = ref(false)
const showStyleSelector = ref(false)
const showPreviewModal = ref(false)
const showSettings = ref(false)
const previewCanvas = ref(null)
const previewGenerated = ref(false)
const showStaticRowSelector = ref(false)
const selectedStaticRowIndices = ref([])

// 全选逻辑
const isAllRowsSelected = computed(() => {
  const total = excelData.value?.data?.length || 0
  return total > 0 && selectedStaticRowIndices.value.length === total
})

const toggleSelectAllRows = (e) => {
  if (e.target.checked) {
    const total = excelData.value?.data?.length || 0
    selectedStaticRowIndices.value = Array.from({ length: total }, (_, i) => i)
  } else {
    selectedStaticRowIndices.value = []
  }
}

// 打开设置
const openSettings = () => {
  showSettings.value = true
  // 确保canvas在DOM更新后绘制
  setTimeout(() => {
    generatePreview()
  }, 100)
}

// 关闭设置
const closeSettings = () => {
  showSettings.value = false
}

const getRowPreviewText = (row, idx) => {
  if (!row || typeof row !== 'object') return `数据行${idx + 1}`
  if (selectedQRColumn.value && row[selectedQRColumn.value] !== undefined && row[selectedQRColumn.value] !== null) {
    const value = String(row[selectedQRColumn.value]).trim()
    if (value) return `${selectedQRColumn.value}: ${value}`
  }
  const pairs = Object.entries(row)
    .map(([k, v]) => [k, v !== null && v !== undefined ? String(v).trim() : ''])
    .filter(([, v]) => v !== '')

  if (pairs.length === 0) return `数据行${idx + 1}`

  const previewPairs = pairs.slice(0, 2).map(([k, v]) => `${k}: ${v}`)
  return previewPairs.join(' | ')
}

const formatColumnOption = (text) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  if (value.length <= 24) return value
  return value.slice(0, 24) + '…'
}

const toSafeFileNameBase = (text) => {
  const value = String(text || '').trim().slice(0, 40)
  const safe = value.replace(/[<>:"/\\|?*]/g, '_').trim()
  return safe || 'qrcode'
}

const downloadBlobAsFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const generateStaticQRForRow = async (rowIndex) => {
  const totalRows = excelData.value?.data?.length || 0
  if (totalRows === 0) {
    alert(t('batchGeneratorExtra.excelNoDataRows'))
    return
  }
  const idx = Math.min(Math.max(0, rowIndex || 0), totalRows - 1)
  const rowData = excelData.value.data[idx] || {}
  const qrContentRaw = selectedQRColumn.value ? rowData[selectedQRColumn.value] : ''
  const qrContent = (qrContentRaw !== undefined && qrContentRaw !== null) ? String(qrContentRaw).trim() : ''
  const qrContentToEncode = qrContent || `数据行${idx + 1}`

  const fileBase = toSafeFileNameBase(qrContentToEncode)
  const fileName = `${fileBase}_${idx + 1}.png`
  const qrResult = await generateSingleQR(qrContentToEncode, fileName)
  downloadBlobAsFile(qrResult.blob, qrResult.fileName)
}

const confirmStaticRowSelection = async () => {
  const indices = [...selectedStaticRowIndices.value].sort((a, b) => a - b)
  showStaticRowSelector.value = false
  
  if (indices.length === 0) return

  try {
    if (indices.length === 1) {
      await generateStaticQRForRow(indices[0])
      return
    }
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const idx of indices) {
      const totalRows = excelData.value?.data?.length || 0
      if (idx < 0 || idx >= totalRows) continue
      const rowData = excelData.value.data[idx] || {}
      const qrContentRaw = selectedQRColumn.value ? rowData[selectedQRColumn.value] : ''
      const qrContent = (qrContentRaw !== undefined && qrContentRaw !== null) ? String(qrContentRaw).trim() : ''
      const qrContentToEncode = qrContent || `数据行${idx + 1}`
      const fileBase = toSafeFileNameBase(qrContentToEncode)
      const fileName = `${fileBase}_${idx + 1}.png`
      const qrResult = await generateSingleQR(qrContentToEncode, fileName)
      zip.file(qrResult.fileName, qrResult.blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipFileName = `静态码_${Date.now()}_${indices.length}个.zip`
    downloadBlobAsFile(zipBlob, zipFileName)
  } catch (error) {
    alert(t('batchGeneratorExtra.generateFailed', { msg: error.message }))
  }
}

// 选择Excel文件
const selectExcel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls,.csv'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      parseExcel(file)
    }
  }
  input.click()
}

// 解析Excel（使用xlsx库）
const parseExcel = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 读取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // 将工作表转换为JSON格式（第一行作为表头）
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // 使用数组格式，第一行是表头
        defval: '', // 空单元格的默认值
        raw: false // 转换为字符串
      })
      
      if (jsonData.length === 0) {
        alert(t('batchGeneratorExtra.excelEmpty'))
        return
      }
      
      // 第一行是原始列名（保留空列以维持索引对应）
      const rawColumns = jsonData[0].map(col => String(col || '').trim())
      // 过滤出有效的列名用于 UI 显示
      const columns = rawColumns.filter(col => col)
      
      if (columns.length === 0) {
        alert(t('batchGeneratorExtra.excelNoValidColumns'))
        return
      }
      
      // 从第二行开始是数据
      const rows = jsonData.slice(1)
      
      // 转换为对象数组，每个对象以列名为键
      const dataArray = rows.map((row) => {
        const rowObj = {}
        rawColumns.forEach((col, originalIndex) => {
          if (!col) return // 跳过无列名的列
          
          const cellValue = row[originalIndex]
          // 处理空值和不同类型的数据
          if (cellValue === null || cellValue === undefined) {
            rowObj[col] = ''
          } else if (typeof cellValue === 'object' && cellValue.t) {
            rowObj[col] = XLSX.utils.format_cell(cellValue) || ''
          } else {
            rowObj[col] = String(cellValue || '').trim()
          }
        })
        return rowObj
      }).filter(row => {
        // 过滤掉完全空白的行（所有字段都为空）
        return Object.values(row).some(val => val && String(val).trim())
      })
      
      excelData.value = {
        fileName: file.name,
        rows: dataArray.length,
        columns: columns,
        data: dataArray // 存储所有行的数据
      }
      
      // 初始化字段配置
      initializeFieldConfigs(columns)
      
      console.log('Excel解析成功:', {
        fileName: file.name,
        columns: columns,
        rows: dataArray.length,
        sampleData: dataArray.slice(0, 3) // 显示前3行数据作为示例
      })
      
      alert(t('batchGeneratorExtra.excelUploaded', { fileName: file.name, rows: excelData.value.rows, columns: columns.join('、') }))
    } catch (error) {
      console.error('Excel解析失败:', error)
      alert(t('batchGeneratorExtra.excelParseFailed', { msg: error.message }))
    }
  }
  
  reader.onerror = (error) => {
    console.error('文件读取失败:', error)
    alert(t('batchGeneratorExtra.fileReadFailed'))
  }
  
  reader.readAsArrayBuffer(file)
}

// 初始化字段配置
const initializeFieldConfigs = (columns) => {
  // 默认第一个字段用于生成二维码
  if (columns.length > 0) {
    selectedQRColumn.value = columns[0]
    // 只创建一个字段配置
    currentFieldConfig.value = {
      name: columns[0],
      enabled: true, // 是否启用
      displayName: columns[0], // 显示名称
      fontSize: 14, // 字体大小
      align: '居中', // 对齐方式：左对齐、居中、右对齐
      color: '#000000', // 文字颜色
      fontWeight: '正常' // 字重：正常、加粗
    }
  }
}

// 监听selectedQRColumn变化，更新字段配置（仅当不是"无内容"时）
watch(selectedQRColumn, (newColumn) => {
  // 如果当前配置是"无内容"，不更新
  if (currentFieldConfig.value?.name === '__empty__') {
    return
  }
  if (newColumn && excelData.value && newColumn !== '__empty__') {
    currentFieldConfig.value = {
      name: newColumn,
      enabled: true,
      displayName: newColumn.replace(/\s*\[T\]$/, ''), // 移除可能存在的图标后缀
      fontSize: currentFieldConfig.value?.fontSize || 14,
      align: currentFieldConfig.value?.align || '居中',
      color: currentFieldConfig.value?.color || '#000000',
      fontWeight: currentFieldConfig.value?.fontWeight || '正常'
    }
    updatePreview() // 更新预览
  }
})

// 处理字段名称变化（select 下拉框变化时）
const handleFieldNameChange = () => {
  const fieldName = currentFieldConfig.value.name
  if (fieldName === '__empty__') {
    const displayName = currentFieldConfig.value.displayName || ''
    currentFieldConfig.value.displayName = displayName.replace(/\s*\[T\]$/, '')
    currentFieldConfig.value.enabled = false
  } else {
    if (!currentFieldConfig.value.displayName || currentFieldConfig.value.displayName.replace(/\s*\[T\]$/, '') === '') {
      currentFieldConfig.value.displayName = fieldName
    } else {
      currentFieldConfig.value.displayName = currentFieldConfig.value.displayName.replace(/\s*\[T\]$/, '')
    }
    selectedQRColumn.value = fieldName
    currentFieldConfig.value.enabled = true
  }
  updatePreview()
}

// 移除Excel
const removeExcel = () => {
  excelData.value = null
  currentFieldConfig.value = null
  selectedQRColumn.value = ''
  displayColumns.value = []
  showStaticRowSelector.value = false
  selectedStaticRowIndices.value = []
}

// 更新预览（实时）
const updatePreview = () => {
  generatePreview()
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
        qrStyle.value.backgroundImage = event.target.result
        updatePreview() // 实时更新预览
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除背景图
const removeBackgroundImage = () => {
  qrStyle.value.backgroundImage = null
  updatePreview() // 实时更新预览
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
        qrStyle.value.logo = event.target.result
        updatePreview() // 实时更新预览
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除Logo
const removeLogo = () => {
  qrStyle.value.logo = null
  updatePreview() // 实时更新预览
}

// 选择模板
const selectTemplate = (template) => {
  selectedTemplate.value = template
  showTemplateSelector.value = false
}

// 应用样式预设
const applyStylePreset = (style) => {
  qrStyle.value = {
    ...qrStyle.value,
    name: style.name,
    backgroundColor: style.backgroundColor,
    codeColor: style.codeColor,
    codeBgColor: style.codeBgColor
  }
  showStyleSelector.value = false
  updatePreview()
}

// 预览模板
const previewTemplate = () => {
  showPreviewModal.value = true
}

// 生成预览
const generatePreview = async () => {
  if (!previewCanvas.value) return
  
  try {
    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    const previewSize = 300
    
    // 设置canvas尺寸
    canvas.width = previewSize
    canvas.height = previewSize
    
    // 清空canvas
    ctx.clearRect(0, 0, previewSize, previewSize)
    
    // 绘制背景色
    ctx.fillStyle = qrStyle.value.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, previewSize, previewSize)
    
    // 绘制背景图
    if (qrStyle.value.backgroundImage) {
      const bgImg = new Image()
      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          // 绘制背景图（覆盖整个canvas）
          ctx.drawImage(bgImg, 0, 0, previewSize, previewSize)
          resolve()
        }
        bgImg.onerror = reject
        bgImg.src = qrStyle.value.backgroundImage
      })
    }
    
    // 生成二维码到临时canvas（背景透明）
    const qrCanvas = document.createElement('canvas')
    const hasText = currentFieldConfig.value && currentFieldConfig.value.enabled
    const qrSize = hasText ? previewSize - 100 : previewSize - 40 // 如果有文字，缩小二维码
    qrCanvas.width = qrSize
    qrCanvas.height = qrSize
    
    // 先生成二维码（使用配置的背景色）
    await QRCode.toCanvas(qrCanvas, '预览示例内容', {
      width: qrSize,
      margin: qrStyle.value.codeMargin || 2,
      errorCorrectionLevel: qrStyle.value.errorLevel || 'H',
      color: {
        dark: qrStyle.value.codeColor || '#000000',
        light: qrStyle.value.codeBgColor || '#ffffff' // 使用配置的背景色
      }
    })
    
    // 应用外眼和内眼颜色，并处理背景色
    const qrCtx = qrCanvas.getContext('2d')
    const imageData = qrCtx.getImageData(0, 0, qrSize, qrSize)
    const data = imageData.data
    
    const bgColor = hexToRgb(qrStyle.value.codeBgColor || '#ffffff')
    const codeColor = hexToRgb(qrStyle.value.codeColor || '#000000')
    
    // 通过检测实际像素来找到 finder pattern 的位置
    const margin = qrStyle.value.codeMargin || 2
    const moduleCount = 21 + (qrStyle.value.errorLevel === 'L' ? 0 : qrStyle.value.errorLevel === 'M' ? 4 : qrStyle.value.errorLevel === 'Q' ? 6 : 8)
    const moduleSize = (qrSize - margin * 2) / moduleCount
    const finderModuleSize = 7 // finder pattern 是 7x7 模块
    const finderPixelSize = moduleSize * finderModuleSize
    
    // 计算三个 finder pattern 的精确位置
    // QRCode 库生成的二维码，finder pattern 从模块边界开始
    // 左上角：从 (margin, margin) 开始
    // 右上角：从 (qrSize - margin - finderPixelSize, margin) 开始
    // 左下角：从 (margin, qrSize - margin - finderPixelSize) 开始
    const finderPatterns = [
      { 
        startX: margin, 
        startY: margin, 
        moduleSize: moduleSize,
        pixelSize: finderPixelSize
      }, // 左上角
      { 
        startX: qrSize - margin - finderPixelSize, 
        startY: margin, 
        moduleSize: moduleSize,
        pixelSize: finderPixelSize
      }, // 右上角
      { 
        startX: margin, 
        startY: qrSize - margin - finderPixelSize, 
        moduleSize: moduleSize,
        pixelSize: finderPixelSize
      } // 左下角
    ]
    
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        const i = (y * qrSize + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // 检查是否在 finder pattern 区域
        let isOuterEye = false
        let isInnerEye = false
        
        for (const pattern of finderPatterns) {
          const relX = x - pattern.startX
          const relY = y - pattern.startY
          
          // 检查是否在 finder pattern 的 7x7 模块区域内
          if (relX >= 0 && relX < pattern.pixelSize && relY >= 0 && relY < pattern.pixelSize) {
            // 计算当前像素属于哪个模块（0-6）
            const moduleX = Math.floor(relX / pattern.moduleSize)
            const moduleY = Math.floor(relY / pattern.moduleSize)
            
              // 确保模块索引在有效范围内
              if (moduleX >= 0 && moduleX <= 6 && moduleY >= 0 && moduleY <= 6) {
                // QR码定位点标准结构（7x7模块）：
                // 层级0（最外层）: 索引0和6 - 7x7黑色边框
                // 层级1（白色层）: 索引1和5 - 5x5白色间隔  
                // 层级2（内层框）: 索引2和4 - 3x3黑色边框
                // 层级3（中心点）: 索引3 - 1x1黑色方块
                //
                // 根据效果图要求：
                // 码外眼: 仅最外层边框（索引0或6）
                // 码内眼: 仅中心3x3区域（索引2-4）
                
                // 判断是否在中心3x3区域
                if (moduleX >= 2 && moduleX <= 4 && moduleY >= 2 && moduleY <= 4) {
                  isInnerEye = true
                } 
                // 判断是否在最外层边框
                else if (moduleX === 0 || moduleX === 6 || moduleY === 0 || moduleY === 6) {
                  isOuterEye = true
                }
              }
            break
          }
        }
        
        // 判断是否是背景色（使用容差判断）
        const isBackground = Math.abs(r - bgColor.r) < 10 && Math.abs(g - bgColor.g) < 10 && Math.abs(b - bgColor.b) < 10
        
        if (isBackground) {
          // 背景色区域：保持背景色
        } else if (isInnerEye || isOuterEye) {
          // 内眼和外眼区域使用码颜色
          data[i] = codeColor.r
          data[i + 1] = codeColor.g
          data[i + 2] = codeColor.b
        } else {
          // 其他区域使用码颜色
          data[i] = codeColor.r
          data[i + 1] = codeColor.g
          data[i + 2] = codeColor.b
        }
      }
    }
    qrCtx.putImageData(imageData, 0, 0)
    
    // 在预览canvas上绘制二维码（居中），透明部分会显示背景
    const qrX = (previewSize - qrSize) / 2
    const qrY = hasText ? 20 : (previewSize - qrSize) / 2
    ctx.drawImage(qrCanvas, qrX, qrY)
    
    // 如果有Logo，绘制Logo
    if (qrStyle.value.logo) {
      const logoImg = new Image()
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoSizeMap = {
            small: qrSize * 0.15,
            medium: qrSize * 0.20,
            large: qrSize * 0.25
          }
          const logoSize = logoSizeMap[qrStyle.value.logoSize || 'medium']
          const logoMargin = qrStyle.value.logoMargin || 0
          const logoX = previewSize / 2 - logoSize / 2
          const logoY = qrY + qrSize / 2 - logoSize / 2
          
          // 绘制白色背景圆形（可选）
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(previewSize / 2, qrY + qrSize / 2, logoSize / 2 + logoMargin, 0, Math.PI * 2)
          ctx.fill()
          
          // 绘制Logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
          resolve()
        }
        logoImg.onerror = reject
        logoImg.src = qrStyle.value.logo
      })
    }

    // 如果有字段内容，绘制在二维码下方
    if (hasText) {
      const fontSize = Math.max(8, (currentFieldConfig.value.fontSize || 14) * (previewSize / 600)) // 缩放字体
      const lineHeight = fontSize + 4
      const textStartY = qrY + qrSize + 15
      
      ctx.fillStyle = currentFieldConfig.value.color || '#000000'
      ctx.font = `${currentFieldConfig.value.fontWeight === '加粗' ? 'bold ' : ''}${fontSize}px sans-serif`
      ctx.textAlign = currentFieldConfig.value.align === '居中' ? 'center' : 
                     currentFieldConfig.value.align === '右对齐' ? 'right' : 'left'
      ctx.textBaseline = 'top'
      
      const displayText = currentFieldConfig.value.displayName || '预览示例文字'
      const maxWidth = previewSize - 30
      const textX = currentFieldConfig.value.align === '居中' ? previewSize / 2 :
                   currentFieldConfig.value.align === '右对齐' ? previewSize - 15 : 15
      
      const words = displayText.split('')
      let line = ''
      let currentY = textStartY
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, textX, currentY)
          line = words[i]
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, textX, currentY)
    }
    
    previewGenerated.value = true
  } catch (error) {
    console.error('生成预览失败:', error)
  }
}

// 生成单个二维码（带背景图和Logo）
const generateSingleQR = async (content, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const size = 600 // 最终输出尺寸
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      // 绘制背景色
      ctx.fillStyle = qrStyle.value.backgroundColor || '#ffffff'
      ctx.fillRect(0, 0, size, size)
      
      // 绘制背景图
      if (qrStyle.value.backgroundImage) {
        const bgImg = new Image()
        await new Promise((resolve, reject) => {
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, size, size)
            resolve()
          }
          bgImg.onerror = reject
          bgImg.src = qrStyle.value.backgroundImage
        })
      }
      
      // 生成二维码（透明背景）
      const qrCanvas = document.createElement('canvas')
      // 如果启用了文字，缩小二维码尺寸并上移，为文字腾出空间
      const hasText = currentFieldConfig.value && currentFieldConfig.value.enabled
      const qrSize = hasText ? size - 160 : size - 40
      qrCanvas.width = qrSize
      qrCanvas.height = qrSize
      
      await QRCode.toCanvas(qrCanvas, content, {
        width: qrSize,
        margin: qrStyle.value.codeMargin || 2,
        errorCorrectionLevel: qrStyle.value.errorLevel || 'H',
        color: {
          dark: qrStyle.value.codeColor || '#000000',
          light: qrStyle.value.codeBgColor || '#FFFFFF' // 使用配置的背景色
        }
      })
      
      // 应用外眼和内眼颜色
      const qrCtx = qrCanvas.getContext('2d')
      const imageData = qrCtx.getImageData(0, 0, qrSize, qrSize)
      const data = imageData.data
      
      const bgColor = hexToRgb(qrStyle.value.codeBgColor || '#ffffff')
      const codeColor = hexToRgb(qrStyle.value.codeColor || '#000000')
      
      // 通过检测实际像素来找到 finder pattern 的位置
      const margin = qrStyle.value.codeMargin || 2
      const moduleCount = 21 + (qrStyle.value.errorLevel === 'L' ? 0 : qrStyle.value.errorLevel === 'M' ? 4 : qrStyle.value.errorLevel === 'Q' ? 6 : 8)
      const moduleSize = (qrSize - margin * 2) / moduleCount
      const finderModuleSize = 7 // finder pattern 是 7x7 模块
      const finderPixelSize = moduleSize * finderModuleSize
      
      // 计算三个 finder pattern 的精确位置
      // QRCode 库生成的二维码，finder pattern 从模块边界开始
      // 左上角：从 (margin, margin) 开始
      // 右上角：从 (qrSize - margin - finderPixelSize, margin) 开始
      // 左下角：从 (margin, qrSize - margin - finderPixelSize) 开始
      const finderPatterns = [
        { 
          startX: margin, 
          startY: margin, 
          moduleSize: moduleSize,
          pixelSize: finderPixelSize
        }, // 左上角
        { 
          startX: qrSize - margin - finderPixelSize, 
          startY: margin, 
          moduleSize: moduleSize,
          pixelSize: finderPixelSize
        }, // 右上角
        { 
          startX: margin, 
          startY: qrSize - margin - finderPixelSize, 
          moduleSize: moduleSize,
          pixelSize: finderPixelSize
        } // 左下角
      ]
      
      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          const i = (y * qrSize + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // 检查是否在 finder pattern 区域
          let isOuterEye = false
          let isInnerEye = false
          
          for (const pattern of finderPatterns) {
            const relX = x - pattern.startX
            const relY = y - pattern.startY
            
            // 检查是否在 finder pattern 的 7x7 模块区域内
            if (relX >= 0 && relX < pattern.pixelSize && relY >= 0 && relY < pattern.pixelSize) {
              // 计算当前像素属于哪个模块（0-6）
              const moduleX = Math.floor(relX / pattern.moduleSize)
              const moduleY = Math.floor(relY / pattern.moduleSize)
              
              // 确保模块索引在有效范围内
              if (moduleX >= 0 && moduleX <= 6 && moduleY >= 0 && moduleY <= 6) {
                // QR码定位点标准结构（7x7模块）：
                // 层级0（最外层）: 索引0和6 - 7x7黑色边框
                // 层级1（白色层）: 索引1和5 - 5x5白色间隔  
                // 层级2（内层框）: 索引2和4 - 3x3黑色边框
                // 层级3（中心点）: 索引3 - 1x1黑色方块
                //
                // 根据效果图要求：
                // 码外眼: 仅最外层边框（索引0或6）
                // 码内眼: 仅中心3x3区域（索引2-4）
                
                // 判断是否在中心3x3区域
                if (moduleX >= 2 && moduleX <= 4 && moduleY >= 2 && moduleY <= 4) {
                  isInnerEye = true
                } 
                // 判断是否在最外层边框
                else if (moduleX === 0 || moduleX === 6 || moduleY === 0 || moduleY === 6) {
                  isOuterEye = true
                }
              }
              break
            }
          }
          
          // 判断是否是背景色（使用容差判断）
          const isBackground = Math.abs(r - bgColor.r) < 10 && Math.abs(g - bgColor.g) < 10 && Math.abs(b - bgColor.b) < 10
          
          if (isBackground) {
            // 背景色区域：保持背景色
          } else if (isInnerEye || isOuterEye) {
            // 内眼和外眼区域使用码颜色
            data[i] = codeColor.r
            data[i + 1] = codeColor.g
            data[i + 2] = codeColor.b
          } else {
            // 其他区域使用码颜色
            data[i] = codeColor.r
            data[i + 1] = codeColor.g
            data[i + 2] = codeColor.b
          }
        }
      }
      qrCtx.putImageData(imageData, 0, 0)
      
      // 在canvas上绘制透明二维码
      const qrX = (size - qrSize) / 2
      const qrY = hasText ? 40 : (size - qrSize) / 2 // 如果有文字，二维码上移
      ctx.drawImage(qrCanvas, qrX, qrY)
      
      // 如果有Logo，绘制Logo
      if (qrStyle.value.logo) {
        const logoImg = new Image()
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            const logoSizeMap = {
              small: qrSize * 0.15,
              medium: qrSize * 0.20,
              large: qrSize * 0.25
            }
            const logoSize = logoSizeMap[qrStyle.value.logoSize || 'medium']
            const logoMargin = qrStyle.value.logoMargin || 0
            const logoX = size / 2 - logoSize / 2
            const logoY = qrY + qrSize / 2 - logoSize / 2 // 这里的中心点要相对于二维码位置
            
            // 绘制白色背景圆形
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(size / 2, qrY + qrSize / 2, logoSize / 2 + logoMargin, 0, Math.PI * 2)
            ctx.fill()
            
            // 绘制Logo
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            resolve()
          }
          logoImg.onerror = reject
          logoImg.src = qrStyle.value.logo
        })
      }
      
      // 如果有字段内容，绘制在二维码下方
      if (hasText) {
        const fontSize = currentFieldConfig.value.fontSize || 14
        const lineHeight = fontSize + 6
        const textStartY = qrY + qrSize + 30 // 二维码下方30px开始绘制文字
        
        ctx.fillStyle = currentFieldConfig.value.color || '#000000'
        ctx.font = `${currentFieldConfig.value.fontWeight === '加粗' ? 'bold ' : ''}${fontSize}px sans-serif`
        ctx.textAlign = currentFieldConfig.value.align === '居中' ? 'center' : 
                       currentFieldConfig.value.align === '右对齐' ? 'right' : 'left'
        ctx.textBaseline = 'top' // 改为顶部对齐，方便向下绘制
        
        // 批量生成时，文字内容优先使用单元格实际内容
        const displayText = content || currentFieldConfig.value.displayName
        const maxWidth = size - 60 // 增加左右边距
        const textX = currentFieldConfig.value.align === '居中' ? size / 2 :
                     currentFieldConfig.value.align === '右对齐' ? size - 30 : 30
        
        // 文本换行处理
        const words = displayText.split('')
        let line = ''
        let currentY = textStartY
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i]
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, textX, currentY)
            line = words[i]
            currentY += lineHeight
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, textX, currentY)
      }
      
      canvas.toBlob((blob) => {
        resolve({
          blob,
          fileName: fileName || `qrcode_${Date.now()}.png`
        })
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}

// 生成批量二维码
const generateBatchQR = async () => {
  if (!excelData.value) {
    alert(t('batchGeneratorExtra.uploadExcelFirst'))
    return
  }

  // 如果选择了"无内容"，允许继续（使用空值）
  if (!selectedQRColumn.value && currentFieldConfig.value?.name !== '__empty__') {
    alert(t('batchGeneratorExtra.selectColumnFirst'))
    return
  }

  // 如果是活码模式，先弹出创建文件夹对话框
  if (batchType.value === 'dynamic') {
    // 触发创建文件夹事件，传递批量数据
    emit('batch-generated', {
      type: batchType.value,
      template: selectedTemplate.value,
      style: qrStyle.value,
      data: excelData.value,
      selectedQRColumn: selectedQRColumn.value
    })
    return
  }

  const totalRows = excelData.value.data?.length || excelData.value.rows || 0

  if (totalRows === 0) {
    alert(t('batchGeneratorExtra.excelNoDataRows'))
    return
  }

  if (totalRows > 1) {
    selectedStaticRowIndices.value = [] // 清空之前的选择
    showStaticRowSelector.value = true
    return
  }

  try {
    await generateStaticQRForRow(0)
    emit('batch-generated', {
      type: batchType.value,
      template: selectedTemplate.value,
      style: qrStyle.value,
      data: excelData.value
    })
  } catch (error) {
    console.error('生成失败:', error)
    alert(t('batchGeneratorExtra.generateFailed', { msg: error.message }))
  }
}

// 防抖函数
let previewTimer = null
const debounceUpdatePreview = () => {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }
  previewTimer = setTimeout(() => {
    updatePreview()
  }, 300) // 300ms防抖
}

// 监听样式变化，自动更新预览
watch(() => qrStyle.value.backgroundColor, debounceUpdatePreview)
watch(() => qrStyle.value.codeColor, debounceUpdatePreview)
watch(() => qrStyle.value.codeBgColor, debounceUpdatePreview)
watch(() => qrStyle.value.codeMargin, debounceUpdatePreview)
watch(() => qrStyle.value.errorLevel, debounceUpdatePreview)
watch(() => qrStyle.value.logoSize, debounceUpdatePreview)
watch(() => qrStyle.value.logoMargin, debounceUpdatePreview)
watch(() => qrStyle.value.backgroundImage, () => {
  updatePreview() // 背景图变化立即更新
})
watch(() => qrStyle.value.logo, () => {
  updatePreview() // Logo变化立即更新
})

// 监听字段配置变化
watch(() => currentFieldConfig.value?.fontSize, debounceUpdatePreview)
watch(() => currentFieldConfig.value?.fontWeight, debounceUpdatePreview)
watch(() => currentFieldConfig.value?.align, debounceUpdatePreview)
watch(() => currentFieldConfig.value?.color, debounceUpdatePreview)
watch(() => currentFieldConfig.value?.displayName, debounceUpdatePreview)

onMounted(() => {
  generatePreview()
})
</script>

<style scoped>
.batch-qr-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-entry {
  display: flex;
  justify-content: flex-end;
}

.settings-trigger-btn {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 15px 30px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.settings-trigger-btn:hover {
  background: #f5f9ff;
  border-color: #2196F3;
  color: #2196F3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}

.settings-modal-content {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.settings-modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 10;
}

.settings-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
}

.close-btn-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.3s;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn-icon:hover {
  color: #333;
  background: #f5f5f5;
}

.settings-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f5f5f5;
}

.inner-section {
  box-shadow: none !important;
  border: 1px solid #e0e0e0;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

/* 标签页 */
.tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab:hover {
  border-color: #2196F3;
}

.tab.active {
  border-color: #2196F3;
  background: #2196F3;
  color: white;
}

.live-code-btn {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.live-code-btn:hover {
  background: #45a049;
  border-color: #45a049;
}

@media (max-width: 900px) {
  .tabs {
    grid-template-columns: 1fr;
  }
}

.section-content {
  position: relative;
}

.description {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.6;
}

/* 上传部分 */
.upload-section {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.upload-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
}

.file-uploaded {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #e8f5e9;
  border-radius: 8px;
}

.success-icon {
  font-size: 1.3rem;
}

.data-count {
  color: #4caf50;
  font-weight: 500;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.excel-icon {
  position: absolute;
  right: 20px;
  font-size: 4rem;
  opacity: 0.1;
}

/* 模板部分 */
.template-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding-right: 80px;
}

.template-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-template {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
}

.current-template strong {
  font-weight: 600;
  color: #333;
}

.change-btn {
  padding: 0;
  background: transparent;
  border: none;
  color: #17a2b8;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s;
}

.change-btn:hover {
  color: #138496;
  text-decoration: underline;
}

.preview-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.preview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
}

.template-icon {
  position: absolute;
  right: 20px;
  font-size: 4rem;
  opacity: 0.15;
  top: 50%;
  transform: translateY(-50%);
}

/* 样式配置 */
.style-header-wrapper {
  margin-bottom: 24px;
}

.field-settings-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.blue-heading {
  color: #2196F3;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.no-data {
  color: #999;
  font-size: 0.9rem;
}

.field-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
}

.field-select:focus {
  outline: none;
  border-color: #2196F3;
}

.display-fields {
  margin-top: 8px;
}

.display-fields label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #666;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.field-checkbox:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.field-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.field-checkbox input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 字段配置列表 */
.field-config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-config-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.field-config-header {
  margin-bottom: 12px;
}

.field-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.field-checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.field-name {
  color: #333;
  font-size: 0.95rem;
}

.field-config-options {
  width: 100%;
}

.config-option-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 80px 100px 100px 50px;
  gap: 8px;
  align-items: center;
}

.field-display-input {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
}

.field-display-input:focus {
  outline: none;
  border-color: #2196F3;
}

.field-select-small {
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
  cursor: pointer;
}

.field-select-small:focus {
  outline: none;
  border-color: #2196F3;
}

.empty-field-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #999;
  border-radius: 2px;
  background: #fff;
  color: #333;
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
  vertical-align: middle;
}

.field-color-picker {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.field-color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.field-color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.qr-column-selector {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.qr-column-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.current-style-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.style-config {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.config-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-group {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.config-group h4 {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 16px;
}

.config-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.config-row:last-child {
  margin-bottom: 0;
}

.upload-box {
  position: relative;
}

.upload-box label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.image-upload {
  width: 100%;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  overflow: hidden;
}

.image-upload:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.image-upload.small {
  height: 80px;
}

.upload-placeholder {
  text-align: center;
}

.plus-icon {
  font-size: 3rem;
  color: #bbb;
}

.image-upload img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-hint {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.color-picker-group,
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-picker-group label,
.form-group label {
  font-size: 0.9rem;
  color: #666;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
}

/* 预览区域 */
.config-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-area {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
}

.style-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  color: #666;
}

.style-info strong {
  color: #333;
  font-weight: 600;
}

.style-info .change-btn {
  padding: 4px 12px;
  background: white;
  border: 1px solid #2196F3;
  color: #2196F3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.style-info .change-btn:hover {
  background: #2196F3;
  color: white;
}

.qr-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.qr-preview canvas {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.preview-hint {
  color: #999;
  text-align: center;
}

.field-content-preview {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.field-preview-item {
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.6;
}

.field-preview-item:last-child {
  margin-bottom: 0;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(33, 150, 243, 0.4);
}

.generate-btn:active {
  transform: translateY(0);
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 20px;
  text-align: center;
}

.template-list,
.style-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.template-list {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  justify-items: center;
}

@media (max-width: 768px) {
  .template-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .template-list {
    grid-template-columns: 1fr;
  }
}

.template-item,
.style-item {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.template-item:hover,
.style-item:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.template-item.active,
.style-item.active {
  border-color: #2196F3;
  background: #e3f2fd;
}

.template-preview {
  font-size: 3rem;
  margin-bottom: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.4;
}

.style-preview {
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.qr-demo {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: #757575;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.close-btn.primary {
  background: #2196F3;
}

.row-selector-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.modal-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header-with-action h3 {
  margin: 0;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  background: #f0f7ff;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #2196F3;
  transition: all 0.2s;
}

.select-all-label:hover {
  background: #e3f2fd;
}

.select-all-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.row-selector-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
}

.row-selector-item:hover {
  border-color: #2196F3;
  background: #f5f9ff;
}

.row-selector-item.selected {
  border-color: #2196F3;
  background: #f0f7ff;
}

.row-selector-item input {
  margin-top: 4px;
  width: 18px;
  height: 18px;
}

.row-selector-text {
  flex: 1;
  min-width: 0;
}

.row-selector-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.row-selector-preview {
  color: #666;
  font-size: 0.9rem;
  word-break: break-word;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row-selector-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.selection-info {
  font-size: 0.9rem;
  color: #666;
  margin-right: auto;
}

.row-selector-actions .close-btn {
  width: auto;
  flex: 1;
}

/* 预览弹窗 */
.preview-modal {
  max-width: 800px;
  width: 95%;
  padding: 0;
  max-height: 90vh;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-icon:hover {
  background: #f5f5f5;
  color: #333;
}

.preview-warning {
  background: #fff3cd;
  color: #856404;
  padding: 12px 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 1px solid #ffeaa7;
}

.preview-warning span:first-child {
  font-size: 1.2rem;
}

.preview-body {
  padding: 30px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.template-preview-content {
  background: white;
}

/* 数据表格模板 */
.data-table-template {
  width: 100%;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.spec-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
}

.spec-table tbody tr:last-child {
  border-bottom: none;
}

.spec-label {
  padding: 12px 16px;
  background: #f8f9fa;
  color: #666;
  font-weight: 500;
  width: 150px;
  vertical-align: top;
}

.spec-value {
  padding: 12px 16px;
  color: #333;
  vertical-align: top;
}

.template-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.template-placeholder .hint-text {
  font-size: 0.9rem;
  margin-top: 12px;
}

/* 图片组合模板样式 */
.image-grid-template {
  width: 100%;
  padding: 20px;
}

.image-grid-2,
.image-grid-3 {
  display: grid;
  gap: 16px;
  width: 100%;
}

.image-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.image-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.image-item {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  background: #f5f5f5;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .image-grid-2,
  .image-grid-3 {
    grid-template-columns: 1fr;
  }
  
  .image-placeholder {
    font-size: 0.9rem;
  }
}

@media (max-width: 1024px) {
  .style-config {
    grid-template-columns: 1fr;
  }
  
  .config-row {
    grid-template-columns: 1fr;
  }

  .config-option-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .preview-modal {
    width: 98%;
    max-height: 95vh;
  }

  .preview-header,
  .preview-warning {
    padding: 12px 20px;
  }

  .preview-body {
    padding: 20px;
  }

  .spec-label {
    width: 120px;
    font-size: 0.85rem;
  }

  .spec-value {
    font-size: 0.85rem;
  }
}
</style>
