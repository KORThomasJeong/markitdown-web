const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, auth, admin } = require('../middleware/auth');
const { sendVerificationEmail, sendApprovalEmail, sendPasswordResetEmail } = require('../utils/emailService');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 인증 토큰 생성
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // 사용자 생성
    const user = new User({
      name,
      email,
      password,
      verificationToken
    });
    
    await user.save();
    
    // 인증 이메일 전송
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${serverUrl}/verify-email/${verificationToken}`;
    
    try {
      await sendVerificationEmail(user, verificationUrl);
    } catch (emailError) {
      console.error('인증 이메일 전송 오류:', emailError);
      // 이메일 전송 실패 시에도 회원가입은 성공으로 처리
    }
    
    res.status(201).json({ 
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.' 
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이메일 인증
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // 토큰으로 사용자 찾기
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 인증 토큰입니다.' });
    }
    
    // 사용자 인증 상태 업데이트
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // 프론트엔드 인증 완료 페이지로 리다이렉트
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    res.redirect(`${serverUrl}/verification-success`);
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 이메일 인증 확인
    if (!user.isVerified) {
      return res.status(403).json({ message: '이메일 인증이 필요합니다.' });
    }
    
    // 관리자 승인 확인
    if (!user.isApproved) {
      return res.status(403).json({ message: '관리자 승인이 필요합니다.' });
    }
    
    // 토큰 생성
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정 요청
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: '해당 이메일로 등록된 사용자가 없습니다.' });
    }
    
    // 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 사용자 정보 업데이트
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1시간
    await user.save();
    
    // 재설정 이메일 전송
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${serverUrl}/reset-password/${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      console.error('비밀번호 재설정 이메일 전송 오류:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ message: '이메일 전송에 실패했습니다.' });
    }
    
    res.json({ message: '비밀번호 재설정 이메일이 전송되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // 토큰으로 사용자 찾기
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
    
    // 비밀번호 업데이트
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보 가져오기
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 모든 사용자 목록 가져오기
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 사용자 승인
router.put('/users/:id/approve', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 이미 승인된 사용자인지 확인
    if (user.isApproved) {
      return res.status(400).json({ message: '이미 승인된 사용자입니다.' });
    }
    
    // 사용자 승인
    user.isApproved = true;
    await user.save();
    
    // 승인 이메일 전송
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const loginUrl = `${serverUrl}/login`;
    
    try {
      await sendApprovalEmail(user, loginUrl);
    } catch (emailError) {
      console.error('승인 이메일 전송 오류:', emailError);
      // 이메일 전송 실패 시에도 승인은 성공으로 처리
    }
    
    res.json({ message: '사용자가 성공적으로 승인되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 사용자 역할 변경
router.put('/users/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: '유효하지 않은 역할입니다.' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 역할 변경
    user.role = role;
    await user.save();
    
    res.json({ message: '사용자 역할이 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('사용자 역할 변경 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 사용자 이메일 수동 인증
router.put('/users/:id/verify', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 이미 인증된 사용자인지 확인
    if (user.isVerified) {
      return res.status(400).json({ message: '이미 인증된 사용자입니다.' });
    }
    
    // 사용자 이메일 인증
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.json({ message: '사용자 이메일이 성공적으로 인증되었습니다.' });
  } catch (error) {
    console.error('사용자 이메일 인증 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 사용자 삭제
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 자기 자신은 삭제할 수 없음
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '자기 자신은 삭제할 수 없습니다.' });
    }
    
    await user.deleteOne();
    
    res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 여러 사용자 삭제
router.delete('/users', auth, admin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '삭제할 사용자 ID 목록이 필요합니다.' });
    }
    
    // 자기 자신이 포함되어 있는지 확인
    if (ids.includes(req.user._id.toString())) {
      return res.status(400).json({ message: '자기 자신은 삭제할 수 없습니다.' });
    }
    
    const result = await User.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: `${result.deletedCount}명의 사용자가 성공적으로 삭제되었습니다.` 
    });
  } catch (error) {
    console.error('사용자 일괄 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
