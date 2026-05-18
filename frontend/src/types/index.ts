// ─────────────────────────────────────────────────────────────
// Domain Models
// ─────────────────────────────────────────────────────────────

export interface Career {
  id: string;
  _id?: string;
  title: string;
  description: string;
  salary: string;
  growth: string;
  skills: string[];
  suitability: number;
  category: string;
}

export interface University {
  id: string;
  _id?: string;
  name: string;
  location: string;
  ranking: string;
  logo: string;
  programs: string[];
  website: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'scale';
  options?: string[];
  category: 'personality' | 'interest' | 'skill';
}

export interface User {
  name: string;
  email: string;
  role: 'student' | 'admin' | 'university';
  avatar: string;
  isPro: boolean;
  academicInfo?: {
    school: string;
    grade: string;
    majorInterest: string;
  };
  personalityTest?: {
    archetype?: string;
    description?: string;
    suitabilityScore?: number;
    careers?: any[];
  };
  skillEvaluation?: {
    scores: {
      technical: number;
      creative: number;
      communication: number;
      analytical: number;
      leadership: number;
    };
  };
  favorites?: any[];
}

// ─────────────────────────────────────────────────────────────
// API / Service Shapes (for future backend integration)
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
