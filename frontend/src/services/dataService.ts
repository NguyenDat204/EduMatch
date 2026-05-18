import type { Career, University, ApiResponse } from '../types';
import { mockCareers, mockUniversities } from '../mock/data';
import { careerService, universityService } from './api';

// ─────────────────────────────────────────────────────────────
// Career Service
// Abstracts data source. Swap mock return for axios calls.
// ─────────────────────────────────────────────────────────────

export const getCareers = async (): Promise<ApiResponse<Career[]>> => {
  try {
    const response = await careerService.getCareers();
    if (response.success && response.data && response.data.length > 0) {
      return {
        data: response.data,
        message: 'Careers fetched successfully from backend',
        success: true
      };
    }
  } catch (err) {
    console.warn("Backend careers fetch failed, falling back to mock data:", err);
  }
  
  return {
    data: mockCareers,
    message: 'Careers fetched successfully (Mock)',
    success: true,
  };
};

export const getCareerById = async (id: string): Promise<ApiResponse<Career | undefined>> => {
  try {
    const response = await careerService.getCareerById(id);
    if (response.success && response.data) {
      return {
        data: response.data,
        message: 'Career fetched successfully from backend',
        success: true
      };
    }
  } catch (err) {
    console.warn(`Backend career ${id} fetch failed, falling back to mock:`, err);
  }

  return {
    data: mockCareers.find(c => c.id === id) || mockCareers[0],
    message: 'Career fetched successfully (Mock)',
    success: true,
  };
};

// ─────────────────────────────────────────────────────────────
// University Service
// ─────────────────────────────────────────────────────────────

export const getUniversities = async (): Promise<ApiResponse<University[]>> => {
  try {
    const response = await universityService.getUniversities();
    if (response.success && response.data && response.data.length > 0) {
      return {
        data: response.data,
        message: 'Universities fetched successfully from backend',
        success: true
      };
    }
  } catch (err) {
    console.warn("Backend universities fetch failed, falling back to mock:", err);
  }

  return {
    data: mockUniversities,
    message: 'Universities fetched successfully (Mock)',
    success: true,
  };
};

export const getUniversityById = async (id: string): Promise<ApiResponse<University | undefined>> => {
  try {
    const response = await universityService.getUniversityById(id);
    if (response.success && response.data) {
      return {
        data: response.data,
        message: 'University fetched successfully from backend',
        success: true
      };
    }
  } catch (err) {
    console.warn(`Backend university ${id} fetch failed, falling back to mock:`, err);
  }

  return {
    data: mockUniversities.find(u => u.id === id) || mockUniversities[0],
    message: 'University fetched successfully (Mock)',
    success: true,
  };
};
