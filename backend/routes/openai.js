const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { auth } = require('../middleware/auth');

// 업로드 디렉토리 설정
const UPLOAD_PATH = process.env.UPLOAD_PATH || '../uploads';

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    // 원본 파일명에서 한글이 깨지지 않도록 Buffer로 변환 후 다시 디코딩
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(originalName));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB 제한
});

// 이미지 OCR 처리
router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { openai_api_key, openai_model } = req.body;

    if (!file) {
      return res.status(400).json({ message: '이미지 파일이 제공되지 않았습니다.' });
    }

    if (!openai_api_key) {
      return res.status(400).json({ message: 'OpenAI API 키가 제공되지 않았습니다.' });
    }

    // 이미지 파일을 Base64로 인코딩
    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    // 사용할 모델 (기본값: gpt-4-vision-preview)
    const model = openai_model || 'gpt-4-vision-preview';

    // OpenAI API 호출
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: '이미지에서 텍스트를 추출하여 마크다운 형식으로 반환해주세요. 표가 있다면 마크다운 표 형식으로 변환해주세요.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '이 이미지에서 모든 텍스트를 추출해주세요.' },
              { type: 'image_url', image_url: { url: dataURI } }
            ]
          }
        ],
        max_tokens: 4000
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    // 결과 반환
    const result = response.data.choices[0].message.content;
    
    // 임시 파일 삭제
    fs.unlinkSync(file.path);

    res.json({
      result,
      model: model,
      usage: response.data.usage
    });
  } catch (err) {
    console.error('OCR 처리 오류:', err);
    
    // 오류 메시지 추출
    let errorMessage = '서버 오류가 발생했습니다.';
    if (err.response && err.response.data && err.response.data.error) {
      errorMessage = err.response.data.error.message || errorMessage;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message 
    });
  }
});

// 모델 목록 가져오기
router.post('/models', async (req, res) => {
  try {
    const { openai_api_key } = req.body;

    if (!openai_api_key) {
      return res.status(400).json({ message: 'OpenAI API 키가 제공되지 않았습니다.' });
    }

    // OpenAI API 호출
    const response = await axios.get(
      'https://api.openai.com/v1/models',
      {
        headers: {
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    // 결과 반환
    res.json(response.data.data);
  } catch (err) {
    console.error('모델 목록 가져오기 오류:', err);
    
    // 오류 메시지 추출
    let errorMessage = '서버 오류가 발생했습니다.';
    if (err.response && err.response.data && err.response.data.error) {
      errorMessage = err.response.data.error.message || errorMessage;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message 
    });
  }
});

// 모델 테스트
router.post('/test', async (req, res) => {
  try {
    const { openai_api_key, openai_model } = req.body;

    if (!openai_api_key) {
      return res.status(400).json({ message: 'OpenAI API 키가 제공되지 않았습니다.' });
    }

    // 사용할 모델 (기본값: gpt-4o)
    const model = openai_model || 'gpt-4o';

    // OpenAI API 호출
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, are you working correctly? Please respond with a short message.' }
        ],
        max_tokens: 50
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    // 결과 반환
    res.json(response.data);
  } catch (err) {
    console.error('API 테스트 오류:', err);
    
    // 오류 메시지 추출
    let errorMessage = '서버 오류가 발생했습니다.';
    if (err.response && err.response.data && err.response.data.error) {
      errorMessage = err.response.data.error.message || errorMessage;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message 
    });
  }
});

module.exports = router;
