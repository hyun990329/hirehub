// src/api/api.ts
import axios from "axios";

// HTTPS 환경(Vercel 등)에서는 Vercel 프록시를 타기 위해 항상 원본 도메인(origin) 사용
const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return window.location.origin;
  }
  return "http://localhost:8080/";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 토큰을 localStorage에 저장하고 axios 헤더에도 즉시 반영하는 헬퍼 함수
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 토큰 저장 및 헤더 설정 완료:', token.length > 20 ? token.substring(0, 20) + '...' : token);
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('🔓 토큰 제거 완료');
  }
};

// ✅ 초기 로드 시 localStorage의 토큰을 axios 헤더에 반영
const bootToken = localStorage.getItem('token');
if (bootToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${bootToken}`;
  console.log('🔄 초기 토큰 로드 완료');
}

// Request 인터셉터
api.interceptors.request.use(
  (config) => {
    // 회원가입, 중복확인, 문자 인증 요청은 토큰 검사하지 않음
    if (
      config.url?.includes('/api/auth/signup') ||
      config.url?.includes('/api/auth/check-') ||
      config.url?.includes('/api/sms/send') ||
      config.url?.includes('/api/sms/verify')
    ) {
      return config;
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ 토큰이 없습니다!');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - 토큰이 유효하지 않거나 만료됨');

      // 로그인/회원가입 API가 아닌 경우에만 토큰 삭제
      // (로그인 실패는 401이 정상이므로 토큰을 삭제하면 안됨)
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isPublicEndpoint =
        error.config?.url === '/api/jobposts' ||
        (error.config?.url?.startsWith('/api/jobposts/') && !error.config?.url?.includes('/recommended')) ||
        error.config?.url?.includes('/api/companies') ||
        error.config?.url?.includes('/api/boards') ||
        error.config?.url?.includes('/api/reviews');


      // 인증 엔드포인트나 공개 엔드포인트가 아닌 경우에만 토큰 삭제
      if (!isAuthEndpoint && !isPublicEndpoint) {
        console.warn('⚠️ 인증 실패 - 토큰 삭제');
        setAuthToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
