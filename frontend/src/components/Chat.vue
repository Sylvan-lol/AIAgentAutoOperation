<template>
  <div class="chat-container flex flex-col h-full">
    <div class="chat-header bg-primary text-white p-4">
      <h2 class="text-xl font-bold">Open Claw - AI 助手</h2>
    </div>
    
    <div class="chat-messages flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="[`message ${message.role}`, message.role === 'user' ? 'text-right' : 'text-left']"
      >
        <div 
          :class="[
            'message-content inline-block p-3 rounded-lg',
            message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
          ]"
        >
          {{ message.content }}
        </div>
      </div>
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    </div>
    
    <div class="chat-input p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <textarea 
          v-model="inputMessage"
          placeholder="输入您的问题..."
          class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          :disabled="loading"
          rows="1"
          maxlength="1000"
          @input="autoResize"
          ref="textarea"
        ></textarea>
        <button 
          type="submit"
          class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:bg-gray-400 self-end"
          :disabled="loading || !inputMessage.trim()"
        >
          发送
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useChatStore } from '../store/chatStore';

const chatStore = useChatStore();
const inputMessage = ref('');
const messagesContainer = ref(null);
const textarea = ref(null);

const messages = computed(() => chatStore.messages);
const loading = computed(() => chatStore.loading);

const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message) return;
  
  await chatStore.sendMessage(message);
  inputMessage.value = '';
  // 重置textarea高度
  if (textarea.value) {
    textarea.value.style.height = 'auto';
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const autoResize = () => {
  if (textarea.value) {
    // 重置高度
    textarea.value.style.height = 'auto';
    // 计算新高度，最大4行
    const maxHeight = 4 * 24; // 假设每行24px
    const newHeight = Math.min(textarea.value.scrollHeight, maxHeight);
    textarea.value.style.height = `${newHeight}px`;
  }
};

watch(messages, scrollToBottom, { deep: true });

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  height: 100%;
}

.message {
  margin-bottom: 10px;
}

.message-content {
  max-width: 80%;
  word-wrap: break-word;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.message.assistant {
  display: flex;
  justify-content: flex-start;
}

textarea {
  min-height: 40px;
  max-height: 96px; /* 4行 * 24px/行 */
  overflow-y: auto;
}
</style>