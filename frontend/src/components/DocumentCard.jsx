import { Link } from 'react-router-dom';
import { DocumentTextIcon, ClockIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

function DocumentCard({ document }) {
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
    const contentType = document.contentType;
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📑';
    if (contentType.includes('html')) return '🌐';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('json') || contentType.includes('xml') || contentType.includes('csv')) return '📋';
    return '📄';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getFileIcon()}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {document.originalName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(document.fileSize)} • {document.contentType.split('/')[1]}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>{formatDate(document.createdAt)}</span>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <DocumentTextIcon className="h-4 w-4 mr-1" />
          <span>변환 방식: {document.conversionMethod}</span>
        </div>

        {document.originalUrl && (
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
            <a 
              href={document.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
            >
              {document.originalUrl}
            </a>
          </div>
        )}

        <div className="mt-4">
          <Link
            to={`/documents/${document._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            마크다운 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
