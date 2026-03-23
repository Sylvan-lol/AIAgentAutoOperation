<template>
  <div class="app-container flex h-screen">
    <!-- 左侧聊天区域 -->
    <div class="chat-section flex-1 border-r">
      <Chat />
    </div>
    
    <!-- 右侧文件管理区域 -->
    <div class="file-section w-1/3">
      <FileList />
    </div>
  </div>
</template>

<script setup>
import Chat from './components/Chat.vue';
import FileList from './components/FileList.vue';
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.chat-section {
  height: 100%;
}

.file-section {
  height: 100%;
  background-color: #f8fafc;
}
</style>