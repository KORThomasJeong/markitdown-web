import { Link } from 'react-router-dom';

function VerificationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            이메일 인증 완료
          </h2>
          <div className="mt-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
            이메일 인증이 성공적으로 완료되었습니다.
          </p>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            이제 관리자 승인을 기다려주세요. 승인이 완료되면 이메일로 알려드립니다.
          </p>
          <div className="mt-6 text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationSuccessPage;
