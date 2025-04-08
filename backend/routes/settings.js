const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, admin } = require('../middleware/auth');

// 환경 설정 파일 경로
const ENV_FILE_PATH = path.resolve(__dirname, '../../.env');

/**
 * @route   GET /api/settings
 * @desc    현재 환경 설정 가져오기 (관리자 전용)
 * @access  Private/Admin
 */
router.get('/', auth, admin, async (req, res) => {
  try {
    // .env 파일이 존재하는지 확인
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return res.status(404).json({ message: '환경 설정 파일을 찾을 수 없습니다.' });
    }
    
    // .env 파일 읽기
    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    // 환경 변수 파싱
    const settings = {};
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          settings[key.trim()] = value.trim().replace(/^["'](.*)["']$/, '$1');
        }
      }
    });
    
    // 민감한 정보 제외
    delete settings.JWT_SECRET;
    delete settings.MONGODB_URI;
    delete settings.ADMIN_PASSWORD;
    
    res.json(settings);
  } catch (err) {
    console.error('환경 설정 가져오기 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/settings
 * @desc    환경 설정 업데이트 (관리자 전용)
 * @access  Private/Admin
 */
router.put('/', auth, admin, async (req, res) => {
  try {
    const { SERVER_URL } = req.body;
    
    // 필수 필드 확인
    if (!SERVER_URL) {
      return res.status(400).json({ message: '서버 URL은 필수 입력 항목입니다.' });
    }
    
    // .env 파일이 존재하는지 확인
    let envContent = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    }
    
    // 환경 변수 파싱
    const envVars = {};
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
    
    // 환경 변수 업데이트
    envVars.SERVER_URL = SERVER_URL;
    
    // .env 파일 내용 생성
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // .env 파일 쓰기
    fs.writeFileSync(ENV_FILE_PATH, newEnvContent);
    
    // 환경 변수 업데이트
    process.env.SERVER_URL = SERVER_URL;
    
    res.json({ 
      message: '환경 설정이 성공적으로 업데이트되었습니다.',
      settings: { SERVER_URL }
    });
  } catch (err) {
    console.error('환경 설정 업데이트 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
