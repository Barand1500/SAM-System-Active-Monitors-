const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class MailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      });
    }
    return this.transporter;
  }

  async sendMail(to, subject, html) {
    try {
      if (!process.env.SMTP_USER) {
        logger.warn(`Mail NOT sent (SMTP not configured) → ${to} | Konu: ${subject}`);
        return { success: false, reason: "SMTP not configured" };
      }

      const info = await this.getTransporter().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      logger.info(`Mail gönderildi → ${to} | Konu: ${subject} | ID: ${info.messageId}`);
      return { success: true, to, subject, messageId: info.messageId };
    } catch (err) {
      logger.error(`Mail gönderilemedi → ${to} | Hata: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendLeaveApprovalMail(userEmail, status) {
    const subject = status === "approved" ? "İzin Talebiniz Onaylandı" : "İzin Talebiniz Reddedildi";
    return this.sendMail(userEmail, subject, `<p>İzin talebiniz <strong>${status}</strong> olarak güncellendi.</p>`);
  }

  async sendWelcomeMail(userEmail, firstName) {
    return this.sendMail(userEmail, "SAM'e Hoş Geldiniz", `<p>Merhaba ${firstName}, SAM platformuna hoş geldiniz!</p>`);
  }

  async sendNewEmployeeMail(userEmail, firstName, password) {
    const loginUrl = process.env.FRONTEND_URL || 'https://sam.guzelteknoloji.com';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">SAM'e Hoş Geldiniz!</h2>
        <p>Merhaba <strong>${firstName}</strong>,</p>
        <p>SAM platformuna hesabınız oluşturuldu. Giriş bilgileriniz aşağıdadır:</p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>E-posta:</strong> ${userEmail}</p>
          <p style="margin: 5px 0;"><strong>Şifre:</strong> ${password}</p>
        </div>
        <p style="color: #ef4444;">⚠️ Güvenliğiniz için lütfen giriş yaptıktan sonra şifrenizi değiştirin.</p>
        <a href="${loginUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Giriş Yap</a>
      </div>
    `;
    return this.sendMail(userEmail, 'SAM - Hesap Bilgileriniz', html);
  }
}

module.exports = new MailService();
