const TaskService = require("../services/TaskService");
const { TaskStatus, TaskPriority, Workspace, Project, TaskList } = require("../models");
const logger = require("../utils/logger");

class TaskController {
  async getConfig(req, res) {
    const startTime = Date.now();
    try {
      // Auth kontrolü
      if (!req.user || !req.user.company_id) {
        logger.error('TASK-CONFIG', 'Kullanıcı doğrulanamadı', { user: req.user });
        return res.status(401).json({ error: 'Kullanıcı doğrulanamadı' });
      }
      
      const companyId = req.user.company_id;
      logger.info('TASK-CONFIG', `Config yükleniyor`, { companyId });
      
      // Statuses ve priorities
      let statuses = [];
      let priorities = [];
      
      try {
        statuses = await TaskStatus.findAll({ 
          where: { companyId }, 
          order: [['order_no', 'ASC']] 
        });
        logger.debug('TASK-CONFIG', `${statuses.length} status yüklendi`);
      } catch (err) {
        logger.warning('TASK-CONFIG', 'Status yükleme hatası', err);
      }
      
      try {
        priorities = await TaskPriority.findAll({ 
          where: { companyId }, 
          order: [['order_no', 'ASC']] 
        });
        logger.debug('TASK-CONFIG', `${priorities.length} priority yüklendi`);
      } catch (err) {
        logger.warning('TASK-CONFIG', 'Priority yükleme hatası', err);
      }
      
      // Varsayılan TaskList ID
      let defaultTaskListId = null;
      try {
        const workspace = await Workspace.findOne({ where: { companyId } });
        if (workspace) {
          const project = await Project.findOne({ where: { workspaceId: workspace.id } });
          if (project) {
            const taskList = await TaskList.findOne({ 
              where: { projectId: project.id }, 
              order: [['order_no', 'ASC']] 
            });
            if (taskList) defaultTaskListId = taskList.id;
          }
        }
      } catch (err) {
        logger.warning('TASK-CONFIG', 'TaskList yükleme hatası', err);
      }
      
      logger.success('TASK-CONFIG', 'Config başarıyla yüklendi', { 
        statuses: statuses.length, 
        priorities: priorities.length, 
        defaultTaskListId 
      });
      logger.perf('TASK-CONFIG', 'getConfig', Date.now() - startTime);
      
      res.json({ 
        statuses: statuses || [], 
        priorities: priorities || [], 
        defaultTaskListId: defaultTaskListId || null
      });
    } catch (err) {
      logger.error('TASK-CONFIG', 'Config yüklenirken hata', err);
      res.status(500).json({ error: err.message });
    }
  }

  async createTask(req, res) {
    try {
      logger.info('TASK-CREATE', 'Yeni görev oluşturuluyor', { title: req.body.title });
      
      const { title, description, taskListId, statusId, priorityId, type, departmentId, categoryId, dueDate, startDate, estimatedHours, parentTaskId } = req.body;
      
      // Validation
      if (!title || title.trim() === '') {
        logger.warning('TASK-CREATE', 'Görev başlığı eksik');
        return res.status(422).json({ error: 'Görev başlığı gereklidir' });
      }
      if (!taskListId) {
        logger.warning('TASK-CREATE', 'Task list ID eksik');
        return res.status(422).json({ error: 'Task list ID gereklidir' });
      }
      if (!statusId) {
        logger.warning('TASK-CREATE', 'Status ID eksik');
        return res.status(422).json({ error: 'Status ID gereklidir' });
      }
      if (!priorityId) {
        logger.warning('TASK-CREATE', 'Priority ID eksik');
        return res.status(422).json({ error: 'Priority ID gereklidir' });
      }
      
      const task = await TaskService.create({
        title, 
        description: description || '', 
        taskListId, 
        statusId, 
        priorityId, 
        type: type || 'task', 
        departmentId: departmentId || null, 
        categoryId: categoryId || null, 
        dueDate: dueDate || null, 
        startDate: startDate || null, 
        estimatedHours: estimatedHours || 0, 
        parentTaskId: parentTaskId || null,
        companyId: req.user.company_id,
        creatorId: req.user.id
      });
      
      logger.success('TASK-CREATE', `Görev oluşturuldu: #${task.id}`, { title: task.title });
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