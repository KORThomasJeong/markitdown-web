import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import MarkdownPreview from '../components/MarkdownPreview';
import { getDocument, deleteDocument, downloadOriginalFile } from '../utils/api';

function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await getDocument(id);
        setDocData(data);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('문서를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteDocument(id);
      navigate('/documents');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('문서 삭제 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };

  const handleCopyToClipboard = () => {
    // 임시 텍스트 영역 생성
    const textArea = document.createElement('textarea');
    textArea.value = docData.markdownContent;
    
    // 텍스트 영역을 화면 밖으로 이동시켜 보이지 않게 함
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // 텍스트 선택 및 복사
    textArea.focus();
    textArea.select();
    
    let success = false;
    try {
      // execCommand는 deprecated되었지만 호환성을 위해 사용
      success = document.execCommand('copy');
      if (!success) {
        // 실패 시 Clipboard API 시도
        navigator.clipboard.writeText(docData.markdownContent)
          .then(() => {
            alert('마크다운 내용이 클립보드에 복사되었습니다.');
          })
          .catch(err => {
            console.error('클립보드 복사 오류:', err);
            alert('클립보드 복사 중 오류가 발생했습니다.');
          });
      } else {
        alert('마크다운 내용이 클립보드에 복사되었습니다.');
      }
    } catch (err) {
      console.error('클립보드 복사 오류:', err);
      alert('클립보드 복사 중 오류가 발생했습니다.');
    } finally {
      // 임시 텍스트 영역 제거
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      // Blob 객체 생성 시 UTF-8 인코딩 명시
      const blob = new Blob([docData.markdownContent], { 
        type: 'text/markdown;charset=UTF-8' 
      });
      
      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      
      // 파일명 설정 (원본 파일명에서 확장자를 .md로 변경)
      const fileName = docData.originalName.replace(/\.[^/.]+$/, '') + '.md';
      
      downloadLink.href = url;
      downloadLink.download = fileName;
      
      // 링크를 DOM에 추가하고 클릭 이벤트 발생시킨 후 제거
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // 지연 후 URL 객체 해제 및 링크 제거
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(downloadLink);
      }, 100);
      
      alert('마크다운 파일이 다운로드되었습니다.');
    } catch (err) {
      console.error('마크다운 다운로드 오류:', err);
      alert('마크다운 다운로드 중 오류가 발생했습니다.');
    }
  };

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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getFileIcon = () => {
    if (!docData) return '📄';
    
    const contentType = docData.contentType;
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
        <p className="ml-2">문서를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        <p>{error}</p>
        <Link to="/documents" className="mt-4 inline-block text-indigo-600 hover:underline">
          문서 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
        <p>문서를 찾을 수 없습니다.</p>
        <Link to="/documents" className="mt-4 inline-block text-indigo-600 hover:underline">
          문서 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 원본 파일 다운로드 처리
  const handleDownloadOriginal = () => {
    if (!docData) return;
    
    try {
      downloadOriginalFile(docData._id, docData.originalName);
      alert('원본 파일 다운로드가 시작되었습니다.');
    } catch (err) {
      console.error('원본 파일 다운로드 오류:', err);
      alert('원본 파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <Link to="/documents" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          문서 목록으로 돌아가기
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadOriginal}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            원본 다운로드
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            마크다운 다운로드
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
            복사
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            삭제
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start">
            <span className="text-3xl mr-4">{getFileIcon()}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {docData.originalName}
              </h1>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  <span>
                    {formatFileSize(docData.fileSize)} • {docData.contentType.split('/')[1]}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{formatDate(docData.createdAt)}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                <span>변환 방식: {docData.conversionMethod}</span>
              </div>
              {docData.originalUrl && (
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                  <a 
                    href={docData.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                  >
                    {docData.originalUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">마크다운 변환 결과</h2>
          <MarkdownPreview markdown={docData.markdownContent} />
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailPage;
