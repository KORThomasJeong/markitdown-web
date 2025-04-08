import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로컬 스토리지에서 API 키 가져오기
const getApiKey = () => localStorage.getItem('openai_api_key');
const getApiModel = () => localStorage.getItem('openai_model') || 'gpt-4-vision-preview';

// OpenAI API 직접 호출을 위한 클라이언트
const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// OpenAI API 모델 목록 가져오기
export const getOpenAIModels = async (apiKey) => {
  try {
    const response = await api.post('/openai/models', {
      openai_api_key: apiKey
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// OpenAI API 테스트
export const testOpenAIAPI = async (apiKey, model) => {
  try {
    const response = await api.post('/openai/test', {
      openai_api_key: apiKey,
      openai_model: model
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 이미지 OCR 처리
export const processImageOCR = async (imageFile, apiKey, model) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('openai_api_key', apiKey);
    formData.append('openai_model', model);

    const response = await api.post('/openai/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 파일 업로드 및 변환
export const uploadFiles = async (files) => {
  const formData = new FormData();
  
  // 여러 파일 추가
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // OpenAI API 키와 모델 추가 (있는 경우)
  const apiKey = getApiKey();
  const apiModel = getApiModel();
  
  if (apiKey) {
    formData.append('openai_api_key', apiKey);
    formData.append('openai_model', apiModel);
  }

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// URL을 통한 변환
export const convertUrl = async (url) => {
  // 기본 요청 데이터
  const requestData = { url };
  
  // OpenAI API 키와 모델 추가 (있는 경우)
  const apiKey = getApiKey();
  const apiModel = getApiModel();
  
  if (apiKey) {
    requestData.openai_api_key = apiKey;
    requestData.openai_model = apiModel;
  }
  
  const response = await api.post('/documents/convert-url', requestData);
  return response.data;
};

// 모든 문서 가져오기 (관리자는 모든 문서, 일반 사용자는 자신의 문서만)
export const getAllDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

// 내 문서만 가져오기
export const getMyDocuments = async () => {
  const response = await api.get('/documents/my');
  return response.data;
};

// 특정 문서 가져오기
export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

// 원본 파일 다운로드 URL 가져오기
export const getDownloadUrl = (id) => {
  return `${API_URL}/documents/${id}/download`;
};

// 원본 파일 다운로드 (브라우저에서 다운로드 창 열기)
export const downloadOriginalFile = (id, filename) => {
  const link = document.createElement('a');
  link.href = getDownloadUrl(id);
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 문서 삭제
export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

// 여러 문서 삭제
export const deleteMultipleDocuments = async (ids) => {
  const response = await api.delete('/documents', { data: { ids } });
  return response.data;
};

// SMTP 설정 삭제
export const deleteSmtpConfig = async (id) => {
  const response = await api.delete(`/smtp/${id}`);
  return response.data;
};

// 활성화된 SMTP 설정 테스트
export const testActiveSmtp = async (testEmail) => {
  const response = await api.post('/smtp/test-active', { testEmail });
  return response.data;
};

export default api;
