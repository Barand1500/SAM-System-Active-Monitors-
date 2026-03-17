const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.guzelteknoloji.com",
  port: 587,
  secure: false,
  auth: {
    user: "ali.kose@guzelteknoloji.com",
    pass: "Ali@Kose1",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Bellek içi doğrulama kodları { email -> { code, expiresAt } }
const verificationCodes = new Map();

class EmailService {
  async sendPasswordEmail(email, password, userName) {
    await transporter.sendMail({
      from: '"SAM Sistem" <ali.kose@guzelteknoloji.com>',
      to: email,
      subject: "SAM - Hesap Bilgileriniz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e293b; margin: 0;">SAM Sistem</h2>
            <p style="color: #64748b; font-size: 14px;">Hesap Bilgileri</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px;">
            <p style="color: #475569; font-size: 15px; margin-bottom: 8px;">Merhaba <strong>${userName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">Hesabınız başarıyla oluşturuldu. Giriş yapabilmeniz için şifreniz aşağıdadır:</p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #6366f1; background: #eef2ff; padding: 16px; border-radius: 8px; font-family: monospace;">
                ${password}
              </div>
            </div>
            <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Giriş yaptıktan sonra şifrenizi değiştirebilirsiniz.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">Bu e-posta SAM Sistem tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  }

  async sendVerificationCode(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 dakika

    verificationCodes.set(email.toLowerCase(), { code, expiresAt });

    await transporter.sendMail({
      from: '"SAM Sistem" <ali.kose@guzelteknoloji.com>',
      to: email,
      subject: "SAM - E-posta Doğrulama Kodu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e293b; margin: 0;">SAM Sistem</h2>
            <p style="color: #64748b; font-size: 14px;">E-posta Doğrulama</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; text-align: center;">
            <p style="color: #475569; font-size: 15px; margin-bottom: 16px;">Doğrulama kodunuz:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6366f1; background: #eef2ff; padding: 16px; border-radius: 8px;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Bu kod 5 dakika içinde geçerliliğini yitirir.</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  }

  verifyCode(email, code) {
    const entry = verificationCodes.get(email.toLowerCase());
    if (!entry) return { valid: false, message: "Doğrulama kodu bulunamadı. Tekrar gönderin." };
    if (Date.now() > entry.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return { valid: false, message: "Doğrulama kodunun süresi doldu. Tekrar gönderin." };
    }
    if (entry.code !== code) return { valid: false, message: "Geçersiz doğrulama kodu!" };
    verificationCodes.delete(email.toLowerCase());
    return { valid: true };
  }
}

module.exports = new EmailService();
