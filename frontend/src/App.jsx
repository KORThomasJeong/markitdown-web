import { Routes, Route, Navigate, useLocation, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import FilesPage from './pages/FilesPage';
import OpenAISettingsPage from './pages/OpenAISettingsPage';
import SmtpSettingsPage from './pages/SmtpSettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationSuccessPage from './pages/VerificationSuccessPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/AdminPage';
import UserManagementPage from './pages/UserManagementPage';
import ApiKeyManagementPage from './pages/ApiKeyManagementPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import ServerSettingsPage from './pages/ServerSettingsPage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import { useAuth } from './contexts/AuthContext';

// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
}

// 이메일 인증 리다이렉트 컴포넌트
function VerifyEmailRedirect() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 백엔드 API로 요청 전송
        await axios.get(`/api/auth/verify/${token}`);
        // 성공 시 인증 완료 페이지로 리다이렉트
        window.location.href = '/verification-success';
      } catch (err) {
        console.error('이메일 인증 오류:', err);
        setError('이메일 인증에 실패했습니다. 유효하지 않거나 만료된 토큰입니다.');
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-lg">이메일 인증 중입니다...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Link to="/login" className="text-indigo-600 hover:underline">
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }
  
  return null;
}

// 관리자 권한이 필요한 라우트를 위한 컴포넌트
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 관리자가 아닌 경우 홈페이지로 리다이렉트
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 관리자인 경우 자식 컴포넌트 렌더링
  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verification-success" element={<VerificationSuccessPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailRedirect />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* 인증이 필요한 라우트 */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            } />
            <Route path="/documents/:id" element={
              <ProtectedRoute>
                <DocumentDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/files" element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            } />
            <Route path="/my-documents" element={
              <ProtectedRoute>
                <MyDocumentsPage />
              </ProtectedRoute>
            } />
            {/* 관리자 라우트 */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/api-keys" element={
              <AdminRoute>
                <ApiKeyManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/openai" element={
              <AdminRoute>
                <OpenAISettingsPage />
              </AdminRoute>
            } />
            <Route path="/admin/smtp" element={
              <AdminRoute>
                <SmtpSettingsPage />
              </AdminRoute>
            } />
            <Route path="/admin/documents" element={
              <AdminRoute>
                <DocumentManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/server" element={
              <AdminRoute>
                <ServerSettingsPage />
              </AdminRoute>
            } />
            
            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
