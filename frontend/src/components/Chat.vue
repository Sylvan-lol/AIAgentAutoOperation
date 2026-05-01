<template>
  <div class="chat-container flex flex-col h-full bg-[#f5f5f7]">
    <!-- 聊天头部 -->
    <div class="chat-header bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/50 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-[#0071e3] rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-semibold text-[#1d1d1f]">AI 助手</h2>
            <p class="text-xs text-[#86868b]">由 Open Claw 驱动</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="chatStore.clearMessages()"
            class="px-3 py-1.5 text-xs text-[#86868b] bg-white/50 border border-[#d2d2d7] rounded-lg hover:bg-white hover:text-[#1d1d1f] transition-all"
          >
            清空对话
          </button>
          <button
            @click="showLogout = true"
            class="w-8 h-8 flex items-center justify-center text-[#86868b] hover:text-[#ff3b30] rounded-lg hover:bg-[#ff3b30]/5 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages flex-1 overflow-y-auto px-6 py-4 space-y-4" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index">
        <!-- 用户消息 -->
        <div v-if="message.role === 'user'" class="flex justify-end mb-4">
          <div class="max-w-[75%] bg-[#0071e3] text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed shadow-sm">
            {{ message.content }}
          </div>
        </div>
        <!-- AI 消息 -->
        <div v-else class="flex justify-start mb-4">
          <div class="flex items-start gap-2 max-w-[80%]">
            <div class="w-8 h-8 bg-[#0071e3]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div class="bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl rounded-bl-md text-sm text-[#1d1d1f] leading-relaxed shadow-apple border border-white/50">
              {{ message.content }}
              <div v-if="loading && index === messages.length - 1" class="inline-flex ml-1">
                <span class="animate-pulse">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && messages[messages.length - 1]?.role !== 'assistant'" class="flex justify-start mb-4">
        <div class="flex items-start gap-2">
          <div class="w-8 h-8 bg-[#0071e3]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div class="bg-white/80 backdrop-blur-xl px-5 py-3.5 rounded-2xl rounded-bl-md shadow-apple border border-white/50">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 bg-[#0071e3] rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-[#0071e3] rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-[#0071e3] rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input bg-white/80 backdrop-blur-xl border-t border-[#d2d2d7]/50 px-6 py-4">
      <form @submit.prevent="sendMessage" class="flex items-end gap-2">
        <div class="flex-1 relative">
          <textarea
            v-model="inputMessage"
            placeholder="输入消息..."
            class="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] resize-none transition-all"
            :disabled="loading"
            rows="1"
            maxlength="1000"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
            ref="textarea"
          ></textarea>
        </div>
        <button
          type="submit"
          class="px-4 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ed] disabled:bg-[#0071e3]/40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
          :disabled="loading || !inputMessage.trim()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span class="hidden sm:inline">发送</span>
        </button>
      </form>
    </div>

    <!-- 确认退出弹窗 -->
    <div v-if="showLogout" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showLogout = false">
      <div class="bg-white rounded-2xl shadow-apple-xl p-6 w-80 mx-4 border border-white/50">
        <div class="text-center">
          <div class="w-12 h-12 bg-[#ff3b30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-[#ff3b30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-[#1d1d1f] mb-2">退出登录</h3>
          <p class="text-sm text-[#86868b] mb-6">确定要退出登录吗？</p>
          <div class="flex gap-3">
            <button
              @click="showLogout = false"
              class="flex-1 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all"
            >
              取消
            </button>
            <button
              @click="handleLogout"
              class="flex-1 py-2.5 text-sm font-medium text-white bg-[#ff3b30] rounded-xl hover:bg-[#ff6259] transition-all"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

const chatStore = useChatStore();
const authStore = useAuthStore();
const emit = defineEmits(['logout']);

const inputMessage = ref('');
const messagesContainer = ref(null);
const textarea = ref(null);
const showLogout = ref(false);

const messages = computed(() => chatStore.messages);
const loading = computed(() => chatStore.loading);

const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message) return;

  await chatStore.sendMessage(message);
  inputMessage.value = '';
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
    textarea.value.style.height = 'auto';
    const maxHeight = 96;
    const newHeight = Math.min(textarea.value.scrollHeight, maxHeight);
    textarea.value.style.height = `${newHeight}px`;
  }
};

const handleLogout = () => {
  showLogout.value = false;
  authStore.logout();
  emit('logout');
};

watch(messages, scrollToBottom, { deep: true });

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

textarea {
  min-height: 42px;
  max-height: 96px;
  overflow-y: auto;
}

.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: #d2d2d7 transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 2px;
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>