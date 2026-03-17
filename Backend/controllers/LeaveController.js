// Backend/controllers/LeaveController.js
const LeaveService = require("../services/LeaveService");
const AuditLogService = require("../services/AuditLogService");
const { createForUsers, createForCompany } = require("../utils/notificationDispatcher");
const { User } = require("../models");

const logAudit = async (req, type, action, description, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'LeaveRequest', tableName: 'leave_requests', recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

class LeaveController {
  async createLeave(req, res) {
    try {
      const { leaveType, startDate, endDate, leaveDays, reasonText, documentUrl } = req.body;
      const leave = await LeaveService.create({
        userId: req.user.id,
        leaveType,
        startDate,
        endDate,
        leaveDays,
        reasonText,
        documentUrl,
      });
      await logAudit(req, 'leave_created', 'CREATE', `İzin talebi oluşturuldu: ${leaveType} (${startDate} - ${endDate})`, leave.id, null, leave);
      
      // Boss'lara bildirim gönder
      try {
        const bosses = await User.findAll({
          where: { companyId: req.user.company_id || req.user.companyId, role: 'boss' },
          attributes: ['id']
        });
        const bossIds = bosses.map(b => Number(b.id)).filter(id => id !== Number(req.user.id));
        if (bossIds.length > 0) {
          const userName = `${req.user.firstName || req.user.first_name || ''} ${req.user.lastName || req.user.last_name || ''}`.trim();
          await createForUsers(req, bossIds, {
            title: 'Yeni izin talebi',
            message: `${userName} ${leaveType} izni talep etti (${startDate} - ${endDate}).`,
            type: 'leave',
            referenceType: 'leave',
            referenceId: Number(leave.id)
          });
        }
      } catch (e) { /* bildirim hatası ana işlemi engellemesin */ }
      
      res.status(201).json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getMyLeaves(req, res) {
    try {
      const leaves = await LeaveService.getByUser(req.user.id);
      res.json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getPendingLeaves(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const leaves = await LeaveService.getPendingByCompany(companyId);
      res.json(leaves || []);
    } catch (err) {
      console.error('[LeaveController] getPendingLeaves error:', err.message);
      res.status(500).json({ error: "Bekleyen izin talepleri yüklenirken hata oluştu" });
    }
  }

  async getAllLeaves(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const leaves = await LeaveService.getAllByCompany(companyId);
      res.json(leaves || []);
    } catch (err) {
      console.error('[LeaveController] getAllLeaves error:', err.message);
      res.status(500).json({ error: "İzin talepleri yüklenirken hata oluştu" });
    }
  }

  async approveLeave(req, res) {
    try {
      const leave = await LeaveService.approve(req.params.id, req.user.id);
      await logAudit(req, 'leave_approved', 'UPDATE', `İzin talebi onaylandı #${req.params.id}`, req.params.id, { status: 'pending' }, { status: 'approved' });
      
      // İzin sahibine bildirim gönder
      if (leave?.userId) {
        await createForUsers(req, [leave.userId], {
          title: 'İzin talebi onaylandı',
          message: `İzin talebiniz onaylandı.`,
          type: 'leave',
          referenceType: 'leave',
          referenceId: Number(req.params.id)
        }).catch(err => console.error('[Bildirim] İzin onay bildirimi gönderilemedi:', err.message));
      }
      
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async rejectLeave(req, res) {
    try {
      const leave = await LeaveService.reject(req.params.id, req.user.id, req.body.rejection_reason);
      await logAudit(req, 'leave_rejected', 'UPDATE', `İzin talebi reddedildi #${req.params.id}: ${req.body.rejection_reason || ''}`, req.params.id, { status: 'pending' }, { status: 'rejected', reason: req.body.rejection_reason });
      
      // İzin sahibine bildirim gönder
      if (leave?.userId) {
        await createForUsers(req, [leave.userId], {
          title: 'İzin talebi reddedildi',
          message: `İzin talebiniz reddedildi.${req.body.rejection_reason ? ' Sebep: ' + req.body.rejection_reason : ''}`,
          type: 'leave',
          referenceType: 'leave',
          referenceId: Number(req.params.id)
        }).catch(err => console.error('[Bildirim] İzin red bildirimi gönderilemedi:', err.message));
      }
      
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new LeaveController();