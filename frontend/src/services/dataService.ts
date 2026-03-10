import type { Career, University, ApiResponse } from '../types';
import { mockCareers, mockUniversities } from '../mock/data';

// ─────────────────────────────────────────────────────────────
// Career Service
// Abstracts data source. Swap mock return for axios calls
// when connecting the backend.
// ─────────────────────────────────────────────────────────────

export const getCareers = async (): Promise<ApiResponse<Career[]>> => {
  // TODO: Replace with: return (await axios.get('/api/careers')).data;
  return {
    data: mockCareers,
    message: 'Careers fetched successfully',
    success: true,
  };
};

export const getCareerById = async (id: string): Promise<ApiResponse<Career | undefined>> => {
  // TODO: Replace with: return (await axios.get(`/api/careers/${id}`)).data;
  return {
    data: mockCareers.find(c => c.id === id),
    message: 'Career fetched successfully',
    success: true,
  };
};

// ─────────────────────────────────────────────────────────────
// University Service
// ─────────────────────────────────────────────────────────────

export const getUniversities = async (): Promise<ApiResponse<University[]>> => {
  // TODO: Replace with: return (await axios.get('/api/universities')).data;
  return {
    data: mockUniversities,
    message: 'Universities fetched successfully',
    success: true,
  };
};

export const getUniversityById = async (id: string): Promise<ApiResponse<University | undefined>> => {
  // TODO: Replace with: return (await axios.get(`/api/universities/${id}`)).data;
  return {
    data: mockUniversities.find(u => u.id === id),
    message: 'University fetched successfully',
    success: true,
  };
};
