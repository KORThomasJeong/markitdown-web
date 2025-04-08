import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  ServerIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

function ServerSettingsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    SERVER_URL: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin/server' } } });
    } else if (!isAdmin) {
      navigate('/');
    } else {
      fetchSettings();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 환경 설정 가져오기
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (err) {
      console.error('환경 설정 가져오기 오류:', err);
      setError(err.response?.data?.message || '환경 설정을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // 환경 설정 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!settings.SERVER_URL) {
      setError('서버 URL은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.put('/settings', settings);
      
      setSuccess('환경 설정이 성공적으로 저장되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('환경 설정 저장 오류:', err);
      setError(err.response?.data?.message || '환경 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로딩 컴포넌트
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      <span className="ml-2">로딩 중...</span>
    </div>
  );

  // 오류 메시지 컴포넌트
  const ErrorMessage = ({ message }) => (
    <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
      <p className="flex items-center">
        <XCircleIcon className="h-5 w-5 mr-1" />
        {message}
      </p>
    </div>
  );
  
  // 성공 메시지 컴포넌트
  const SuccessMessage = ({ message }) => (
    <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
      <p className="flex items-center">
        <CheckCircleIcon className="h-5 w-5 mr-1" />
        {message}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          관리자 대시보드로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-2">서버 설정</h1>
        <p className="text-gray-600 dark:text-gray-300">
          서버 URL 및 기타 환경 설정을 관리합니다.
        </p>
      </div>

      {/* 오류 및 성공 메시지 */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* 서버 설정 폼 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ServerIcon className="h-5 w-5 mr-2" />
          서버 설정
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="SERVER_URL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                서버 URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="SERVER_URL"
                  name="SERVER_URL"
                  value={settings.SERVER_URL || ''}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                이메일 인증 링크 등에 사용되는 서버의 URL을 입력하세요. (예: https://example.com)
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    저장 중...
                  </span>
                ) : (
                  '설정 저장'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* 현재 설정 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">현재 설정 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">서버 URL</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {settings.SERVER_URL || '설정되지 않음'}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServerSettingsPage;
