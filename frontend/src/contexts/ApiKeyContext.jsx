import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// API 키 컨텍스트 생성
const ApiKeyContext = createContext();

// API 키 제공자 컴포넌트
export function ApiKeyProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4-vision-preview');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 서버에서 API 키 가져오기 (인증 여부와 관계없이)
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        
        // 관리자인 경우 모든 API 키 가져오기
        if (isAuthenticated && isAdmin) {
          const response = await api.get('/api-keys');
          setApiKeys(response.data);
        } 
        
        // 활성화된 OpenAI API 키 가져오기 (인증 여부와 관계없이)
        try {
          const response = await api.get('/api-keys/active/openai');
          console.log('활성화된 OpenAI API 키 가져오기 성공:', response.data);
          setOpenaiApiKey(response.data.key);
          setOpenaiModel(response.data.model || 'gpt-4-vision-preview');
        } catch (err) {
          console.error('활성화된 OpenAI API 키 가져오기 오류:', err);
          // 활성화된 API 키가 없는 경우 로컬 스토리지에서 가져오기
          if (err.response?.status === 404) {
            const storedApiKey = localStorage.getItem('openai_api_key');
            const storedModel = localStorage.getItem('openai_model');
            
            if (storedApiKey) {
              console.log('로컬 스토리지에서 OpenAI API 키 가져오기 성공');
              setOpenaiApiKey(storedApiKey);
            }
            
            if (storedModel) {
              setOpenaiModel(storedModel);
            }
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('API 키 가져오기 오류:', err);
        setError(err.response?.data?.message || 'API 키를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, [isAuthenticated, isAdmin]);

  // API 키 저장 (인증되지 않은 사용자용)
  const saveApiKey = async (apiKey, model) => {
    try {
      // 서버에 API 키 저장
      const response = await api.post('/api-keys', {
        name: 'OpenAI API 키',
        service: 'openai',
        key: apiKey,
        model: model || 'gpt-4-vision-preview',
        isActive: true
      });
      
      // 상태 업데이트
      setOpenaiApiKey(apiKey);
      setOpenaiModel(model || 'gpt-4-vision-preview');
      
      // 백업용으로 로컬 스토리지에도 저장
      localStorage.setItem('openai_api_key', apiKey);
      localStorage.setItem('openai_model', model || 'gpt-4-vision-preview');
      
      return response.data;
    } catch (err) {
      console.error('API 키 저장 오류:', err);
      throw err;
    }
  };

  // 모델 저장 (인증되지 않은 사용자용)
  const saveModel = async (model) => {
    try {
      if (openaiApiKey) {
        // API 키가 있는 경우 서버에 모델 업데이트
        await saveApiKey(openaiApiKey, model);
      }
      
      // 상태 업데이트
      setOpenaiModel(model);
      
      // 백업용으로 로컬 스토리지에도 저장
      localStorage.setItem('openai_model', model);
    } catch (err) {
      console.error('모델 저장 오류:', err);
      throw err;
    }
  };

  // API 키 삭제 (인증되지 않은 사용자용)
  const clearApiKey = () => {
    setOpenaiApiKey('');
    localStorage.removeItem('openai_api_key');
  };

  // API 키 생성 (관리자용)
  const createApiKey = async (apiKeyData) => {
    try {
      setLoading(true);
      const response = await api.post('/api-keys', apiKeyData);
      setApiKeys([...apiKeys, response.data.apiKey]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('API 키 생성 오류:', err);
      setError(err.response?.data?.message || 'API 키 생성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // API 키 업데이트 (관리자용)
  const updateApiKey = async (id, apiKeyData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api-keys/${id}`, apiKeyData);
      setApiKeys(apiKeys.map(key => key.id === id ? response.data.apiKey : key));
      setError(null);
      return response.data;
    } catch (err) {
      console.error('API 키 업데이트 오류:', err);
      setError(err.response?.data?.message || 'API 키 업데이트에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // API 키 삭제 (관리자용)
  const deleteApiKey = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api-keys/${id}`);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      setError(null);
    } catch (err) {
      console.error('API 키 삭제 오류:', err);
      setError(err.response?.data?.message || 'API 키 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // API 키 활성화/비활성화 (관리자용)
  const toggleApiKey = async (id) => {
    try {
      setLoading(true);
      const response = await api.patch(`/api-keys/${id}/toggle`);
      setApiKeys(apiKeys.map(key => key.id === id ? response.data.apiKey : key));
      setError(null);
      return response.data;
    } catch (err) {
      console.error('API 키 활성화/비활성화 오류:', err);
      setError(err.response?.data?.message || 'API 키 활성화/비활성화에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiKeyContext.Provider 
      value={{ 
        openaiApiKey, 
        openaiModel, 
        apiKeys,
        loading,
        error,
        saveApiKey, 
        saveModel, 
        clearApiKey,
        createApiKey,
        updateApiKey,
        deleteApiKey,
        toggleApiKey
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

// API 키 컨텍스트 사용을 위한 훅
export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
