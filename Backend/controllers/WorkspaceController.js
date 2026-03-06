const WorkspaceService = require("../services/WorkspaceService");

class WorkspaceController {
  async list(req, res) {
    try {
      const workspaces = await WorkspaceService.getByCompany(req.user.company_id);
      res.json(workspaces);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const workspace = await WorkspaceService.getById(req.params.id);
      if (!workspace) return res.status(404).json({ error: "Workspace not found" });
      res.json(workspace);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const workspace = await WorkspaceService.create({
        ...req.body,
        company_id: req.user.company_id,
        created_by: req.user.id
      });
      res.status(201).json(workspace);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const workspace = await WorkspaceService.update(req.params.id, req.body);
      res.json(workspace);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await WorkspaceService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addMember(req, res) {
    try {
      const member = await WorkspaceService.addMember(req.params.id, req.body.user_id, req.body.role);
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async removeMember(req, res) {
    try {
      await WorkspaceService.removeMember(req.params.id, req.params.userId);
      res.json({ message: "Member removed" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new WorkspaceController();
