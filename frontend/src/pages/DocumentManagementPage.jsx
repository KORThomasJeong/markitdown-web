import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function DocumentManagementPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin/documents' } } });
    } else if (!isAdmin) {
      navigate('/');
    } else {
      fetchDocuments();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 문서 목록 가져오기
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/documents/all');
      setDocuments(response.data);
    } catch (err) {
      console.error('문서 목록 가져오기 오류:', err);
      setError(err.response?.data?.message || '문서 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문서 삭제
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('정말로 이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/documents/${documentId}`);
      fetchDocuments(); // 문서 목록 새로고침
      setSuccess('문서가 성공적으로 삭제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('문서 삭제 오류:', err);
      setError(err.response?.data?.message || '문서 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문서 보기
  const handleViewDocument = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  // 문서 편집
  const handleEditDocument = (documentId) => {
    navigate(`/documents/${documentId}?edit=true`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
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
        <h1 className="text-3xl font-bold mb-2">문서 관리</h1>
        <p className="text-gray-600 dark:text-gray-300">
          시스템의 모든 문서를 관리합니다.
        </p>
      </div>

      {/* 오류 및 성공 메시지 */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* 문서 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">문서 목록</h2>
          <button
            onClick={fetchDocuments}
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
                    제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    생성일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    수정일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.length > 0 ? (
                  documents.map((document) => (
                    <tr key={document._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-indigo-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.originalName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {document.author ? (
                            <span>
                              {document.author.name} ({document.author.email})
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">작성자 없음</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(document.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(document.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDocument(document._id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="문서 보기"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditDocument(document._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="문서 편집"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="문서 삭제"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      문서가 없습니다.
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

export default DocumentManagementPage;
