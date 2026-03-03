import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';

const Signup: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [allAgree, setAllAgree] = useState(false);
  const [agreements, setAgreements] = useState({
    age14: false,
    terms: false,
    privacy: false,
    marketing: false,
    marketingEmail: false,
    marketingPush: false,
    marketingSMS: false,
    jobInfo: false,
    jobInfoEmail: false,
    jobInfoPush: false,
    jobInfoSMS: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    try {
      await api.get(`/api/auth/check-email?email=${email}`);
      setIsEmailChecked(true);
      setEmailCheckMessage("기입이 가능한 이메일입니다.");
      setEmailError('');
    } catch (e: any) {
      setIsEmailChecked(false);
      setEmailCheckMessage("");
      if (e.response?.status === 409) {
        setEmailError("이미 사용 중인 이메일입니다.");
      } else {
        setEmailError("서버와 통신할 수 없습니다.");
      }
    }
  };

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    try {
      await api.get(`/api/auth/check-nickname?nickname=${nickname}`);
      setIsNicknameChecked(true);
      setNicknameCheckMessage("사용 가능한 닉네임입니다.");
      setNicknameError('');
    } catch (e: any) {
      setIsNicknameChecked(false);
      setNicknameCheckMessage("");
      if (e.response?.status === 409) {
        setNicknameError("이미 사용 중인 닉네임입니다.");
      } else {
        setNicknameError("서버와 통신할 수 없습니다.");
      }
    }
  };

  // 전체 동의 핸들러
  const handleAllAgree = (checked: boolean) => {
    setAllAgree(checked);
    setAgreements({
      age14: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
      marketingEmail: checked,
      marketingPush: checked,
      marketingSMS: checked,
      jobInfo: checked,
      jobInfoEmail: checked,
      jobInfoPush: checked,
      jobInfoSMS: checked,
    });
  };

  // 개별 약관 동의 핸들러
  const handleAgreementChange = (key: string, checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked };
    setAgreements(newAgreements);

    // 모든 항목이 체크되었는지 확인
    const allChecked = Object.values(newAgreements).every(v => v === true);
    setAllAgree(allChecked);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // 이메일 중복 확인 검증
    if (!isEmailChecked) {
      setError('이메일 중복 확인이 필요합니다.');
      return;
    }

    // 비밀번호 검증
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 닉네임 중복 확인 검증
    if (!isNicknameChecked) {
      setError('닉네임 중복 확인이 필요합니다.');
      return;
    }

    // 필수 약관 동의 확인
    if (!agreements.age14 || !agreements.terms || !agreements.privacy) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 일반 회원가입
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        name,
        nickname
      });

      console.log('📦 회원가입 응답:', response.data);

      const { accessToken } = response.data || {};

      if (accessToken) {
        setAuthToken(accessToken);
        await login(accessToken);
        console.log('🔐 회원가입 성공, 토큰 저장 및 인증 상태 업데이트 완료');
      }

      console.log('📝 온보딩 페이지로 이동');
      navigate('/signInfo');

    } catch (err: any) {
      console.error('❌ 회원가입 에러:', err.response?.data);
      const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 font-display p-4 pt-12 pb-24">
      <div className="w-full max-w-[480px] bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-sm">
        {/* 뒤로가기 */}
        <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          이전으로
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-[26px] font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-[15px] text-gray-500">Hirehub의 모든 서비스를 이용하기 위해 가입해주세요.</p>
        </div>

        {error && (
          <div className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-6 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-5">
          {/* 이메일 */}
          <div className="flex flex-col space-y-2">
            <label className="text-[15px] font-medium text-gray-800">이메일</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailChecked(false);
                  setEmailCheckMessage('');
                  setEmailError('');
                }}
                placeholder="이메일을 입력해주세요"
                className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 pr-24 text-[15px] transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={isLoading || !email}
                className={`absolute right-2 top-1/2 -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-semibold px-3 py-1.5 rounded-md transition-colors ${email ? 'bg-blue-50 text-[#006AFF] hover:bg-blue-100' : 'text-gray-400'
                  }`}
              >
                중복 확인
              </button>
            </div>
            {emailCheckMessage && (
              <p className="text-green-600 text-xs ml-1 mt-1">{emailCheckMessage}</p>
            )}
            {emailError && (
              <p className="text-red-500 text-xs ml-1 mt-1">{emailError}</p>
            )}
          </div>

          {/* 이름 */}
          <div className="flex flex-col space-y-2">
            <label className="text-[15px] font-medium text-gray-800">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 text-[15px] transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* 닉네임 */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[15px] font-medium text-gray-800">닉네임</label>
              <span className="text-gray-400 text-[12px]">*실시간 채팅 시 사용됩니다.</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setIsNicknameChecked(false);
                  setNicknameCheckMessage('');
                  setNicknameError('');
                }}
                placeholder="닉네임을 입력해주세요"
                className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 pr-24 text-[15px] transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={isLoading || !nickname}
                className={`absolute right-2 top-1/2 -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-semibold px-3 py-1.5 rounded-md transition-colors ${nickname ? 'bg-blue-50 text-[#006AFF] hover:bg-blue-100' : 'text-gray-400'
                  }`}
              >
                중복 확인
              </button>
            </div>
            {nicknameCheckMessage && (
              <p className="text-green-600 text-xs ml-1 mt-1">{nicknameCheckMessage}</p>
            )}
            {nicknameError && (
              <p className="text-red-500 text-xs ml-1 mt-1">{nicknameError}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col space-y-2">
            <label className="text-[15px] font-medium text-gray-800">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
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
            {/* 비밀번호 확인 */}
            <div className="relative mt-2">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                className="w-full rounded-lg text-gray-900 border border-gray-300 bg-white focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF] outline-none h-12 px-4 pr-12 text-[15px] transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswordConfirm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-red-500 text-xs ml-1 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
            {passwordError && (
              <p className="text-red-500 text-xs ml-1 mt-1">{passwordError}</p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
            {/* 전체 동의 */}
            <div className="flex items-center pb-2">
              <input
                type="checkbox"
                id="allAgree"
                checked={allAgree}
                onChange={(e) => handleAllAgree(e.target.checked)}
                className="w-[18px] h-[18px] text-[#006AFF] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#006AFF]"
              />
              <label htmlFor="allAgree" className="ml-2 text-[15px] font-semibold text-gray-800">
                전체 동의
              </label>
            </div>

            {/* 필수 약관들 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="age14"
                checked={agreements.age14}
                onChange={(e) => handleAgreementChange('age14', e.target.checked)}
                className="w-4 h-4 text-[#006AFF] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#006AFF]"
              />
              <label htmlFor="age14" className="ml-2 text-sm text-gray-500">
                [필수] 만 14세 이상입니다.
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreements.terms}
                  onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                  className="w-4 h-4 text-[#006AFF] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#006AFF]"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
                  [필수] Hirehub 이용약관 동의
                </label>
              </div>
              <button type="button" className="text-gray-400">›</button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreements.privacy}
                  onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                  className="w-4 h-4 text-[#006AFF] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#006AFF]"
                />
                <label htmlFor="privacy" className="ml-2 text-sm text-gray-500">
                  [필수] Hirehub 개인정보 수집 및 이용 동의
                </label>
              </div>
              <button type="button" className="text-gray-400">›</button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={agreements.marketing}
                  onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                  className="w-4 h-4 text-[#006AFF] bg-white border-gray-300 rounded focus:ring-1 focus:ring-[#006AFF]"
                />
                <label htmlFor="marketing" className="ml-2 text-sm text-gray-500">
                  [선택] 마케팅 목적의 개인정보 수집 및 이용 동의
                </label>
              </div>
              <button type="button" className="text-gray-400">›</button>
            </div>
          </div>

          {/* 가입하기 버튼 */}
          <div className="pt-4 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg font-semibold text-white bg-[#006AFF] hover:bg-[#0056CC] focus:ring-2 focus:ring-[#006AFF]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-[16px]"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;