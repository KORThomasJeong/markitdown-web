const nodemailer = require('nodemailer');
const SmtpConfig = require('../models/SmtpConfig');

// SMTP 설정 가져오기
async function getSmtpConfig() {
  try {
    const config = await SmtpConfig.findOne({ isActive: true });
    if (!config) {
      throw new Error('활성화된 SMTP 설정이 없습니다.');
    }
    return config;
  } catch (error) {
    console.error('SMTP 설정 가져오기 오류:', error);
    throw error;
  }
}

// 트랜스포터 생성
async function createTransporter() {
  try {
    const config = await getSmtpConfig();
    
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass
      }
    });
  } catch (error) {
    console.error('트랜스포터 생성 오류:', error);
    throw error;
  }
}

// 이메일 전송
async function sendEmail(to, subject, html) {
  try {
    const config = await getSmtpConfig();
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info.messageId);
    return info;
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    throw error;
  }
}

// 가입 확인 이메일 전송
async function sendVerificationEmail(user, verificationUrl) {
  const subject = '이메일 주소 확인';
  const html = `
    <h1>이메일 주소 확인</h1>
    <p>안녕하세요, ${user.name}님!</p>
    <p>MarkItDown 가입을 완료하려면 아래 링크를 클릭하여 이메일 주소를 확인해주세요.</p>
    <p><a href="${verificationUrl}" target="_blank">이메일 주소 확인하기</a></p>
    <p>링크가 작동하지 않는 경우, 아래 URL을 브라우저에 복사하여 붙여넣으세요:</p>
    <p>${verificationUrl}</p>
    <p>감사합니다.</p>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// 가입 승인 알림 이메일 전송
async function sendApprovalEmail(user, loginUrl) {
  const subject = '가입 승인 완료';
  const html = `
    <h1>가입 승인 완료</h1>
    <p>안녕하세요, ${user.name}님!</p>
    <p>MarkItDown 가입이 승인되었습니다. 이제 로그인하여 서비스를 이용하실 수 있습니다.</p>
    <p><a href="${loginUrl}" target="_blank">로그인하기</a></p>
    <p>감사합니다.</p>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// 비밀번호 재설정 이메일 전송
async function sendPasswordResetEmail(user, resetUrl) {
  const subject = '비밀번호 재설정';
  const html = `
    <h1>비밀번호 재설정</h1>
    <p>안녕하세요, ${user.name}님!</p>
    <p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정해주세요.</p>
    <p><a href="${resetUrl}" target="_blank">비밀번호 재설정하기</a></p>
    <p>링크가 작동하지 않는 경우, 아래 URL을 브라우저에 복사하여 붙여넣으세요:</p>
    <p>${resetUrl}</p>
    <p>이 링크는 1시간 동안 유효합니다.</p>
    <p>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>
    <p>감사합니다.</p>
  `;
  
  return await sendEmail(user.email, subject, html);
}

module.exports = {
  sendVerificationEmail,
  sendApprovalEmail,
  sendPasswordResetEmail
};
