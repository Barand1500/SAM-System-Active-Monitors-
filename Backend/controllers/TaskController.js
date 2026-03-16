const TaskService = require("../services/TaskService");
const AuditLogService = require("../services/AuditLogService");
const { TaskStatus, TaskPriority, Workspace, Project, TaskList, Task, sequelize } = require("../models");
const logger = require("../utils/logger");

// Audit log yardımcı fonksiyonu
const logAudit = async (req, type, action, description, entity, tableName, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity, tableName, recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit log hatası ana işlemi engellemesin */ }
};

// Task objesinden sadece anlamlı alanları çıkar (audit log için)
const pickTaskFields = (task) => {
  if (!task) return null;
  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate || task.due_date,
    startDate: task.startDate || task.start_date,
    estimatedHours: task.estimatedHours || task.estimated_hours,
    progressPercent: task.progressPercent || task.progress_percent,
    statusId: task.statusId || task.status_id,
    priorityId: task.priorityId || task.priority_id,
    departmentId: task.departmentId || task.department_id,
    type: task.type,
  };
};

const emitCompanyDataChanged = (req, payload) => {
  const io = req.app.get('io');
  const companyId = req.user?.company_id || req.user?.companyId;
  if (io && companyId) {
    io.to(`company_${companyId}`).emit('company:data-changed', payload);
  }
};

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
    const t = await sequelize.transaction();
    
    try {
      logger.info('TASK-CREATE', 'Yeni görev oluşturuluyor', { 
        title: req.body.title, 
        hasTaskListId: !!req.body.taskListId,
        hasStatusId: !!req.body.statusId,
        hasPriorityId: !!req.body.priorityId
      });
      
      let { title, description, taskListId, statusId, priorityId, type, departmentId, categoryId, dueDate, startDate, estimatedHours, parentTaskId } = req.body;
      
      // Validation - sadece title zorunlu
      if (!title || title.trim() === '') {
        await t.rollback();
        logger.warning('TASK-CREATE', 'Görev başlığı eksik');
        return res.status(422).json({ error: 'Görev başlığı gereklidir' });
      }
      
      const companyId = req.user.company_id;
      logger.info('TASK-CREATE', `CompanyId: ${companyId}`);
      
      // TaskListId yoksa, ilk mevcut liste bul veya oluştur
      if (!taskListId) {
        logger.info('TASK-CREATE', 'TaskListId eksik, varsayılan aranıyor');
        let workspace = await Workspace.findOne({ where: { companyId }, transaction: t });
        
        // Workspace yoksa oluştur
        if (!workspace) {
          logger.warning('TASK-CREATE', 'Workspace bulunamadı, oluşturuluyor', { companyId });
          workspace = await Workspace.create({
            name: 'Ana Çalışma Alanı',
            companyId: companyId,
            createdBy: req.user.id,
            description: 'Otomatik oluşturuldu'
          }, { transaction: t });
          logger.success('TASK-CREATE', `Workspace oluşturuldu: ${workspace.id}`);
        }
        logger.info('TASK-CREATE', `Workspace bulundu: ${workspace.id}`);
        
        let project = await Project.findOne({ where: { workspaceId: workspace.id }, transaction: t });
        
        // Project yoksa oluştur
        if (!project) {
          logger.warning('TASK-CREATE', 'Project bulunamadı, oluşturuluyor', { workspaceId: workspace.id });
          project = await Project.create({
            name: 'Genel Proje',
            workspaceId: workspace.id,
            createdBy: req.user.id,
            description: 'Otomatik oluşturuldu'
          }, { transaction: t });
          logger.success('TASK-CREATE', `Project oluşturuldu: ${project.id}`);
        }
        logger.info('TASK-CREATE', `Project bulundu: ${project.id}`);
        
        let taskList = await TaskList.findOne({ 
          where: { projectId: project.id }, 
          order: [['order_no', 'ASC']],
          transaction: t
        });
        
        // TaskList yoksa oluştur
        if (!taskList) {
          logger.warning('TASK-CREATE', 'TaskList bulunamadı, oluşturuluyor', { projectId: project.id });
          taskList = await TaskList.create({
            name: 'Yapılacaklar',
            projectId: project.id,
            orderNo: 1
          }, { transaction: t });
          logger.success('TASK-CREATE', `TaskList oluşturuldu: ${taskList.id}`);
        }
        
        taskListId = taskList.id;
        logger.info('TASK-CREATE', `TaskList kullanılıyor: ${taskListId}`);
      }
      
      // StatusId yoksa, ilk mevcut status bul veya oluştur
      if (!statusId) {
        logger.info('TASK-CREATE', 'StatusId eksik, varsayılan aranıyor');
        let status = await TaskStatus.findOne({ 
          where: { companyId }, 
          order: [['order_no', 'ASC']],
          transaction: t
        });
        
        // Status yoksa varsayılanları oluştur
        if (!status) {
          logger.warning('TASK-CREATE', 'Status bulunamadı, varsayılanlar oluşturuluyor');
          const defaultStatuses = [
            { name: 'Beklemede', color: '#94a3b8', order_no: 1, companyId },
            { name: 'Devam Ediyor', color: '#3b82f6', order_no: 2, companyId },
            { name: 'İncelemede', color: '#f59e0b', order_no: 3, companyId },
            { name: 'Tamamlandı', color: '#10b981', order_no: 4, companyId }
          ];
          await TaskStatus.bulkCreate(defaultStatuses, { transaction: t });
          status = await TaskStatus.findOne({ where: { companyId }, order: [['order_no', 'ASC']], transaction: t });
          logger.success('TASK-CREATE', `Varsayılan statuslar oluşturuldu`);
        }
        
        statusId = status.id;
        logger.info('TASK-CREATE', `Status kullanılıyor: ${statusId}`);
      }
      
      // PriorityId yoksa, ilk mevcut priority bul veya oluştur
      if (!priorityId) {
        logger.info('TASK-CREATE', 'PriorityId eksik, varsayılan aranıyor');
        let priority = await TaskPriority.findOne({ 
          where: { companyId }, 
          order: [['order_no', 'ASC']],
          transaction: t
        });
        
        // Priority yoksa varsayılanları oluştur
        if (!priority) {
          logger.warning('TASK-CREATE', 'Priority bulunamadı, varsayılanlar oluşturuluyor');
          const defaultPriorities = [
            { name: 'Düşük', color: '#94a3b8', order_no: 1, companyId },
            { name: 'Normal', color: '#3b82f6', order_no: 2, companyId },
            { name: 'Yüksek', color: '#f59e0b', order_no: 3, companyId },
            { name: 'Acil', color: '#ef4444', order_no: 4, companyId }
          ];
          await TaskPriority.bulkCreate(defaultPriorities, { transaction: t });
          priority = await TaskPriority.findOne({ where: { companyId }, order: [['order_no', 'ASC']], transaction: t });
          logger.success('TASK-CREATE', `Varsayılan priorityler oluşturuldu`);
        }
        
        priorityId = priority.id;
        logger.info('TASK-CREATE', `Priority kullanılıyor: ${priorityId}`);
      }
      
      // Görevi oluştur
      const taskData = {
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
        companyId: companyId,
        creatorId: req.user.id
      };
      
      logger.info('TASK-CREATE', 'Görev verisi hazır', taskData);
      const task = await Task.create(taskData, { transaction: t });
      logger.info('TASK-CREATE', 'Task.create tamamlandı', { taskId: task.id });
      
      // Transaction'ı commit et
      await t.commit();
      logger.success('TASK-CREATE', `✅ Görev DB'ye kaydedildi: #${task.id}`, { title: task.title });
      
      await logAudit(req, 'task_created', 'CREATE', `Görev oluşturuldu: ${task.title}`, 'Task', 'tasks', task.id, null, task);
      emitCompanyDataChanged(req, { entity: 'task', action: 'create', id: task.id });
      
      res.status(201).json(task);
    } catch (err) {
      // Hata durumunda transaction'ı geri al
      await t.rollback();
      logger.error('TASK-CREATE', '❌ Görev oluşturulurken hata (transaction rollback)', { 
        error: err.message,
        stack: err.stack 
      });
      res.status(400).json({ error: err.message });
    }
  }

  async getTasks(req, res) {
    const startTime = Date.now();
    try {
      logger.info('TASK-LIST', 'Görevler yükleniyor', { companyId: req.user.company_id });
      
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        logger.warning('TASK-LIST', 'Company ID eksik');
        return res.status(400).json({ error: "Company ID not found" });
      }
      
      const tasks = await TaskService.getByCompany(companyId);
      
      const duration = Date.now() - startTime;
      logger.success('TASK-LIST', `${tasks.length} görev yüklendi`);
      logger.perf('TASK-LIST', 'getTasks', duration);
      
      res.json(tasks || []);
    } catch (err) {
      logger.error('TASK-LIST', 'Görevler yüklenirken hata', err);
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
      const oldTask = await TaskService.getById(req.params.id, req.user.company_id);
      
      // Eğer dueDate güncelleniyorsa, sadece Boss yapabilir
      if (req.body.dueDate !== undefined) {
        const userRole = req.user.role;
        const userRoles = req.user.roles || (userRole ? [userRole] : []);
        
        if (!userRoles.includes('boss')) {
          logger.warning('TASK-UPDATE', 'Yetkisiz dueDate güncelleme denemesi', { 
            userId: req.user.id, 
            role: userRole, 
            roles: userRoles 
          });
          return res.status(403).json({ error: 'Sadece patron görev tarihini değiştirebilir' });
        }
      }
      
      const task = await TaskService.update(req.params.id, req.body, req.user.company_id);
      await logAudit(req, 'task_updated', 'UPDATE', `Görev güncellendi: ${task.title || ''}`, 'Task', 'tasks', task.id, pickTaskFields(oldTask), pickTaskFields(req.body));
      emitCompanyDataChanged(req, { entity: 'task', action: 'update', id: task.id });
      res.json(task);
    } catch (err) {
      console.error('[TaskController] updateTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async deleteTask(req, res) {
    try {
      const oldTask = await TaskService.getById(req.params.id, req.user.company_id);
      await TaskService.delete(req.params.id, req.user.company_id);
      await logAudit(req, 'task_deleted', 'DELETE', `Görev silindi: ${oldTask?.title || req.params.id}`, 'Task', 'tasks', req.params.id, pickTaskFields(oldTask), null);
      emitCompanyDataChanged(req, { entity: 'task', action: 'delete', id: Number(req.params.id) });
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      console.error('[TaskController] deleteTask error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async assignUser(req, res) {
    try {
      const assignment = await TaskService.assignUser(req.params.id, req.body.user_id);
      await logAudit(req, 'task_assigned', 'UPDATE', `Göreve kullanıcı atandı (Task: ${req.params.id}, User: ${req.body.user_id})`, 'TaskAssignment', 'task_assignments', req.params.id, null, { userId: req.body.user_id });
      emitCompanyDataChanged(req, { entity: 'task_assignment', action: 'create', id: Number(req.params.id) });
      res.status(201).json(assignment);
    } catch (err) {
      console.error('[TaskController] assignUser error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async removeAssignment(req, res) {
    try {
      await TaskService.removeAssignment(req.params.id, req.params.userId);
      emitCompanyDataChanged(req, { entity: 'task_assignment', action: 'delete', id: Number(req.params.id) });
      res.json({ message: "Assignment removed" });
    } catch (err) {
      console.error('[TaskController] removeAssignment error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskController();