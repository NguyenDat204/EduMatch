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
  // ─── PHẦN 1: SỞ THÍCH HỌC THUẬT & THÍCH ỨNG CÔNG NGHỆ ──────────────────
  {
    id: 'q1',
    text: 'Khi đối mặt với một bài toán hóc búa hoặc trò chơi câu đố logic, bạn thường phản ứng như thế nào?',
    type: 'choice',
    options: ['Không bao giờ', 'Thỉnh thoảng', 'Rất yêu thích'],
    category: 'personality'
  },
  {
    id: 'q2',
    text: 'Bạn hứng thú ở mức độ nào trong việc tìm hiểu cách thức hoạt động bên trong của các ứng dụng, website hoặc thiết bị công nghệ hiện đại?',
    type: 'scale',
    category: 'interest'
  },
  {
    id: 'q3',
    text: 'Mức độ đam mê tự học lập trình, phân tích dữ liệu hoặc tìm hiểu về các công nghệ Trí tuệ nhân tạo (AI/ChatGPT) của bạn?',
    type: 'scale',
    category: 'interest'
  },
  {
    id: 'q4',
    text: 'Mức độ kiên nhẫn tự tìm hiểu, tra cứu lỗi và tự khắc phục của bạn khi các thiết bị điện tử hoặc phần mềm bạn đang dùng gặp sự cố kỹ thuật?',
    type: 'scale',
    category: 'personality'
  },
  {
    id: 'q5',
    text: 'Khi đọc báo hoặc xem tin tức, bạn có xu hướng bị thu hút bởi các khám phá khoa học mới hay các xu hướng công nghệ tương lai không?',
    type: 'choice',
    options: ['Không quan tâm', 'Có một chút', 'Rất tò mò'],
    category: 'interest'
  },
  // ─── PHẦN 2: TƯ DUY SÁNG TẠO & XỬ LÝ SỐ LIỆU ──────────────────────────
  {
    id: 'q6',
    text: 'Nếu được giao xây dựng một sản phẩm thực tế, bạn có muốn tự do thiết kế phong cách giao diện nghệ thuật, lựa chọn tông màu phối và bố cục sáng tạo không?',
    type: 'choice',
    options: ['Không quan tâm', 'Có một chút', 'Đó là đam mê của tôi'],
    category: 'interest'
  },
  {
    id: 'q7',
    text: 'Bạn tự đánh giá cao khả năng cảm nhận thẩm mỹ, phối màu và tính sáng tạo trực quan của bản thân ở mức độ nào?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q8',
    text: 'Bạn đánh giá khả năng kiên trì và tự tin của bản thân khi phải làm việc trực tiếp với các bảng số liệu chi tiết hoặc phân tích lượng thông tin lớn?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q9',
    text: 'Bạn cảm thấy thế nào trước việc dành nhiều giờ nghiên cứu tài liệu chuyên sâu để tìm ra nguyên nhân gốc rễ của một hiện tượng tự nhiên hoặc vấn đề xã hội?',
    type: 'choice',
    options: ['Khá nhàm chán', 'Bình thường', 'Rất tò mò'],
    category: 'interest'
  },
  {
    id: 'q10',
    text: 'Độ chính xác, tính ngăn nắp và kỷ luật của bản thân khi tự lập kế hoạch học tập chi tiết hoặc tự sắp xếp công việc theo lịch trình sẵn có?',
    type: 'scale',
    category: 'skill'
  },
  // ─── PHẦN 3: KỸ NĂNG TƯƠNG TÁC & THÍCH ỨNG THỰC TẾ ───────────────────
  {
    id: 'q11',
    text: 'Khi tham gia hoạt động đội nhóm hoặc bài tập lớn, xu hướng tự nhiên của bạn trong việc tổ chức công việc và lãnh đạo đội ngũ là gì?',
    type: 'choice',
    options: ['Thích làm theo hơn', 'Tùy trường hợp', 'Luôn sẵn sàng dẫn dắt'],
    category: 'personality'
  },
  {
    id: 'q12',
    text: 'Hãy tự đánh giá mức độ tự tin và kỹ năng của bạn khi cần thuyết trình, đàm phán hoặc truyền đạt một ý tưởng mới trước đám đông?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q13',
    text: 'Bạn có cảm thấy hạnh phúc và hào hứng khi làm các công việc mang tính chất lắng nghe chia sẻ, tư vấn hướng nghiệp hoặc hỗ trợ khó khăn cho người khác không?',
    type: 'choice',
    options: ['Không phù hợp', 'Có thể thử', 'Rất thích giúp đỡ'],
    category: 'interest'
  },
  {
    id: 'q14',
    text: 'Khả năng đọc vị cảm xúc, lắng nghe thấu cảm và giải quyết các xung đột nảy sinh giữa các thành viên trong nhóm của bạn ở mức độ nào?',
    type: 'scale',
    category: 'skill'
  },
  {
    id: 'q15',
    text: 'Đánh giá khả năng tự quản lý áp lực học tập và nhanh chóng xoay chuyển kế hoạch khi có những thay đổi đột ngột từ thầy cô hoặc lịch thi cử?',
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
