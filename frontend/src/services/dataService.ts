import type { Career, University, ApiResponse } from '../types';
import { careerService, universityService } from './api';

// ─────────────────────────────────────────────────────────────
// Career Service
// Abstracts data source. Uses axios-based backend services.
// ─────────────────────────────────────────────────────────────

export const getCareers = async (): Promise<ApiResponse<Career[]>> => {
  try {
    const response = await careerService.getCareers();
    if (response.success && response.data) {
      return { data: response.data, message: response.message || 'Careers fetched', success: true };
    }
  } catch (err) {
    console.warn('Backend careers fetch failed:', err);
    return { data: [], message: 'Failed to fetch careers from backend', success: false };
  }
  return { data: [], message: 'No careers available', success: false };
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
    console.warn(`Backend career ${id} fetch failed:`, err);
    return { data: undefined, message: `Failed to fetch career ${id}`, success: false };
  }
  return { data: undefined, message: `No career found for ${id}`, success: false };
};

// ─────────────────────────────────────────────────────────────
// University Service
// ─────────────────────────────────────────────────────────────

export const getUniversities = async (): Promise<ApiResponse<University[]>> => {
  try {
    const response = await universityService.getUniversities();
    if (response.success && response.data) {
      return { data: response.data, message: response.message || 'Universities fetched', success: true };
    }
  } catch (err) {
    console.warn('Backend universities fetch failed:', err);
    return { data: [], message: 'Failed to fetch universities from backend', success: false };
  }
  return { data: [], message: 'No universities available', success: false };
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
    console.warn(`Backend university ${id} fetch failed:`, err);
    return { data: undefined, message: `Failed to fetch university ${id}`, success: false };
  }
  return { data: undefined, message: `No university found for ${id}`, success: false };
};
