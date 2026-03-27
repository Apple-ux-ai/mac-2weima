<template>
  <div v-if="visible" class="license-modal-overlay">
    <div class="license-modal">
      <button class="close-btn-top" @click="close">×</button>
      
      <div class="license-header">
        <img src="/license_logo.ico" alt="Logo" class="license-logo">
        <h3 class="license-title">{{ t('licenseModal.title') }}</h3>
      </div>
      
      <div class="license-content">
        <p class="description">
          {{ t('licenseModal.description') }}
        </p>

        <div class="input-section">
          <div class="input-container">
            <input 
              v-model="authCode" 
              :type="isPasswordVisible ? 'text' : 'password'" 
              :placeholder="t('licenseModal.placeholder')" 
              maxlength="32"
              class="license-input"
              @keyup.enter="validate"
            >
            <span 
              class="eye-icon" 
              :class="{ 'is-visible': isPasswordVisible }"
              @click="toggleVisibility"
              :title="t('licenseModal.toggleVisibility')"
            >
              {{ isPasswordVisible ? '👁️' : '🙈' }}
            </span>
          </div>
          
          <button 
            class="validate-btn" 
            :class="{ 'is-active': authCode && !loading }"
            :disabled="loading || !authCode"
            @click="validate"
          >
            {{ loading ? t('licenseModal.validating') : t('licenseModal.verify') }}
          </button>
          
          <div class="footer-links">
            <span class="help-text">{{ t('licenseModal.noCodeYet') }}</span>
            <a href="#" @click.prevent="getAuthCode" class="get-auth-link">{{ t('licenseModal.clickToGet') }}</a>
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { licenseService } from '../utils/license'
import { toast } from '../utils/toast'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

const machineCode = ref('')
const authCode = ref('')
const isPasswordVisible = ref(true)
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const code = await licenseService.getMachineCode()
  machineCode.value = code || ''
})

const toggleVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const close = () => {
  emit('update:visible', false)
}

const getAuthCode = async () => {
  if (!machineCode.value) {
    const code = await licenseService.getMachineCode()
    machineCode.value = code || ''
  }
  
  loading.value = true
  const result = await licenseService.checkNeedAuthCode(machineCode.value)
  loading.value = false
  
  if (result.code === 1) {
    // 只要有返回的 url，不管 is_need_auth_code 是多少都允许跳转，除非明确不需要且没有 url
    if (result.data.is_need_auth_code === 1 || result.data.auth_code_url) {
      const url = licenseService.getAuthPageUrl(machineCode.value, result.data.auth_code_url)
      if (window.electron && window.electron.openExternal) {
        window.electron.openExternal(url)
      } else {
        window.open(url)
      }
    } else {
      toast.info(t('licenseModal.noNeedAuth'))
    }
  } else {
    errorMsg.value = result.msg || t('licenseModal.errors.getPageFailed')
  }
}

const validate = async () => {
  if (!authCode.value) {
    errorMsg.value = t('licenseModal.errors.pleaseEnter')
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    const result = await licenseService.validAuthCode(machineCode.value, authCode.value)
    if (result.code === 1 && result.data.auth_code_status === 1) {
      licenseService.saveLicense(authCode.value)
      licenseService.setIsAuthed(true) // 更新全局缓存状态
      toast.success(t('licenseModal.authSuccess'))
      emit('success')
      close()
    } else {
      errorMsg.value = result.msg || t('licenseModal.errors.invalidRetry')
    }
  } catch (err) {
    errorMsg.value = t('licenseModal.errors.verifyError')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.license-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.license-modal {
  width: 440px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  position: relative;
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.close-btn-top {
  position: absolute;
  right: 24px;
  top: 24px;
  background: none;
  border: none;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  line-height: 1;
}

.license-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 12px;
}

.license-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.license-title {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.description {
  color: #888;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 40px;
  padding: 0 10px;
}

.input-container {
  position: relative;
  margin-bottom: 24px;
}

.license-input {
  width: 100%;
  height: 54px;
  background: #f5f7fa;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  padding: 0 20px;
  font-size: 16px;
  color: #333;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s;
}

.license-input:focus {
  border-color: #a0bfff;
  background: white;
  box-shadow: 0 0 0 3px rgba(160, 191, 255, 0.1);
}

.eye-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.eye-icon:hover {
  color: #9abeff;
  transform: translateY(-50%) scale(1.1);
}

.eye-icon.is-visible {
  color: #9abeff;
}

.validate-btn {
  width: 100%;
  height: 54px;
  background: #dce5f5; /* 初始状态：浅灰蓝色 */
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 输入验证码后的激活状态 */
.validate-btn.is-active {
  background: #4477ff; /* 激活状态：鲜艳深蓝色 */
  box-shadow: 0 6px 20px rgba(68, 119, 255, 0.3);
  transform: scale(1.02);
}

.validate-btn:hover:not(:disabled) {
  background: #3366ee;
  box-shadow: 0 8px 25px rgba(68, 119, 255, 0.4);
  transform: translateY(-2px) scale(1.03);
}

.validate-btn:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.validate-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.footer-links {
  text-align: center;
  font-size: 14px;
}

.help-text {
  color: #999;
}

.get-auth-link {
  color: #4477ff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.error-msg {
  color: #ff4d4f;
  font-size: 12px;
  text-align: center;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
