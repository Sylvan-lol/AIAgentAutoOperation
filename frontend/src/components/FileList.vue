<template>
  <div class="file-manager h-full flex flex-col bg-[#f5f5f7] font-sans">
    <!-- 顶部栏 -->
    <div class="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/50 px-5 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-[#0071e3]/10 rounded-lg flex items-center justify-center">
          <svg class="w-4.5 h-4.5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-[#1d1d1f]">文件管理器</h2>
          <p class="text-[10px] text-[#86868b]">{{ statusText }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button @click="showRoots = !showRoots" title="切换根目录" :class="['p-1.5 rounded-lg transition-all', showRoots ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/5']">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
        </button>
        <button v-if="!showRoots" @click="showNewFolderModal = true" class="p-1.5 text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/5 rounded-lg transition-all" title="新建文件夹">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0v6m0-6h6m-6 0H6"/></svg>
        </button>
        <button v-if="!showRoots" @click="showNewFileModal = true" class="p-1.5 text-[#86868b] hover:text-[#34c759] hover:bg-[#34c759]/5 rounded-lg transition-all" title="新建文件">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
        </button>
        <button @click="refreshCurrent" class="p-1.5 text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/5 rounded-lg transition-all" title="刷新">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
        </button>
      </div>
    </div>

    <!-- 根目录选择面板 -->
    <div v-if="showRoots" class="flex-1 overflow-y-auto px-5 py-4">
      <h3 class="text-sm font-semibold text-[#1d1d1f] mb-3">选择要浏览的目录</h3>
      <div class="grid grid-cols-1 gap-2">
        <div v-for="root in roots" :key="root.path"
          class="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/80 rounded-xl hover:bg-white/80 hover:shadow-apple cursor-pointer transition-all duration-200"
          @click="navigateToPath(root.path)">
          <div class="w-10 h-10 bg-[#0071e3]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-[#1d1d1f]">{{ root.label }}</p>
            <p class="text-[10px] text-[#86868b] mt-0.5">{{ root.path }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件浏览器模式 -->
    <template v-if="!showRoots">
      <!-- 地址栏 -->
      <div class="bg-white/40 backdrop-blur-sm border-b border-[#d2d2d7]/30 px-5 py-2 flex items-center gap-1 text-xs flex-shrink-0 overflow-x-auto">
        <button @click="showRoots = true" class="px-2 py-1 rounded-md hover:bg-white/60 text-[#86868b] hover:text-[#0071e3] transition-colors flex-shrink-0 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          根目录
        </button>
        <div v-for="(seg, idx) in pathSegments" :key="'ps-'+idx" class="flex items-center">
          <svg class="w-3 h-3 text-[#86868b]/50 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          <button @click="navigateToPath(seg.fullPath)" :class="['px-2 py-1 rounded-md hover:bg-white/60 transition-colors', idx === pathSegments.length - 1 ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b] hover:text-[#0071e3]']">{{ seg.name }}</button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-0.5" ref="listContainer"
        @click.self="selectedPath = ''">
        <!-- 加载中 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <svg class="animate-spin h-6 w-6 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>

        <!-- 空状态 -->
        <div v-else-if="items.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 bg-[#0071e3]/5 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-[#0071e3]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>
          </div>
          <p class="text-sm text-[#86868b] font-medium">此文件夹为空</p>
        </div>

        <!-- 文件列表 -->
        <div v-for="item in items" :key="item.path"
          :class="['flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group',
            selectedPath === item.path ? 'bg-[#0071e3]/10 ring-1 ring-[#0071e3]/30' : 'hover:bg-white/60']"
          @click="selectedPath = item.path"
          @dblclick="openItem(item)">
          <!-- 图标 -->
          <div class="w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
            <svg v-if="item.isDirectory" class="w-6 h-6 text-[#ff9500]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>
            <svg v-else class="w-5 h-5 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          </div>
          <!-- 名称 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-[#1d1d1f] truncate font-medium">{{ item.name }}</p>
            <p class="text-[10px] text-[#86868b] mt-0.5">
              <template v-if="item.isDirectory">文件夹</template>
              <template v-else>{{ formatSize(item.size) }} · {{ formatDate(item.modifiedAt) }}</template>
            </p>
          </div>
          <!-- 操作按钮 -->
          <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
            <button v-if="item.isDirectory" @click.stop="navigateToPath(item.path)" class="p-1.5 text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/5 rounded-lg" title="打开">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </button>
            <button v-if="item.isFile" @click.stop="openFileEdit(item)" class="p-1.5 text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/5 rounded-lg" title="编辑">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
            <button @click.stop="openRename(item)" class="p-1.5 text-[#86868b] hover:text-[#ff9500] hover:bg-[#ff9500]/5 rounded-lg" title="重命名">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
            </button>
            <button @click.stop="openDelete(item)" class="p-1.5 text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/5 rounded-lg" title="删除">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 模态框（与之前相同，但适配新的 API） ===== -->

    <!-- 新建文件 -->
    <div v-if="showNewFileModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showNewFileModal = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl p-6 w-[28rem] mx-4 border border-white/50">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#34c759]/10 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg></div>
          <div><h3 class="text-lg font-semibold text-[#1d1d1f]">新建文件</h3><p class="text-xs text-[#86868b]">在 {{ currentDirName }} 下创建</p></div>
        </div>
        <div class="space-y-4">
          <div><label class="block text-xs font-medium text-[#86868b] mb-1.5">文件名</label><input v-model="newFileName" @keydown.enter="createFile" placeholder="例如：readme.txt" class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"/></div>
          <div><label class="block text-xs font-medium text-[#86868b] mb-1.5">内容（可选）</label><textarea v-model="newFileContent" placeholder="输入文件内容" class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all resize-none" rows="4"></textarea></div>
          <div class="flex justify-end gap-3 pt-2">
            <button @click="showNewFileModal = false" class="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">取消</button>
            <button @click="createFile" class="px-5 py-2.5 text-sm font-medium text-white bg-[#34c759] rounded-xl hover:bg-[#30d158] transition-all">创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文件夹 -->
    <div v-if="showNewFolderModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showNewFolderModal = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl p-6 w-[28rem] mx-4 border border-white/50">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#0071e3]/10 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-[#0071e3]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg></div>
          <div><h3 class="text-lg font-semibold text-[#1d1d1f]">新建文件夹</h3><p class="text-xs text-[#86868b]">在 {{ currentDirName }} 下创建</p></div>
        </div>
        <div class="space-y-4">
          <div><label class="block text-xs font-medium text-[#86868b] mb-1.5">文件夹名称</label><input v-model="newFolderName" @keydown.enter="createFolder" placeholder="例如：我的文档" class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"/></div>
          <div class="flex justify-end gap-3 pt-2">
            <button @click="showNewFolderModal = false" class="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">取消</button>
            <button @click="createFolder" class="px-5 py-2.5 text-sm font-medium text-white bg-[#0071e3] rounded-xl hover:bg-[#0077ed] transition-all">创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑文件 -->
    <div v-if="showFileEditModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showFileEditModal = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl p-6 w-[36rem] mx-4 border border-white/50">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#0071e3]/10 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg></div>
            <div><h3 class="text-lg font-semibold text-[#1d1d1f]">{{ editTarget.name }}</h3><p class="text-xs text-[#86868b]">{{ formatSize(editTarget.size) }}</p></div>
          </div>
          <button @click="showFileEditModal = false" class="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="space-y-4">
          <textarea v-model="editContent" class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all resize-none font-mono" rows="12"></textarea>
          <div class="flex justify-end gap-3">
            <button @click="showFileEditModal = false" class="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">取消</button>
            <button @click="saveFileEdit" class="px-5 py-2.5 text-sm font-medium text-white bg-[#0071e3] rounded-xl hover:bg-[#0077ed] transition-all flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名 -->
    <div v-if="showRenameModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showRenameModal = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl p-6 w-[28rem] mx-4 border border-white/50">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#ff9500]/10 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-[#ff9500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg></div>
          <div><h3 class="text-lg font-semibold text-[#1d1d1f]">重命名</h3><p class="text-xs text-[#86868b]">{{ renameTarget?.name }}</p></div>
        </div>
        <div class="space-y-4">
          <input v-model="renameNewName" @keydown.enter="confirmRename" placeholder="输入新名称" class="w-full px-4 py-3 bg-white/80 border border-[#d2d2d7] rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"/>
          <div class="flex justify-end gap-3 pt-2">
            <button @click="showRenameModal = false" class="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">取消</button>
            <button @click="confirmRename" class="px-5 py-2.5 text-sm font-medium text-white bg-[#ff9500] rounded-xl hover:bg-[#ffa03a] transition-all">确认</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件预览模态框 -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showPreviewModal = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl mx-4 border border-white/50 flex flex-col" style="width: min(90vw, 900px); height: min(85vh, 700px);">
        <!-- 预览头部 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#d2d2d7]/30 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#0071e3]/10 rounded-xl flex items-center justify-center">
              <template v-if="previewType === 'image'"><svg class="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/></svg></template>
              <template v-else-if="previewType === 'pdf'"><svg class="w-5 h-5 text-[#ff3b30]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg></template>
              <template v-else><svg class="w-5 h-5 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg></template>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-[#1d1d1f]">{{ previewData.name }}</h3>
              <p class="text-xs text-[#86868b]">{{ formatSize(previewData.size) }} · {{ previewType === 'image' ? '图片' : previewType === 'pdf' ? 'PDF' : previewType === 'office' ? 'Office 文档' : previewType === 'video' ? '视频' : previewType === 'audio' ? '音频' : '文件' }}</p>
            </div>
          </div>
          <button @click="showPreviewModal = false" class="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <!-- 预览内容 -->
        <div class="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#f5f5f7]/50">
          <!-- 图片预览 -->
          <img v-if="previewType === 'image'" :src="'data:' + previewData.mime + ';base64,' + previewData.base64" :alt="previewData.name" class="max-w-full max-h-full object-contain rounded-xl" />
          <!-- PDF 预览 -->
          <iframe v-else-if="previewType === 'pdf'" :src="'data:' + previewData.mime + ';base64,' + previewData.base64" class="w-full h-full rounded-xl" frameborder="0"></iframe>
          <!-- Office 文档（用 Google Docs Viewer 或直链） -->
          <div v-else-if="previewType === 'office'" class="flex flex-col items-center justify-center text-center p-8">
            <div class="w-20 h-20 bg-[#0071e3]/10 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            </div>
            <p class="text-sm text-[#86868b]">预览 Office 文档需要下载后查看</p>
            <a :href="'data:' + previewData.mime + ';base64,' + previewData.base64" :download="previewData.name" class="mt-4 px-6 py-2.5 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ed] transition-all">下载文件</a>
          </div>
          <!-- 视频预览 -->
          <video v-else-if="previewType === 'video'" controls class="max-w-full max-h-full rounded-xl" :src="'data:' + previewData.mime + ';base64,' + previewData.base64"></video>
          <!-- 音频预览 -->
          <div v-else-if="previewType === 'audio'" class="flex flex-col items-center justify-center p-8">
            <div class="w-20 h-20 bg-[#34c759]/10 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/></svg>
            </div>
            <audio controls class="w-full max-w-md" :src="'data:' + previewData.mime + ';base64,' + previewData.base64"></audio>
          </div>
          <!-- 其他 -->
          <div v-else class="flex flex-col items-center justify-center">
            <p class="text-sm text-[#86868b]">无法预览此文件类型</p>
            <a :href="'data:' + previewData.mime + ';base64,' + previewData.base64" :download="previewData.name" class="mt-4 px-6 py-2.5 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ed] transition-all">下载文件</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
      <div class="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-apple-xl p-6 w-80 mx-4 border border-white/50">
        <div class="text-center">
          <div class="w-12 h-12 bg-[#ff3b30]/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6 text-[#ff3b30]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg></div>
          <h3 class="text-lg font-semibold text-[#1d1d1f] mb-2">确认删除</h3>
          <p class="text-sm text-[#86868b] mb-6">确定要删除 <span class="font-medium text-[#1d1d1f]">{{ deleteTarget?.name }}</span> 吗？不可撤销。</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false" class="flex-1 py-2.5 text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">取消</button>
            <button @click="confirmDelete" class="flex-1 py-2.5 text-sm font-medium text-white bg-[#ff3b30] rounded-xl hover:bg-[#ff6259] transition-all">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fileApi } from '../api';

// ===== 状态 =====
const roots = ref([]);
const showRoots = ref(true);
const items = ref([]);
const currentPath = ref('');
const loading = ref(false);
const selectedPath = ref('');

// 新建
const showNewFileModal = ref(false);
const newFileName = ref('');
const newFileContent = ref('');
const showNewFolderModal = ref(false);
const newFolderName = ref('');

// 编辑
const showFileEditModal = ref(false);
const editTarget = ref({ name: '', size: 0, path: '' });
const editContent = ref('');

// 重命名
const showRenameModal = ref(false);
const renameTarget = ref(null);
const renameNewName = ref('');

// 删除
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

// ===== 计算属性 =====
const pathSegments = computed(() => {
  if (!currentPath.value) return [];
  // 拆分路径为段，构建面包屑
  const parts = currentPath.value.split(/[\\/]/).filter(p => p !== '');
  const segments = [];
  let accumulated = '';
  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      accumulated = parts[i];
    } else {
      accumulated = accumulated + '\\' + parts[i];
    }
    // 处理驱动器盘符
    if (i === 0 && parts[i].endsWith(':')) {
      accumulated = parts[i] + '\\';
    } else if (i === 1 && parts[0].endsWith(':')) {
      accumulated = parts[0] + '\\' + parts.slice(1, i+1).join('\\');
    }
    segments.push({
      name: parts[i],
      fullPath: accumulated
    });
  }
  return segments;
});

const currentDirName = computed(() => {
  if (!currentPath.value) return '';
  const parts = currentPath.value.split(/[\\/]/).filter(p => p !== '');
  return parts[parts.length - 1] || currentPath.value;
});

const statusText = computed(() => {
  if (showRoots.value) return '选择目录开始浏览';
  if (loading.value) return '加载中...';
  return `${items.value.filter(i => i.isDirectory).length} 个文件夹 · ${items.value.filter(i => i.isFile).length} 个文件`;
});

// ===== 核心函数 =====
async function loadRoots() {
  try {
    const res = await fileApi.getRoots();
    roots.value = res.roots || [];
  } catch (e) {
    console.error('Failed to load roots:', e);
  }
}

async function navigateToPath(absPath) {
  loading.value = true;
  showRoots.value = false;
  selectedPath.value = '';
  try {
    const res = await fileApi.listDirectory(absPath);
    items.value = res.items || [];
    currentPath.value = res.currentPath || absPath;
  } catch (e) {
    console.error('Failed to navigate:', e);
    alert('无法访问该路径: ' + (e.response?.data?.message || e.message));
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function refreshCurrent() {
  if (currentPath.value) {
    navigateToPath(currentPath.value);
  } else {
    loadRoots();
  }
}

// ===== 可预览的文件类型 =====
const TEXT_EXTENSIONS = ['.txt','.md','.json','.js','.ts','.jsx','.tsx','.vue','.html','.htm','.css','.scss','.less','.py','.java','.cpp','.c','.h','.php','.rb','.go','.rs','.swift','.kt','.sql','.log','.xml','.yaml','.yml','.csv','.env','.gitignore','.ini','.cfg','.conf','.sh','.bat','.ps1','.rb','.pl','.lua','.r','.m','.mm','.gradle','.properties'];
const IMAGE_EXTENSIONS = ['.png','.jpg','.jpeg','.gif','.bmp','.webp','.svg','.ico'];
const PREVIEW_EXTENSIONS = ['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.mp4','.mp3'];

const showPreviewModal = ref(false);
const previewData = ref({ base64: '', mime: '', name: '', size: 0 });
const previewType = ref(''); // 'image', 'pdf', 'text', 'other'

// ===== 文件操作 =====
async function openItem(item) {
  if (item.isDirectory) {
    navigateToPath(item.path);
    return;
  }
  const ext = getExtension(item.name);
  
  if (IMAGE_EXTENSIONS.includes(ext)) {
    await openFilePreview(item);
  } else if (PREVIEW_EXTENSIONS.includes(ext)) {
    await openFilePreview(item);
  } else if (TEXT_EXTENSIONS.includes(ext)) {
    await openFileEdit(item);
  } else {
    // 未知类型，尝试作为文本打开
    await openFileEdit(item);
  }
}

function getExtension(name) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.substring(idx).toLowerCase();
}

async function openFilePreview(item) {
  try {
    const res = await fileApi.previewFile(item.path);
    if (res.status === 'success') {
      previewData.value = {
        base64: res.base64,
        mime: res.mime,
        name: res.name,
        size: res.size
      };
      const mime = res.mime;
      if (mime.startsWith('image/')) previewType.value = 'image';
      else if (mime === 'application/pdf') previewType.value = 'pdf';
      else if (mime.includes('officedocument') || mime.includes('msword') || mime.includes('ms-excel') || mime.includes('ms-powerpoint')) previewType.value = 'office';
      else if (mime.startsWith('video/')) previewType.value = 'video';
      else if (mime.startsWith('audio/')) previewType.value = 'audio';
      else previewType.value = 'other';
      showPreviewModal.value = true;
    } else {
      alert('预览失败: ' + (res.message || '未知错误'));
    }
  } catch (e) {
    // 如果预览失败，尝试作为文本打开
    console.log('Preview failed, trying text edit:', e.message);
    await openFileEdit(item);
  }
}

async function openFileEdit(item) {
  try {
    const res = await fileApi.readFile(item.path);
    editTarget.value = { name: item.name, size: item.size, path: item.path };
    editContent.value = res.content || '';
    showFileEditModal.value = true;
  } catch (e) {
    alert('读取失败: ' + (e.response?.data?.message || e.message));
  }
}

async function saveFileEdit() {
  try {
    await fileApi.writeFile(editTarget.value.path, editContent.value);
    showFileEditModal.value = false;
    refreshCurrent();
  } catch (e) {
    alert('保存失败: ' + (e.response?.data?.message || e.message));
  }
}

async function createFile() {
  if (!newFileName.value.trim()) { alert('请输入文件名'); return; }
  const fullPath = currentPath.value + '\\' + newFileName.value.trim();
  try {
    await fileApi.writeFile(fullPath, newFileContent.value);
    showNewFileModal.value = false;
    newFileName.value = '';
    newFileContent.value = '';
    refreshCurrent();
  } catch (e) {
    alert('创建失败: ' + (e.response?.data?.message || e.message));
  }
}

async function createFolder() {
  if (!newFolderName.value.trim()) { alert('请输入文件夹名称'); return; }
  const fullPath = currentPath.value + '\\' + newFolderName.value.trim();
  try {
    await fileApi.createDirectory(fullPath);
    showNewFolderModal.value = false;
    newFolderName.value = '';
    refreshCurrent();
  } catch (e) {
    alert('创建失败: ' + (e.response?.data?.message || e.message));
  }
}

function openRename(item) {
  renameTarget.value = item;
  renameNewName.value = item.name;
  showRenameModal.value = true;
}

async function confirmRename() {
  if (!renameNewName.value.trim()) { alert('请输入新名称'); return; }
  const dir = renameTarget.value.path.substring(0, renameTarget.value.path.lastIndexOf('\\') + 1);
  const newPath = dir + renameNewName.value.trim();
  try {
    await fileApi.renameItem(renameTarget.value.path, newPath);
    showRenameModal.value = false;
    renameTarget.value = null;
    refreshCurrent();
  } catch (e) {
    alert('重命名失败: ' + (e.response?.data?.message || e.message));
  }
}

function openDelete(item) {
  deleteTarget.value = item;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  try {
    await fileApi.deleteItem(deleteTarget.value.path);
    showDeleteConfirm.value = false;
    deleteTarget.value = null;
    refreshCurrent();
  } catch (e) {
    alert('删除失败: ' + (e.response?.data?.message || e.message));
  }
}

// ===== 工具函数 =====
function formatSize(size) {
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024*1024)).toFixed(1)} MB`;
  return `${(size / (1024*1024*1024)).toFixed(2)} GB`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ===== 生命周期 =====
onMounted(() => {
  loadRoots();
});
</script>

<style scoped>
.file-manager {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
}
.file-manager ::-webkit-scrollbar { width: 4px; }
.file-manager ::-webkit-scrollbar-track { background: transparent; }
.file-manager ::-webkit-scrollbar-thumb { background: #d2d2d7; border-radius: 2px; }
</style>
