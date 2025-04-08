import { createContext, useState, useEffect, useContext } from 'react';

// 테마 컨텍스트 생성
const ThemeContext = createContext();

// 테마 제공자 컴포넌트
export function ThemeProvider({ children }) {
  // 로컬 스토리지에서 테마 설정 불러오기 또는 기본값 설정
  const [darkMode, setDarkMode] = useState(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('darkMode');
    
    // 저장된 설정이 있으면 사용, 없으면 시스템 설정 확인
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    
    // 시스템 다크모드 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // 다크모드 변경 시 로컬 스토리지에 저장 및 HTML 클래스 업데이트
  useEffect(() => {
    // 로컬 스토리지에 설정 저장
    localStorage.setItem('darkMode', darkMode);
    
    // HTML 요소에 다크모드 클래스 추가/제거
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 컨텍스트 값 제공
  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 테마 컨텍스트 사용을 위한 커스텀 훅
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
