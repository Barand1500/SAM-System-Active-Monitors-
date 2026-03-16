const ProjectService = require("../services/ProjectService");
const AuditLogService = require("../services/AuditLogService");

const logAudit = async (req, type, action, description, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'Project', tableName: 'projects', recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

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
      await logAudit(req, 'project_created', 'CREATE', `Proje oluşturuldu: ${name}`, project.id, null, project);
      res.status(201).json(project);
    } catch (err) {
      console.error('[ProjectController] create error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const oldProject = await ProjectService.getById(req.params.id);
      const project = await ProjectService.update(req.params.id, req.body);
      await logAudit(req, 'project_updated', 'UPDATE', `Proje güncellendi: ${project.name || ''}`, req.params.id, oldProject, req.body);
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const oldProject = await ProjectService.getById(req.params.id);
      await ProjectService.delete(req.params.id);
      await logAudit(req, 'project_deleted', 'DELETE', `Proje silindi: ${oldProject?.name || req.params.id}`, req.params.id, oldProject, null);
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
