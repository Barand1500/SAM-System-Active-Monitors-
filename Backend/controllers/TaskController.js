const TaskService = require("../services/TaskService");
const { TaskStatus, TaskPriority, Workspace, Project, TaskList } = require("../models");

class TaskController {
  async getConfig(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      
      if (!companyId) {
        console.error("[TaskController] getConfig - CRITICAL: Missing company_id:", {
          userId: req.user.id,
          userEmail: req.user.email,
          allUserData: req.user
        });
        return res.status(400).json({ 
          error: "Company ID not found in user data"
        });
      }

      // Veritabanı sorgularını yap
      // Statuses ve priorities - boş liste de olabilir
      const statuses = await TaskStatus.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']],
        raw: true
      });
      
      const priorities = await TaskPriority.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']],
        raw: true
      });
      
      // Varsayılan TaskList ID'sini bul (error handling ile)
      let defaultTaskListId = null;
      try {
        const workspace = await Workspace.findOne({ where: { companyId } });
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
      } catch (err) {
        console.warn('[TaskController] getConfig - Failed to find default task list:', err.message);
      }
      
      res.json({ 
        statuses: statuses || [], 
        priorities: priorities || [], 
        defaultTaskListId: defaultTaskListId || null
      });
    } catch (err) {
      console.error('[TaskController] getConfig error:', err.message);
      res.status(500).json({ error: "Failed to load task configuration" });
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
      console.error('[TaskController] createTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async getTasks(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const tasks = await TaskService.getByCompany(companyId);
      res.json(tasks || []);
    } catch (err) {
      console.error('[TaskController] getTasks error:', err.message);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  async getTasksByList(req, res) {
    try {
      const tasks = await TaskService.getByTaskList(req.params.listId);
      res.json(tasks);
    } catch (err) {
      console.error('[TaskController] getTasksByList error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async getTask(req, res) {
    try {
      const task = await TaskService.getById(req.params.id, req.user.company_id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (err) {
      console.error('[TaskController] getTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async updateTask(req, res) {
    try {
      const task = await TaskService.update(req.params.id, req.body, req.user.company_id);
      res.json(task);
    } catch (err) {
      console.error('[TaskController] updateTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async deleteTask(req, res) {
    try {
      await TaskService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      console.error('[TaskController] deleteTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async assignUser(req, res) {
    try {
      const assignment = await TaskService.assignUser(req.params.id, req.body.user_id);
      res.status(201).json(assignment);
    } catch (err) {
      console.error('[TaskController] assignUser error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async removeAssignment(req, res) {
    try {
      await TaskService.removeAssignment(req.params.id, req.params.userId);
      res.json({ message: "Assignment removed" });
    } catch (err) {
      console.error('[TaskController] removeAssignment error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskController();