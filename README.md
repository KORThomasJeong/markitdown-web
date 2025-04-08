# MarkItDown 웹 애플리케이션

문서를 마크다운으로 변환하는 웹 애플리케이션입니다. 이 애플리케이션은 다양한 형식의 문서를 마크다운으로 변환하고, 변환된 결과를 저장하고 관리할 수 있는 기능을 제공합니다.

## 시스템 구성

이 애플리케이션은 다음과 같은 구성 요소로 이루어져 있습니다:

- **프론트엔드**: React 기반의 웹 인터페이스
- **백엔드**: Node.js와 Express 기반의 API 서버
- **데이터베이스**: MongoDB
- **markitdown-api**: 문서 변환 기능을 제공하는 별도의 API 서비스

## 주요 기능

- **다양한 형식의 문서 변환**: PDF, DOCX, XLSX, PPTX, HTML, CSV, JSON, XML, 이미지 등 다양한 형식의 문서를 마크다운으로 변환
- **드래그 앤 드롭 업로드**: 사용자 친화적인 드래그 앤 드롭 인터페이스로 쉽게 파일 업로드
- **여러 파일 동시 업로드**: 여러 파일을 한 번에 업로드하고 변환
- **URL을 통한 변환**: 웹 페이지 URL을 입력하여 해당 콘텐츠를 마크다운으로 변환
- **변환 기록 저장**: 모든 변환 결과는 데이터베이스에 저장되며, 원본 파일은 서버에 저장
- **최신 UI/UX**: Tailwind CSS와 React를 사용하여 모던하고 반응형 인터페이스 구현

## Docker를 사용한 실행 방법

### 사전 요구사항

- [Docker](https://www.docker.com/get-started) 설치
- [Docker Compose](https://docs.docker.com/compose/install/) 설치

### 설치 및 설정

1. 저장소를 클론합니다:

```bash
git clone <repository-url>
cd markitdown-web
```

2. 환경 변수 설정:
   - 루트 디렉토리와 backend 디렉토리에 있는 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
   - 필요한 환경 변수를 설정합니다. 특히 다음 항목들을 설정해야 합니다:
     - `API_KEY`: markitdown-api 서비스에 접근하기 위한 API 키
     - `JWT_SECRET`: 인증에 사용되는 JWT 시크릿 키
     - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: 관리자 계정 정보
     - `SERVER_URL`: 서버 URL

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# 필요한 환경 변수 값을 수정하세요
```

3. Docker Compose를 사용하여 애플리케이션을 실행합니다:

```bash
docker-compose up
```

이 명령어는 다음 서비스를 실행합니다:
- MongoDB 데이터베이스 (포트 27017)
- 백엔드 API 서버 (포트 5000)
- 프론트엔드 웹 서버 (포트 3000)

4. markitdown-api 서비스가 실행 중인지 확인합니다. 이 서비스는 문서 변환 기능을 제공하는 별도의 API 서비스입니다.

3. 브라우저에서 다음 URL로 접속합니다:

```
http://localhost:3000
```

### 백그라운드에서 실행

백그라운드에서 애플리케이션을 실행하려면 다음 명령어를 사용합니다:

```bash
docker-compose up -d
```

### 애플리케이션 중지

애플리케이션을 중지하려면 다음 명령어를 사용합니다:

```bash
docker-compose down
```

데이터베이스 볼륨을 포함하여 모든 리소스를 삭제하려면 다음 명령어를 사용합니다:

```bash
docker-compose down -v
```

## 애플리케이션 사용 방법

1. **파일 업로드**: 홈 페이지에서 "파일 업로드" 탭을 선택하고, 파일을 드래그 앤 드롭하거나 클릭하여 선택한 후 "변환하기" 버튼을 클릭합니다.
2. **URL 변환**: "URL 변환" 탭을 선택하고, 변환하려는 웹 페이지나 문서의 URL을 입력한 후 "URL 변환하기" 버튼을 클릭합니다.
3. **문서 목록 확인**: 상단 네비게이션 바에서 "문서 목록"을 클릭하여 이전에 변환한 모든 문서를 확인할 수 있습니다.
4. **문서 상세 보기**: 문서 목록에서 "마크다운 보기" 버튼을 클릭하여 변환된 마크다운 내용을 확인할 수 있습니다.
5. **마크다운 복사**: 문서 상세 페이지에서 "복사" 버튼을 클릭하여 마크다운 내용을 클립보드에 복사할 수 있습니다.
6. **문서 삭제**: 문서 상세 페이지에서 "삭제" 버튼을 클릭하여 문서를 삭제할 수 있습니다.

## 문제 해결

1. **컨테이너 로그 확인**: 문제가 발생하면 다음 명령어로 로그를 확인할 수 있습니다:
   ```bash
   docker-compose logs
   ```

2. **특정 서비스 로그 확인**:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs mongodb
   ```

3. **컨테이너 재시작**:
   ```bash
   docker-compose restart backend
   docker-compose restart frontend
   ```

4. **API 연결 오류**: 프론트엔드에서 API 연결 오류가 발생하면 백엔드 서버가 실행 중인지 확인하세요.

5. **파일 업로드 오류**: 파일 크기가 50MB를 초과하면 업로드가 실패합니다. 더 작은 파일을 사용하세요.

## 기술 스택

- **백엔드**: Node.js, Express, MongoDB, Mongoose, Multer
- **프론트엔드**: React, React Router, Tailwind CSS, Headless UI, Heroicons
- **API 통신**: Axios
- **파일 업로드**: React Dropzone, Multer
- **컨테이너화**: Docker, Docker Compose
- **인증**: JWT (JSON Web Tokens)
- **외부 서비스**: markitdown-api (문서 변환 API)

## 개발자 안내

### 환경 변수

이 프로젝트는 다음과 같은 환경 변수 파일을 사용합니다:

- **루트 디렉토리의 .env**: Docker Compose 및 전체 애플리케이션 설정
- **backend/.env**: 백엔드 서버 설정
- **frontend/.env**: 프론트엔드 설정 (Vite 환경 변수)

GitHub에 푸시하기 전에 민감한 정보가 포함된 .env 파일을 .gitignore에 추가하고, 대신 .env.example 파일을 제공하는 것이 좋습니다.

### API 키 및 JWT 시크릿 생성

새로운 API 키와 JWT 시크릿을 생성하려면 다음 스크립트를 사용할 수 있습니다:

```bash
node generate-keys.js
```

이 스크립트는 안전한 랜덤 문자열을 생성하여 API 키와 JWT 시크릿으로 사용할 수 있습니다.
