import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { setAuthToken } from '../../api/api'; // ✅ setAuthToken import

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      console.log('📦 로그인 응답:', response.data);

      const { accessToken, role, email: userEmail, id: userId } = response.data;

      if (accessToken) {
        // ✅ 헬퍼 함수로 토큰 저장 및 헤더 설정
        setAuthToken(accessToken);

        // role, email, userId 저장
        localStorage.setItem('role', role || 'USER');
        localStorage.setItem('email', userEmail || email);
        localStorage.setItem('userId', String(userId));

        console.log('🔐 로그인 성공');
        console.log('- 토큰:', accessToken.substring(0, 20) + '...');
        console.log('- Role:', role);
        console.log('- Email:', userEmail || email);

        // 로그인 후 페이지 새로고침으로 이동
        if (role === 'ADMIN') {
          console.log('✅ 관리자 - Admin 페이지로 이동');
          window.location.href = '/admin';
        } else {
          console.log('✅ 일반 사용자 - 메인 페이지로 이동');
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      console.error('❌ 로그인 에러:', err.response?.data);
      const errorMessage = err.response?.data?.message || '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 font-display p-4 py-12">
      <div className="w-full max-w-[440px] bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-sm">
        {/* 뒤로가기 */}
        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          홈으로
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-[26px] font-bold text-gray-900 mb-2">환영합니다!</h1>
          <p className="text-[15px] text-gray-500">Hirehub에 로그인하여 서비스를 이용해보세요.</p>
        </div>

        {error && (
          <div className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-6 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="flex flex-col space-y-2">
            <label className="text-[15px] font-medium text-gray-800">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 text-[15px] transition-all"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[15px] font-medium text-gray-800">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 pr-12 text-[15px] transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="pt-4 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg font-semibold text-white bg-[#006AFF] hover:bg-[#0056CC] focus:ring-2 focus:ring-[#006AFF]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-[16px]"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="mt-6 text-center text-[14px] text-gray-500">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="font-semibold text-gray-900 hover:text-[#006AFF] underline underline-offset-2 transition-colors ml-1">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;