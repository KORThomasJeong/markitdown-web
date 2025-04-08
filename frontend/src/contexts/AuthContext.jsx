import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 토큰이 변경되면 로컬 스토리지에 저장
  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setError(null);
      } catch (err) {
        console.error('사용자 정보 로드 오류:', err);
        setUser(null);
        setToken(null);
        setError('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // 로그인
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      setError(null);
      return response.data;
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  // 비밀번호 재설정 요청
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      setError(null);
      return response.data;
    } catch (err) {
      console.error('비밀번호 재설정 요청 오류:', err);
      setError(err.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setError(null);
      return response.data;
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 컨텍스트 값 제공
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트 사용을 위한 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
