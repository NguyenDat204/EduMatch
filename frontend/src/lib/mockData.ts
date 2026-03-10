export interface Career {
  id: string;
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
}

export const mockCareers: Career[] = [
  {
    id: '1',
    title: 'Software Architect',
    description: 'Design complex software systems and high-level structure of software projects.',
    salary: '$120k - $180k',
    growth: 'High (+22%)',
    skills: ['System Design', 'Cloud Computing', 'Leadership'],
    suitability: 95,
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Data Scientist',
    description: 'Analyze and interpret complex data to help organizations make informed decisions.',
    salary: '$100k - $160k',
    growth: 'Very High (+36%)',
    skills: ['Python', 'Statistics', 'Machine Learning'],
    suitability: 88,
    category: 'Technology'
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    description: 'Create user-friendly interfaces and enhance user satisfaction by improving usability.',
    salary: '$70k - $120k',
    growth: 'Steady (+8%)',
    skills: ['Figma', 'User Research', 'Visual Design'],
    suitability: 82,
    category: 'Design'
  }
];

export const mockUniversities: University[] = [
  {
    id: '1',
    name: 'Stanford University',
    location: 'Stanford, CA',
    ranking: '#3 National',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Stanford_University_seal_2003.svg/1200px-Stanford_University_seal_2003.svg.png',
    programs: ['Computer Science', 'Business', 'Engineering'],
    website: 'https://stanford.edu'
  },
  {
    id: '2',
    name: 'FPT University',
    location: 'Hanoi, Vietnam',
    ranking: '#1 IT in Vietnam',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FPT_Education_logo.svg/1200px-FPT_Education_logo.svg.png',
    programs: ['Software Engineering', 'Digital Art', 'AI'],
    website: 'https://fpt.edu.vn'
  }
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Do you enjoy solving complex logical puzzles?',
    type: 'choice',
    options: ['Not at all', 'Sometimes', 'Very much'],
    category: 'personality'
  },
  {
    id: 'q2',
    text: 'How interested are you in how technology works?',
    type: 'scale',
    category: 'interest'
  }
];

export const mockCurrentUser: User = {
  name: 'Nguyen Van A',
  email: 'student@example.com',
  role: 'student',
  avatar: 'https://i.pravatar.cc/150?u=student',
  isPro: false,
  academicInfo: {
    school: 'High School for the Gifted',
    grade: '12',
    majorInterest: 'Computer Science'
  }
};
