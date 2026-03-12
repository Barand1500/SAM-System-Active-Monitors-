const TaskService = require("../services/TaskService");
const { TaskStatus, TaskPriority, Workspace, Project, TaskList } = require("../models");

class TaskController {
  async getConfig(req, res) {
    try {
      const companyId = req.user.company_id;
      
      if (!companyId) {
        console.error("[TaskController] getConfig - Missing company_id:", {
          userId: req.user.id,
          userEmail: req.user.email,
          allUserData: req.user
        });
        return res.status(400).json({ 
          error: "Company ID not found in user data",
          debug: {
            userId: req.user.id,
            hasCompanyId: !!req.user.company_id,
            userKeys: Object.keys(req.user)
          }
        });
      }

      // Veritabanı sorgularını yap
      // Statuses ve priorities - boş liste de olabilir
      const statuses = await TaskStatus.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']],  // Sıralama ekledim, böylece öncelik sırasına göre gelirler Ali
        raw: true
      });
      const priorities = await TaskPriority.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']], // Sıralama ekledim, böylece öncelik sırasına göre gelirler Ali
        raw: true
      });
      
      // Varsayılan TaskList ID'sini bul
      const workspace = await Workspace.findOne({ where: { companyId } });
      let defaultTaskListId = null;
      if (workspace) {
        const project = await Project.findOne({ where: { workspaceId: workspace.id } });
        if (project) {
          const taskList = await TaskList.findOne({ 
            where: { projectId: project.id }, 
            order: [['orderNo', 'ASC']] 
          });
          if (taskList) defaultTaskListId = taskList.id;
        }
      }
      
      // Boş sonuç da normal, başarılı response dön
      res.json({ 
        statuses: statuses || [], 
        priorities: priorities || [], 
        defaultTaskListId 
      });
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.getConfig error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async createTask(req, res) {
    try {
      const { title, description, taskListId, statusId, priorityId, type, departmentId, categoryId, dueDate, startDate, estimatedHours, parentTaskId } = req.body;
      const task = await TaskService.create({
        title, description, taskListId, statusId, priorityId, type, departmentId, categoryId, dueDate, startDate, estimatedHours, parentTaskId,
        companyId: req.user.company_id,
        creatorId: req.user.id
      });
      res.status(201).json(task);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.createTask error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async getTasks(req, res) {
    try {
      const tasks = await TaskService.getByCompany(req.user.company_id);
      res.json(tasks);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.getTasks error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async getTasksByList(req, res) {
    try {
      const tasks = await TaskService.getByTaskList(req.params.listId);
      res.json(tasks);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.getTasksByList error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async getTask(req, res) {
    try {
      const task = await TaskService.getById(req.params.id, req.user.company_id);
      if (!task) return res.status(404).json({ error: "🔥 YENİ SÜRÜM v1.0 - Task not found" });
      res.json(task);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.getTask error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async updateTask(req, res) {
    try {
      const task = await TaskService.update(req.params.id, req.body, req.user.company_id);
      res.json(task);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.updateTask error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async deleteTask(req, res) {
    try {
      await TaskService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.deleteTask error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async assignUser(req, res) {
    try {
      const assignment = await TaskService.assignUser(req.params.id, req.body.user_id);
      res.status(201).json(assignment);
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.assignUser error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }

  async removeAssignment(req, res) {
    try {
      await TaskService.removeAssignment(req.params.id, req.params.userId);
      res.json({ message: "Assignment removed" });
    } catch (err) {
      console.error('🔥 YENİ SÜRÜM v1.0 - TaskController.removeAssignment error:', err);
      res.status(400).json({ error: '🔥 YENİ SÜRÜM v1.0 - ' + err.message });
    }
  }
}

module.exports = new TaskController();