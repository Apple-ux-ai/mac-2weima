<template>
  <div class="storage-manager">
    <div class="manager-card">
      <div class="manager-header">
        <h3>{{ t('storageManager.title') }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="manager-content">
        <div class="stats-section">
          <h4>{{ t('storageManager.usageTitle') }}</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">IndexedDB</div>
              <div class="stat-value">{{ stats.indexedDB.formattedSize }}</div>
              <div class="stat-detail">{{ t('storageManager.fileCount', { count: stats.indexedDB.fileCount }) }}</div>
              <div v-if="stats.indexedDB.oldFileCount > 0" class="stat-warning">
                {{ t('storageManager.filesOver30Days', { count: stats.indexedDB.oldFileCount }) }}
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-label">LocalStorage</div>
              <div class="stat-value">{{ stats.localStorage.formattedSize }}</div>
              <div class="stat-detail">{{ t('storageManager.itemCount', { count: stats.localStorage.itemCount }) }}</div>
            </div>
            
            <div class="stat-card total">
              <div class="stat-label">{{ t('storageManager.total') }}</div>
              <div class="stat-value">{{ stats.total.formattedSize }}</div>
              <div class="stat-detail">{{ t('storageManager.totalItems', { count: stats.total.fileCount }) }}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h4>{{ t('storageManager.whyTitle') }}</h4>
          <ul class="info-list">
            <li>{{ t('storageManager.reason1') }}</li>
            <li>{{ t('storageManager.reason2') }}</li>
            <li>{{ t('storageManager.reason3') }}</li>
            <li>{{ t('storageManager.reason4') }}</li>
          </ul>
        </div>

        <div class="solutions-section">
          <h4>{{ t('storageManager.solutionTitle') }}</h4>
          <div class="solution-cards">
            <div class="solution-card">
              <div class="solution-icon">🧹</div>
              <div class="solution-title">{{ t('storageManager.cleanOldData') }}</div>
              <div class="solution-desc">{{ t('storageManager.cleanOldDataDesc') }}</div>
              <button class="solution-btn" @click="cleanOldData" :disabled="cleaning">
                {{ cleaning ? t('storageManager.cleaning') : t('storageManager.cleanOldData') }}
              </button>
            </div>
            
            <div class="solution-card">
              <div class="solution-icon">🗑️</div>
              <div class="solution-title">{{ t('storageManager.clearAll') }}</div>
              <div class="solution-desc">{{ t('storageManager.clearAllDesc') }}</div>
              <button class="solution-btn danger" @click="clearAllData" :disabled="clearing">
                {{ clearing ? t('storageManager.clearing') : t('storageManager.clearAll') }}
              </button>
            </div>
            
            <div class="solution-card">
              <div class="solution-icon">🌐</div>
              <div class="solution-title">{{ t('storageManager.useServer') }}</div>
              <div class="solution-desc">{{ t('storageManager.useServerDesc') }}</div>
              <button class="solution-btn" @click="openServerConfig">
                {{ t('storageManager.configServer') }}
              </button>
            </div>
          </div>
        </div>

        <div class="tips-section">
          <h4>{{ t('storageManager.suggestTitle') }}</h4>
          <ul class="tips-list">
            <li>{{ t('storageManager.suggest1') }}</li>
            <li>{{ t('storageManager.suggest2') }}</li>
            <li>{{ t('storageManager.suggest3') }}</li>
            <li>{{ t('storageManager.suggest4') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showCleanConfirm" class="confirm-dialog-overlay" @click.self="closeCleanConfirm">
      <div class="confirm-dialog">
        <div class="confirm-dialog-icon">🧹</div>
        <div class="confirm-dialog-title">{{ t('storageManager.confirmCleanTitle') }}</div>
        <div class="confirm-dialog-message">
          <p>{{ t('storageManager.confirmCleanMsg') }}</p>
          <p class="warning-text">{{ t('storageManager.warning') }}</p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="confirm-cancel-btn" @click="closeCleanConfirm">{{ t('storageManager.cancel') }}</button>
          <button class="confirm-ok-btn" @click="confirmCleanOldData">{{ t('storageManager.confirm') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showClearConfirm" class="confirm-dialog-overlay" @click.self="closeClearConfirm">
      <div class="confirm-dialog">
        <div class="confirm-dialog-icon">⚠️</div>
        <div class="confirm-dialog-title">{{ t('storageManager.confirmClearTitle') }}</div>
        <div class="confirm-dialog-message">
          <p>{{ t('storageManager.confirmClearMsg') }}</p>
          <div class="clear-data-list">
            <p>{{ t('storageManager.confirmClearDetail') }}</p>
            <ul>
              <li>{{ t('storageManager.deleteVideos') }}</li>
              <li>{{ t('storageManager.deleteAudios') }}</li>
              <li>{{ t('storageManager.deleteEditorContent') }}</li>
            </ul>
            <p class="retain-info">{{ t('storageManager.retainInfo') }}</p>
          </div>
          <p class="warning-text">{{ t('storageManager.warning') }}</p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="confirm-cancel-btn" @click="closeClearConfirm">{{ t('storageManager.cancel') }}</button>
          <button class="confirm-danger-btn" @click="confirmClearAllData">{{ t('storageManager.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getStorageStats, cleanOldFiles, clearAllStorage } from '../common/utils/indexedDB'

const { t } = useI18n()
const emit = defineEmits(['close', 'open-server-config'])

const stats = ref({
  indexedDB: { fileCount: 0, totalSize: 0, oldFileCount: 0, formattedSize: '0 B' },
  localStorage: { itemCount: 0, totalSize: 0, formattedSize: '0 B' },
  total: { fileCount: 0, totalSize: 0, formattedSize: '0 B' }
})

const cleaning = ref(false)
const clearing = ref(false)
const showCleanConfirm = ref(false)
const showClearConfirm = ref(false)

// 加载存储统计
const loadStats = async () => {
  try {
    stats.value = await getStorageStats()
  } catch (error) {
    console.error('加载存储统计失败:', error)
  }
}

// 清理旧数据
const cleanOldData = () => {
  showCleanConfirm.value = true
}

// 确认清理旧数据
const confirmCleanOldData = async () => {
  closeCleanConfirm()
  cleaning.value = true
  try {
    const result = await cleanOldFiles(30)
    alert(t('storageManagerExtra.cleanDoneDetail', { indexedDB: result.indexedDBDeleted, localStorage: result.localStorageDeleted, total: result.totalDeleted }))
    await loadStats() // 重新加载统计
  } catch (error) {
    console.error('清理失败:', error)
    alert(t('storageManagerExtra.cleanFail', { msg: error.message }))
  } finally {
    cleaning.value = false
  }
}

// 关闭清理确认对话框
const closeCleanConfirm = () => {
  showCleanConfirm.value = false
}

// 清空所有数据
const clearAllData = () => {
  showClearConfirm.value = true
}

// 确认清空所有数据
const confirmClearAllData = async () => {
  closeClearConfirm()
  clearing.value = true
  try {
    const result = await clearAllStorage()
    alert(t('storageManagerExtra.clearDoneDetail', { localStorage: result.localStorageCleared, total: result.totalCleared }))
    await loadStats() // 重新加载统计
  } catch (error) {
    console.error('清空失败:', error)
    alert(t('storageManagerExtra.clearFail', { msg: error.message }))
  } finally {
    clearing.value = false
  }
}

// 关闭清空确认对话框
const closeClearConfirm = () => {
  showClearConfirm.value = false
}

// 打开服务器配置
const openServerConfig = () => {
  emit('open-server-config')
  emit('close')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.storage-manager {
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
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.manager-card {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.manager-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.manager-content {
  padding: 24px;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.stat-card.total .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-card.total .stat-value {
  color: white;
}

.stat-detail {
  font-size: 0.85rem;
  color: #999;
  margin-top: 4px;
}

.stat-card.total .stat-detail {
  color: rgba(255, 255, 255, 0.8);
}

.stat-warning {
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  display: inline-block;
}

.info-section,
.solutions-section,
.tips-section {
  margin-bottom: 32px;
}

.info-section h4,
.solutions-section h4,
.tips-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #333;
}

.info-list,
.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.8;
}

.info-list li,
.tips-list li {
  margin-bottom: 8px;
}

.info-list strong {
  color: #333;
}

.solution-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.solution-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.solution-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.solution-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.solution-desc {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.solution-btn {
  width: 100%;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.solution-btn:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.solution-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.solution-btn.danger {
  background: #f44336;
}

.solution-btn.danger:hover:not(:disabled) {
  background: #d32f2f;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

@media (max-width: 768px) {
  .storage-manager {
    padding: 10px;
  }
  
  .manager-card {
    max-height: 95vh;
  }
  
  .stats-grid,
  .solution-cards {
    grid-template-columns: 1fr;
  }
}

/* 确认对话框样式 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10004;
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

.confirm-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
}

.confirm-dialog-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: scaleIn 0.3s ease-out 0.1s both;
}

.confirm-dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.confirm-dialog-message {
  margin-bottom: 32px;
  line-height: 1.6;
  width: 100%;
}

.confirm-dialog-message p {
  margin: 8px 0;
  font-size: 15px;
  color: #666;
}

.confirm-dialog-message strong {
  color: #f44336;
  font-weight: 600;
}

.confirm-dialog-message .warning-text {
  color: #f44336 !important;
  font-weight: 500;
  font-size: 14px !important;
  margin-top: 12px;
}

.clear-data-list {
  text-align: left;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.clear-data-list p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.clear-data-list ul {
  margin: 8px 0;
  padding-left: 20px;
  color: #666;
}

.clear-data-list li {
  margin: 4px 0;
  font-size: 14px;
}

.retain-info {
  color: #4CAF50 !important;
  font-weight: 500;
  margin-top: 12px !important;
}

.confirm-dialog-footer {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.confirm-cancel-btn,
.confirm-ok-btn,
.confirm-danger-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.confirm-cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.confirm-ok-btn {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.confirm-ok-btn:hover {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.confirm-danger-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.confirm-danger-btn:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

.confirm-ok-btn:active,
.confirm-danger-btn:active {
  transform: translateY(0);
}
</style>










