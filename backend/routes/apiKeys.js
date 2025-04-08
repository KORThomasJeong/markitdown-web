const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/api-keys
 * @desc    모든 API 키 가져오기 (관리자 전용)
 * @access  Private/Admin
 */
router.get('/', auth, admin, async (req, res) => {
  try {
    const apiKeys = await ApiKey.find().sort({ createdAt: -1 });
    res.json(apiKeys);
  } catch (err) {
    console.error('API 키 목록 가져오기 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/api-keys/active/:service
 * @desc    특정 서비스의 활성화된 API 키 가져오기
 * @access  Private
 */
router.get('/active/:service', auth, async (req, res) => {
  try {
    const { service } = req.params;
    
    const apiKey = await ApiKey.findOne({ 
      service: service.toLowerCase(),
      isActive: true 
    });
    
    if (!apiKey) {
      return res.status(404).json({ message: `활성화된 ${service} API 키가 없습니다.` });
    }
    
    res.json(apiKey);
  } catch (err) {
    console.error('활성화된 API 키 가져오기 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/api-keys/:id
 * @desc    특정 API 키 가져오기 (관리자 전용)
 * @access  Private/Admin
 */
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API 키를 찾을 수 없습니다.' });
    }
    
    res.json(apiKey);
  } catch (err) {
    console.error('API 키 가져오기 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/api-keys
 * @desc    새 API 키 생성 (관리자 전용)
 * @access  Private/Admin
 */
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, service, key, model, isActive } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({ message: 'API 키 이름과 키 값은 필수 입력 항목입니다.' });
    }
    
    // 같은 서비스의 다른 API 키가 활성화되어 있고, 새 API 키도 활성화하려는 경우
    if (isActive) {
      // 같은 서비스의 다른 모든 API 키를 비활성화
      await ApiKey.updateMany(
        { service: service.toLowerCase(), isActive: true },
        { isActive: false }
      );
    }
    
    const newApiKey = new ApiKey({
      name,
      service: service.toLowerCase(),
      key,
      model,
      isActive
    });
    
    await newApiKey.save();
    
    res.status(201).json({ 
      message: 'API 키가 성공적으로 생성되었습니다.',
      apiKey: newApiKey
    });
  } catch (err) {
    console.error('API 키 생성 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/api-keys/:id
 * @desc    API 키 업데이트 (관리자 전용)
 * @access  Private/Admin
 */
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, service, key, model, isActive } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({ message: 'API 키 이름과 키 값은 필수 입력 항목입니다.' });
    }
    
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API 키를 찾을 수 없습니다.' });
    }
    
    // 같은 서비스의 다른 API 키가 활성화되어 있고, 이 API 키도 활성화하려는 경우
    if (isActive && !apiKey.isActive) {
      // 같은 서비스의 다른 모든 API 키를 비활성화
      await ApiKey.updateMany(
        { service: service.toLowerCase(), isActive: true },
        { isActive: false }
      );
    }
    
    apiKey.name = name;
    apiKey.service = service.toLowerCase();
    apiKey.key = key;
    apiKey.model = model;
    apiKey.isActive = isActive;
    
    await apiKey.save();
    
    res.json({ 
      message: 'API 키가 성공적으로 업데이트되었습니다.',
      apiKey
    });
  } catch (err) {
    console.error('API 키 업데이트 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PATCH /api/api-keys/:id/toggle
 * @desc    API 키 활성화/비활성화 (관리자 전용)
 * @access  Private/Admin
 */
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API 키를 찾을 수 없습니다.' });
    }
    
    // API 키를 활성화하려는 경우
    if (!apiKey.isActive) {
      // 같은 서비스의 다른 모든 API 키를 비활성화
      await ApiKey.updateMany(
        { service: apiKey.service, isActive: true },
        { isActive: false }
      );
    }
    
    // 상태 토글
    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();
    
    res.json({ 
      message: `API 키가 ${apiKey.isActive ? '활성화' : '비활성화'}되었습니다.`,
      apiKey
    });
  } catch (err) {
    console.error('API 키 토글 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/api-keys/:id
 * @desc    API 키 삭제 (관리자 전용)
 * @access  Private/Admin
 */
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API 키를 찾을 수 없습니다.' });
    }
    
    await apiKey.deleteOne();
    
    res.json({ message: 'API 키가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('API 키 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
