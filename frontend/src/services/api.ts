import axios from 'axios';
import type { Career, University, User, ApiResponse } from '../types';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  register: async (name: string, email: string, password: string, school?: string, role?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { name, email, password, school, role });
    return response.data;
  },
  loginViaGoogle: async (email: string, name: string, avatar?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', { email, name, avatar });
    return response.data;
  },
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
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
  sendMessage: async (chatHistory: { role: string; content: string }[]): Promise<any> => {
    const response = await apiClient.post('/chat', { chatHistory });
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
  getSystemAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/admin/analytics');
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
};
