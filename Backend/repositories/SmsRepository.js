const { SmsGroup, SmsHistory } = require("../models");

class SmsRepository {
  // === GROUPS ===
  async findGroupsByCompany(companyId) {
    return SmsGroup.findAll({
      where: { company_id: companyId },
      order: [["created_at", "DESC"]],
    });
  }

  async createGroup(data) {
    return SmsGroup.create(data);
  }

  async findGroupById(id, companyId) {
    return SmsGroup.findOne({ where: { id, company_id: companyId } });
  }

  async deleteGroup(id, companyId) {
    const group = await this.findGroupById(id, companyId);
    if (!group) throw new Error("Grup bulunamadı");
    await group.destroy();
    return { message: "Grup silindi" };
  }

  async updateGroup(id, companyId, data) {
    const group = await this.findGroupById(id, companyId);
    if (!group) throw new Error("Grup bulunamadı");
    if (data.name !== undefined) group.name = data.name;
    if (data.emoji !== undefined) group.emoji = data.emoji;
    if (data.memberIds !== undefined) group.memberIds = data.memberIds;
    await group.save();
    return group;
  }

  // === HISTORY ===
  async findHistoryByCompany(companyId) {
    return SmsHistory.findAll({
      where: { company_id: companyId },
      order: [["created_at", "DESC"]],
      limit: 100,
    });
  }

  async createHistory(data) {
    return SmsHistory.create(data);
  }
}

module.exports = new SmsRepository();
