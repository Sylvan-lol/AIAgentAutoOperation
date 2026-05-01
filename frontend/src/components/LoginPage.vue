<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-[#f5f5f7]">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#0071e3]/5 rounded-full"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#0071e3]/5 rounded-full"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-full max-w-md mx-4">
      <div class="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-apple-lg p-8 border border-white/20">
        <!-- Logo 区域 -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#0071e3] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Open Claw</h1>
          <p class="text-sm text-[#86868b] mt-1">企业级 AI 助手</p>
        </div>

        <!-- 切换登录/注册 -->
        <div class="flex bg-[#f5f5f7] rounded-xl p-1 mb-6">
          <button
            @click="isLogin = true"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300',
              isLogin ? 'bg-white text-[#1d1d1f] shadow-apple' : 'text-[#86868b] hover:text-[#1d1d1f]'
            ]"
          >
            登录
          </button>
          <button
            @click="isLogin = false"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300',
              !isLogin ? 'bg-white text-[#1d1d1f] shadow-apple' : 'text-[#86868b] hover:text-[#1d1d1f]'
            ]"
          >
            注册
          </button>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#86868b] mb-1.5 tracking-wide uppercase">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              :disabled="loading"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#86868b] mb-1.5 tracking-wide uppercase">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              :disabled="loading"
              required
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="bg-[#ff3b30]/5 border border-[#ff3b30]/20 rounded-xl px-4 py-3">
            <p class="text-xs text-[#ff3b30]">{{ errorMessage }}</p>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading || !username || !password"
            class="w-full py-3 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ed] disabled:bg-[#0071e3]/40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              处理中...
            </span>
            <span v-else>{{ isLogin ? '登录' : '创建账号' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const emit = defineEmits(['login-success']);

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    let result;
    if (isLogin.value) {
      result = await authStore.login(username.value, password.value);
    } else {
      result = await authStore.register(username.value, password.value);
    }
    
    if (result.success) {
      emit('login-success');
    } else {
      errorMessage.value = result.message || '操作失败，请重试';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请检查后端服务是否运行';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
}
</style>