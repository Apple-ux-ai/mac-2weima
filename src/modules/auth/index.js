import CryptoJS from 'crypto-js';
import { i18n } from '../../i18n';

const SECRET_KEY = '7530bfb1ad6c41627b0f0620078fa5ed';
const API_BASE_URL = 'https://api-web.kunqiongai.com';

/**
 * Auth 模块 - 处理所有与身份验证相关的逻辑
 */

/**
 * 生成带签名的临时会话ID (nonce)
 */
export function generateSignedNonce() {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `${nonce}|${timestamp}`;
  
  const signature = CryptoJS.HmacSHA256(message, SECRET_KEY).toString(CryptoJS.enc.Base64);
  
  return {
    nonce,
    timestamp,
    signature
  };
}

/**
 * 将带签名的nonce编码为URL安全的字符串
 */
export function encodeSignedNonce(signedNonce) {
  const jsonStr = JSON.stringify(signedNonce);
  let urlSafeStr = CryptoJS.enc.Utf8.parse(jsonStr).toString(CryptoJS.enc.Base64);
  
  // 替换base64中的URL不安全字符
  urlSafeStr = urlSafeStr.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return urlSafeStr;
}

/**
 * 获取网页端登录地址
 */
export async function getWebLoginUrl() {
  const response = await fetch(`${API_BASE_URL}/soft_desktop/get_web_login_url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const result = await response.json();
  if (result.code === 1) {
    return result.data.login_url;
  } else {
    throw new Error(i18n.global.t('auth.getLoginUrlFailed', { msg: result.msg }));
  }
}

/**
 * 轮询获取登录令牌
 */
export async function pollToken(encodedNonce, signal) {
  const pollUrl = `${API_BASE_URL}/user/desktop_get_token`;
  
  while (!signal.aborted) {
    try {
      const response = await fetch(`${pollUrl}?client_type=desktop&client_nonce=${encodedNonce}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const result = await response.json();
      
      if (result.code === 1) {
        return result.data.token;
      }
      
      // 等待2秒继续轮询
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('轮询失败:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error(i18n.global.t('auth.pollCanceled'));
}

/**
 * 检查登录状态
 */
export async function checkLogin(token) {
  const response = await fetch(`${API_BASE_URL}/user/check_login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `token=${token}`
  });
  const result = await response.json();
  return result.code === 1;
}

/**
 * 获取用户信息
 */
export async function getUserInfo(token) {
  const response = await fetch(`${API_BASE_URL}/soft_desktop/get_user_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'token': token
    }
  });
  const result = await response.json();
  if (result.code === 1) {
    return result.data.user_info;
  } else {
    throw new Error(i18n.global.t('auth.getUserInfoFailed', { msg: result.msg }));
  }
}

/**
 * 退出登录
 */
export async function logout(token) {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'token': token
    }
  });
  const result = await response.json();
  return result.code === 1;
}
