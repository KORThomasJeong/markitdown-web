import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  FolderIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

function MyDocumentsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-documents' } } });
    } else {
      fetchMyDocuments();
    }
  }, [isAuthenticated, navigate]);

  // 내 문서 목록 가져오기
  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/documents/my');
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
      fetchMyDocuments(); // 문서 목록 새로고침
      setSuccess('문서가 성공적으로 삭제되었습니다.');
      
      // 선택된 문서 목록에서 제거
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
      
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

  // 선택된 문서 삭제
  const handleDeleteSelectedDocuments = async () => {
    if (selectedDocuments.length === 0) {
      setError('삭제할 문서를 선택해주세요.');
      return;
    }
    
    if (!window.confirm(`선택한 ${selectedDocuments.length}개의 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete('/documents', { data: { ids: selectedDocuments } });
      fetchMyDocuments(); // 문서 목록 새로고침
      setSuccess(`${selectedDocuments.length}개의 문서가 성공적으로 삭제되었습니다.`);
      
      // 선택된 문서 목록 초기화
      setSelectedDocuments([]);
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('문서 일괄 삭제 오류:', err);
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

  // 문서 복제
  const handleDuplicateDocument = async (documentId) => {
    try {
      setLoading(true);
      const response = await api.post(`/documents/${documentId}/duplicate`);
      fetchMyDocuments(); // 문서 목록 새로고침
      setSuccess('문서가 성공적으로 복제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('문서 복제 오류:', err);
      setError(err.response?.data?.message || '문서 복제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문서 선택 토글
  const handleToggleSelectDocument = (documentId) => {
    setSelectedDocuments(prevSelected => {
      if (prevSelected.includes(documentId)) {
        return prevSelected.filter(id => id !== documentId);
      } else {
        return [...prevSelected, documentId];
      }
    });
  };
  
  // 모든 문서 선택/해제 토글
  const handleToggleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      // 모두 선택된 상태면 모두 해제
      setSelectedDocuments([]);
    } else {
      // 일부만 선택되었거나 아무것도 선택되지 않았으면 모두 선택
      setSelectedDocuments(documents.map(doc => doc._id));
    }
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
        <h1 className="text-3xl font-bold mb-2">내 문서</h1>
        <p className="text-gray-600 dark:text-gray-300">
          내가 생성하거나 변환한 문서를 관리합니다.
        </p>
      </div>

      {/* 오류 및 성공 메시지 */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      {/* 선택된 문서 삭제 버튼 */}
      {selectedDocuments.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelectedDocuments}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            선택한 문서 삭제 ({selectedDocuments.length}개)
          </button>
        </div>
      )}

      {/* 문서 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">문서 목록</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleSelectAll}
              disabled={loading || documents.length === 0}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            >
              {selectedDocuments.length === documents.length && documents.length > 0 ? '전체 선택 해제' : '전체 선택'}
            </button>
            <button
              onClick={fetchMyDocuments}
              disabled={loading}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    선택
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제목
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
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document._id)}
                          onChange={() => handleToggleSelectDocument(document._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-indigo-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.title}
                          </div>
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
                            onClick={() => handleDuplicateDocument(document._id)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="문서 복제"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
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
                      문서가 없습니다. 파일을 업로드하거나 변환하여 문서를 생성해보세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 파일 업로드 버튼 */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/files"
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <FolderIcon className="h-5 w-5 mr-2" />
          파일 업로드 및 변환하기
        </Link>
      </div>
    </div>
  );
}

export default MyDocumentsPage;
