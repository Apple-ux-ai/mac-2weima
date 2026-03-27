<template>
  <div v-if="show" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('loginModal.title') }}</h3>
        <button class="close-btn" @click="handleCancel">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="step === 'idle'" class="idle-state">
          <p class="desc">{{ t('loginModal.desc') }}</p>
          <button class="login-action-btn" @click="startLogin">{{ t('loginModal.start') }}</button>
        </div>
        
        <div v-else-if="step === 'polling'" class="polling-state">
          <div class="loading-spinner"></div>
          <p class="status-text">{{ t('loginModal.waiting') }}</p>
          <p class="timer">{{ t('loginModal.remaining', { seconds: timeLeft }) }}</p>
          <button class="cancel-btn" @click="handleCancel">{{ t('loginModal.cancel') }}</button>
        </div>
        
        <div v-else-if="step === 'success'" class="success-state">
          <div class="success-icon">✓</div>
          <p>{{ t('loginModal.success') }}</p>
        </div>
        
        <div v-else-if="step === 'error'" class="error-state">
          <div class="error-icon">!</div>
          <p>{{ errorMsg }}</p>
          <button class="retry-btn" @click="step = 'idle'">{{ t('loginModal.retry') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { generateSignedNonce, encodeSignedNonce, pollToken, getWebLoginUrl } from '../modules/auth';
import { userStore } from '../modules/user';
const { t } = useI18n()

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const step = ref('idle'); // idle, polling, success, error
const timeLeft = ref(300);
const errorMsg = ref('');
let pollController = null;
let timerInterval = null;

const startLogin = async () => {
  try {
    step.value = 'polling';
    timeLeft.value = 300;
    errorMsg.value = '';
    
    // 1. 生成带签名的nonce
    const signedNonce = generateSignedNonce();
    const encodedNonce = encodeSignedNonce(signedNonce);
    
    // 2. 获取登录地址
    const webLoginUrl = await getWebLoginUrl();
    const finalUrl = `${webLoginUrl}?client_type=desktop&client_nonce=${encodedNonce}`;
    
    // 3. 打开浏览器
    if (window.electron && window.electron.openExternal) {
      await window.electron.openExternal(finalUrl);
    } else {
      window.open(finalUrl, '_blank');
    }
    
    // 4. 开始轮询
    pollController = new AbortController();
    
    // 启动倒计时
    timerInterval = setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        handleTimeout();
      }
    }, 1000);
    
    const token = await pollToken(encodedNonce, pollController.signal);
    
    // 5. 登录成功
    userStore.setToken(token);
    step.value = 'success';
    
    setTimeout(() => {
      emit('close');
      resetState();
    }, 1500);
    
  } catch (error) {
    if (error.message !== '轮询已取消') {
      step.value = 'error';
      errorMsg.value = error.message || t('loginModal.failed');
    }
    stopTimer();
  }
};

const handleCancel = () => {
  if (pollController) {
    pollController.abort();
  }
  emit('close');
  resetState();
};

const handleTimeout = () => {
  if (pollController) {
    pollController.abort();
  }
  step.value = 'error';
  errorMsg.value = t('loginModal.timeout');
  stopTimer();
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetState = () => {
  stopTimer();
  step.value = 'idle';
  timeLeft.value = 300;
  errorMsg.value = '';
};

onUnmounted(() => {
  resetState();
});

watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetState();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
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
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
}

.desc {
  color: #666;
  margin-bottom: 24px;
}

.login-action-btn {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.login-action-btn:hover {
  background: #1976D2;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-text {
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.timer {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.cancel-btn {
  padding: 8px 24px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4CAF50;
  color: white;
  font-size: 30px;
  line-height: 60px;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #F44336;
  color: white;
  font-size: 30px;
  line-height: 60px;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.retry-btn {
  padding: 8px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
