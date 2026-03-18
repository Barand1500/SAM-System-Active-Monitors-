const ticketRepo = require("../repositories/SupportTicketRepository");
const { SupportTicket, TicketMessage, TicketFile, TicketResolutionHistory } = require("../models");

class SupportTicketService {
  async create(data) {
    return ticketRepo.create(data);
  }

  async getByCompany(company_id, filters = {}) {
    return ticketRepo.findByCompany(company_id, filters);
  }

  async getById(id, company_id) {
    const ticket = await ticketRepo.findWithMessages(id);
    if (!ticket || ticket.companyId != company_id) {
      throw new Error("Destek talebi bulunamadı");
    }
    return ticket;
  }

  async update(id, data, company_id) {
    return ticketRepo.update(id, data, company_id);
  }

  async delete(id, company_id) {
    return ticketRepo.delete(id, company_id);
  }

  async addMessage(ticketId, userId, messageText, isInternal = false) {
    return TicketMessage.create({
      ticketId,
      userId,
      messageText,
      isInternal
    });
  }

  async addFile(ticketId, messageId, fileData) {
    return TicketFile.create({
      ticketId,
      messageId,
      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      uploadedBy: fileData.uploadedBy
    });
  }

  async updateStatus(id, status, company_id, extraData = {}) {
    const updateData = { status, ...extraData };
    
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    } else if (status === "closed") {
      updateData.closedAt = new Date();
    }

    return ticketRepo.update(id, updateData, company_id);
  }

  async assignTicket(id, userId, company_id) {
    return this.update(id, { assignedTo: userId }, company_id);
  }

  async getStats(company_id) {
    return ticketRepo.getStats(company_id);
  }

  async getByStatus(company_id, status) {
    return ticketRepo.getByStatus(company_id, status);
  }

  async checkUserAccess(ticketId, userId, companyId) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket || ticket.companyId != companyId) {
      return false;
    }
    return ticket.createdBy == userId || ticket.assignedTo == userId;
  }

  async reopenTicket(id, companyId, userId, reopenReason) {
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket || ticket.companyId != companyId) {
      throw new Error("Destek talebi bulunamadı");
    }
    if (ticket.status !== "resolved" && ticket.status !== "closed") {
      throw new Error("Sadece çözülmüş veya kapatılmış talepler tekrar açılabilir");
    }

    // Çözüm süresini hesapla
    const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
    const createdAt = new Date(ticket.createdAt);
    const durationSeconds = Math.floor((resolvedAt - createdAt) / 1000);

    // Mevcut çözümü history'ye kaydet
    await TicketResolutionHistory.create({
      ticketId: ticket.id,
      companyId: ticket.companyId,
      cycleNumber: (ticket.reopenCount || 0) + 1,
      resolvedBy: ticket.assignedTo,
      resolution: ticket.resolution,
      resolvedAt: ticket.resolvedAt,
      reopenedBy: userId,
      reopenedAt: new Date(),
      reopenReason: reopenReason || null,
      durationSeconds: durationSeconds > 0 ? durationSeconds : 0
    });

    // Ticket'i tekrar aç
    await ticket.update({
      status: "open",
      resolution: null,
      resolvedAt: null,
      assignedTo: null,
      reopenCount: (ticket.reopenCount || 0) + 1
    });

    return ticketRepo.findWithMessages(id);
  }

  async getResolutionHistory(id, companyId) {
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket || ticket.companyId != companyId) {
      throw new Error("Destek talebi bulunamadı");
    }
    return ticketRepo.getResolutionHistory(id);
  }
}

module.exports = new SupportTicketService();
