import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  Cog6ToothIcon,
  DocumentTextIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin' } } });
    } else if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 관리자 메뉴 항목
  const adminMenuItems = [
    {
      title: '사용자 관리',
      description: '사용자 계정을 관리하고 권한을 설정합니다.',
      icon: <UserIcon className="h-8 w-8 text-indigo-500" />,
      path: '/admin/users'
    },
    {
      title: 'API 키 관리',
      description: 'API 키를 관리하고 활성화/비활성화합니다.',
      icon: <KeyIcon className="h-8 w-8 text-green-500" />,
      path: '/admin/api-keys'
    },
    {
      title: 'OpenAI 설정',
      description: 'OpenAI API 키 및 모델 설정을 관리합니다.',
      icon: <Cog6ToothIcon className="h-8 w-8 text-blue-500" />,
      path: '/admin/openai'
    },
    {
      title: 'SMTP 설정',
      description: '이메일 전송을 위한 SMTP 서버 설정을 관리합니다.',
      icon: <EnvelopeIcon className="h-8 w-8 text-purple-500" />,
      path: '/admin/smtp'
    },
    {
      title: '문서 관리',
      description: '시스템의 모든 문서를 관리합니다.',
      icon: <DocumentTextIcon className="h-8 w-8 text-red-500" />,
      path: '/admin/documents'
    },
    {
      title: '서버 설정',
      description: '서버 URL 및 기타 환경 설정을 관리합니다.',
      icon: <ServerIcon className="h-8 w-8 text-yellow-500" />,
      path: '/admin/server'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-gray-600 dark:text-gray-300">
          MarkItDown 시스템의 다양한 설정과 관리 기능에 접근할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                {item.icon}
                <h2 className="text-xl font-semibold ml-3">{item.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
