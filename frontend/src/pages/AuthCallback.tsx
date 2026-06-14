import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

// Trang callback nhận token từ Google OAuth redirect
export const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUserInState } = useAuth();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('token');

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (!token) {
      navigate('/login?error=no_token');
      return;
    }

    // Lưu token và fetch profile
    localStorage.setItem('edumatch_token', token);

    profileService.getProfile()
      .then((res) => {
        if (res.success && res.data) {
          updateUserInState(res.data);
          navigate(res.data.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          localStorage.removeItem('edumatch_token');
          navigate('/login?error=profile_failed');
        }
      })
      .catch(() => {
        localStorage.removeItem('edumatch_token');
        navigate('/login?error=profile_failed');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-500">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};
