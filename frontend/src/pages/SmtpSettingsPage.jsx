import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { deleteSmtpConfig, testActiveSmtp } from '../utils/api';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  LockClosedIcon,
  UserIcon,
  ArrowLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

function SmtpSettingsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    host: '',
    port: '587',
    secure: true,
    auth: {
      user: '',
      pass: ''
    },
    fromEmail: '',
    fromName: '',
    isActive: true
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [activeSmtp, setActiveSmtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [showActiveSmtpTest, setShowActiveSmtpTest] = useState(false);

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/smtp-settings' } } });
    } else if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 활성화된 SMTP 설정 가져오기
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchActiveSmtp();
    }
  }, [isAuthenticated, isAdmin]);

  // 활성화된 SMTP 설정 가져오기
  const fetchActiveSmtp = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/smtp/active');
      setActiveSmtp(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        // 활성화된 SMTP 설정이 없는 경우
        setActiveSmtp(null);
      } else {
        console.error('SMTP 설정 가져오기 오류:', err);
        setError(err.response?.data?.message || 'SMTP 설정을 가져오는 중 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('auth.')) {
      const authField = name.split('.')[1];
      setFormData({
        ...formData,
        auth: {
          ...formData.auth,
          [authField]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // SMTP 설정 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.post('/smtp', formData);
      
      setSuccess('SMTP 설정이 성공적으로 저장되었습니다.');
      fetchActiveSmtp(); // 활성화된 SMTP 설정 다시 가져오기
      
      // 폼 초기화
      setFormData({
        host: '',
        port: '587',
        secure: true,
        auth: {
          user: '',
          pass: ''
        },
        fromEmail: '',
        fromName: '',
        isActive: true
      });
    } catch (err) {
      console.error('SMTP 설정 저장 오류:', err);
      setError(err.response?.data?.message || 'SMTP 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 활성화된 SMTP 설정 삭제
  const handleDeleteActiveSmtp = async () => {
    if (!activeSmtp) {
      return;
    }
    
    if (!window.confirm('활성화된 SMTP 설정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await deleteSmtpConfig(activeSmtp._id);
      
      setSuccess('SMTP 설정이 성공적으로 삭제되었습니다.');
      setActiveSmtp(null);
    } catch (err) {
      console.error('SMTP 설정 삭제 오류:', err);
      setError(err.response?.data?.message || 'SMTP 설정 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 활성화된 SMTP 설정 테스트
  const handleTestActiveSmtp = () => {
    setShowActiveSmtpTest(!showActiveSmtpTest);
    setTestError(null);
    setTestResult(null);
  };
  
  // 활성화된 SMTP 설정으로 테스트 이메일 전송
  const handleSendActiveSmtpTest = async () => {
    if (!testEmail) {
      setTestError('테스트 이메일 주소를 입력해주세요.');
      return;
    }
    
    try {
      setTestLoading(true);
      setTestError(null);
      setTestResult(null);
      
      const response = await testActiveSmtp(testEmail);
      
      setTestResult('테스트 이메일이 성공적으로 전송되었습니다.');
    } catch (err) {
      console.error('SMTP 테스트 오류:', err);
      setTestError(err.response?.data?.message || 'SMTP 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestLoading(false);
    }
  };
  
  // 새 SMTP 설정 테스트
  const handleTest = async (e) => {
    e.preventDefault();
    
    if (!testEmail) {
      setTestError('테스트 이메일 주소를 입력해주세요.');
      return;
    }
    
    try {
      setTestLoading(true);
      setTestError(null);
      setTestResult(null);
      
      const testData = {
        ...formData,
        testEmail
      };
      
      const response = await api.post('/smtp/test', testData);
      
      setTestResult('테스트 이메일이 성공적으로 전송되었습니다.');
    } catch (err) {
      console.error('SMTP 테스트 오류:', err);
      setTestError(err.response?.data?.message || 'SMTP 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestLoading(false);
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
        <h1 className="text-3xl font-bold mb-2">SMTP 설정</h1>
        <p className="text-gray-600 dark:text-gray-300">
          이메일 전송을 위한 SMTP 서버 설정을 관리합니다.
        </p>
      </div>

      {/* 현재 활성화된 SMTP 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            현재 활성화된 SMTP 설정
          </h2>
          {activeSmtp && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleTestActiveSmtp()}
                disabled={testLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {testLoading ? (
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-1" />
                ) : (
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                )}
                테스트
              </button>
              <button
                onClick={() => handleDeleteActiveSmtp()}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                삭제
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : activeSmtp ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">서버 정보</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">호스트:</span> {activeSmtp.host}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">포트:</span> {activeSmtp.port}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">보안 연결:</span> {activeSmtp.secure ? '사용' : '사용 안 함'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">발신자 정보</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">이메일:</span> {activeSmtp.fromEmail}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">이름:</span> {activeSmtp.fromName}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">사용자:</span> {activeSmtp.auth.user}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 활성화된 SMTP 테스트 입력 필드 */}
            {showActiveSmtpTest && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium mb-2">활성화된 SMTP 설정 테스트</h3>
                {testError && <ErrorMessage message={testError} />}
                {testResult && <SuccessMessage message={testResult} />}
                <div className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="activeTestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      테스트 이메일 주소
                    </label>
                    <input
                      type="email"
                      id="activeTestEmail"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSendActiveSmtpTest}
                    disabled={testLoading || !testEmail}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      testLoading || !testEmail
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    {testLoading ? (
                      <span className="flex items-center">
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        테스트 중...
                      </span>
                    ) : (
                      '테스트 이메일 전송'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>활성화된 SMTP 설정이 없습니다.</p>
            <p className="mt-2 text-sm">아래 폼을 사용하여 SMTP 설정을 추가해주세요.</p>
          </div>
        )}
      </div>

      {/* SMTP 설정 폼 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ServerIcon className="h-5 w-5 mr-2" />
          SMTP 설정 추가
        </h2>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 서버 설정 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b border-gray-200 dark:border-gray-700 pb-2">
                서버 설정
              </h3>
              
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP 호스트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  required
                  placeholder="smtp.example.com"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  포트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="port"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  required
                  placeholder="587"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="secure"
                  name="secure"
                  checked={formData.secure}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="secure" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  보안 연결 사용 (SSL/TLS)
                </label>
              </div>
            </div>
            
            {/* 인증 및 발신자 설정 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b border-gray-200 dark:border-gray-700 pb-2">
                인증 및 발신자 설정
              </h3>
              
              <div>
                <label htmlFor="auth.user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP 사용자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="auth.user"
                  name="auth.user"
                  value={formData.auth.user}
                  onChange={handleChange}
                  required
                  placeholder="user@example.com"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="auth.pass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP 비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="auth.pass"
                  name="auth.pass"
                  value={formData.auth.pass}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  발신자 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value={formData.fromEmail}
                  onChange={handleChange}
                  required
                  placeholder="noreply@example.com"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  발신자 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value={formData.fromName}
                  onChange={handleChange}
                  required
                  placeholder="MarkItDown"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              이 설정을 활성화 (기존 활성화된 설정은 비활성화됩니다)
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
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
      </div>

      {/* 새 SMTP 설정 테스트 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <EnvelopeIcon className="h-5 w-5 mr-2" />
          새 SMTP 설정 테스트
        </h2>

        {testError && <ErrorMessage message={testError} />}
        {testResult && <SuccessMessage message={testResult} />}

        <form onSubmit={handleTest} className="space-y-4">
          <div>
            <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              테스트 이메일 주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="testEmail"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              required
              placeholder="test@example.com"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              테스트 이메일을 받을 주소를 입력하세요. 위 폼에 입력한 SMTP 설정으로 테스트 이메일이 전송됩니다.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={testLoading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                testLoading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {testLoading ? (
                <span className="flex items-center">
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                  테스트 중...
                </span>
              ) : (
                '테스트 이메일 전송'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SmtpSettingsPage;
