import { defineStore } from 'pinia';
import { fileApi } from '../api';

export const useFileStore = defineStore('file', {
  state: () => ({
    files: []
  }),
  actions: {
    async loadFiles() {
      try {
        const response = await fileApi.listFiles();
        this.files = response.files;
      } catch (error) {
        console.error('Error loading files:', error);
      }
    },
    async readFile(fileName) {
      try {
        const response = await fileApi.readFile(fileName);
        return response.content;
      } catch (error) {
        console.error('Error reading file:', error);
        throw error;
      }
    },
    async createFile(fileName, content) {
      try {
        await fileApi.createFile(fileName, content);
        // 重新加载文件列表
        await this.loadFiles();
      } catch (error) {
        console.error('Error creating file:', error);
        throw error;
      }
    },
    async updateFile(fileName, content) {
      try {
        await fileApi.updateFile(fileName, content);
        // 重新加载文件列表
        await this.loadFiles();
      } catch (error) {
        console.error('Error updating file:', error);
        throw error;
      }
    },
    async deleteFile(fileName) {
      try {
        await fileApi.deleteFile(fileName);
        // 重新加载文件列表
        await this.loadFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    }
  }
});