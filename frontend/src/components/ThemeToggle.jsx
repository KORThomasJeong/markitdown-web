import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center justify-center w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none transition-colors duration-200 ease-in-out relative"
      aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
          darkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {darkMode ? (
          <MoonIcon className="h-3 w-3 text-indigo-600" />
        ) : (
          <SunIcon className="h-3 w-3 text-yellow-500" />
        )}
      </span>
      <span className="sr-only">{darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}</span>
    </button>
  );
}

export default ThemeToggle;
