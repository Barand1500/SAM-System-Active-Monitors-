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
}

module.exports = new MailService();
