<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('updateModal.title') }}</h3>
        <span class="version-tag">v{{ updateInfo.version_name }}</span>
      </div>
      
      <div class="modal-body">
        <div class="update-info">
          <p class="release-date">{{ t('updateModal.releaseTime') }}: {{ formatDate(updateInfo.create_time) }}</p>
          <div class="release-notes" v-html="formatReleaseNotes(updateInfo.description)"></div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">{{ t('updateModal.later') }}</button>
        <button class="btn-confirm" @click="handleUpdate" :disabled="updating">
          {{ updating ? `${t('updateModal.updateNow')}...` : t('updateModal.updateNow') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '../i18n/datetime'
const { t, locale } = useI18n()

const props = defineProps({
  show: Boolean,
  updateInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])
const updating = ref(false)

const formatDate = (dateStr) => {
  return formatDateTime(dateStr, locale.value)
}

const formatReleaseNotes = (notes) => {
  if (!notes) return '-'
  // 将换行符转换为 <br>
  return notes.replace(/\n/g, '<br>')
}

const handleUpdate = async () => {
  updating.value = true
  try {
    if (window.electron && window.electron.startUpdate) {
      await window.electron.startUpdate({
        url: props.updateInfo.download_url,
        hash: props.updateInfo.hash
      })
    }
  } catch (error) {
    console.error('启动更新失败:', error)
    updating.value = false
    alert(t('app.update.fail', { reason: error.message || 'Unknown error' }))
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.version-tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.modal-body {
  padding: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.release-date {
  color: #999;
  font-size: 13px;
  margin-top: 0;
  margin-bottom: 12px;
}

.release-notes {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  background: #f9f9f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.btn-confirm {
  padding: 8px 16px;
  border: none;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #40a9ff;
}

.btn-confirm:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>