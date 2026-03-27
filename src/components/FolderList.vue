<template>
  <div class="folder-list">
    <div class="folder-top-bar">
      <button class="create-btn-top" @click="showCreateOptions = true">{{ t('folderList.createBtn') }}</button>
      <button class="icon-btn" @click="handleClose">✕</button>
    </div>

    <div class="folder-table-container">
      <table class="folder-table">
        <thead>
          <tr>
            <th>{{ t('folderList.qrInfo') }}</th>
            <th>{{ t('folderList.qrCount') }}</th>
            <th>{{ t('folderList.modifyTime') }}</th>
            <th>{{ t('folderList.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="folderList.length === 0" class="empty-row">
            <td colspan="4" style="text-align: center; padding: 40px; color: #999;">
              {{ t('folderList.emptyHint') }}
            </td>
          </tr>
          <tr 
            v-for="folder in folderList" 
            :key="folder.id"
            @click="openFolder(folder)"
            class="folder-row"
          >
            <td>
              <div class="folder-info">
                <span class="folder-icon">📁</span>
                <span class="folder-name">{{ folder.name }}</span>
              </div>
            </td>
            <td>{{ folder.qrCount || 0 }}</td>
            <td>{{ formatTime(folder.updateTime) }}</td>
            <td>
              <div class="folder-actions" @click.stop>
                <button class="action-btn" @click="editFolder(folder)">{{ t('folderList.edit') }}</button>
                <button class="action-btn" @click="openFolder(folder)">{{ t('folderList.manage') }}</button>
                <button class="action-btn danger" @click="deleteFolder(folder)">{{ t('folderList.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateOptions" class="create-options-overlay" @click.self="closeCreateOptions">
      <div class="create-options-dialog">
        <div class="create-option-card" @click="handleSingleCode">
          <div class="option-icon">
            <span class="plus-icon">+</span>
          </div>
          <div class="option-text">{{ t('folderList.optionSingleCode') }}</div>
        </div>

        <div class="create-option-card" @click="handleBlankQR">
          <div class="option-icon">
            <span class="plus-icon">+</span>
          </div>
          <div class="option-text">{{ t('folderList.optionBlankQR') }}</div>
        </div>

        <div class="create-option-card" @click="handleBatchExcel">
          <div class="option-icon">
            <div class="excel-icon">📊</div>
          </div>
          <div class="option-text">{{ t('folderList.optionBatchExcel') }}</div>
        </div>
      </div>
    </div>

    <div v-if="showCreateDialog" class="create-dialog-overlay" @click.self="closeCreateDialog">
      <div class="create-dialog">
        <div class="create-dialog-header">
          <h3>{{ t('folderList.createDialogTitle') }}</h3>
          <button class="close-btn" @click="closeCreateDialog">✕</button>
        </div>
        <div class="create-dialog-body">
          <div class="form-field">
            <label>{{ t('folderList.qrNameLabel') }}</label>
            <input 
              v-model="newFolderName" 
              type="text" 
              :placeholder="t('folderListExtra.enterQrName')"
              class="form-input"
              @keyup.enter="createFolder"
            />
          </div>
        </div>
        <div class="create-dialog-footer">
          <button class="cancel-btn" @click="closeCreateDialog">{{ t('toast.cancel') }}</button>
          <button class="save-btn" @click="createFolder">{{ t('folderList.saveAndGenerate') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="delete-dialog-overlay" @click.self="closeDeleteDialog">
      <div class="delete-dialog">
        <div class="delete-dialog-icon">⚠️</div>
        <div class="delete-dialog-title">{{ t('folderList.confirmDeleteTitle') }}</div>
        <div class="delete-dialog-message">
          <p>{{ t('folderList.confirmDeleteMessage', { name: folderToDelete?.name || '' }) }}</p>
          <p class="warning-text">{{ t('folderList.confirmDeleteWarning') }}</p>
        </div>
        <div class="delete-dialog-footer">
          <button class="delete-cancel-btn" @click="closeDeleteDialog">{{ t('toast.cancel') }}</button>
          <button class="delete-confirm-btn" @click="confirmDelete">{{ t('toast.ok') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '../i18n/datetime'
const { locale, t } = useI18n()

const emit = defineEmits(['open-folder', 'create-folder', 'close', 'single-code', 'blank-qr', 'batch-excel'])

const folderList = ref([])
const showCreateDialog = ref(false)
const showCreateOptions = ref(false)
const newFolderName = ref('')
const showDeleteDialog = ref(false)
const folderToDelete = ref(null)

// 从localStorage加载文件夹列表
onMounted(() => {
  loadFolders()
})

// 监听文件夹列表变化，自动重新加载（当从其他页面返回时）
watch(() => folderList.value.length, () => {
  // 当文件夹数量变化时，重新计算二维码数量
  folderList.value.forEach(folder => {
    const qrList = getQRListByFolder(folder.id)
    folder.qrCount = qrList.length
  })
  saveFolders()
})

const loadFolders = () => {
  const savedData = localStorage.getItem('dynamicQRFolders')
  if (savedData) {
    try {
      folderList.value = JSON.parse(savedData)
      // 计算每个文件夹的二维码数量
      folderList.value.forEach(folder => {
        const qrList = getQRListByFolder(folder.id)
        folder.qrCount = qrList.length
      })
      saveFolders()
    } catch (error) {
      console.error('加载文件夹列表失败:', error)
      folderList.value = []
    }
  } else {
    folderList.value = []
  }
  console.log('文件夹列表已加载:', folderList.value.length, '个文件夹')
}

const getQRListByFolder = (folderId) => {
  const savedData = localStorage.getItem('dynamicQRList')
  if (!savedData) return []
  const allQRList = JSON.parse(savedData)
  return allQRList.filter(qr => qr.folderId === folderId)
}

const saveFolders = () => {
  localStorage.setItem('dynamicQRFolders', JSON.stringify(folderList.value))
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return formatDateTime(timestamp, locale.value).replace(/\//g, '-')
}

// 打开文件夹
const openFolder = (folder) => {
  emit('open-folder', folder)
}

// 编辑文件夹
const editFolder = (folder) => {
  newFolderName.value = folder.name
  showCreateDialog.value = true
  // TODO: 实现编辑功能
}

// 删除文件夹
const deleteFolder = (folder) => {
  folderToDelete.value = folder
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = () => {
  if (!folderToDelete.value) return
  
  const folder = folderToDelete.value
  
  // 删除文件夹内的所有二维码
  const savedData = localStorage.getItem('dynamicQRList')
  if (savedData) {
    const allQRList = JSON.parse(savedData)
    const filteredList = allQRList.filter(qr => qr.folderId !== folder.id)
    localStorage.setItem('dynamicQRList', JSON.stringify(filteredList))
  }
  
  // 删除文件夹
  const index = folderList.value.findIndex(f => f.id === folder.id)
  if (index > -1) {
    folderList.value.splice(index, 1)
    saveFolders()
  }
  
  closeDeleteDialog()
}

// 关闭删除对话框
const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  folderToDelete.value = null
}

// 创建文件夹
const createFolder = () => {
  if (!newFolderName.value.trim()) {
    alert(t('folderListExtra.enterQrName'))
    return
  }
  
  const folder = {
    id: 'folder_' + Date.now(),
    name: newFolderName.value.trim(),
    createTime: Date.now(),
    updateTime: Date.now(),
    qrCount: 0
  }
  
  folderList.value.push(folder)
  saveFolders()
  
  emit('create-folder', folder)
  
  closeCreateDialog()
}

// 显示创建对话框（供外部调用，用于批量生码）
const showCreateDialogForBatch = () => {
  showCreateDialog.value = true
}

// 暴露方法
defineExpose({
  loadFolders,
  showCreateDialogForBatch
})

// 关闭创建对话框
const closeCreateDialog = () => {
  showCreateDialog.value = false
  newFolderName.value = ''
}

// 关闭创建选项对话框
const closeCreateOptions = () => {
  showCreateOptions.value = false
}

// 处理关闭（返回批量生成界面）
const handleClose = () => {
  emit('close')
}

// 处理单码选项
const handleSingleCode = () => {
  closeCreateOptions()
  emit('single-code')
}

// 处理空白二维码选项
const handleBlankQR = () => {
  closeCreateOptions()
  emit('blank-qr')
}

// 处理批量Excel选项
const handleBatchExcel = () => {
  closeCreateOptions()
  emit('batch-excel')
}

</script>

<style scoped>
.folder-list {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部深灰色条 */
.folder-top-bar {
  background: #333;
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
}

.folder-top-bar button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 5px 10px;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  margin-bottom: 0;
}

.header-info {
  display: flex;
  align-items: center;
}

.folder-count {
  font-size: 14px;
  color: #666;
}

.upgrade-link {
  color: #2196F3;
  cursor: pointer;
  text-decoration: underline;
}

.create-btn-top {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.icon-btn {
  color: white !important;
  background: transparent !important;
}

.folder-table-container {
  background: white;
  overflow: hidden;
  padding: 0 20px 20px 20px;
}

.folder-table {
  width: 100%;
  border-collapse: collapse;
}

.folder-table th,
.folder-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.folder-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.folder-row {
  cursor: pointer;
  transition: background 0.2s;
}

.folder-row:hover {
  background: #f5f5f5;
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-icon {
  font-size: 24px;
}

.folder-name {
  font-weight: 500;
  color: #333;
}

.folder-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.action-btn.danger {
  background: #f44336;
}

/* 创建对话框样式 */
.create-dialog-overlay {
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

.create-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.create-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.create-dialog-header h3 {
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
}

.close-btn:hover {
  background: #e0e0e0;
}

.create-dialog-body {
  padding: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #2196F3;
}

.create-dialog-footer {
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
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn {
  background: #2196F3;
  color: white;
}

/* 创建选项对话框样式 */
.create-options-overlay {
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

.create-options-dialog {
  background: white;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.create-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px 40px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.create-option-card:hover {
  background: #e9ecef;
  border-color: #2196F3;
  transform: translateY(-2px);
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  font-size: 32px;
  color: #333;
  font-weight: 300;
}

.excel-icon {
  font-size: 32px;
}

.option-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  text-align: center;
}

/* 删除确认对话框样式 */
.delete-dialog-overlay {
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
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.delete-dialog {
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

.delete-dialog-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: scaleIn 0.3s ease-out 0.1s both;
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

.delete-dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.delete-dialog-message {
  margin-bottom: 32px;
  line-height: 1.6;
}

.delete-dialog-message p {
  margin: 8px 0;
  font-size: 15px;
  color: #666;
}

.delete-dialog-message strong {
  color: #f44336;
  font-weight: 600;
}

.warning-text {
  color: #f44336 !important;
  font-weight: 500;
  font-size: 14px !important;
}

.delete-dialog-footer {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.delete-cancel-btn,
.delete-confirm-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.delete-cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.delete-cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.delete-confirm-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-confirm-btn:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

.delete-confirm-btn:active {
  transform: translateY(0);
}
</style>

