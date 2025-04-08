import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import FileDropzone from '../components/FileDropzone';
import UrlForm from '../components/UrlForm';
import ApiKeySettings from '../components/ApiKeySettings';
import { uploadFiles, convertUrl } from '../utils/api';

function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await uploadFiles(files);
      if (result.length === 1) {
        // 단일 파일 업로드 시 해당 문서 상세 페이지로 이동
        navigate(`/documents/${result[0]._id}`);
      } else {
        // 여러 파일 업로드 시 문서 목록 페이지로 이동
        navigate('/documents');
      }
    } catch (err) {
      setError(err.response?.data?.message || '파일 업로드 중 오류가 발생했습니다.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlConvert = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await convertUrl(url);
      navigate(`/documents/${result._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'URL 변환 중 오류가 발생했습니다.');
      console.error('URL conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          문서를 마크다운으로 변환하세요
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          PDF, Word, Excel, PowerPoint 등 다양한 형식의 문서를 깔끔한 마크다운으로 변환합니다.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-end mb-4">
          <ApiKeySettings />
        </div>
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                 ${
                   selected
                     ? 'bg-indigo-600 text-white shadow'
                     : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/30'
                 }`
              }
            >
              <div className="flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                파일 업로드
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                 ${
                   selected
                     ? 'bg-indigo-600 text-white shadow'
                     : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/30'
                 }`
              }
            >
              <div className="flex items-center justify-center">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                URL 변환
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <FileDropzone onUpload={handleFileUpload} />
            </Tab.Panel>
            <Tab.Panel>
              <UrlForm onSubmit={handleUrlConvert} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">처리 중...</p>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">다양한 형식 지원</h3>
          <p className="text-gray-600 dark:text-gray-300">
            PDF, Word, Excel, PowerPoint, HTML, CSV, JSON, XML, 이미지 등 다양한 형식을 지원합니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold mb-2">웹 콘텐츠 추출</h3>
          <p className="text-gray-600 dark:text-gray-300">
            URL을 입력하면 웹 페이지의 주요 콘텐츠를 추출하여 마크다운으로 변환합니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">💾</div>
          <h3 className="text-xl font-semibold mb-2">변환 기록 저장</h3>
          <p className="text-gray-600 dark:text-gray-300">
            변환한 모든 문서는 저장되어 언제든지 다시 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
