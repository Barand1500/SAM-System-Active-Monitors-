const smsRepo = require("../repositories/SmsRepository");

class SmsService {
  // === GROUPS ===
  async listGroups(companyId) {
    return smsRepo.findGroupsByCompany(companyId);
  }

  async createGroup(companyId, userId, data) {
    return smsRepo.createGroup({
      companyId,
      name: data.name,
      emoji: data.emoji || "👥",
      memberIds: data.memberIds || [],
      createdBy: userId,
    });
  }

  async updateGroup(id, companyId, data) {
    return smsRepo.updateGroup(id, companyId, data);
  }

  async deleteGroup(id, companyId) {
    return smsRepo.deleteGroup(id, companyId);
  }

  // === SEND + HISTORY ===
  async listHistory(companyId) {
    return smsRepo.findHistoryByCompany(companyId);
  }

  async send(companyId, userId, data) {
    // TODO: Gerçek SMS entegrasyonu (Netgsm, Twilio vb.) buraya eklenecek
    // Şu an sadece DB'ye kaydediliyor
    const record = await smsRepo.createHistory({
      companyId,
      message: data.message,
      recipients: data.recipients,
      sendTo: data.sendTo || "all",
      templateUsed: data.templateUsed || null,
      status: "pending", // Gerçek entegrasyon olduğunda "sent" veya "failed" olacak
      sentBy: userId,
      sentAt: new Date(),
    });

    return record;
  }
}

module.exports = new SmsService();
