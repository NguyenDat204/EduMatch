import type { Career, University, Question, User } from '../types';

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
    text: 'Bạn có thích giải quyết các bài toán logic hoặc câu đố hóc búa không?',
    type: 'choice',
    options: ['Không bao giờ', 'Thỉnh thoảng', 'Rất yêu thích'],
    category: 'personality'
  },
  {
    id: 'q2',
    text: 'Bạn quan tâm đến việc tìm hiểu cách thức hoạt động của các thiết bị công nghệ ở mức độ nào?',
    type: 'scale',
    category: 'interest'
  },
  {
    id: 'q3',
    text: 'Bạn có thích làm việc trong một môi trường sáng tạo, nơi bạn có thể tự do thể hiện ý tưởng nghệ thuật không?',
    type: 'choice',
    options: ['Không quan tâm', 'Có một chút', 'Đó là đam mê của tôi'],
    category: 'interest'
  },
  {
    id: 'q4',
    text: 'Khả năng trình bày ý tưởng của bạn trước đám đông hoặc trong một nhóm như thế nào?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q5',
    text: 'Bạn có xu hướng muốn trở thành người dẫn dắt và tổ chức công việc cho người khác không?',
    type: 'choice',
    options: ['Thích làm theo hơn', 'Tùy trường hợp', 'Luôn sẵn sàng dẫn dắt'],
    category: 'personality'
  },
  {
    id: 'q6',
    text: 'Bạn cảm thấy thế nào khi phải làm việc với các con số và dữ liệu chi tiết?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q7',
    text: 'Bạn có thích dành thời gian để nghiên cứu và tìm hiểu sâu về một hiện tượng tự nhiên hoặc xã hội không?',
    type: 'choice',
    options: ['Khá nhàm chán', 'Bình thường', 'Rất tò mò'],
    category: 'interest'
  },
  {
    id: 'q8',
    text: 'Mức độ kiên nhẫn của bạn khi đối mặt với một vấn đề kỹ thuật khó giải quyết?',
    type: 'scale',
    category: 'personality'
  },
  {
    id: 'q9',
    text: 'Bạn có thích các công việc liên quan đến chăm sóc, hỗ trợ hoặc tư vấn cho người khác không?',
    type: 'choice',
    options: ['Không phù hợp', 'Có thể thử', 'Rất thích giúp đỡ'],
    category: 'interest'
  },
  {
    id: 'q10',
    text: 'Khả năng thích nghi của bạn với những thay đổi đột ngột trong kế hoạch hoặc môi trường làm việc?',
    type: 'scale',
    category: 'skill'
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
