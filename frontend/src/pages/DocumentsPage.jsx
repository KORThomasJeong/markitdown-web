import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import DocumentCard from '../components/DocumentCard';
import { getAllDocuments, deleteMultipleDocuments } from '../utils/api';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // 선택된 문서 수 계산
  const selectedCount = Object.values(selectedDocuments).filter(Boolean).length;
  
  // 모든 문서가 선택되었는지 확인
  const allSelected = documents.length > 0 && selectedCount === documents.length;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getAllDocuments();
        setDocuments(data);
        // 선택 상태 초기화
        const initialSelection = {};
        data.forEach(doc => {
          initialSelection[doc._id] = false;
        });
        setSelectedDocuments(initialSelection);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('문서를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // 문서 선택 토글
  const toggleDocumentSelection = (id) => {
    setSelectedDocuments(prev => ({
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
    setSelectedDocuments(newSelectedState);
  };

  // 선택된 문서 삭제
  const handleDeleteSelected = async () => {
    if (selectedCount === 0) {
      alert('삭제할 문서를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedCount}개의 문서를 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteResult(null);

    try {
      // 선택된 문서 ID 배열 생성
      const selectedIds = Object.entries(selectedDocuments)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);

      // 선택된 문서 삭제 API 호출
      const result = await deleteMultipleDocuments(selectedIds);
      
      // 삭제 결과 표시
      setDeleteResult(result);
      
      // 문서 목록 다시 불러오기
      const updatedDocuments = await getAllDocuments();
      setDocuments(updatedDocuments);
      
      // 선택 상태 초기화
      const initialSelection = {};
      updatedDocuments.forEach(doc => {
        initialSelection[doc._id] = false;
      });
      setSelectedDocuments(initialSelection);
    } catch (err) {
      console.error('Error deleting documents:', err);
      setError('문서 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 결과 메시지 닫기
  const closeDeleteResult = () => {
    setDeleteResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="ml-2">문서를 불러오는 중...</p>
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
        <h1 className="text-2xl font-bold">변환된 문서 목록</h1>
        <div className="flex space-x-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            새 문서 변환
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
          <p className="text-gray-600 dark:text-gray-300 mb-4">변환된 문서가 없습니다.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            새 문서 변환하기
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <div key={document._id} className="relative">
                <div 
                  className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    selectedDocuments[document._id] 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-400'
                  }`}
                  onClick={() => toggleDocumentSelection(document._id)}
                >
                  {selectedDocuments[document._id] && <CheckIcon className="h-4 w-4" />}
                </div>
                <DocumentCard document={document} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentsPage;
