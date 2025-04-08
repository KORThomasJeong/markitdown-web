import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import api from '../utils/api';
import { 
  KeyIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

function ApiKeyManagementPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { apiKey, setApiKey, apiModel, setApiModel } = useApiKey();
  const navigate = useNavigate();
  
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // 새 API 키 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    service: 'openai',
    key: '',
    model: '',
    isActive: true
  });

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin/api-keys' } } });
    } else if (!isAdmin) {
      navigate('/');
    } else {
      fetchApiKeys();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // API 키 목록 가져오기
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api-keys');
      setApiKeys(response.data);
    } catch (err) {
      console.error('API 키 목록 가져오기 오류:', err);
      setError(err.response?.data?.message || 'API 키 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 키 활성화/비활성화
  const handleToggleApiKey = async (apiKeyId) => {
    try {
      setLoading(true);
      await api.patch(`/api-keys/${apiKeyId}/toggle`);
      fetchApiKeys(); // API 키 목록 새로고침
      setSuccess('API 키 상태가 변경되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('API 키 활성화/비활성화 오류:', err);
      setError(err.response?.data?.message || 'API 키 활성화/비활성화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 키 삭제
  const handleDeleteApiKey = async (apiKeyId) => {
    if (!window.confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/api-keys/${apiKeyId}`);
      fetchApiKeys(); // API 키 목록 새로고침
      setSuccess('API 키가 삭제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('API 키 삭제 오류:', err);
      setError(err.response?.data?.message || 'API 키 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 새 API 키 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewApiKey({
      ...newApiKey,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // 새 API 키 추가
  const handleAddApiKey = async (e) => {
    e.preventDefault();
    
    if (!newApiKey.name || !newApiKey.key) {
      setError('API 키 이름과 키 값은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/api-keys', newApiKey);
      
      // 폼 초기화
      setNewApiKey({
        name: '',
        service: 'openai',
        key: '',
        model: '',
        isActive: true
      });
      
      // 폼 닫기
      setShowForm(false);
      
      // API 키 목록 새로고침
      fetchApiKeys();
      
      setSuccess('API 키가 성공적으로 추가되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('API 키 추가 오류:', err);
      setError(err.response?.data?.message || 'API 키 추가 중 오류가 발생했습니다.');
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          관리자 대시보드로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-2">API 키 관리</h1>
        <p className="text-gray-600 dark:text-gray-300">
          외부 서비스 연동을 위한 API 키를 관리합니다.
        </p>
      </div>

      {/* 오류 및 성공 메시지 */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* 새 API 키 추가 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          {showForm ? (
            <>
              <XCircleIcon className="h-5 w-5 mr-2" />
              취소
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5 mr-2" />
              새 API 키 추가
            </>
          )}
        </button>
      </div>

      {/* 새 API 키 추가 폼 */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">새 API 키 추가</h2>
          <form onSubmit={handleAddApiKey} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newApiKey.name}
                onChange={handleInputChange}
                required
                placeholder="OpenAI API 키"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                서비스
              </label>
              <select
                id="service"
                name="service"
                value={newApiKey.service}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
                <option value="azure">Azure</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API 키 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="key"
                name="key"
                value={newApiKey.key}
                onChange={handleInputChange}
                required
                placeholder="sk-..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                모델 (선택사항)
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={newApiKey.model}
                onChange={handleInputChange}
                placeholder="gpt-4-vision-preview"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={newApiKey.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                활성화
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {loading ? '처리 중...' : '추가'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API 키 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">API 키 목록</h2>
          <button
            onClick={fetchApiKeys}
            disabled={loading}
            className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    이름
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    서비스
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    모델
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.length > 0 ? (
                  apiKeys.map((apiKey) => (
                    <tr key={apiKey._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {apiKey.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{apiKey.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{apiKey.model || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          apiKey.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {apiKey.isActive ? '활성화' : '비활성화'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleApiKey(apiKey._id)}
                            className={`${
                              apiKey.isActive
                                ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                          >
                            {apiKey.isActive ? '비활성화' : '활성화'}
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(apiKey._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      API 키가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiKeyManagementPage;
