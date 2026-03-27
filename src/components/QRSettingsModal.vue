<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t('qrGenerator.settingsModal.title') }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- 左侧：设置区域 -->
        <div class="settings-panel">
          <h4>{{ t('qrGenerator.settingsModal.settingsTitle') }}</h4>
          <div class="options-grid">
            <div class="option-item">
              <label>{{ t('qrGenerator.settingsModal.size') }}</label>
              <div class="size-control">
                <input 
                  :value="qrSize"
                  @input="$emit('update:qrSize', Number($event.target.value))"
                  type="range" 
                  min="200" 
                  max="800" 
                  step="50"
                />
                <span class="size-value">{{ qrSize }}px</span>
              </div>
            </div>
            
            <div class="option-item">
              <label>{{ t('qrGenerator.settingsModal.foreground') }}</label>
              <input 
                :value="qrColor" 
                @input="$emit('update:qrColor', $event.target.value)" 
                type="color" 
                class="color-picker" 
              />
            </div>
            
            <div class="option-item">
              <label>{{ t('qrGenerator.settingsModal.background') }}</label>
              <input 
                :value="qrBgColor" 
                @input="$emit('update:qrBgColor', $event.target.value)" 
                type="color" 
                class="color-picker" 
              />
            </div>
            
            <div class="option-item">
              <label>{{ t('qrGenerator.settingsModal.errorLevel') }}</label>
              <select 
                :value="errorLevel" 
                @change="$emit('update:errorLevel', $event.target.value)"
              >
                <option value="L">{{ t('qrGenerator.settingsModal.errorLevelL') }}</option>
                <option value="M">{{ t('qrGenerator.settingsModal.errorLevelM') }}</option>
                <option value="Q">{{ t('qrGenerator.settingsModal.errorLevelQ') }}</option>
                <option value="H">{{ t('qrGenerator.settingsModal.errorLevelH') }}</option>
              </select>
            </div>
          </div>
          
          <button class="refresh-btn" @click="$emit('regenerate')">
            <span>{{ t('qrGenerator.settingsModal.updatePreview') }}</span>
          </button>
          
          <p class="settings-hint">
            {{ t('qrGenerator.settingsModal.settingsHint') }}
          </p>
        </div>
        
        <!-- 右侧：预览区域 -->
        <div class="preview-panel">
          <QRPreview :qr-data-url="qrDataUrl" :qr-info="qrInfo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import QRPreview from './QRPreview.vue'

const { t } = useI18n()

defineProps({
  qrSize: Number,
  qrColor: String,
  qrBgColor: String,
  errorLevel: String,
  qrDataUrl: String,
  qrInfo: Object
})

defineEmits([
  'close', 
  'update:qrSize', 
  'update:qrColor', 
  'update:qrBgColor', 
  'update:errorLevel', 
  'regenerate'
])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  padding: 30px;
}

.settings-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  height: fit-content;
}

.settings-panel h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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
  min-width: 50px;
  text-align: right;
  font-family: monospace;
}

.color-picker {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.refresh-btn {
  width: 100%;
  margin-top: 25px;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.refresh-btn:hover {
  background: #1976D2;
}

.settings-hint {
  margin-top: 15px;
  font-size: 0.85rem;
  color: #999;
  text-align: center;
}

.preview-panel {
  min-height: 400px;
}

@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>




