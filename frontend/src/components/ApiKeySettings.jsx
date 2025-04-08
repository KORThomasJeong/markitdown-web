import { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { KeyIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

function ApiKeySettings() {
  const { openaiApiKey, openaiModel } = useApiKey();
  const [isOpen, setIsOpen] = useState(false);
  
  // API 키가 없으면 컴포넌트를 렌더링하지 않음
  if (!openaiApiKey) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200"
      >
        <KeyIcon className="h-4 w-4 mr-1" />
        API 키 설정됨
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">OpenAI API 설정</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-sm font-medium">API 키 정보</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              관리자가 설정한 OpenAI API 키가 사용됩니다.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
              <p className="text-sm font-medium">사용 중인 모델: <span className="text-indigo-600 dark:text-indigo-400">{openaiModel}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeySettings;
