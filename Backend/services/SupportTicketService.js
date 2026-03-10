const ticketRepo = require("../repositories/SupportTicketRepository");
const { SupportTicket, TicketMessage, TicketFile } = require("../models");

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
      throw new Error("Ticket not found");
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
}

module.exports = new SupportTicketService();
