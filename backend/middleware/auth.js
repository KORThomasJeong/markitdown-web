const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// 인증 미들웨어
exports.auth = async (req, res, next) => {
  try {
    // 토큰 가져오기
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('인증 미들웨어 - 요청 경로:', req.path);
    console.log('인증 미들웨어 - 토큰:', token ? '토큰 있음' : '토큰 없음');
    
    if (!token) {
      console.log('인증 미들웨어 - 오류: 인증 토큰이 없습니다.');
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }
    
    // 토큰 검증
    try {
      // 토큰 검증 시도
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('인증 미들웨어 - 토큰 검증 성공:', decoded);
      
      // 사용자 찾기
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('인증 미들웨어 - 오류: 유효하지 않은 토큰입니다. 사용자를 찾을 수 없습니다.');
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
      }
      
      // 이메일 인증 확인
      if (!user.isVerified) {
        console.log('인증 미들웨어 - 오류: 이메일 인증이 필요합니다.');
        return res.status(403).json({ message: '이메일 인증이 필요합니다.' });
      }
      
      // 관리자 승인 확인
      if (!user.isApproved) {
        console.log('인증 미들웨어 - 오류: 관리자 승인이 필요합니다.');
        return res.status(403).json({ message: '관리자 승인이 필요합니다.' });
      }
      
      // 요청 객체에 사용자 정보 추가
      req.user = user;
      console.log('인증 미들웨어 - 인증 성공:', user.email);
      next();
    } catch (jwtError) {
      console.log('인증 미들웨어 - JWT 검증 오류:', jwtError.message);
      res.status(401).json({ message: '인증에 실패했습니다. 토큰이 유효하지 않습니다.' });
    }
  } catch (error) {
    console.error('인증 오류:', error);
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};

// 관리자 권한 확인 미들웨어
exports.admin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      console.log('권한 확인 미들웨어 - 오류: 관리자 권한이 필요합니다.');
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    
    console.log('권한 확인 미들웨어 - 관리자 권한 확인 성공');
    next();
  } catch (error) {
    console.error('권한 확인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 토큰 생성 함수
exports.generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  console.log('토큰 생성 - 사용자:', user.email);
  console.log('토큰 생성 - JWT_SECRET:', JWT_SECRET.substring(0, 3) + '...');
  return token;
};
