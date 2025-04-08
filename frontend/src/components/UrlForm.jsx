import { useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';

function UrlForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    // 간단한 URL 유효성 검사
    try {
      new URL(url);
    } catch (err) {
      setError('유효한 URL을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(url);
      setUrl('');
    } catch (err) {
      setError(err.message || 'URL 변환 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            웹 페이지 URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            웹 페이지 또는 PDF, DOCX 등의 문서 URL을 입력하세요
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !url.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isSubmitting || !url.trim()
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? '변환 중...' : 'URL 변환하기'}
        </button>
      </form>
    </div>
  );
}

export default UrlForm;
