import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApiKey } from '../contexts/ApiKeyContext';
import { getOpenAIModels, testOpenAIAPI, processImageOCR } from '../utils/api';
import { KeyIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, DocumentTextIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

function OpenAISettingsPage() {
  const { openaiApiKey, openaiModel, saveApiKey, saveModel } = useApiKey();
  const [apiKey, setApiKey] = useState(openaiApiKey);
  const [selectedModel, setSelectedModel] = useState(openaiModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState(null);

  // API 키가 변경되면 모델 목록 가져오기
  useEffect(() => {
    if (apiKey) {
      fetchModels();
    } else {
      setModels([]);
    }
  }, [apiKey]);

  // 모델 목록 가져오기
  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelError(null);
    
    try {
      const modelData = await getOpenAIModels(apiKey);
      // 모델 이름으로 정렬
      const sortedModels = modelData.sort((a, b) => a.id.localeCompare(b.id));
      setModels(sortedModels);
    } catch (error) {
      console.error('모델 목록 가져오기 오류:', error);
      setModelError(error.response?.data?.error?.message || '모델 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  // API 키 저장
  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(apiKey, selectedModel);
      setTestResult(null);
      setTestError(null);
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      setModelError(error.response?.data?.message || 'API 키 저장 중 오류가 발생했습니다.');
    }
  };

  // API 키 표시/숨기기 토글
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  // API 테스트
  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestError(null);
    
    try {
      const result = await testOpenAIAPI(apiKey, selectedModel);
      setTestResult(result);
    } catch (error) {
      console.error('API 테스트 오류:', error);
      setTestError(error.response?.data?.error?.message || '테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTesting(false);
    }
  };

  // 모델 필터링 함수 (GPT 모델만 표시)
  const filterGptModels = (models) => {
    return models.filter(model => 
      model.id.includes('gpt') && 
      !model.id.includes('instruct') && 
      !model.id.includes('-if')
    );
  };

  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          관리자 대시보드로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-2">OpenAI API 설정</h1>
        <p className="text-gray-600 dark:text-gray-300">
          OpenAI API 키를 설정하고 사용 가능한 모델을 확인하세요.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <KeyIcon className="h-5 w-5 mr-2" />
          API 키 설정
        </h2>

        <div className="mb-6">
          <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
            OpenAI API 키
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="block w-full pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={toggleApiKeyVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {showApiKey ? (
                <span className="text-xs">숨기기</span>
              ) : (
                <span className="text-xs">보기</span>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            OpenAI API 키를 입력하세요. 이 키는 서버에 저장됩니다.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            API 키 저장
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <span>사용 가능한 모델</span>
          </h2>
          <button
            onClick={fetchModels}
            disabled={!apiKey || isLoadingModels}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
              !apiKey
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${isLoadingModels ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {modelError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            <p className="flex items-center">
              <XCircleIcon className="h-5 w-5 mr-1" />
              {modelError}
            </p>
          </div>
        )}

        {isLoadingModels ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <span className="ml-2">모델 목록 불러오는 중...</span>
          </div>
        ) : (
          <>
            {models.length > 0 ? (
              <div className="mb-6">
                <label htmlFor="model" className="block text-sm font-medium mb-1">
                  모델 선택
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {filterGptModels(models).map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              !modelError && apiKey && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>API 키를 입력하고 새로고침 버튼을 클릭하여 모델 목록을 불러오세요.</p>
                </div>
              )
            )}
          </>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">API 테스트</h2>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            선택한 모델과 API 키로 간단한 테스트를 실행합니다.
          </p>
          <button
            onClick={handleTestApi}
            disabled={!apiKey || !selectedModel || isTesting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              !apiKey || !selectedModel
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isTesting ? (
              <span className="flex items-center justify-center">
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                테스트 중...
              </span>
            ) : (
              '테스트 실행'
            )}
          </button>
        </div>

        {testError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            <p className="flex items-center">
              <XCircleIcon className="h-5 w-5 mr-1" />
              {testError}
            </p>
          </div>
        )}

        {testResult && (
          <div className="mb-4">
            <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md mb-2">
              <p className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                API 테스트 성공!
              </p>
            </div>
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">응답 결과:</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{testResult.choices[0].message.content}</pre>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">모델:</p>
                  <p className="text-gray-600 dark:text-gray-300">{testResult.model}</p>
                </div>
                <div>
                  <p className="font-medium">토큰 사용량:</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {testResult.usage.prompt_tokens} (프롬프트) + {testResult.usage.completion_tokens} (완성) = {testResult.usage.total_tokens} (총)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2" />
          이미지 OCR 테스트
        </h2>
        
        <ImageOcrTester apiKey={apiKey} model={selectedModel} />
      </div>
    </div>
  );
}

// 이미지 OCR 테스터 컴포넌트
function ImageOcrTester({ apiKey, model }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 드롭존 설정
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setError(null);
      setResult(null);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // OCR 처리
  const handleProcessOcr = async () => {
    if (!selectedFile) {
      setError('이미지 파일을 선택해주세요.');
      return;
    }

    if (!apiKey) {
      setError('OpenAI API 키가 필요합니다.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await processImageOCR(selectedFile, apiKey, model);
      setResult(response);
    } catch (err) {
      console.error('OCR 처리 오류:', err);
      setError(err.response?.data?.message || '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 결과 복사
  const copyToClipboard = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result)
        .then(() => {
          alert('클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('클립보드 복사 오류:', err);
        });
    }
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        이미지에서 텍스트를 추출하려면 이미지 파일을 업로드하세요.
      </p>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
        {isDragActive ? (
          <p>이미지를 여기에 놓으세요...</p>
        ) : (
          <div>
            <p className="mb-1">이미지를 여기에 끌어다 놓거나</p>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">파일 선택</p>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          PNG, JPG, JPEG, GIF, BMP, WEBP (최대 10MB)
        </p>
      </div>

      {imagePreview && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">선택한 이미지:</p>
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-60 max-w-full rounded border border-gray-200 dark:border-gray-700" 
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setSelectedFile(null);
                setResult(null);
              }}
              className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
            >
              <XCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleProcessOcr}
          disabled={!selectedFile || !apiKey || isProcessing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !selectedFile || !apiKey
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
              처리 중...
            </span>
          ) : (
            '이미지 텍스트 추출'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          <p className="flex items-center">
            <XCircleIcon className="h-5 w-5 mr-1" />
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mb-4">
          <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md mb-2">
            <p className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              텍스트 추출 성공!
            </p>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">추출된 텍스트:</h3>
              <button
                onClick={copyToClipboard}
                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                클립보드에 복사
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-60">
              <pre className="text-xs whitespace-pre-wrap">{result.result}</pre>
            </div>
            
            {result.usage && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">모델:</p>
                  <p className="text-gray-600 dark:text-gray-300">{result.model}</p>
                </div>
                <div>
                  <p className="font-medium">토큰 사용량:</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {result.usage.prompt_tokens} (프롬프트) + {result.usage.completion_tokens} (완성) = {result.usage.total_tokens} (총)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OpenAISettingsPage;
