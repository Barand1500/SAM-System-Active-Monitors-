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
    // SMS entegrasyonu placeholder
    // Production'da Netgsm, Twilio, vb. entegrasyonu eklemelisiniz
    
    if (!data.recipients || data.recipients.length === 0) {
      throw new Error("Recipients list is required");
    }
    
    if (!data.message || data.message.trim() === "") {
      throw new Error("Message content is required");
    }
    
    console.warn('[SmsService] SMS sending - INTEGRATION PENDING', {
      companyId,
      userId,
      recipientCount: data.recipients.length,
      provider: process.env.SMS_PROVIDER || 'not-configured'
    });
    
    const record = await smsRepo.createHistory({
      companyId,
      message: data.message,
      recipients: data.recipients,
      sendTo: data.sendTo || "all",
      templateUsed: data.templateUsed || null,
      status: "pending", // TODO: Integration with real SMS provider
      sentBy: userId,
      sentAt: new Date(),
    });

    return record;
  }
}

module.exports = new SmsService();
