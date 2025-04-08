const express = require('express');
const router = express.Router();
const SmtpConfig = require('../models/SmtpConfig');
const { auth, admin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// SMTP 설정 목록 가져오기 (관리자만)
router.get('/', auth, admin, async (req, res) => {
  try {
    const smtpConfigs = await SmtpConfig.find().populate('createdBy', 'name email');
    res.json(smtpConfigs);
  } catch (error) {
    console.error('SMTP 설정 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 활성화된 SMTP 설정 가져오기 (관리자만)
router.get('/active', auth, admin, async (req, res) => {
  try {
    const smtpConfig = await SmtpConfig.findOne({ isActive: true }).populate('createdBy', 'name email');
    
    if (!smtpConfig) {
      return res.status(404).json({ message: '활성화된 SMTP 설정이 없습니다.' });
    }
    
    // 비밀번호는 제외하고 반환
    const config = smtpConfig.toObject();
    config.auth.pass = undefined;
    
    res.json(config);
  } catch (error) {
    console.error('활성화된 SMTP 설정 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// SMTP 설정 생성 (관리자만)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { host, port, secure, auth, fromEmail, fromName } = req.body;
    
    if (!host || !port || !auth || !auth.user || !auth.pass || !fromEmail || !fromName) {
      return res.status(400).json({ message: '모든 필수 항목을 입력해주세요.' });
    }
    
    // 같은 서비스의 다른 SMTP 설정 비활성화
    if (req.body.isActive) {
      await SmtpConfig.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }
    
    // SMTP 설정 생성
    const smtpConfig = new SmtpConfig({
      host,
      port,
      secure: secure !== undefined ? secure : true,
      auth,
      fromEmail,
      fromName,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdBy: req.user._id
    });
    
    await smtpConfig.save();
    
    // 비밀번호는 제외하고 반환
    const config = smtpConfig.toObject();
    config.auth.pass = undefined;
    
    res.status(201).json({
      message: 'SMTP 설정이 성공적으로 생성되었습니다.',
      smtpConfig: config
    });
  } catch (error) {
    console.error('SMTP 설정 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// SMTP 설정 업데이트 (관리자만)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { host, port, secure, auth, fromEmail, fromName, isActive } = req.body;
    
    // SMTP 설정 찾기
    const smtpConfig = await SmtpConfig.findById(id);
    
    if (!smtpConfig) {
      return res.status(404).json({ message: 'SMTP 설정을 찾을 수 없습니다.' });
    }
    
    // 같은 서비스의 다른 SMTP 설정 비활성화
    if (isActive) {
      await SmtpConfig.updateMany(
        { _id: { $ne: id }, isActive: true },
        { isActive: false }
      );
    }
    
    // SMTP 설정 업데이트
    if (host) smtpConfig.host = host;
    if (port) smtpConfig.port = port;
    if (secure !== undefined) smtpConfig.secure = secure;
    if (auth) {
      if (auth.user) smtpConfig.auth.user = auth.user;
      if (auth.pass) smtpConfig.auth.pass = auth.pass;
    }
    if (fromEmail) smtpConfig.fromEmail = fromEmail;
    if (fromName) smtpConfig.fromName = fromName;
    if (isActive !== undefined) smtpConfig.isActive = isActive;
    
    await smtpConfig.save();
    
    // 비밀번호는 제외하고 반환
    const config = smtpConfig.toObject();
    config.auth.pass = undefined;
    
    res.json({
      message: 'SMTP 설정이 성공적으로 업데이트되었습니다.',
      smtpConfig: config
    });
  } catch (error) {
    console.error('SMTP 설정 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// SMTP 설정 삭제 (관리자만)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // SMTP 설정 찾기
    const smtpConfig = await SmtpConfig.findById(id);
    
    if (!smtpConfig) {
      return res.status(404).json({ message: 'SMTP 설정을 찾을 수 없습니다.' });
    }
    
    // SMTP 설정 삭제
    await SmtpConfig.findByIdAndDelete(id);
    
    res.json({ message: 'SMTP 설정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('SMTP 설정 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// SMTP 설정 활성화/비활성화 (관리자만)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // SMTP 설정 찾기
    const smtpConfig = await SmtpConfig.findById(id);
    
    if (!smtpConfig) {
      return res.status(404).json({ message: 'SMTP 설정을 찾을 수 없습니다.' });
    }
    
    // 활성화 상태 토글
    const newActiveState = !smtpConfig.isActive;
    
    // 활성화하는 경우 다른 SMTP 설정 비활성화
    if (newActiveState) {
      await SmtpConfig.updateMany(
        { _id: { $ne: id }, isActive: true },
        { isActive: false }
      );
    }
    
    // SMTP 설정 업데이트
    smtpConfig.isActive = newActiveState;
    await smtpConfig.save();
    
    // 비밀번호는 제외하고 반환
    const config = smtpConfig.toObject();
    config.auth.pass = undefined;
    
    res.json({
      message: `SMTP 설정이 성공적으로 ${newActiveState ? '활성화' : '비활성화'}되었습니다.`,
      smtpConfig: config
    });
  } catch (error) {
    console.error('SMTP 설정 활성화/비활성화 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 활성화된 SMTP 설정 테스트 (관리자만)
router.post('/test-active', auth, admin, async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: '테스트 이메일 주소를 입력해주세요.' });
    }
    
    // 활성화된 SMTP 설정 가져오기
    const smtpConfig = await SmtpConfig.findOne({ isActive: true });
    
    if (!smtpConfig) {
      return res.status(404).json({ message: '활성화된 SMTP 설정이 없습니다.' });
    }
    
    // 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });
    
    // 테스트 이메일 전송
    const info = await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: testEmail,
      subject: 'SMTP 설정 테스트',
      html: `
        <h1>SMTP 설정 테스트</h1>
        <p>안녕하세요!</p>
        <p>이 이메일은 SMTP 설정이 올바르게 구성되었는지 확인하기 위한 테스트 이메일입니다.</p>
        <p>설정 정보:</p>
        <ul>
          <li>호스트: ${smtpConfig.host}</li>
          <li>포트: ${smtpConfig.port}</li>
          <li>보안 연결: ${smtpConfig.secure ? '사용' : '사용 안 함'}</li>
          <li>사용자: ${smtpConfig.auth.user}</li>
          <li>발신자 이메일: ${smtpConfig.fromEmail}</li>
          <li>발신자 이름: ${smtpConfig.fromName}</li>
        </ul>
        <p>이 이메일을 받으셨다면 SMTP 설정이 올바르게 구성된 것입니다.</p>
      `
    });
    
    console.log('이메일 전송 성공:', info.messageId);
    
    res.json({
      message: '테스트 이메일이 성공적으로 전송되었습니다.',
      info: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('SMTP 테스트 오류:', error);
    res.status(500).json({ 
      message: 'SMTP 테스트에 실패했습니다.',
      error: error.message
    });
  }
});

// SMTP 설정 테스트 (관리자만)
router.post('/test', auth, admin, async (req, res) => {
  try {
    const { host, port, secure, auth, fromEmail, fromName, testEmail } = req.body;
    
    if (!host || !port || !auth || !auth.user || !auth.pass || !fromEmail || !fromName || !testEmail) {
      return res.status(400).json({ message: '모든 필수 항목을 입력해주세요.' });
    }
    
    // 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure !== undefined ? secure : true,
      auth: {
        user: auth.user,
        pass: auth.pass
      }
    });
    
    // 테스트 이메일 전송
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: testEmail,
      subject: 'SMTP 설정 테스트',
      html: `
        <h1>SMTP 설정 테스트</h1>
        <p>안녕하세요!</p>
        <p>이 이메일은 SMTP 설정이 올바르게 구성되었는지 확인하기 위한 테스트 이메일입니다.</p>
        <p>설정 정보:</p>
        <ul>
          <li>호스트: ${host}</li>
          <li>포트: ${port}</li>
          <li>보안 연결: ${secure ? '사용' : '사용 안 함'}</li>
          <li>사용자: ${auth.user}</li>
          <li>발신자 이메일: ${fromEmail}</li>
          <li>발신자 이름: ${fromName}</li>
        </ul>
        <p>이 이메일을 받으셨다면 SMTP 설정이 올바르게 구성된 것입니다.</p>
      `
    });
    
    res.json({
      message: '테스트 이메일이 성공적으로 전송되었습니다.',
      info: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('SMTP 테스트 오류:', error);
    res.status(500).json({ 
      message: 'SMTP 테스트에 실패했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
