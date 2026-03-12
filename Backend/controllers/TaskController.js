const TaskService = require("../services/TaskService");
const { TaskStatus, TaskPriority, Workspace, Project, TaskList } = require("../models");

class TaskController {
  async getConfig(req, res) {
    try {
      const companyId = req.user.company_id;
      
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found in user data" });
      }

      // Veritabanı sorgularını yap
      const statuses = await TaskStatus.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']] 
      });
      
      const priorities = await TaskPriority.findAll({ 
        where: { companyId }, 
        order: [['orderNo', 'ASC']] 
      });
      
      // Varsayılan TaskList ID'sini bul
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
      } catch (workspaceErr) {
        console.warn("Workspace/Project/TaskList lookup failed:", workspaceErr.message);
        // defaultTaskListId null olarak kalacak, bu normal bir durum
      }

      // Boş sonuç bile olsa başarılı response dön
      res.json({ 
        statuses: statuses || [], 
        priorities: priorities || [], 
        defaultTaskListId 
      });
    } catch (err) {
      console.error("TaskController.getConfig error:", err);
      res.status(500).json({ error: "Failed to fetch task configuration: " + err.message });
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
      res.status(400).json({ error: err.message });
    }
  }

  async getTasks(req, res) {
    try {
      const tasks = await TaskService.getByCompany(req.user.company_id);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getTasksByList(req, res) {
    try {
      const tasks = await TaskService.getByTaskList(req.params.listId);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getTask(req, res) {
    try {
      const task = await TaskService.getById(req.params.id, req.user.company_id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateTask(req, res) {
    try {
      const task = await TaskService.update(req.params.id, req.body, req.user.company_id);
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteTask(req, res) {
    try {
      await TaskService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async assignUser(req, res) {
    try {
      const assignment = await TaskService.assignUser(req.params.id, req.body.user_id);
      res.status(201).json(assignment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async removeAssignment(req, res) {
    try {
      await TaskService.removeAssignment(req.params.id, req.params.userId);
      res.json({ message: "Assignment removed" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskController();