import { marked } from 'marked';
import { useEffect, useState } from 'react';

function MarkdownPreview({ markdown }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!markdown) {
      setHtml('');
      return;
    }

    // marked 옵션 설정
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown 활성화
      breaks: true, // 줄바꿈 활성화
      headerIds: true, // 헤더에 ID 추가
      mangle: false, // 헤더 ID에 한글 사용 가능하도록 설정
      pedantic: false,
      sanitize: false, // HTML 태그 허용
      smartLists: true,
      smartypants: false,
      xhtml: false
    });

    try {
      // 마크다운을 HTML로 변환
      const htmlContent = marked.parse(markdown);
      setHtml(htmlContent);
    } catch (error) {
      console.error('마크다운 변환 오류:', error);
      setHtml(`<p class="text-red-500">마크다운 변환 중 오류가 발생했습니다.</p>`);
    }
  }, [markdown]);

  return (
    <div className="markdown-preview">
      {html ? (
        <div 
          className="prose prose-indigo max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="whitespace-pre-wrap">{markdown}</pre>
      )}
    </div>
  );
}

export default MarkdownPreview;
