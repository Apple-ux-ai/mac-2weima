import { reactive, watch } from 'vue';
import { checkLogin, getUserInfo, logout as apiLogout } from '../auth';

/**
 * User 模块 - 处理用户状态和本地存储
 */

const STORAGE_KEY = 'auth_token';

export const userStore = reactive({
  token: localStorage.getItem(STORAGE_KEY) || null,
  userInfo: null,
  loading: false,
  isLoggedIn: false,

  async init() {
    if (this.token) {
      this.loading = true;
      try {
        const isValid = await checkLogin(this.token);
        if (isValid) {
          this.userInfo = await getUserInfo(this.token);
          this.isLoggedIn = true;
        } else {
          this.clearAuth();
        }
      } catch (error) {
        console.error('初始化用户信息失败:', error);
        this.clearAuth();
      } finally {
        this.loading = false;
      }
    }
  },

  setToken(token) {
    this.token = token;
    localStorage.setItem(STORAGE_KEY, token);
    this.fetchUserInfo();
  },

  async fetchUserInfo() {
    if (!this.token) return;
    try {
      this.userInfo = await getUserInfo(this.token);
      this.isLoggedIn = true;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.clearAuth();
    }
  },

  async logout() {
    if (this.token) {
      try {
        await apiLogout(this.token);
      } catch (e) {
        console.error('登出接口调用失败:', e);
      }
    }
    this.clearAuth();
  },

  clearAuth() {
    this.token = null;
    this.userInfo = null;
    this.isLoggedIn = false;
    localStorage.removeItem(STORAGE_KEY);
  }
});

// 监听 token 变化
watch(() => userStore.token, (newToken) => {
  if (!newToken) {
    userStore.clearAuth();
  }
});
