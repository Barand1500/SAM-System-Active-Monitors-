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
      const project = await ProjectService.create({
        ...req.body,
        created_by: req.user.id
      });
      res.status(201).json(project);
    } catch (err) {
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
