<template>
  <div class="app-root">
    <!-- 未登录: 显示登录页 -->
    <LoginPage v-if="!authStore.isLoggedIn" @login-success="handleLoginSuccess" />
    
    <!-- 已登录: 显示主界面 -->
    <div v-else class="app-container flex h-screen">
      <!-- 左侧聊天区域 -->
      <div class="chat-section flex-1 border-r border-[#d2d2d7]/30">
        <Chat @logout="handleLogout" />
      </div>
      
      <!-- 右侧文件管理区域 -->
      <div class="file-section w-[380px] min-w-[320px]">
        <FileList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import LoginPage from './components/LoginPage.vue';
import Chat from './components/Chat.vue';
import FileList from './components/FileList.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();

const handleLoginSuccess = () => {
  chatStore.clearMessages();
  console.log('Login successful');
};

const handleLogout = () => {
  chatStore.clearMessages();
  console.log('Logout successful');
};
</script>

<style scoped>
.app-root {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f5f5f7;
}

.app-container {
  height: 100vh;
}

.chat-section {
  height: 100%;
}

.file-section {
  height: 100%;
}
</style>