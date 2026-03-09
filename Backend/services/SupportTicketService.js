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
    if (!ticket || ticket.company_id !== company_id) {
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

  async addMessage(ticket_id, user_id, messageText, isInternal = false) {
    return TicketMessage.create({
      ticket_id,
      user_id,
      message_text: messageText,
      is_internal: isInternal
    });
  }

  async addFile(ticket_id, message_id, fileData) {
    return TicketFile.create({
      ticket_id,
      message_id,
      file_url: fileData.file_url,
      file_name: fileData.file_name,
      file_size: fileData.file_size,
      uploaded_by: fileData.uploaded_by
    });
  }

  async updateStatus(id, status, company_id) {
    const updateData = { status };
    
    if (status === "resolved") {
      updateData.resolved_at = new Date();
    } else if (status === "closed") {
      updateData.closed_at = new Date();
    }

    return ticketRepo.update(id, updateData, company_id);
  }

  async assignTicket(id, user_id, company_id) {
    return this.update(id, { assigned_to: user_id }, company_id);
  }

  async getStats(company_id) {
    return ticketRepo.getStats(company_id);
  }

  async getByStatus(company_id, status) {
    return ticketRepo.getByStatus(company_id, status);
  }

  async checkUserAccess(ticket_id, user_id, company_id) {
    const ticket = await SupportTicket.findByPk(ticket_id);
    if (!ticket || ticket.company_id !== company_id) {
      return false;
    }
    return ticket.created_by === user_id || ticket.assigned_to === user_id;
  }
}

module.exports = new SupportTicketService();
