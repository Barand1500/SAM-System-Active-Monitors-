const SupportTicketService = require("../services/SupportTicketService");

class SupportTicketController {
  async create(req, res) {
    try {
      const ticket = await SupportTicketService.create({
        ...req.body,
        company_id: req.user.company_id,
        created_by: req.user.id
      });
      res.status(201).json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.assigned_to) filters.assigned_to = req.query.assigned_to;

      const tickets = await SupportTicketService.getByCompany(req.user.company_id, filters);
      res.json(tickets);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const ticket = await SupportTicketService.getById(req.params.id, req.user.company_id);
      res.json(ticket);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const ticket = await SupportTicketService.update(req.params.id, req.body, req.user.company_id);
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await SupportTicketService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Ticket deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const ticket = await SupportTicketService.updateStatus(
        req.params.id,
        req.body.status,
        req.user.company_id
      );
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async assign(req, res) {
    try {
      const ticket = await SupportTicketService.assignTicket(
        req.params.id,
        req.body.user_id,
        req.user.company_id
      );
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addMessage(req, res) {
    try {
      const message = await SupportTicketService.addMessage(
        req.params.id,
        req.user.id,
        req.body.message_text,
        req.body.is_internal || false
      );
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addFile(req, res) {
    try {
      const file = await SupportTicketService.addFile(
        req.params.id,
        req.body.message_id,
        {
          file_url: req.body.file_url,
          file_name: req.body.file_name,
          file_size: req.body.file_size,
          uploaded_by: req.user.id
        }
      );
      res.status(201).json(file);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await SupportTicketService.getStats(req.user.company_id);
      res.json(stats);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getByStatus(req, res) {
    try {
      const tickets = await SupportTicketService.getByStatus(req.user.company_id, req.params.status);
      res.json(tickets);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new SupportTicketController();
