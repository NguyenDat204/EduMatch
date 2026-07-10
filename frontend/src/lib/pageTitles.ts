const PAGE_TITLES: Record<string, string> = {
  '/': 'Trang chủ',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/forgot-password': 'Quên mật khẩu',
  '/survey': 'Khảo sát định hướng',
  '/result': 'Kết quả gợi ý',
  '/survey-history': 'Lịch sử khảo sát',
  '/academic-profile': 'Hồ sơ học tập',
  '/skill-evaluation': 'Đánh giá kỹ năng',
  '/dashboard': 'Bảng điều khiển',
  '/profile': 'Hồ sơ cá nhân',
  '/explore': 'Khám phá ngành nghề',
  '/universities': 'Danh sách trường đại học',
  '/chat': 'Tư vấn AI',
  '/feedback': 'Góp ý',
  '/upgrade': 'Nâng cấp tài khoản',
  '/university/manage': 'Quản lý hồ sơ trường',
  '/payment/success': 'Thanh toán thành công',
  '/payment/cancel': 'Thanh toán đã hủy',
  '/compare': 'So sánh ngành nghề',
  '/favorites': 'Ngành nghề yêu thích',
  '/admin': 'Admin - Tổng quan',
  '/admin/analytics': 'Admin - Tổng quan',
  '/admin/users': 'Admin - Người dùng',
  '/admin/careers': 'Admin - Ngành nghề',
  '/admin/universities': 'Admin - Trường đại học',
  '/admin/surveys': 'Admin - Khảo sát',
  '/admin/ai-quality': 'Admin - Chất lượng AI',
  '/admin/payments': 'Admin - Thanh toán',
  '/admin/ai-chats': 'Admin - Hội thoại AI',
  '/admin/feedback': 'Admin - Phản hồi',
  '/admin/settings': 'Admin - Cài đặt',
  '/admin/plans': 'Admin - Gói dịch vụ',
};

const normalizePath = (path: string) => {
  const cleanPath = (path || '/').split(/[?#]/)[0] || '/';
  return cleanPath.length > 1 ? cleanPath.replace(/\/+$/, '') : cleanPath;
};

export const getPageTitle = (path: string) => {
  const cleanPath = normalizePath(path);
  if (PAGE_TITLES[cleanPath]) return PAGE_TITLES[cleanPath];
  if (/^\/explore\/[^/]+$/.test(cleanPath)) return 'Chi tiết ngành nghề';
  if (/^\/universities\/[^/]+$/.test(cleanPath)) return 'Chi tiết trường đại học';
  if (/^\/career-path\/[^/]+$/.test(cleanPath)) return 'Lộ trình nghề nghiệp';
  return cleanPath;
};

export const getAnalyticsPageTitle = (path: string, fallbackTitle?: string) => {
  const cleanedFallback = fallbackTitle?.trim();
  if (!path?.trim()) {
    if (!cleanedFallback || /^EduMatch\s*-/i.test(cleanedFallback)) return 'Không xác định trang';
    return cleanedFallback.replace(/\s*\|\s*EduMatch$/i, '');
  }

  const cleanPath = normalizePath(path);
  const mappedTitle = getPageTitle(cleanPath);
  if (mappedTitle !== cleanPath) return mappedTitle;

  if (cleanedFallback && !/^EduMatch\s*-/i.test(cleanedFallback)) {
    return cleanedFallback.replace(/\s*\|\s*EduMatch$/i, '');
  }
  return cleanPath;
};
