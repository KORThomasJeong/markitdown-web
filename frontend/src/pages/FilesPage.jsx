import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  TrashIcon, 
  CheckIcon, 
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { getAllDocuments, getMyDocuments, deleteMultipleDocuments, downloadOriginalFile } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function FilesPage() {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // 선택된 파일 수 계산
  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;
  
  // 모든 파일이 선택되었는지 확인
  const allSelected = documents.length > 0 && selectedCount === documents.length;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // 관리자는 모든 문서, 일반 사용자는 자신의 문서만 가져오기
        const data = isAdmin ? await getAllDocuments() : await getMyDocuments();
        setDocuments(data);
        // 선택 상태 초기화
        const initialSelection = {};
        data.forEach(doc => {
          initialSelection[doc._id] = false;
        });
        setSelectedFiles(initialSelection);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('파일을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // 파일 선택 토글
  const toggleFileSelection = (id) => {
    setSelectedFiles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 전체 선택/해제 토글
  const toggleSelectAll = () => {
    const newSelectedState = {};
    documents.forEach(doc => {
      newSelectedState[doc._id] = !allSelected;
    });
    setSelectedFiles(newSelectedState);
  };

  // 선택된 파일 삭제
  const handleDeleteSelected = async () => {
    if (selectedCount === 0) {
      alert('삭제할 파일을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedCount}개의 파일을 삭제하시겠습니까? 변환된 문서도 함께 삭제됩니다.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteResult(null);

    try {
      // 선택된 파일 ID 배열 생성
      const selectedIds = Object.entries(selectedFiles)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);

      // 선택된 파일 삭제 API 호출
      const result = await deleteMultipleDocuments(selectedIds);
      
      // 삭제 결과 표시
      setDeleteResult(result);
      
      // 파일 목록 다시 불러오기 (관리자는 모든 문서, 일반 사용자는 자신의 문서만)
      const updatedDocuments = isAdmin ? await getAllDocuments() : await getMyDocuments();
      setDocuments(updatedDocuments);
      
      // 선택 상태 초기화
      const initialSelection = {};
      updatedDocuments.forEach(doc => {
        initialSelection[doc._id] = false;
      });
      setSelectedFiles(initialSelection);
    } catch (err) {
      console.error('Error deleting files:', err);
      setError('파일 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 결과 메시지 닫기
  const closeDeleteResult = () => {
    setDeleteResult(null);
  };

  // 원본 파일 다운로드
  const handleDownload = (id, originalName) => {
    try {
      downloadOriginalFile(id, originalName);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (contentType) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📑';
    if (contentType.includes('html')) return '🌐';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('json') || contentType.includes('xml') || contentType.includes('csv')) return '📋';
    return '📄';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="ml-2">파일을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">업로드된 파일 목록</h1>
        <div className="flex space-x-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            새 파일 업로드
          </Link>
        </div>
      </div>

      {deleteResult && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md flex justify-between items-center">
          <p>{deleteResult.message}</p>
          <button 
            onClick={closeDeleteResult}
            className="text-green-600 hover:text-green-800"
          >
            ✕
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">업로드된 파일이 없습니다.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            파일 업로드하기
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSelectAll}
                className={`mr-2 inline-flex items-center px-3 py-1.5 border ${
                  allSelected 
                    ? 'border-indigo-500 bg-indigo-100 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700'
                } text-sm font-medium rounded-md hover:bg-gray-50`}
              >
                <CheckIcon className={`h-4 w-4 mr-1 ${allSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
              <span className="text-sm text-gray-500">
                {selectedCount > 0 ? `${selectedCount}개 선택됨` : ''}
              </span>
            </div>
            {selectedCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                {isDeleting ? '삭제 중...' : '선택 삭제'}
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    선택
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    파일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    크기
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    업로드 날짜
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    변환 방식
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                          selectedFiles[doc._id] 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-400'
                        }`}
                        onClick={() => toggleFileSelection(doc._id)}
                      >
                        {selectedFiles[doc._id] && <CheckIcon className="h-4 w-4" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getFileIcon(doc.contentType)}</span>
                        <div>
                          <Link 
                            to={`/documents/${doc._id}`}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {doc.originalName}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.contentType.split('/')[1]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.conversionMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownload(doc._id, doc.originalName)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/documents/${doc._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default FilesPage;
