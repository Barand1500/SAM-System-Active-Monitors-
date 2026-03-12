const ProjectService = require("../services/ProjectService");

class ProjectController {
  async list(req, res) {
    try {
      const projects = await ProjectService.getByWorkspace(req.params.workspaceId);
      res.json(projects);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listByCompany(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const projects = await ProjectService.getByCompany(companyId);
      res.json(projects || []);
    } catch (err) {
      console.error('[ProjectController] listByCompany error:', err.message);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  async get(req, res) {
    try {
      const project = await ProjectService.getById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const { name, description, workspaceId, color, icon, startDate, endDate, members } = req.body;
      const project = await ProjectService.create({
        name, description, workspaceId, color, icon, startDate, endDate,
        createdBy: req.user.id,
        companyId: companyId
      });
      res.status(201).json(project);
    } catch (err) {
      console.error('[ProjectController] create error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await ProjectService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addMember(req, res) {
    try {
      const member = await ProjectService.addMember(req.params.id, req.body.user_id, req.body.role);
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async removeMember(req, res) {
    try {
      await ProjectService.removeMember(req.params.id, req.params.userId);
      res.json({ message: "Member removed" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new ProjectController();
