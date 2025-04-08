import { Link } from 'react-router-dom';
import { DocumentTextIcon, FolderIcon, KeyIcon, UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { darkMode } = useTheme();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-indigo-600 dark:bg-indigo-800 text-white shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <DocumentTextIcon className="h-8 w-8" />
          <span className="text-xl font-bold">MarkItDown</span>
        </Link>
        <div className="flex items-center">
          {isAuthenticated && (
            <nav className="mr-6">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="hover:text-indigo-200 transition-colors">
                    홈
                  </Link>
                </li>
                <li>
                  <Link to="/documents" className="hover:text-indigo-200 transition-colors">
                    문서 목록
                  </Link>
                </li>
                <li>
                  <Link to="/files" className="hover:text-indigo-200 transition-colors flex items-center">
                    <FolderIcon className="h-4 w-4 mr-1" />
                    파일 관리
                  </Link>
                </li>
                <li>
                  <Link to="/my-documents" className="hover:text-indigo-200 transition-colors flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    내 문서
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" className="hover:text-indigo-200 transition-colors flex items-center">
                      <Cog6ToothIcon className="h-4 w-4 mr-1" />
                      관리자
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{darkMode ? '다크' : '라이트'}</span>
              <ThemeToggle />
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">{user?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-md transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-1" />
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
