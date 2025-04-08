const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

// 환경 변수 설정
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const UPLOAD_PATH = process.env.UPLOAD_PATH || '../uploads';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-vision-preview';

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

// 모든 문서 가져오기 (관리자만 가능)
router.get('/', auth, async (req, res) => {
  try {
    // 관리자가 아니면 자신의 문서만 반환
    if (req.user.role !== 'admin') {
      const documents = await Document.find({ author: req.user._id }).sort({ createdAt: -1 });
      return res.json(documents);
    }
    
    // 관리자는 모든 문서 반환
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('문서 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 모든 문서 가져오기
router.get('/all', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    
    const documents = await Document.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('문서 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 문서 가져오기
router.get('/my', auth, async (req, res) => {
  try {
    const documents = await Document.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('문서 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 문서 가져오기
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다.' });
    }
    
    // 관리자가 아니고 문서 작성자가 아니면 접근 거부
    if (req.user.role !== 'admin' && (!document.author || document.author.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: '이 문서에 접근할 권한이 없습니다.' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('문서 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 원본 파일 다운로드
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다.' });
    }
    
    // 관리자가 아니고 문서 작성자가 아니면 접근 거부
    if (req.user.role !== 'admin' && (!document.author || document.author.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: '이 문서에 접근할 권한이 없습니다.' });
    }

    // 파일 경로 확인
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
    }

    // 원본 파일명 설정 (한글 파일명 처리)
    const originalName = encodeURIComponent(document.originalName);
    
    // Content-Disposition 헤더 설정
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${originalName}`);
    res.setHeader('Content-Type', document.contentType);
    
    // 파일 스트림 전송
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('파일 다운로드 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 문서 복제
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다.' });
    }
    
    // 관리자가 아니고 문서 작성자가 아니면 접근 거부
    if (req.user.role !== 'admin' && (!document.author || document.author.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: '이 문서에 접근할 권한이 없습니다.' });
    }
    
    // 새 파일 이름 생성
    const newFileName = `duplicate-${Date.now()}-${document.fileName}`;
    const newFilePath = path.join(UPLOAD_PATH, newFileName);
    
    // 파일 복사
    if (fs.existsSync(document.filePath)) {
      fs.copyFileSync(document.filePath, newFilePath);
    }
    
    // 새 문서 생성
    const newDocument = new Document({
      author: req.user._id,
      originalName: `복사본 - ${document.originalName}`,
      fileName: newFileName,
      filePath: newFilePath,
      fileSize: document.fileSize,
      contentType: document.contentType,
      markdownContent: document.markdownContent,
      conversionMethod: document.conversionMethod,
      processingTime: document.processingTime,
      originalUrl: document.originalUrl
    });
    
    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (err) {
    console.error('문서 복제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 파일 업로드 및 변환
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const results = [];
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });
    }

    // 각 파일에 대해 처리
    for (const file of files) {
      let result, metadata;
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      
      // 이미지 파일인지 확인
      const isImage = file.mimetype.startsWith('image/');
      
      // OpenAI API 키 가져오기 (요청에서 또는 환경 변수에서)
      const openaiApiKey = req.body.openai_api_key || OPENAI_API_KEY;
      const openaiModel = req.body.openai_model || OPENAI_MODEL;
      
      if (isImage && openaiApiKey) {
        // 이미지 파일이고 API 키가 있으면 OCR 처리
        try {
          // 이미지 파일을 Base64로 인코딩
          const imageBuffer = fs.readFileSync(file.path);
          const base64Image = imageBuffer.toString('base64');
          const dataURI = `data:${file.mimetype};base64,${base64Image}`;
          
          // OpenAI API 호출
          const ocrResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            JSON.stringify({
              model: openaiModel,
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
                'Authorization': `Bearer ${openaiApiKey}`
              }
            }
          );
          
          result = ocrResponse.data.choices[0].message.content;
          metadata = {
            content_type: file.mimetype,
            conversion_method: 'openai_ocr',
            processing_time: 0,
            file_size: file.size,
            original_url: null
          };
          
          console.log('OCR 처리 성공:', file.originalname);
        } catch (ocrErr) {
          console.error('OCR 처리 오류:', ocrErr);
          
          // OCR 처리 실패 시 기본 API로 폴백
          const FormData = require('form-data');
          const formData = new FormData();
          const fileBuffer = fs.readFileSync(file.path);
          formData.append('file', fileBuffer, {
            filename: originalName,
            contentType: file.mimetype
          });
          
          // OpenAI API 키와 모델 이름 추가
          if (openaiApiKey) {
            formData.append('openai_api_key', openaiApiKey);
            formData.append('openai_model', openaiModel);
          }
          
          // MarkItDown API 호출
          const response = await axios.post(`${API_URL}/convert`, formData, {
            headers: {
              'X-API-Key': API_KEY,
              ...formData.getHeaders()
            }
          });
          
          // 응답 데이터 추출
          result = response.data.result;
          metadata = response.data.metadata;
        }
      } else {
        // 이미지가 아니거나 API 키가 없으면 기존 API 사용
        const FormData = require('form-data');
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(file.path);
        formData.append('file', fileBuffer, {
          filename: originalName,
          contentType: file.mimetype
        });
        
        // OpenAI API 키와 모델 이름 추가
        if (openaiApiKey) {
          formData.append('openai_api_key', openaiApiKey);
          formData.append('openai_model', openaiModel);
        }
        
        // MarkItDown API 호출
        const response = await axios.post(`${API_URL}/convert`, formData, {
          headers: {
            'X-API-Key': API_KEY,
            ...formData.getHeaders()
          }
        });
        
        // 응답 데이터 추출
        result = response.data.result;
        metadata = response.data.metadata;
      }

      // 문서 저장
      const document = new Document({
        author: req.user._id,
        originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        contentType: metadata.content_type,
        markdownContent: result,
        conversionMethod: metadata.conversion_method,
        processingTime: metadata.processing_time,
        originalUrl: metadata.original_url
      });

      await document.save();
      results.push(document);
    }

    res.status(201).json(results);
  } catch (err) {
    console.error('파일 업로드 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
  }
});

// URL을 통한 변환
router.post('/convert-url', auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL이 제공되지 않았습니다.' });
    }

    // 요청 데이터 준비
    let requestData = `url=${encodeURIComponent(url)}`;
    
    // OpenAI API 키와 모델 이름 추가
    if (OPENAI_API_KEY) {
      requestData += `&openai_api_key=${encodeURIComponent(OPENAI_API_KEY)}`;
      requestData += `&openai_model=${encodeURIComponent(OPENAI_MODEL)}`;
    }

    // MarkItDown API 호출
    const response = await axios.post(`${API_URL}/convert`, requestData, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // 응답 데이터 추출
    const { result, metadata } = response.data;

    // 파일 이름 생성
    const fileName = `url-${Date.now()}.md`;
    const filePath = path.join(UPLOAD_PATH, fileName);

    // 마크다운 내용을 파일로 저장
    fs.writeFileSync(filePath, result);

    // 문서 저장
    const document = new Document({
      author: req.user._id,
      originalName: url,
      fileName: fileName,
      filePath: filePath,
      fileSize: metadata.file_size,
      contentType: metadata.content_type,
      markdownContent: result,
      conversionMethod: metadata.conversion_method,
      processingTime: metadata.processing_time,
      originalUrl: url
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    console.error('URL 변환 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
  }
});

// 문서 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다.' });
    }
    
    // 관리자가 아니고 문서 작성자가 아니면 접근 거부
    if (req.user.role !== 'admin' && (!document.author || document.author.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: '이 문서에 접근할 권한이 없습니다.' });
    }

    // 파일 삭제
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // 문서 삭제
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: '문서가 삭제되었습니다.' });
  } catch (err) {
    console.error('문서 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 여러 문서 삭제
router.delete('/', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '삭제할 문서 ID가 제공되지 않았습니다.' });
    }
    
    // 관리자가 아니면 자신의 문서만 삭제 가능하도록 필터링
    let documentsToDelete = [];
    if (req.user.role !== 'admin') {
      // 사용자가 소유한 문서 ID만 필터링
      const userDocuments = await Document.find({ 
        _id: { $in: ids },
        author: req.user._id
      });
      
      documentsToDelete = userDocuments.map(doc => doc._id);
      
      if (documentsToDelete.length === 0) {
        return res.status(403).json({ message: '삭제할 권한이 있는 문서가 없습니다.' });
      }
    } else {
      documentsToDelete = ids;
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 각 문서에 대해 처리
    for (const id of documentsToDelete) {
      try {
        const document = await Document.findById(id);
        
        if (!document) {
          results.failed++;
          results.errors.push({ id, message: '문서를 찾을 수 없습니다.' });
          continue;
        }

        // 파일 삭제
        if (fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath);
        }

        // 문서 삭제
        await Document.findByIdAndDelete(id);
        results.success++;
      } catch (err) {
        console.error(`문서 ID ${id} 삭제 오류:`, err);
        results.failed++;
        results.errors.push({ id, message: err.message });
      }
    }
    
    res.json({ 
      message: `${results.success}개의 문서가 삭제되었습니다. ${results.failed}개 실패.`,
      results 
    });
  } catch (err) {
    console.error('여러 문서 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
