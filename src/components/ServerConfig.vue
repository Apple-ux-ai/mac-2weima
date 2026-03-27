<template>
  <div class="server-config">
    <div class="config-card">
      <div class="config-header">
        <h3>{{ t('serverConfig.title') }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="config-content">
        <div class="info-section">
          <p class="info-text">
            {{ t('serverConfig.desc') }}
          </p>
          
          <div class="current-address">
            <label>{{ t('serverConfig.currentAddress') }}</label>
            <div class="address-display">
              <code>{{ serverInfo.url }}</code>
              <button class="copy-btn" @click="copyAddress">{{ t('serverConfig.copy') }}</button>
            </div>
            <p v-if="serverInfo.warning" class="warning-text">
              ⚠️ {{ serverInfo.warning }}
            </p>
          </div>
        </div>

        <div class="config-section">
          <label>{{ t('serverConfig.manualConfig') }}</label>
          <div class="input-group">
            <input 
              v-model="inputUrl" 
              type="text" 
              :placeholder="t('serverConfig.placeholder')"
              class="url-input"
            />
            <button class="save-btn" @click="saveConfig">{{ t('serverConfig.save') }}</button>
          </div>
          <p class="hint-text" style="white-space: pre-line">{{ t('serverConfig.tip') }}</p>
        </div>

        <div class="help-section">
          <h4>{{ t('serverConfig.howToGetTitle') }}</h4>
          <div class="help-steps">
            <div class="step">{{ t('serverConfig.windowsTip') }}</div>
            <div class="step">{{ t('serverConfig.macTip') }}</div>
            <div class="step">{{ t('serverConfig.serverTip') }}</div>
          </div>
        </div>

        <div v-if="serverInfo.isConfigured" class="actions">
          <button class="clear-btn" @click="clearConfig">{{ t('serverConfig.clearConfig') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getServerBaseUrl, setServerBaseUrl, clearServerBaseUrl, getServerAddressInfo } from '../utils/serverConfig.js'

const { t } = useI18n()
const emit = defineEmits(['close'])

const inputUrl = ref('')
const serverInfo = ref(getServerAddressInfo())

const saveConfig = () => {
  if (!inputUrl.value.trim()) {
    alert(t('serverConfig.pleaseEnter'))
    return
  }

  // 验证URL格式
  try {
    new URL(inputUrl.value)
  } catch (error) {
    alert(t('serverConfig.invalidUrl'))
    return
  }

  if (setServerBaseUrl(inputUrl.value)) {
    serverInfo.value = getServerAddressInfo()
    inputUrl.value = ''
    alert(t('serverConfig.saveSuccess'))
  } else {
    alert(t('serverConfig.saveFail'))
  }
}

const clearConfig = () => {
  if (confirm(t('serverConfig.confirmClear'))) {
    clearServerBaseUrl()
    serverInfo.value = getServerAddressInfo()
    alert(t('serverConfig.cleared'))
  }
}

const copyAddress = () => {
  navigator.clipboard.writeText(serverInfo.value.url).then(() => {
    alert(t('serverConfig.copySuccess'))
  }).catch(() => {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = serverInfo.value.url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert(t('serverConfig.copySuccess'))
  })
}

onMounted(() => {
  inputUrl.value = serverInfo.value.url
})
</script>

<style scoped>
.server-config {
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
  padding: 20px;
}

.config-card {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.config-header h3 {
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

.config-content {
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.info-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.current-address {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.current-address label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.address-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-display code {
  flex: 1;
  background: white;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #333;
  border: 1px solid #e0e0e0;
  word-break: break-all;
}

.copy-btn {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: #1976D2;
}

.warning-text {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 8px;
  line-height: 1.5;
}

.config-section {
  margin-bottom: 24px;
}

.config-section label {
  display: block;
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.url-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Courier New', monospace;
}

.url-input:focus {
  outline: none;
  border-color: #2196F3;
}

.save-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.hint-text {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.8;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.help-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.help-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #333;
}

.help-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.step code {
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.clear-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #eeeeee;
  color: #333;
}

@media (max-width: 768px) {
  .server-config {
    padding: 10px;
  }
  
  .config-card {
    max-height: 95vh;
  }
  
  .address-display {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-group {
    flex-direction: column;
  }
}
</style>






















