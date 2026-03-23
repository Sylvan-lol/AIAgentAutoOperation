<template>
  <div class="file-list-container h-full flex flex-col">
    <div class="file-list-header bg-secondary text-white p-4">
      <h2 class="text-xl font-bold">文件管理</h2>
      <button 
        @click="showCreateModal = true"
        class="mt-2 bg-white text-secondary px-3 py-1 rounded hover:bg-gray-100 text-sm"
      >
        创建新文件
      </button>
    </div>
    
    <div class="file-list-content flex-1 overflow-y-auto p-4">
      <div v-if="files.length === 0" class="text-center text-gray-500 py-8">
        暂无文件
      </div>
      <div v-else class="space-y-2">
        <div 
          v-for="file in files" 
          :key="file.name"
          class="file-item p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <div>
            <h3 class="font-medium">{{ file.name }}</h3>
            <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }} · {{ formatDate(file.modifiedAt) }}</p>
          </div>
          <div class="file-actions space-x-2">
            <button 
              @click="readFile(file.name)"
              class="text-primary hover:underline"
            >
              查看
            </button>
            <button 
              @click="deleteFile(file.name)"
              class="text-red-500 hover:underline"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建文件模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">创建新文件</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文件名</label>
            <input 
              v-model="newFileName"
              type="text"
              class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="输入文件名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文件内容</label>
            <textarea 
              v-model="newFileContent"
              class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="输入文件内容"
              rows="4"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              @click="showCreateModal = false"
              class="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              取消
            </button>
            <button 
              @click="createFile"
              class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文件内容模态框 -->
    <div v-if="showFileModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">{{ currentFile.name }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文件内容</label>
            <textarea 
              v-model="currentFile.content"
              class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              rows="6"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              @click="showFileModal = false"
              class="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              关闭
            </button>
            <button 
              @click="updateFile"
              class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFileStore } from '../store/fileStore';

const fileStore = useFileStore();
const showCreateModal = ref(false);
const showFileModal = ref(false);
const newFileName = ref('');
const newFileContent = ref('');
const currentFile = ref({ name: '', content: '' });

const files = computed(() => fileStore.files);

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const readFile = async (fileName) => {
  try {
    const content = await fileStore.readFile(fileName);
    currentFile.value = { name: fileName, content };
    showFileModal.value = true;
  } catch (error) {
    alert('读取文件失败');
  }
};

const deleteFile = async (fileName) => {
  if (confirm(`确定要删除文件 ${fileName} 吗？`)) {
    try {
      await fileStore.deleteFile(fileName);
    } catch (error) {
      alert('删除文件失败');
    }
  }
};

const createFile = async () => {
  if (!newFileName.value.trim()) {
    alert('请输入文件名');
    return;
  }
  
  try {
    await fileStore.createFile(newFileName.value, newFileContent.value);
    showCreateModal.value = false;
    newFileName.value = '';
    newFileContent.value = '';
  } catch (error) {
    alert('创建文件失败');
  }
};

const updateFile = async () => {
  try {
    await fileStore.updateFile(currentFile.value.name, currentFile.value.content);
    showFileModal.value = false;
  } catch (error) {
    alert('保存文件失败');
  }
};

onMounted(async () => {
  try {
    console.log('Loading files...');
    await fileStore.loadFiles();
    console.log('Files loaded successfully');
  } catch (error) {
    console.error('Error loading files in FileList:', error);
  }
});
</script>

<style scoped>
.file-list-container {
  height: 100%;
}

.file-item {
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f8fafc;
}
</style>