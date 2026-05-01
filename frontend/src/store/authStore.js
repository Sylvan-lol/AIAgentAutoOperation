import { defineStore } from 'pinia';
import { authApi } from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isLoggedIn: !!localStorage.getItem('token')
  }),
  getters: {
    getToken: (state) => state.token,
    isAuthenticated: (state) => state.isLoggedIn,
    currentUser: (state) => state.user
  },
  actions: {
    async register(username, password) {
      try {
        const response = await authApi.register(username, password);
        const data = response.data;
        this.token = data.token;
        this.user = data.user;
        this.isLoggedIn = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        const message = error.response?.data?.message || '注册失败';
        return { success: false, message };
      }
    },
    async login(username, password) {
      try {
        const response = await authApi.login(username, password);
        const data = response.data;
        this.token = data.token;
        this.user = data.user;
        this.isLoggedIn = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        const message = error.response?.data?.message || '登录失败';
        return { success: false, message };
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});