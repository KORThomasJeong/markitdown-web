const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드 (로컬 개발 환경 설정)
dotenv.config();

// 루트 디렉토리의 .env 파일에서 관리자 설정 로드
const rootEnvPath = path.resolve(__dirname, '../.env');
if (require('fs').existsSync(rootEnvPath)) {
  const rootEnv = dotenv.parse(require('fs').readFileSync(rootEnvPath));
  
  // 관리자 계정 설정 및 서버 URL 가져오기
  process.env.ADMIN_EMAIL = rootEnv.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  process.env.ADMIN_PASSWORD = rootEnv.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  process.env.ADMIN_NAME = rootEnv.ADMIN_NAME || process.env.ADMIN_NAME;
  process.env.JWT_SECRET = rootEnv.JWT_SECRET || process.env.JWT_SECRET;
  process.env.SERVER_URL = rootEnv.SERVER_URL || process.env.SERVER_URL;
  
  console.log('서버 URL:', process.env.SERVER_URL);
}

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 라우트 설정
app.use('/api/documents', require('./routes/documents'));
app.use('/api/openai', require('./routes/openai'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/api-keys', require('./routes/apiKeys'));
app.use('/api/smtp', require('./routes/smtp'));
app.use('/api/settings', require('./routes/settings'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'MarkItDown API 서버에 오신 것을 환영합니다!' });
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB에 연결되었습니다.');
    
    // 관리자 계정 생성 또는 업데이트
    try {
      const User = require('./models/User');
      
      // 환경 변수에서 관리자 정보 가져오기
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminName = process.env.ADMIN_NAME;
      
      if (adminEmail && adminPassword) {
        // 기존 관리자 계정 확인
        let admin = await User.findOne({ email: adminEmail });
        
        if (admin) {
          // 관리자 계정이 이미 존재하는 경우 업데이트
          admin.name = adminName || admin.name;
          admin.role = 'admin';
          admin.isVerified = true;
          admin.isApproved = true;
          
          // 비밀번호가 변경된 경우에만 업데이트
          if (!(await admin.comparePassword(adminPassword))) {
            admin.password = adminPassword;
          }
          
          await admin.save();
          console.log('관리자 계정이 업데이트되었습니다:', adminEmail);
        } else {
          // 관리자 계정 생성
          admin = new User({
            name: adminName || '관리자',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isVerified: true,
            isApproved: true
          });
          
          await admin.save();
          console.log('관리자 계정이 생성되었습니다:', adminEmail);
        }
      }
    } catch (err) {
      console.error('관리자 계정 설정 오류:', err);
    }
  })
  .catch(err => {
    console.error('MongoDB 연결 오류:', err);
    process.exit(1);
  });

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
