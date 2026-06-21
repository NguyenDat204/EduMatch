// ─────────────────────────────────────────────────────────────
// Domain Models
// ─────────────────────────────────────────────────────────────

export interface CareerRoadmapStep {
  phase?: string;
  duration?: string;
  title?: string;
  description?: string;
  skillsToAcquire?: string[];
}

export interface Career {
  id: string;
  _id?: string;
  title: string;
  description: string;
  salary: string;
  growth: string;
  skills: string[];
  suitability?: number;
  category: string;
  roadmap?: CareerRoadmapStep[];
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
  tuitionFee?: number;
  scholarships?: string;
  admissions?: string;
  views?: number;
  representativeId?: string;
  viewLogs?: {
    userId: string;
    userName: string;
    userSchool: string;
    timestamp: string;
  }[];
}


export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'scale';
  options?: string[];
  category: 'personality' | 'interest' | 'skill';
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'university';
  avatar: string;
  isPro: boolean;
  universityId?: string;
  subscription?: {
    plan: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  plan_id?: string;
  plan_started_at?: string;
  plan_expired_at?: string;
  academicInfo?: {
    school: string;
    grade: string;
    majorInterest: string;
    subjects?: {
      math: number;
      physics: number;
      chemistry: number;
      english: number;
      literature: number;
      biology: number;
      history: number;
      geography: number;
      [key: string]: number;
    };
  };
  personalityTest?: {
    archetype?: string;
    description?: string;
    suitabilityScore?: number;
    insights?: string;
    careers?: any[];
    answers?: any;
    updatedAt?: string | Date;
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


export interface SubscriptionPlan {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  successfulTxCount: number;
  proUsersCount: number;
  bestSellingPlans: {
    plan_id: string | null;
    name: string;
    slug: string;
    salesCount: number;
    totalRevenue: number;
  }[];
  monthlyRevenue: {
    year: number;
    month: number;
    monthStr: string;
    revenue: number;
    count: number;
  }[];
}
