import axios from 'axios';
import type { Career, University, User, Question, ApiResponse, SubscriptionPlan, DashboardMetrics } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://edumatch-hfg8.onrender.com/api';
const removeStoredToken = () => {
  try {
    localStorage.removeItem('edumatch_token');
  } catch {
    // Ignore storage access errors in restricted browser contexts.
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicSettingsService = {
  getPublicSettings: async (): Promise<ApiResponse<{ appTitle: string; maintenanceMode: boolean; allowRegistration: boolean }>> => {
    const response = await apiClient.get('/settings/public');
    return response.data;
  },
};

// Automatically inject Authorization Header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edumatch_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler: handle 401 by clearing token and reloading (forces re-auth)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url: string = error?.config?.url || '';
      // Skip auto-reload for auth endpoints — let the caller handle the error message
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google');
      if (!isAuthEndpoint) {
        removeStoredToken();
        if (typeof window !== 'undefined') window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  success: boolean;
  message: string;
  data: User;
  token: string;
}

// ─── AUTH SERVICES ──────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, school?: string, role?: string, grade?: string, majorInterest?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { name, email, password, school, role, grade, majorInterest });
    return response.data;
  },
  loginViaGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', { token: idToken });
    return response.data;
  },
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

// ─── PROFILE SERVICES ───────────────────────────────────────
export const profileService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },
  updateProfile: async (name: string, school: string, grade: string, majorInterest: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/profile', {
      name,
      academicInfo: { school, grade, majorInterest },
    });
    return response.data;
  },
  updateAcademicProfile: async (school: string, grade: string, majorInterest: string, subjects: Record<string, number>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/profile/academic', {
      school,
      grade,
      majorInterest,
      subjects,
    });
    return response.data;
  },
  updateSkillEvaluation: async (scores: Record<string, number>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/profile/skills', { scores });
    return response.data;
  },
  upgradeToPro: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/profile/upgrade');
    return response.data;
  },
};

// ─── CAREER SERVICES ────────────────────────────────────────
export const careerService = {
  getCareers: async (search?: string, category?: string): Promise<ApiResponse<Career[]>> => {
    const response = await apiClient.get('/careers', { params: { search, category } });
    return response.data;
  },
  getCareerById: async (id: string): Promise<ApiResponse<Career>> => {
    const response = await apiClient.get(`/careers/${id}`);
    return response.data;
  },
  toggleFavorite: async (id: string): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.post(`/careers/${id}/favorite`);
    return response.data;
  },
  getFavorites: async (): Promise<ApiResponse<Career[]>> => {
    const response = await apiClient.get('/careers/favorites/list');
    return response.data;
  },
};

// ─── UNIVERSITY SERVICES ────────────────────────────────────
export const universityService = {
  getUniversities: async (search?: string, location?: string): Promise<ApiResponse<University[]>> => {
    const response = await apiClient.get('/universities', { params: { search, location } });
    return response.data;
  },
  getUniversityById: async (id: string): Promise<ApiResponse<University>> => {
    const response = await apiClient.get(`/universities/${id}`);
    return response.data;
  },
  trackView: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/universities/${id}/view`);
    return response.data;
  },
  getMyUniversity: async (): Promise<ApiResponse<University>> => {
    const response = await apiClient.get('/universities/managed/my-university');
    return response.data;
  },
  updateMyUniversity: async (data: Partial<University>): Promise<ApiResponse<University>> => {
    const response = await apiClient.put('/universities/managed/my-university', data);
    return response.data;
  },
};

// ─── ARTICLE SERVICES ───────────────────────────────────────
export const articleService = {
  getArticles: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/articles');
    return response.data;
  },
  getArticleById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/articles/${id}`);
    return response.data;
  },
};

// ─── AI CHAT & RECOMMENDATION SERVICES ──────────────────────
export const aiApiService = {
  getRecommendations: async (surveyData: any): Promise<any> => {
    const response = await apiClient.post('/recommendations', surveyData);
    return response.data;
  },
  sendMessage: async (
    chatHistory: { role: string; content: string }[],
    conversationId?: string
  ): Promise<any> => {
    const response = await apiClient.post('/chat', { chatHistory, conversationId });
    return response.data;
  },
  // Active conversation
  getChatHistory: async (): Promise<any> => {
    const response = await apiClient.get('/chat/history');
    return response.data;
  },
  clearChatHistory: async (): Promise<any> => {
    const response = await apiClient.delete('/chat/history');
    return response.data;
  },
  // All conversations
  getConversations: async (): Promise<any> => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },
  getConversationById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/chat/conversations/${id}`);
    return response.data;
  },
  renameConversation: async (id: string, title: string): Promise<any> => {
    const response = await apiClient.patch(`/chat/conversations/${id}/rename`, { title });
    return response.data;
  },
  deleteConversation: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/chat/conversations/${id}`);
    return response.data;
  },
};

// ─── SURVEY HISTORY SERVICES ────────────────────────────────
export const surveyHistoryService = {
  save: async (answers: any, result: any, title?: string): Promise<any> => {
    const response = await apiClient.post('/survey-history', { answers, result, title });
    return response.data;
  },
  getAll: async (): Promise<any> => {
    const response = await apiClient.get('/survey-history');
    return response.data;
  },
  getById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/survey-history/${id}`);
    return response.data;
  },
  rename: async (id: string, title: string): Promise<any> => {
    const response = await apiClient.patch(`/survey-history/${id}/rename`, { title });
    return response.data;
  },
  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/survey-history/${id}`);
    return response.data;
  },
};

export const recommendationFeedbackService = {
  submit: async (payload: {
    result: any;
    surveyHistoryId?: string;
    perceivedAccuracy: number;
    topCareerFit: 'interested' | 'unsure' | 'not_interested';
    comment?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/recommendation-feedback', payload);
    return response.data;
  },
};

export const surveyService = {
  getQuestions: async (): Promise<ApiResponse<Question[]>> => {
    const response = await apiClient.get('/survey-questions');
    return response.data;
  },
};

// ─── FEEDBACK SERVICES ──────────────────────────────────────
export const feedbackService = {
  submitFeedback: async (name: string, email: string, message: string, rating: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/feedback', { name, email, message, rating });
    return response.data;
  },
};

// ─── ADMIN SERVICES ─────────────────────────────────────────
export const adminService = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  updateUser: async (id: string, name: string, email: string, role: string, isPro: boolean): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/admin/users/${id}`, { name, email, role, isPro });
    return response.data;
  },
  deleteUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
  getSystemAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    return response.data;
  },
  getFeedbackLogs: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/feedback');
    return response.data;
  },
  deleteFeedback: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/feedback/${id}`);
    return response.data;
  },
  createCareer: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/careers', data);
    return response.data;
  },
  updateCareer: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/careers/${id}`, data);
    return response.data;
  },
  deleteCareer: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/careers/${id}`);
    return response.data;
  },
  createUniversity: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/universities', data);
    return response.data;
  },
  updateUniversity: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/universities/${id}`, data);
    return response.data;
  },
  deleteUniversity: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/universities/${id}`);
    return response.data;
  },
  getSettings: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },
  updateSettings: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/admin/settings', data);
    return response.data;
  },
  getAllSurveys: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/admin/surveys');
    return response.data;
  },
  getRecommendationFeedbacks: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/admin/recommendation-feedbacks');
    return response.data;
  },
  getPayments: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/admin/payments');
    return response.data;
  },
  getChats: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/admin/chats');
    return response.data;
  },
  getUserActivity: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data;
  },
};

// ─── PAYMENT SERVICES ────────────────────────────────────────
export interface PaymentCreateResponse {
  orderCode: number;
  amount: number;
  status: string;
  checkoutUrl: string;
  qrCode: string;
  expiredAt: string;
}

export interface PaymentStatusResponse {
  status: string;
}

export const paymentService = {
  createPayment: async (planId: string): Promise<PaymentCreateResponse> => {
    const response = await apiClient.post('/payments/create', { planId });
    return response.data;
  },
  checkStatus: async (orderCode: number | string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get(`/payments/${orderCode}`);
    return response.data;
  },
};

// ─── SUBSCRIPTION PLAN SERVICES ─────────────────────────────
export const planService = {
  getActivePlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },
};

export const adminPlanService = {
  getPlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },
  getPlanById: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiClient.get(`/admin/plans/${id}`);
    return response.data;
  },
  createPlan: async (data: Partial<SubscriptionPlan>): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiClient.post('/admin/plans', data);
    return response.data;
  },
  updatePlan: async (id: string, data: Partial<SubscriptionPlan>): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiClient.put(`/admin/plans/${id}`, data);
    return response.data;
  },
  deletePlan: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/plans/${id}`);
    return response.data;
  },
  getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await apiClient.get('/admin/plans/dashboard');
    return response.data;
  },
};

