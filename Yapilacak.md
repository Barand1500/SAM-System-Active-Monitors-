Mimari Mantığın SAM'a Uygulanması
Katman Akışı
HTTP İsteği
    ↓
routes/          → Sadece URL tanımı + middleware zinciri
    ↓
middleware/      → JWT doğrulama, rol kontrolü, input validasyon
    ↓
controllers/     → HTTP'yi karşıla, servis çağır, yanıt döndür
    ↓
services/        → İş mantığı (business logic), kurallar burada
    ↓
repositories/    → Sadece SQL/DB sorguları, başka hiçbir şey yok
    ↓
models/          → Tablo tanımları (Sequelize ya da sade obje)
    ↓
MySQL (sam_db)

SAM İçin Önerilen Dosya Yapısı
Backend/
├── app.js                          # Express kurulumu, middleware, route bağlama
├── server.js                       # http.createServer + socket.io + port dinleme
│
├── config/
│   └── database.js                 # MySQL bağlantı havuzu (mysql2/promise Pool)
│
├── middleware/
│   ├── authMiddleware.js                     # JWT doğrulama → req.user'ı doldurur
│   ├── roleCheck.js                # roleCheck('boss','manager') şeklinde kullanılır
│   ├── companyIsolation.js         # Her sorguda company_id = req.user.companyId kontrolü
│   ├── handlers.js                 # Global hata yakalayıcı + yanıt formatlama
│   └── ValidationMiddleware.js     # express-validator zincirleri
│
├── controllers/
│   ├── AuthController.js           # login, registerCompany, registerEmployee, me
│   ├── UserController.js           # CRUD + rol değiştir + bulk import
│   ├── DepartmentController.js     # CRUD
│   ├── WorkspaceController.js      # CRUD + üye yönetimi
│   ├── ProjectController.js        # CRUD + üye yönetimi
│   ├── TaskListController.js       # CRUD
│   ├── TaskController.js           # CRUD + durum güncelle + subtask
│   ├── TaskCommentController.js    # Yorum ekle/düzenle/sil
│   ├── TaskLogController.js        # Zaman takibi (start/stop)
│   ├── AttendanceController.js     # check-in, check-out, break
│   ├── LeaveController.js          # Talep oluştur, onayla, reddet
│   ├── AnnouncementController.js   # CRUD + sabitle
│   ├── NotificationController.js   # Liste, okundu işaretle
│   ├── FileController.js           # Upload, göreve ekle
│   ├── ReportController.js         # Genel/kişi/departman raporları
│   ├── SettingsController.js       # Şirket ayarları, task statuses/priorities
│   └── DashboardController.js      # Dashboard widget verisi
│
├── services/
│   ├── AuthService.js              # bcrypt karşılaştır, JWT üret, şirket kodu üret
│   ├── UserService.js              # Kullanıcı iş mantığı
│   ├── DepartmentService.js
│   ├── WorkspaceService.js
│   ├── ProjectService.js
│   ├── TaskService.js              # Görev oluşturma kuralları, subtask limiti, history kaydı
│   ├── TaskCommentService.js
│   ├── TaskLogService.js           # Süre hesaplama
│   ├── AttendanceService.js        # Çakışma kontrolü, mola ihlali hesaplama
│   ├── LeaveService.js             # Gün hesaplama, izin bakiyesi kontrolü
│   ├── AnnouncementService.js
│   ├── NotificationService.js      # Bildirim oluştur + socket.io emit
│   ├── FileService.js              # Multer + dosya validasyon
│   ├── ReportService.js            # İstatistik hesaplamaları
│   ├── RecurringTaskService.js     # next_run_at hesaplama, tetikleme
│   └── MailService.js              # Nodemailer (izin onayı, şifre sıfırlama vb.)
│
├── repositories/
│   ├── BaseRepository.js           # findById, findAll, create, update, delete (generic)
│   ├── UserRepository.js
│   ├── DepartmentRepository.js
│   ├── WorkspaceRepository.js
│   ├── ProjectRepository.js
│   ├── TaskListRepository.js
│   ├── TaskRepository.js           # Kompleks JOIN sorguları burada
│   ├── TaskCommentRepository.js
│   ├── TaskLogRepository.js
│   ├── AttendanceRepository.js
│   ├── LeaveRepository.js
│   ├── AnnouncementRepository.js
│   ├── NotificationRepository.js
│   ├── FileRepository.js
│   └── ReportRepository.js         # GROUP BY, aggregate sorgular
│
├── models/
│   ├── index.js                    # Tüm model export + ilişki tanımları
│   ├── Company.js
│   ├── Department.js
│   ├── User.js
│   ├── UserSkill.js
│   ├── Workspace.js
│   ├── WorkspaceMember.js
│   ├── Project.js
│   ├── ProjectMember.js
│   ├── TaskList.js
│   ├── TaskStatus.js
│   ├── TaskPriority.js
│   ├── Category.js
│   ├── Tag.js
│   ├── Task.js
│   ├── TaskAssignment.js
│   ├── TaskTag.js
│   ├── TaskComment.js
│   ├── TaskLog.js
│   ├── TaskHistory.js
│   ├── File.js
│   ├── TaskFile.js
│   ├── CommentFile.js
│   ├── Attendance.js
│   ├── BreakType.js
│   ├── Break.js
│   ├── LeaveRequest.js
│   ├── Notification.js
│   ├── CompanySetting.js
│   ├── Announcement.js
│   ├── AutomationRule.js
│   ├── RecurringTask.js
│   ├── UserDashboardSetting.js
│   └── AuditLog.js
│
├── routes/
│   ├── index.js                    # Hepsini /api altında toplar
│   ├── auth.js
│   ├── users.js
│   ├── departments.js
│   ├── workspaces.js
│   ├── projects.js
│   ├── taskLists.js
│   ├── tasks.js
│   ├── taskComments.js
│   ├── taskLogs.js
│   ├── attendance.js
│   ├── leaves.js
│   ├── announcements.js
│   ├── notifications.js
│   ├── files.js
│   ├── reports.js
│   ├── settings.js
│   └── dashboard.js
│
├── utils/
│   ├── encryption.js               # Şirket kodu üretimi, token helpers
│   ├── logger.js                   # Winston veya morgan logger
│   ├── ValidationUtils.js          # express-validator kural setleri
│   └── dateUtils.js                # İzin gün hesaplama, next_run_at vb.
│
├── temp/                           # Geçici dosya yüklemeleri
├── uploads/                        # Kalıcı dosya deposu
├── .env
└── package.json

Kritik Tasarım Kararları
1. Sequelize mi, raw SQL mi?

Önceki projende model yapısına bakılırsa Sequelize kullanıyorsun. SAM için de Sequelize önerilir çünkü ilişkiler (hasMany, belongsTo) çok karmaşık — elle yazmak zorlaşır. Ancak rapor sorguları için raw query karıştırabilirsin:
// TaskRepository.js içinde karma kullanım
async getTasksWithAssignees(companyId, filters) {
    // Basit sorgular: Sequelize ORM
    return Task.findAll({ where: { company_id: companyId }, include: [User] });
}

async getDepartmentStats(companyId) {
    // Karmaşık aggregate: raw SQL
    const [rows] = await sequelize.query(`
        SELECT d.name, COUNT(t.id) as total,
               SUM(t.status_id = ?) as completed
        FROM departments d
        LEFT JOIN tasks t ON t.department_id = d.id
        WHERE d.company_id = ?
        GROUP BY d.id
    `, { replacements: [completedStatusId, companyId] });
    return rows;
}
2. companyIsolation middleware — en kritik güvenlik katmanı
// middleware/companyIsolation.js
const companyIsolation = (req, res, next) => {
    // URL'deki company_id ile token'daki company_id eşleşmeli
    if (req.params.companyId && req.params.companyId != req.user.companyId) {
        return res.status(403).json({ message: 'Erişim reddedildi' });
    }
    // Repository sorgularına otomatik eklensin
    req.companyId = req.user.companyId;
    next();
};
3. NotificationService — Socket.io ile entegrasyon
// services/NotificationService.js
class NotificationService {
    constructor(io) {
        this.io = io; // server.js'ten inject edilir
    }

    async create(userId, type, title, referenceType, referenceId) {
        const notif = await NotificationRepository.create({...});
        // Gerçek zamanlı gönder
        this.io.to(`user-${userId}`).emit('notification', notif);
        return notif;
    }
}
4. TaskService — history otomatik kaydı
// services/TaskService.js
async updateStatus(taskId, newStatusId, userId) {
    const task = await TaskRepository.findById(taskId);
    await TaskRepository.update(taskId, { status_id: newStatusId });
    
    // Her değişiklik otomatik history'e yazılır
    await TaskHistoryRepository.create({
        task_id: taskId,
        user_id: userId,
        action: 'status_changed',
        old_value: task.status_id,
        new_value: newStatusId
    });

    // Bildirim tetikle
    await this.notificationService.create(
        task.creator_id, 'task_updated', 'Gorev durumu degisti', 'task', taskId
    );
}
5. Seed otomasyonu — şirket kurulunca çalışır
// services/AuthService.js — registerCompany içinde
async _seedCompanyDefaults(companyId) {
    await TaskStatusRepository.bulkCreate([
        { company_id: companyId, name: 'pending',     color: '#94a3b8', order_no: 1, is_default: true },
        { company_id: companyId, name: 'in_progress', color: '#3b82f6', order_no: 2 },
        { company_id: companyId, name: 'review',      color: '#f59e0b', order_no: 3 },
        { company_id: companyId, name: 'completed',   color: '#22c55e', order_no: 4 },
        { company_id: companyId, name: 'cancelled',   color: '#ef4444', order_no: 5 },
    ]);
    await TaskPriorityRepository.bulkCreate([...]);
    await CompanySettingRepository.create({ company_id: companyId });
}
Başlangıç Öncelik Sırası
Önceki projenin BaseRepository.js yapısı bu projeye doğrudan taşınabilir — sadece Sequelize model referanslarını güncellemen yeterli.