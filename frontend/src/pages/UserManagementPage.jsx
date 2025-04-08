import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  UserIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  TrashIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

function UserManagementPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin/users' } } });
    } else if (!isAdmin) {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('사용자 목록 가져오기 오류:', err);
      setError(err.response?.data?.message || '사용자 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 승인
  const handleApproveUser = async (userId) => {
    try {
      setLoading(true);
      await api.put(`/auth/users/${userId}/approve`);
      fetchUsers(); // 사용자 목록 새로고침
      setSuccess('사용자가 성공적으로 승인되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('사용자 승인 오류:', err);
      setError(err.response?.data?.message || '사용자 승인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 이메일 인증
  const handleVerifyEmail = async (userId) => {
    try {
      setLoading(true);
      await api.put(`/auth/users/${userId}/verify`);
      fetchUsers(); // 사용자 목록 새로고침
      setSuccess('사용자 이메일이 성공적으로 인증되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('이메일 인증 오류:', err);
      setError(err.response?.data?.message || '이메일 인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 역할 변경
  const handleChangeRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      fetchUsers(); // 사용자 목록 새로고침
      setSuccess('사용자 역할이 성공적으로 변경되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('사용자 역할 변경 오류:', err);
      setError(err.response?.data?.message || '사용자 역할 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 사용자 삭제
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/auth/users/${userId}`);
      fetchUsers(); // 사용자 목록 새로고침
      setSuccess('사용자가 성공적으로 삭제되었습니다.');
      
      // 선택된 사용자 목록에서 제거
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('사용자 삭제 오류:', err);
      setError(err.response?.data?.message || '사용자 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 선택된 사용자 삭제
  const handleDeleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      setError('삭제할 사용자를 선택해주세요.');
      return;
    }
    
    if (!window.confirm(`선택한 ${selectedUsers.length}명의 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete('/auth/users', { data: { ids: selectedUsers } });
      fetchUsers(); // 사용자 목록 새로고침
      setSuccess(`${selectedUsers.length}명의 사용자가 성공적으로 삭제되었습니다.`);
      
      // 선택된 사용자 목록 초기화
      setSelectedUsers([]);
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('사용자 일괄 삭제 오류:', err);
      setError(err.response?.data?.message || '사용자 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 사용자 선택 토글
  const handleToggleSelectUser = (userId) => {
    setSelectedUsers(prevSelected => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter(id => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };
  
  // 모든 사용자 선택/해제 토글
  const handleToggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      // 모두 선택된 상태면 모두 해제
      setSelectedUsers([]);
    } else {
      // 일부만 선택되었거나 아무것도 선택되지 않았으면 모두 선택
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // 로딩 컴포넌트
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      <span className="ml-2">로딩 중...</span>
    </div>
  );

  // 오류 메시지 컴포넌트
  const ErrorMessage = ({ message }) => (
    <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
      <p className="flex items-center">
        <XCircleIcon className="h-5 w-5 mr-1" />
        {message}
      </p>
    </div>
  );
  
  // 성공 메시지 컴포넌트
  const SuccessMessage = ({ message }) => (
    <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
      <p className="flex items-center">
        <CheckCircleIcon className="h-5 w-5 mr-1" />
        {message}
      </p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          관리자 대시보드로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-2">사용자 관리</h1>
        <p className="text-gray-600 dark:text-gray-300">
          시스템 사용자를 관리하고 권한을 설정합니다.
        </p>
      </div>

      {/* 오류 및 성공 메시지 */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      {/* 선택된 사용자 삭제 버튼 */}
      {selectedUsers.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelectedUsers}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            선택한 사용자 삭제 ({selectedUsers.length}명)
          </button>
        </div>
      )}

      {/* 사용자 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">사용자 목록</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleSelectAll}
              disabled={loading || users.length === 0}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            >
              {selectedUsers.length === users.length && users.length > 0 ? '전체 선택 해제' : '전체 선택'}
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    선택
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    이름
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    이메일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    역할
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleToggleSelectUser(user._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {user.isVerified ? '이메일 인증됨' : '이메일 미인증'}
                          </span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isApproved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {user.isApproved ? '승인됨' : '승인 대기중'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.role === 'admin' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            관리자
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            일반 사용자
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          {!user.isVerified && (
                            <button
                              onClick={() => handleVerifyEmail(user._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                            >
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              이메일 인증
                            </button>
                          )}
                          {!user.isApproved && user.isVerified && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              승인
                            </button>
                          )}
                          {user.role === 'user' ? (
                            <button
                              onClick={() => handleChangeRole(user._id, 'admin')}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              관리자로 변경
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeRole(user._id, 'user')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              일반 사용자로 변경
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;
