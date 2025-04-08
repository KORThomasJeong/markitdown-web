function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">MarkItDown</h3>
            <p className="text-gray-400 text-sm mt-1">문서를 마크다운으로 쉽게 변환하세요</p>
          </div>
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ThomasJeong. 모든 권리 보유.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
