const logger = require("../utils/logger");

class MailService {
  async sendMail(to, subject, html) {
    // TODO: SMTP veya mail servis entegrasyonu yapılacak
    logger.info(`Mail gönderildi → ${to} | Konu: ${subject}`);
    return { success: true, to, subject };
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
