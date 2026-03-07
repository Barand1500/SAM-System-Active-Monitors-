================================================================================
                    SAM BACKEND KOD ANALİZİ
================================================================================

================================================================================
KÜME 1: GİRİŞ NOKTALARI (Entry Points)
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. server.js — Ana Sunucu Dosyası
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: HTTP sunucusunu oluşturur ve Socket.io'yu başlatır.
                Uygulama bu dosyadan ayağa kalkar.

İçeriği:
  - http.createServer(app) ile Express app'i HTTP sunucusuna bağlıyor
  - Socket.io kurulumu: join_company ve join_user event'leri var
    (gerçek zamanlı bildirim altyapısı)
  - Port default 5000
  - app.set('io', io) ile Socket.io instance'ını route'lara aktarıyor

Durum: ✅ Temiz, sorun yok. Yapısı doğru.

────────────────────────────────────────────────────────────────────────────────
2. app.js — Express Uygulama Konfigürasyonu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Express middleware'lerini, güvenlik ayarlarını ve
                route'ları tanımlar.

İçeriği:
  - helmet → HTTP güvenlik başlıkları (CSP kapalı)
  - cors → Sadece development'ta aktif
  - Body parser limit: 10mb
  - /uploads statik dosya sunumu
  - Production'da SPA (Single Page App) desteği

⚠️ HATA / EKSİK:
  - Satır 34-35: API Route'lar KAPALI!
    const routes = require('./routes/index');  ve  app.use('/api', routes);
    satırları yorum satırı (comment) halinde.
    Yani backend şu an hiçbir API endpoint'i sunmuyor.
    Routes klasöründe dosyalar var ama bağlı değiller.

────────────────────────────────────────────────────────────────────────────────
3. package.json — Bağımlılıklar
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Proje bağımlılıklarını ve script'leri tanımlar.

Bağımlılıklar:
  express            → Web framework
  sequelize + mysql2 → ORM + MySQL driver
  bcrypt             → Şifre hashleme
  jsonwebtoken       → JWT kimlik doğrulama
  helmet             → Güvenlik başlıkları
  cors               → Cross-origin izin
  multer             → Dosya yükleme
  socket.io          → Gerçek zamanlı iletişim
  winston            → Loglama
  express-validator  → Input doğrulama
  dotenv             → Ortam değişkenleri

Durum: ✅ Bağımlılıklar makul ve güncel.

────────────────────────────────────────────────────────────────────────────────
4. config/database.js — Veritabanı Bağlantısı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sequelize ORM ile MySQL bağlantısını kurar.

İçeriği:
  - MySQL bağlantısı .env dosyasından okunuyor
    (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)
  - utf8mb4 karakter seti (Türkçe karakter desteği ✅)
  - Connection pool: max 5 bağlantı
  - underscored: true → Tablo sütunları snake_case olacak
  - timestamps: true → created_at, updated_at otomatik

Durum: ✅ Temiz, sorun yok.

────────────────────────────────────────────────────────────────────────────────
KÜME 1 ÖZET
────────────────────────────────────────────────────────────────────────────────
  server.js        → ✅ Temiz
  app.js           → ⚠️ Route'lar bağlı değil (yorum satırında)
  package.json     → ✅ Temiz
  config/database  → ✅ Temiz

  ANA SORUN: app.js'de API route'ları devre dışı.
             Backend çalışsa bile hiçbir endpoint çalışmaz.
================================================================================


================================================================================
KÜME 2: MIDDLEWARE'LER
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. middleware/authMiddleware.js — Kimlik Doğrulama & Rol Yetkilendirme
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: JWT token kontrolü yaparak kullanıcıyı doğrular.
                İki fonksiyon export ediyor:

  authenticate(req, res, next):
    - Header'dan "Bearer <token>" formatında token alır
    - jwt.verify ile token doğrular
    - Token'daki id ile User tablosundan kullanıcıyı çeker
    - req.user'a kullanıcı bilgisini atar (tüm controller'lar erişir)
    - Token yoksa 401, geçersizse 403 döner

  authorizeRoles(...roles):
    - Rol bazlı yetkilendirme (örn: 'admin', 'manager')
    - req.user.role değeri izin verilen roller listesinde mi kontrol eder
    - Yoksa 403 Forbidden döner

Durum: ✅ Temiz ve doğru çalışır.

────────────────────────────────────────────────────────────────────────────────
2. middleware/companyIsolation.js — Şirket Veri İzolasyonu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Multi-tenant (çok şirketli) yapıda her kullanıcının
                SADECE kendi şirketinin verilerine erişmesini sağlar.

  Nasıl çalışıyor:
    - req.user.company_id var mı kontrol eder
    - GET isteklerinde → req.query.company_id'ye enjekte eder
    - POST/PUT isteklerinde → req.body.company_id'ye enjekte eder
    - Böylece controller'lar her zaman doğru company_id ile çalışır

Durum: ✅ Temel izolasyon doğru.

⚠️ UYARI:
  - PUT/PATCH ile mevcut kayıt güncellenirken, kaydın gerçekten
    o şirkete ait olduğu kontrol EDİLMİYOR. Sadece body'ye company_id
    koyuyor ama başka şirketin kaydını güncelleyebilir.
    Bu kontrol repository/controller seviyesinde yapılmalı.

────────────────────────────────────────────────────────────────────────────────
3. middleware/roleCheck.js — Rol Kontrolü (DUPLICATE)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Rol bazlı yetkilendirme — allowedRoles listesine göre
                kullanıcının erişim yetkisini kontrol eder.

⚠️ HATA / TEKRAR:
  Bu dosya authMiddleware.js'deki authorizeRoles fonksiyonunun
  BİREBİR KOPYASI. Aynı kodu iki yerde tutmak gereksiz.
  Dosyanın kendisi de bunu kabul ediyor:
    "authMiddleware.js'deki authorizeRoles ile aynı işlev"

  ÖNERİ: Bu dosya silinmeli, tüm kullanımlar
          authMiddleware.js'deki authorizeRoles'a yönlendirilmeli.

────────────────────────────────────────────────────────────────────────────────
4. middleware/ValidationMiddleware.js — Input Doğrulama
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Express-validator kullanarak gelen verileri doğrular.
                İki şey export ediyor:

  validate(req, res, next):
    - Validation sonuçlarını kontrol eder
    - Hata varsa 422 + hata detayları döner
    - Route'larda validation kurallarından SONRA çağrılır

  rules (önceden tanımlı kurallar):
    - idParam       → URL'deki :id parametresi pozitif integer mi
    - createTask    → title, task_list_id, status_id, priority_id zorunlu
    - login         → email geçerli mi, password boş mu
    - registerCompany → şirket adı, admin bilgileri, şifre min 6 karakter

Durum: ✅ Temiz ve iyi yapılandırılmış.

────────────────────────────────────────────────────────────────────────────────
5. middleware/handlers.js — Hata Yakalayıcılar
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Global hata yönetimi. İki fonksiyon export ediyor:

  notFound(req, res, next):
    - Tanımlanmayan route'lara 404 döner
    - Hangi method + URL olduğunu mesajda gösterir

  errorHandler(err, req, res, next):
    - Tüm yakalanmamış hataları loglar (winston ile)
    - Production'da genel mesaj, development'ta detaylı hata döner
    - Default status 500

Durum: ✅ Temiz.

⚠️ UYARI:
  - Bu handler'lar app.js'de KULLANILMIYOR!
    app.js'de app.use(notFound) ve app.use(errorHandler)
    çağrıları yok. Yani 404 ve global error handling aktif değil.

────────────────────────────────────────────────────────────────────────────────
KÜME 2 ÖZET
────────────────────────────────────────────────────────────────────────────────
  authMiddleware.js      → ✅ Temiz (JWT + rol yetkilendirme)
  companyIsolation.js    → ✅ Temel mantık doğru, PUT güvenliği eksik
  roleCheck.js           → ⚠️ GEREKSIZ TEKRAR — authorizeRoles'un kopyası
  ValidationMiddleware.js→ ✅ Temiz (express-validator kuralları)
  handlers.js            → ⚠️ Temiz ama app.js'de BAĞLI DEĞİL

  SORUNLAR:
    1. roleCheck.js → authMiddleware.js ile duplicate, silinmeli
    2. handlers.js (notFound + errorHandler) → app.js'de kullanılmıyor
    3. companyIsolation → PUT/PATCH'te kayıt sahipliği doğrulanmıyor
================================================================================


================================================================================
KÜME 3A: MODELLER — Çekirdek Modeller + İlişki Merkezi (index.js)
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. models/index.js — Model Merkezi & İlişki Tanımları
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: TÜM modelleri import eder, aralarındaki ilişkileri
                (relationships) tanımlar ve tek noktadan export eder.
                Projenin "beyni" diyebiliriz.

  Toplam 30 model import ediliyor:
    Çekirdek  : Company, Department, User
    Görev     : Task, TaskList, TaskAssignment, TaskTag, TaskComment,
                TaskLog, TaskHistory, TaskStatus, TaskPriority
    Proje     : Workspace, WorkspaceMember, Project, ProjectMember
    Dosya     : File, TaskFile, CommentFile
    HR        : Attendance, Break, BreakType, LeaveRequest
    Sistem    : Notification, Announcement, CompanySetting,
                AutomationRule, RecurringTask, UserDashboardSetting,
                AuditLog, UserSkill
    Referans  : Category, Tag

  İlişki Hiyerarşisi (yukarıdan aşağıya):
    Company
      └─ Department
      └─ User
      └─ Workspace
      │    └─ WorkspaceMember
      │    └─ Project
      │         └─ ProjectMember
      │         └─ TaskList
      │              └─ Task
      │                   └─ TaskAssignment (kullanıcıya atama)
      │                   └─ TaskComment
      │                   └─ TaskFile
      │                   └─ TaskTag
      └─ Attendance
      │    └─ Break
      └─ LeaveRequest
      └─ Notification
      └─ Announcement
      └─ CompanySetting
      └─ AutomationRule

Durum: ✅ İlişkiler doğru ve tutarlı tanımlanmış.

⚠️ UYARILAR:
  - User → Department ilişkisi EKSİK! User'da department_id var ama
    index.js'de User.belongsTo(Department) tanımlı DEĞİL.
    Department.hasMany(User) da yok. Bu demek ki kullanıcının
    departman bilgisi JOIN ile alınamaz.
  - TaskLog ve TaskHistory için ilişki tanımlı DEĞİL.
    Model dosyaları var ama index.js'de relationship yok.

────────────────────────────────────────────────────────────────────────────────
2. models/Company.js — Şirket Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sistemdeki şirketleri temsil eder. Multi-tenant yapının
                temel taşı. Her veri bir şirkete bağlıdır.

  Alanlar:
    id           → BIGINT, auto-increment, PK
    name         → STRING(255), zorunlu — Şirket adı
    companyCode  → STRING(8), zorunlu, unique — Benzersiz şirket kodu
    description  → TEXT — Açıklama
    logoUrl      → STRING(500) — Logo URL'i
    industry     → STRING(100) — Sektör
    address      → TEXT — Adres
    phone        → STRING(20) — Telefon

  Tablo: "companies"
  Timestamps: ✅ created_at, updated_at

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
3. models/User.js — Kullanıcı Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sistemdeki tüm kullanıcıları temsil eder.
                Hem çalışanlar hem müşteriler bu tabloda.

  Alanlar:
    id             → BIGINT, PK
    company_id     → BIGINT, zorunlu — Hangi şirkete ait
    department_id  → BIGINT — Hangi departmanda
    parent_id      → BIGINT — Üst kullanıcı (hiyerarşi için)

    is_reseller    → BOOLEAN — Bayi mi?
    user_type      → ENUM: individual_tr, individual_foreign, legal_entity
    identity_number→ STRING(20) — TC kimlik no
    tax_number     → STRING(20) — Vergi no
    tax_office     → STRING(100) — Vergi dairesi
    company_name   → STRING(255) — (müşteri ise) firma adı

    first_name     → STRING(100), zorunlu
    last_name      → STRING(100), zorunlu
    email          → STRING(255), zorunlu, unique
    password       → STRING(255), zorunlu

    avatar_url     → STRING(500)
    role           → ENUM: boss, manager, employee, customer
    position       → STRING(100) — Pozisyon/unvan
    phone          → STRING(20)
    status         → ENUM: active, inactive, on_leave
    language       → ENUM: tr, en
    theme          → ENUM: light, dark
    last_login     → DATE

  Tablo: "users"
  Timestamps: ✅ created_at, updated_at

⚠️ UYARILAR:
  - Hem bir "çalışan" modeli hem bir "müşteri/bayi" modeli olmaya
    çalışıyor. user_type, identity_number, tax_number, tax_office,
    company_name, is_reseller gibi alanlar CRM/müşteri yönetimi
    alanları. Bu alanlar çalışanlar için gereksiz.
    İleride karmaşıklaşabilir — Customer ayrı model olabilir.
  - password alanı için model seviyesinde hash kontrolü yok.
    Hash'leme muhtemelen controller/service'te yapılıyor (kontrol edeceğiz).

────────────────────────────────────────────────────────────────────────────────
4. models/Department.js — Departman Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Şirketteki departmanları temsil eder (Yazılım, Muhasebe vb.)

  Alanlar:
    id          → BIGINT, PK
    company_id  → BIGINT, zorunlu — Hangi şirkete ait
    name        → STRING(255), zorunlu — Departman adı
    description → TEXT — Açıklama
    color       → STRING(7), default "#6366f1" — Renk kodu (UI'da kullanılır)

  Tablo: "departments"
  Timestamps: ❌ YOK (timestamps: false)

Durum: ✅ Temiz ve basit.

────────────────────────────────────────────────────────────────────────────────
5. models/Workspace.js — Çalışma Alanı Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Şirket içindeki çalışma alanlarını temsil eder.
                Projeler workspace'lerin altında yaşar.
                Hiyerarşi: Company → Workspace → Project → TaskList → Task

  Alanlar:
    id          → BIGINT, PK
    company_id  → BIGINT, zorunlu — Hangi şirkete ait
    created_by  → BIGINT, zorunlu — Kim oluşturdu
    name        → STRING(255), zorunlu
    description → TEXT
    icon        → STRING(10) — Emoji/ikon

  Tablo: "workspaces"
  Timestamps: ✅ created_at, updated_at

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
6. models/WorkspaceMember.js — Çalışma Alanı Üyeliği
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Hangi kullanıcının hangi workspace'e üye olduğunu tutar.
                Many-to-Many ara tablosu.

  Alanlar:
    id           → BIGINT, PK
    workspace_id → BIGINT, zorunlu
    user_id      → BIGINT, zorunlu
    role         → ENUM: admin, member (default: member)
    joined_at    → DATE — Katılım tarihi

  Tablo: "workspace_members"
  Timestamps: ❌ YOK

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
KÜME 3A ÖZET
────────────────────────────────────────────────────────────────────────────────
  index.js         → ✅ 30 model, ilişkiler büyük oranda doğru
  Company.js       → ✅ Temiz
  User.js          → ✅ Çalışır ama çalışan+müşteri karışık tasarım
  Department.js    → ✅ Temiz
  Workspace.js     → ✅ Temiz
  WorkspaceMember  → ✅ Temiz

  SORUNLAR:
    1. index.js → User ↔ Department ilişkisi TANIMLI DEĞİL
    2. index.js → TaskLog ve TaskHistory ilişkileri EKSİK
    3. User.js  → Çalışan + Müşteri/Bayi alanları aynı modelde
                  (user_type, tax_number vb.) İleride ayrılabilir.
================================================================================


================================================================================
KÜME 3B: MODELLER — Görev (Task) Sistemi
================================================================================

  Görev hiyerarşisi:
    Project → TaskList → Task → (TaskAssignment, TaskComment, TaskLog,
                                  TaskHistory, TaskFile, TaskTag)

  Referans tabloları: TaskStatus, TaskPriority, Category, Tag

────────────────────────────────────────────────────────────────────────────────
1. models/Task.js — Görev Modeli (ANA MODEL)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sistemin en kritik modeli. Bir görevi temsil eder.

  Alanlar:
    id              → BIGINT, PK
    task_list_id    → BIGINT, zorunlu — Hangi listeye ait
    company_id      → BIGINT, zorunlu — Şirket izolasyonu
    parent_task_id  → BIGINT — Alt görev desteği (self-referencing)
    creator_id      → BIGINT — Görevi oluşturan kullanıcı
    department_id   → BIGINT — İlgili departman
    title           → STRING(255), zorunlu
    description     → TEXT
    type            → ENUM: "task", "fault" (görev veya arıza)
    status_id       → BIGINT, zorunlu — Durum (TaskStatus'a FK)
    priority_id     → BIGINT, zorunlu — Öncelik (TaskPriority'ye FK)
    category_id     → BIGINT — Kategori
    due_date        → DATEONLY — Son tarih
    start_date      → DATEONLY — Başlangıç tarihi
    estimated_hours → DECIMAL(5,2) — Tahmini süre
    actual_hours    → DECIMAL(5,2) — Gerçek harcanan süre
    progress_percent→ INTEGER — Tamamlanma yüzdesi (0-100)
    started_at      → DATE — Başlatıldığı an
    completed_at    → DATE — Tamamlandığı an

  Timestamps: ✅ created_at, updated_at

  ÖZELLİKLER:
    - Alt görev (subtask) desteği: parent_task_id ile
    - İki tip: "task" (normal görev) ve "fault" (arıza bildirimi)
    - Hem tahmini hem gerçek süre takibi var

Durum: ✅ Zengin ve iyi düşünülmüş.

⚠️ UYARI:
  - parent_task_id için self-referencing ilişki index.js'de
    TANIMLI DEĞİL. Task.belongsTo(Task, ...) eksik.
    Alt görevler JOIN ile alınamaz.

────────────────────────────────────────────────────────────────────────────────
2. models/TaskList.js — Görev Listesi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Bir proje içindeki görev listelerini temsil eder.
                Kanban board'daki sütunlar gibi düşünülebilir.
                Örn: "Yapılacak", "Devam Eden", "Tamamlandı"

  Alanlar:
    id          → BIGINT, PK
    project_id  → BIGINT, zorunlu — Hangi projeye ait
    name        → STRING(255), zorunlu
    description → TEXT
    color       → STRING(7), default "#6366f1"
    order_no    → INTEGER — Sıralama

  Timestamps: ❌ YOK

Durum: ✅ Temiz ve basit.

────────────────────────────────────────────────────────────────────────────────
3. models/TaskAssignment.js — Görev Ataması
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Bir göreve birden fazla kişi atanabilmesini sağlar.
                Many-to-Many (Task ↔ User) ara tablosu.

  Alanlar:
    id          → BIGINT, PK
    task_id     → BIGINT, zorunlu
    user_id     → BIGINT, zorunlu
    assigned_by → BIGINT — Kim atadı
    role        → ENUM: "lead", "support" — Sorumlu mu destek mi
    assigned_at → DATE — Atanma zamanı
    is_active   → BOOLEAN — Hâlâ atanmış mı
    ended_at    → DATE — Atama bitti mi

  Timestamps: ❌ YOK

  ÖZELLİK: Atama geçmişi tutabiliyor (is_active + ended_at).
            Kişi görevden çıkarılınca silinmiyor, is_active=false yapılıyor.

Durum: ✅ İyi tasarım, geçmiş kaybedilmiyor.

────────────────────────────────────────────────────────────────────────────────
4. models/TaskComment.js — Görev Yorumu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev altına yapılan yorumları tutar.
                Threaded (iç içe) yorum desteği var.

  Alanlar:
    id                → BIGINT, PK
    task_id           → BIGINT, zorunlu
    user_id           → BIGINT — Yorumu yazan
    parent_comment_id → BIGINT — Yanıt verilen yorum (thread)
    comment_text      → TEXT, zorunlu

  Timestamps: ✅ created_at, updated_at

  ÖZELLİK: parent_comment_id ile yanıt zincirleme desteği.

⚠️ UYARI:
  - parent_comment_id için self-referencing ilişki index.js'de
    TANIMLI DEĞİL. TaskComment.belongsTo(TaskComment) eksik.

Durum: ✅ Çalışır ama self-ref ilişki eksik.

────────────────────────────────────────────────────────────────────────────────
5. models/TaskLog.js — Görev Zaman Kaydı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcının bir görev üzerinde çalıştığı süreyi kaydeder.
                Zamanlayıcı (timer) özelliği için.

  Alanlar:
    id         → BIGINT, PK
    task_id    → BIGINT, zorunlu
    user_id    → BIGINT — Kim çalıştı
    start_time → DATE — Başlangıç
    end_time   → DATE — Bitiş
    duration   → INTEGER — Dakika cinsinden süre
    note       → TEXT — Çalışma notu

  Timestamps: ❌ YOK

Durum: ✅ Temiz.

⚠️ UYARI (Küme 3A'dan):
  - index.js'de TaskLog ilişkileri (Task, User) TANIMLI DEĞİL.
    TaskLog.belongsTo(Task) ve TaskLog.belongsTo(User) eksik.

────────────────────────────────────────────────────────────────────────────────
6. models/TaskHistory.js — Görev Değişiklik Geçmişi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görevde yapılan her değişikliği kaydeder.
                Audit trail — kim, ne zaman, neyi, neden değiştirdi.

  Alanlar:
    id        → BIGINT, PK
    task_id   → BIGINT, zorunlu
    user_id   → BIGINT — Kim değiştirdi
    action    → STRING(255), zorunlu — "status_changed", "assigned" vb.
    old_value → TEXT — Eski değer
    new_value → TEXT — Yeni değer

  Timestamps: Sadece created_at (updatedAt: false)

Durum: ✅ Temiz tasarım.

⚠️ UYARI (Küme 3A'dan):
  - index.js'de TaskHistory ilişkileri TANIMLI DEĞİL.
    TaskHistory.belongsTo(Task) ve TaskHistory.belongsTo(User) eksik.

────────────────────────────────────────────────────────────────────────────────
7. models/TaskStatus.js — Görev Durumları (Referans)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev durum tanımları. Her şirket kendi durumlarını
                oluşturabilir (ör: "Yapılacak", "Devam Ediyor", "Bitti").

  Alanlar:
    id         → BIGINT, PK
    company_id → BIGINT, zorunlu — Şirkete özel
    name       → STRING(100), zorunlu
    color      → STRING(7) — UI rengi
    order_no   → INTEGER — Sıralama
    is_default → BOOLEAN — Varsayılan durum mu

Durum: ✅ Temiz. Şirkete özel olması çok iyi.

────────────────────────────────────────────────────────────────────────────────
8. models/TaskPriority.js — Görev Öncelikleri (Referans)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev öncelik tanımları. Şirkete özel.
                (ör: "Acil", "Yüksek", "Normal", "Düşük")

  Alanlar:
    id         → BIGINT, PK
    company_id → BIGINT, zorunlu
    name       → STRING(100), zorunlu
    color      → STRING(7)
    order_no   → INTEGER

Durum: ✅ Temiz. TaskStatus ile aynı yapıda.

────────────────────────────────────────────────────────────────────────────────
9. models/TaskTag.js — Görev-Etiket Ara Tablosu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Task ↔ Tag many-to-many ilişkisinin ara tablosu.
                Bir göreve birden fazla etiket atanabilir.

  Alanlar:
    id      → BIGINT, PK
    task_id → BIGINT, zorunlu
    tag_id  → BIGINT, zorunlu

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
10. models/TaskFile.js — Görev-Dosya Ara Tablosu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Task ↔ File many-to-many ilişkisinin ara tablosu.
                Bir göreve birden fazla dosya eklenebilir.

  Alanlar:
    id      → BIGINT, PK
    task_id → BIGINT, zorunlu
    file_id → BIGINT, zorunlu

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
11. models/Category.js — Kategoriler (Referans)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görevlerin kategorilenmesi için.
                Şirkete özel kategoriler.

  Alanlar:
    id         → BIGINT, PK
    company_id → BIGINT, zorunlu
    name       → STRING(100), zorunlu
    color      → STRING(7)

  Timestamps: Sadece created_at

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
12. models/Tag.js — Etiketler (Referans)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görevlere atanacak etiketler. Şirkete özel.

  Alanlar:
    id         → BIGINT, PK
    company_id → BIGINT, zorunlu
    name       → STRING(100), zorunlu
    color      → STRING(7)

  Timestamps: Sadece created_at

  NOT: Category ile neredeyse aynı yapıda. Fark şu:
       Category → bir görevin tek kategorisi olur (1-to-many)
       Tag      → bir göreve birden fazla etiket atanır (many-to-many)

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
KÜME 3B ÖZET
────────────────────────────────────────────────────────────────────────────────
  Task.js           → ✅ Zengin model, alt görev + çift tip desteği
  TaskList.js       → ✅ Temiz (kanban sütunları)
  TaskAssignment.js → ✅ İyi tasarım (atama geçmişi korunuyor)
  TaskComment.js    → ✅ Thread desteği var ama self-ref ilişki eksik
  TaskLog.js        → ✅ Temiz ama ilişki tanımsız
  TaskHistory.js    → ✅ Temiz ama ilişki tanımsız
  TaskStatus.js     → ✅ Şirkete özel durum tanımları
  TaskPriority.js   → ✅ Şirkete özel öncelik tanımları
  TaskTag.js        → ✅ Temiz ara tablo
  TaskFile.js       → ✅ Temiz ara tablo
  Category.js       → ✅ Temiz
  Tag.js            → ✅ Temiz

  SORUNLAR (index.js'de eksik ilişkiler):
    1. Task → parent_task_id self-referencing ilişki TANIMLI DEĞİL
    2. TaskComment → parent_comment_id self-ref ilişki TANIMLI DEĞİL
    3. TaskLog → Task ve User ilişkileri TANIMLI DEĞİL
    4. TaskHistory → Task ve User ilişkileri TANIMLI DEĞİL
================================================================================


================================================================================
KÜME 3C: MODELLER — Proje, Dosya, HR, Bildirim & Sistem Modelleri
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. models/Project.js — Proje Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Workspace altındaki projeleri temsil eder.
                Hiyerarşi: Company → Workspace → Project → TaskList → Task

  Alanlar:
    id           → BIGINT, PK
    workspace_id → BIGINT, zorunlu — Hangi workspace'e ait
    created_by   → BIGINT — Kim oluşturdu
    name         → STRING(255), zorunlu
    description  → TEXT
    status       → ENUM: active, inactive, completed, archived
    color        → STRING(7)
    icon         → STRING(10) — Emoji
    start_date   → DATEONLY
    end_date     → DATEONLY

  Timestamps: ✅ created_at, updated_at

Durum: ✅ Temiz ve işlevsel.

────────────────────────────────────────────────────────────────────────────────
2. models/ProjectMember.js — Proje Üyeliği
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Hangi kullanıcının hangi projede olduğunu tutar.
                Many-to-Many (Project ↔ User) ara tablosu.

  Alanlar:
    id         → BIGINT, PK
    project_id → BIGINT, zorunlu
    user_id    → BIGINT, zorunlu
    role       → ENUM: lead, member
    joined_at  → DATE

  Timestamps: ❌ YOK

Durum: ✅ Temiz. WorkspaceMember ile benzer yapıda.

────────────────────────────────────────────────────────────────────────────────
3. models/File.js — Dosya Modeli
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sisteme yüklenen dosyaların kaydını tutar.
                TaskFile ve CommentFile üzerinden görev/yoruma bağlanır.

  Alanlar:
    id          → BIGINT, PK
    company_id  → BIGINT, zorunlu — Şirket izolasyonu
    uploaded_by → BIGINT — Kim yükledi
    file_name   → STRING(255), zorunlu — Orijinal dosya adı
    file_url    → TEXT, zorunlu — Dosya yolu/URL
    file_type   → STRING(50) — MIME tipi (image/png, application/pdf vb.)
    file_size   → BIGINT — Byte cinsinden boyut

  Timestamps: Sadece created_at

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
4. models/CommentFile.js — Yorum-Dosya Ara Tablosu
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Yorumlara eklenen dosyaların ara tablosu.
                TaskComment ↔ File ilişkisi.

  Alanlar:
    id         → BIGINT, PK
    comment_id → BIGINT, zorunlu
    file_id    → BIGINT, zorunlu

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
5. models/Attendance.js — Yoklama / Giriş-Çıkış Kaydı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcının günlük giriş-çıkış saatlerini tutar.
                Mesai takibi yapılır.

  Alanlar:
    id         → BIGINT, PK
    user_id    → BIGINT, zorunlu
    date       → DATEONLY, zorunlu — Hangi gün
    check_in   → DATE — Giriş saati
    check_out  → DATE — Çıkış saati
    ip_address → STRING(45) — Giriş IP'si
    device     → STRING(255) — Cihaz bilgisi
    note       → TEXT

  Timestamps: Sadece created_at

  ÖZELLİK: IP ve cihaz kaydediyor → güvenlik/doğrulama amaçlı.

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
6. models/Break.js — Mola Kaydı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Çalışanın gün içindeki molalarını kaydeder.
                Attendance kaydına bağlıdır.

  Alanlar:
    id            → BIGINT, PK
    attendance_id → BIGINT, zorunlu — Hangi güne ait
    break_type_id → BIGINT, zorunlu — Mola tipi
    start_time    → DATE — Mola başlangıcı
    end_time      → DATE — Mola bitişi
    is_violated   → BOOLEAN — Süre aşıldı mı?

  Timestamps: ❌ YOK

  ÖZELLİK: is_violated alanı → mola süresi aşılırsa true yapılır.
            CompanySetting.max_break_minutes ile kontrol edilebilir.

Durum: ✅ İyi düşünülmüş.

────────────────────────────────────────────────────────────────────────────────
7. models/BreakType.js — Mola Tipi (Referans)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Mola türlerini tanımlar. Şirkete özel.
                Ör: "Öğle Molası", "Sigara Molası", "Çay Molası"

  Alanlar:
    id           → BIGINT, PK
    company_id   → BIGINT, zorunlu
    name         → STRING(100), zorunlu
    max_duration → INTEGER — Dakika cinsinden max süre

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
8. models/LeaveRequest.js — İzin Talebi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Çalışanların izin taleplerini tutar.
                Onay/red mekanizması var.

  Alanlar:
    id               → BIGINT, PK
    user_id          → BIGINT, zorunlu — Kim talep etti
    leave_type       → ENUM: annual, sick, personal, unpaid, education
    start_date       → DATEONLY
    end_date         → DATEONLY
    leave_days       → INTEGER — Kaç gün
    reason_text      → TEXT — Neden
    document_url     → STRING(500) — Ek belge (rapor vb.)
    approval_status  → ENUM: pending, approved, rejected
    approved_by      → BIGINT — Kim onayladı
    approved_at      → DATE — Ne zaman onaylandı
    rejection_reason → TEXT — Red nedeni

  Timestamps: Sadece created_at

  ÖZELLİK: Tam bir izin yönetim akışı:
    talep → beklemede → onay/red (neden + kim + tarih)

⚠️ UYARI:
  - approved_by için ilişki (User) index.js'de TANIMLI DEĞİL.
    LeaveRequest.belongsTo(User, {as: "approver"}) eksik.

Durum: ✅ İyi ama onaylayan ilişkisi eksik.

────────────────────────────────────────────────────────────────────────────────
9. models/Notification.js — Bildirim
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcıya gönderilen bildirimleri tutar.
                Socket.io ile gerçek zamanlı gönderilebilir.

  Alanlar:
    id             → BIGINT, PK
    user_id        → BIGINT, zorunlu — Kime
    title          → STRING(255), zorunlu
    message        → TEXT
    type           → STRING(50) — Bildirim tipi (task, leave, vb.)
    reference_type → STRING(20) — Polymorphic referans tipi
    reference_id   → BIGINT — Polymorphic referans ID
    is_read        → BOOLEAN — Okundu mu

  Timestamps: Sadece created_at

  ÖZELLİK: Polymorphic ilişki (reference_type + reference_id)
    → "task" + 42 = Task#42'ye bağlı bildirim
    → "leave" + 7 = LeaveRequest#7'ye bağlı bildirim

Durum: ✅ Esnek ve doğru tasarım.

────────────────────────────────────────────────────────────────────────────────
10. models/Announcement.js — Duyuru
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Şirket geneli duyuruları tutar.
                Belirli role hedeflenebilir.

  Alanlar:
    id          → BIGINT, PK
    company_id  → BIGINT
    user_id     → BIGINT — Kim yayınladı
    title       → STRING(255), zorunlu
    content     → TEXT, zorunlu
    priority    → ENUM: normal, important, urgent
    target_role → STRING(50) — Sadece belirli role göster
    is_pinned   → BOOLEAN — Sabitlenmiş mi
    expiry_date → DATEONLY — Son geçerlilik tarihi

  Timestamps: Sadece created_at

Durum: ✅ Temiz. Hedef rol + süre sonu + sabitleme iyi özellikler.

────────────────────────────────────────────────────────────────────────────────
11. models/CompanySetting.js — Şirket Ayarları
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Her şirketin çalışma saati ve mola kurallarını tutar.

  Alanlar:
    id                → BIGINT, PK
    company_id        → BIGINT, zorunlu
    work_start        → TIME — Mesai başlangıcı (ör: 09:00)
    work_end          → TIME — Mesai bitişi (ör: 18:00)
    max_break_minutes → INTEGER — Toplam mola süresi limiti
    overtime_allowed  → BOOLEAN — Mesai dışı çalışmaya izin var mı

  Timestamps: ❌ YOK

Durum: ✅ Temiz ama sınırlı. İleride daha fazla ayar eklenebilir.

────────────────────────────────────────────────────────────────────────────────
12. models/AutomationRule.js — Otomasyon Kuralı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Otomatik iş akışı kurallarını tanımlar.
                Ör: "Görev tamamlanınca yöneticiye bildirim gönder"

  Alanlar:
    id            → BIGINT, PK
    company_id    → BIGINT
    name          → STRING(255)
    trigger_event → STRING(255) — Tetikleyici olay
    rule_condition→ TEXT — Koşul (JSON veya DSL)
    rule_action   → TEXT — Eylem (JSON veya DSL)
    is_active     → BOOLEAN

  Timestamps: Sadece created_at

  NOT: condition ve action TEXT olarak saklanıyor. Muhtemelen JSON
       formatında. Bu modelin çalışması için bir otomasyon motoru
       (rule engine) gerekiyor — henüz servislerde yok gibi görünüyor.

Durum: ✅ Model hazır ama otomasyon motoru henüz yok.

────────────────────────────────────────────────────────────────────────────────
13. models/RecurringTask.js — Tekrarlayan Görev
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Belirli aralıklarla otomatik oluşturulacak görevlerin
                şablonunu tutar.

  Alanlar:
    id          → BIGINT, PK
    company_id  → BIGINT
    created_by  → BIGINT
    title       → STRING(255)
    description → TEXT
    frequency   → ENUM: daily, weekly, biweekly, monthly
    day_of_week → INTEGER — Haftanın günü (0-6)
    day_of_month→ INTEGER — Ayın günü (1-31)
    time_of_day → TIME — Saat
    priority_id → BIGINT
    assignee_id → BIGINT — Her seferinde kime atanacak
    is_active   → BOOLEAN
    last_run_at → DATE — Son çalışma zamanı
    next_run_at → DATE — Sonraki çalışma zamanı

  Timestamps: Sadece created_at

  NOT: Bu modelin çalışması için bir cron/scheduler servisi gerekiyor.
       Henüz yoksa, next_run_at'a göre görev oluşturan bir
       zamanlayıcı yazılmalı.

⚠️ UYARI:
  - assignee_id için ilişki index.js'de TANIMLI DEĞİL.
    RecurringTask.belongsTo(User, {as: "assignee"}) eksik.
  - task_list_id veya project_id YOK — görev nereye oluşturulacak?
    Şablon hangi listeye/projeye ait olacağı belli değil.

Durum: ⚠️ Model eksik — hedef proje/liste bilgisi yok.

────────────────────────────────────────────────────────────────────────────────
14. models/UserDashboardSetting.js — Dashboard Ayarı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Her kullanıcının dashboard düzenini (layout) saklar.
                Widget sırası, hangi widget'lar görünür vb.

  Alanlar:
    id      → BIGINT, PK
    user_id → BIGINT
    layout  → JSON — Dashboard düzeni

  Timestamps: Sadece updated_at (createdAt: false)

Durum: ✅ Temiz ve basit. JSON ile esnek.

────────────────────────────────────────────────────────────────────────────────
15. models/AuditLog.js — Denetim Kaydı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Sistemdeki önemli işlemlerin logunu tutar.
                Kim, ne zaman, hangi tabloda, hangi kaydı, nasıl değiştirdi.

  Alanlar:
    id         → BIGINT, PK
    user_id    → BIGINT
    action     → STRING(255) — "create", "update", "delete"
    table_name → STRING(255) — Hangi tablo
    record_id  → BIGINT — Hangi kayıt
    old_value  → TEXT — Eski değer
    new_value  → TEXT — Yeni değer
    ip_address → STRING(45) — İşlem IP'si

  Timestamps: Sadece created_at

  NOT: TaskHistory ile benzer ama daha genel.
       TaskHistory → sadece görev değişiklikleri
       AuditLog → tüm sistem değişiklikleri

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
16. models/UserSkill.js — Kullanıcı Yetkinlikleri
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcıların yeteneklerini/uzmanlıklarını tutar.
                Görev atamasında yetkinlik bazlı eşleştirme yapılabilir.

  Alanlar:
    id       → BIGINT, PK
    user_id  → BIGINT, zorunlu
    name     → STRING(100), zorunlu — Yetenek adı (ör: "React", "SQL")
    category → STRING(100) — Kategori (ör: "Frontend", "Database")
    level    → ENUM: beginner, intermediate, advanced, expert

  Timestamps: ❌ YOK

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
KÜME 3C ÖZET
────────────────────────────────────────────────────────────────────────────────
  Project.js             → ✅ Temiz
  ProjectMember.js       → ✅ Temiz
  File.js                → ✅ Temiz
  CommentFile.js         → ✅ Temiz
  Attendance.js          → ✅ Temiz (IP+cihaz kaydı)
  Break.js               → ✅ İyi (süre ihlali takibi)
  BreakType.js           → ✅ Temiz
  LeaveRequest.js        → ✅ İyi (onay akışı) — approver ilişkisi eksik
  Notification.js        → ✅ Esnek (polymorphic referans)
  Announcement.js        → ✅ Temiz (hedef rol + sabitleme)
  CompanySetting.js      → ✅ Sınırlı ama çalışır
  AutomationRule.js      → ✅ Model var ama otomasyon motoru YOK
  RecurringTask.js       → ⚠️ Hedef proje/liste bilgisi eksik
  UserDashboardSetting.js→ ✅ Temiz (JSON layout)
  AuditLog.js            → ✅ Temiz
  UserSkill.js           → ✅ Temiz

  SORUNLAR:
    1. LeaveRequest → approved_by User ilişkisi (as: approver) eksik
    2. RecurringTask → assignee_id User ilişkisi eksik
    3. RecurringTask → task_list_id / project_id YOK,
       görev nereye oluşturulacak belli değil
    4. AutomationRule → Model var ama çalıştıracak motor/servis yok
    5. RecurringTask → Scheduler/cron servisi yok

  TÜM MODELLER GENEL TOPLAM (Küme 3A + 3B + 3C):
    30 model tanımlı, genel tasarım tutarlı.
    Toplam 11 eksik ilişki/sorun tespit edildi.
================================================================================


================================================================================
KÜME 4: ROUTES (API Yönlendirmeleri)
================================================================================

  Toplam 18 route dosyası. Tüm endpoint'ler /api/ prefix'i altında
  çalışacak (app.js'de routes açılırsa).

  ÖNEMLİ HATIRLATMA: app.js'de route'lar hâlâ YORUM SATIRINDA.
  Bu route'lar tanımlı ama backend'e BAĞLI DEĞİL.

────────────────────────────────────────────────────────────────────────────────
1. routes/index.js — Ana Route Birleştirici
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Tüm alt route'ları tek bir router'da birleştirir.
                app.js'de app.use('/api', routes) ile bağlanacak.

  Tanımlı alt yollar:
    /api/auth          → auth.js
    /api/users         → users.js
    /api/workspaces    → workspaces.js
    /api/projects      → projects.js
    /api/task-lists    → taskLists.js
    /api/tasks         → tasks.js
    /api/task-comments → taskComments.js
    /api/task-logs     → taskLogs.js
    /api/departments   → departments.js
    /api/attendance    → attendance.js
    /api/leaves        → leaves.js
    /api/files         → files.js
    /api/notifications → notifications.js
    /api/announcements → announcements.js
    /api/reports       → reports.js
    /api/settings      → settings.js
    /api/dashboard     → dashboard.js

Durum: ✅ Temiz ve düzenli.

────────────────────────────────────────────────────────────────────────────────
2. routes/auth.js — Kimlik Doğrulama Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    POST /api/auth/register-company  → Yeni şirket + admin kayıt
    POST /api/auth/register-employee → Çalışan kayıt
    POST /api/auth/login             → Giriş

  Middleware: YOK (auth gerektirmez — mantıklı)

⚠️ UYARI:
  - ValidationMiddleware KULLANILMIYOR! rules.login ve
    rules.registerCompany tanımlı ama burada uygulanmamış.
    Input doğrulaması yapılmıyor.

Durum: ⚠️ Validation eksik.

────────────────────────────────────────────────────────────────────────────────
3. routes/users.js — Kullanıcı Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/users      → Kullanıcı listesi
    GET    /api/users/:id  → Tek kullanıcı
    POST   /api/users      → Kullanıcı oluştur
    PUT    /api/users/:id  → Kullanıcı güncelle

  Middleware: authenticate ✅

⚠️ UYARILAR:
  - DELETE endpoint YOK. Kullanıcı silinemiyor.
  - companyIsolation middleware KULLANILMIYOR.
    Başka şirketin kullanıcılarına erişilebilir.
  - authorizeRoles YOK. Herhangi bir çalışan başka
    kullanıcıları listeleyip güncelleyebilir.

────────────────────────────────────────────────────────────────────────────────
4. routes/workspaces.js — Çalışma Alanı Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/workspaces          → Liste
    GET    /api/workspaces/:id      → Detay
    POST   /api/workspaces          → Oluştur
    PUT    /api/workspaces/:id      → Güncelle
    DELETE /api/workspaces/:id      → Sil
    POST   /api/workspaces/:id/members      → Üye ekle
    DELETE /api/workspaces/:id/members/:userId → Üye çıkar

  Middleware: authenticate ✅
  Tam CRUD + üye yönetimi var.

⚠️ UYARI: companyIsolation ve authorizeRoles yok.

Durum: ✅ Endpoint'ler iyi ama yetkilendirme eksik.

────────────────────────────────────────────────────────────────────────────────
5. routes/projects.js — Proje Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/projects/workspace/:workspaceId → Workspace'e göre projeler
    GET    /api/projects/:id                    → Detay
    POST   /api/projects                        → Oluştur
    PUT    /api/projects/:id                    → Güncelle
    DELETE /api/projects/:id                    → Sil
    POST   /api/projects/:id/members            → Üye ekle
    DELETE /api/projects/:id/members/:userId     → Üye çıkar

  Middleware: authenticate ✅
  Tam CRUD + üye yönetimi var.

Durum: ✅ İyi yapılandırılmış.

────────────────────────────────────────────────────────────────────────────────
6. routes/taskLists.js — Görev Listesi Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/task-lists/project/:projectId → Projeye göre listeler
    GET    /api/task-lists/:id               → Detay
    POST   /api/task-lists                   → Oluştur
    PUT    /api/task-lists/:id               → Güncelle
    DELETE /api/task-lists/:id               → Sil

  Middleware: authenticate ✅
  Tam CRUD.

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
7. routes/tasks.js — Görev Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    POST /api/tasks              → Görev oluştur
    GET  /api/tasks/list/:listId → Listeye göre görevler

  Middleware: authenticate ✅

⚠️ UYARILAR:
  - SADECE 2 ENDPOINT VAR! Diğer CRUD işlemleri eksik:
    → PUT /api/tasks/:id (güncelleme) YOK
    → DELETE /api/tasks/:id (silme) YOK
    → GET /api/tasks/:id (tek görev detayı) YOK
    → Görev ataması (assignment) endpoint'leri YOK
  - Validation (rules.createTask) uygulanmamış.

Durum: ⚠️ ÇOK EKSİK — En kritik modülde sadece 2 endpoint.

────────────────────────────────────────────────────────────────────────────────
8. routes/taskComments.js — Görev Yorum Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    POST /api/task-comments           → Yorum ekle
    GET  /api/task-comments/task/:taskId → Yorumları getir

  Middleware: authenticate ✅

⚠️ UYARI: PUT (düzenle) ve DELETE (sil) yok.

────────────────────────────────────────────────────────────────────────────────
9. routes/taskLogs.js — Görev Zaman Kaydı Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/task-logs/task/:taskId → Task'ın logları
    POST   /api/task-logs             → Log oluştur
    PUT    /api/task-logs/:id         → Log güncelle
    DELETE /api/task-logs/:id         → Log sil

  Middleware: authenticate ✅
  Tam CRUD.

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
10. routes/departments.js — Departman Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/departments     → Liste
    GET    /api/departments/:id → Detay
    POST   /api/departments     → Oluştur
    PUT    /api/departments/:id → Güncelle
    DELETE /api/departments/:id → Sil

  Middleware: authenticate ✅
  Tam CRUD.

⚠️ UYARI: authorizeRoles yok. Herkes departman oluşturup silebilir.

────────────────────────────────────────────────────────────────────────────────
11. routes/attendance.js — Yoklama / Mesai Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    POST /api/attendance/check-in              → Giriş yap
    POST /api/attendance/check-out             → Çıkış yap
    POST /api/attendance/breaks/start          → Molaya başla
    POST /api/attendance/breaks/end/:breakId   → Molayı bitir
    POST /api/attendance/leaves                → İzin talebi
    GET  /api/attendance/leaves                → İzinlerimi getir

  Middleware: authenticate ✅

⚠️ UYARI:
  - İzin (leaves) route'ları HEM burada HEM routes/leaves.js'de
    tanımlı. DUPLICATE endpoint'ler:
      /api/attendance/leaves  ve  /api/leaves
    Aynı controller fonksiyonları çağrılıyor.

Durum: ⚠️ Leave endpoint'leri duplicate.

────────────────────────────────────────────────────────────────────────────────
12. routes/leaves.js — İzin Route'ları (DUPLICATE)
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET  /api/leaves → İzinlerimi getir
    POST /api/leaves → İzin talebi

  ⚠️ attendance.js ile AYNI fonksiyonlar. Bu dosya gereksiz
     veya attendance.js'deki leave kısmı kaldırılmalı.

⚠️ UYARI:
  - Leave onay/red endpoint'leri YOK.
    LeaveRequest modelinde approval_status var ama
    onaylama/reddetme route'u tanımlı değil.

────────────────────────────────────────────────────────────────────────────────
13. routes/files.js — Dosya Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    POST /api/files         → Dosya yükle
    GET  /api/files/company → Şirketin dosyaları

  Middleware: authenticate ✅

⚠️ UYARI: Dosya silme (DELETE) endpoint'i YOK.

────────────────────────────────────────────────────────────────────────────────
14. routes/notifications.js — Bildirim + Duyuru + Ayarlar (KARISIK!)
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET   /api/notifications                → Bildirimlerimi getir
    PATCH /api/notifications/read/:id       → Okundu işaretle
    GET   /api/notifications/announcements  → Duyurular (!)
    POST  /api/notifications/announcements  → Duyuru oluştur (!)
    PUT   /api/notifications/announcements/:id  → Duyuru güncelle (!)
    DELETE/api/notifications/announcements/:id  → Duyuru sil (!)
    GET   /api/notifications/company-settings   → Şirket ayarları (!)
    PUT   /api/notifications/company-settings   → Ayar güncelle (!)

  ⚠️ HATA / TASARIM SORUNU:
    Bu dosya 3 farklı şeyi karıştırıyor:
      1. Bildirimler (Notification)
      2. Duyurular (Announcement) — zaten routes/announcements.js var!
      3. Şirket Ayarları (CompanySetting) — bunun burada ne işi var?

    Duyurular DUPLICATE: Hem burada hem announcements.js'de.
    Şirket ayarları: settings.js'de zaten var.

────────────────────────────────────────────────────────────────────────────────
15. routes/announcements.js — Duyuru Route'ları (DUPLICATE)
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET    /api/announcements     → Liste
    POST   /api/announcements     → Oluştur
    PUT    /api/announcements/:id → Güncelle
    DELETE /api/announcements/:id → Sil

  ⚠️ notifications.js ile DUPLICATE.
     authorizeRoles yok — herkes duyuru oluşturup silebilir.

────────────────────────────────────────────────────────────────────────────────
16. routes/reports.js — Rapor Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET /api/reports/tasks      → Görev raporu
    GET /api/reports/attendance  → Yoklama raporu
    GET /api/reports/leaves      → İzin raporu

  Middleware: authenticate + authorizeRoles("boss", "manager") ✅

  GÜZEL: Bu dosya authorizeRoles'u DOĞRU KULLANAN TEK route.
         Sadece boss ve manager erişebilir.

Durum: ✅ İyi — yetkili erişim doğru uygulanmış.

────────────────────────────────────────────────────────────────────────────────
17. routes/settings.js — Şirket Ayarları Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET /api/settings → Ayarları getir
    PUT /api/settings → Ayarları güncelle (sadece boss)

  Middleware: authenticate + authorizeRoles("boss") ✅

  GÜZEL: PUT sadece boss'a açık.

⚠️ UYARI: notifications.js'de de company-settings endpoint'leri var
           — yetkilendirmesiz. DUPLICATE + güvenlik açığı.

────────────────────────────────────────────────────────────────────────────────
18. routes/dashboard.js — Dashboard Route'ları
────────────────────────────────────────────────────────────────────────────────
  Endpoint'ler:
    GET /api/dashboard/summary → Özet veriler

  Middleware: authenticate ✅

Durum: ✅ Temiz ama tek endpoint.

────────────────────────────────────────────────────────────────────────────────
KÜME 4 ÖZET
────────────────────────────────────────────────────────────────────────────────
  index.js        → ✅ 17 alt route düzenli birleştirilmiş
  auth.js         → ⚠️ Validation middleware uygulanmamış
  users.js        → ⚠️ DELETE yok, companyIsolation yok, rol kontrolü yok
  workspaces.js   → ✅ Tam CRUD + üye yönetimi (rol kontrolü eksik)
  projects.js     → ✅ Tam CRUD + üye yönetimi
  taskLists.js    → ✅ Tam CRUD
  tasks.js        → ⚠️ ÇOK EKSİK — sadece 2 endpoint (update/delete yok)
  taskComments.js → ⚠️ Update/delete yok
  taskLogs.js     → ✅ Tam CRUD
  departments.js  → ✅ Tam CRUD (rol kontrolü eksik)
  attendance.js   → ⚠️ Leave endpoint'leri duplicate
  leaves.js       → ⚠️ DUPLICATE + onay/red endpoint'i yok
  files.js        → ⚠️ Delete endpoint yok
  notifications.js→ ⚠️ 3 farklı kaynak karışık, duplicate
  announcements.js→ ⚠️ DUPLICATE (notifications.js ile)
  reports.js      → ✅ İYİ — rol kontrolü doğru uygulanmış
  settings.js     → ✅ İYİ — boss yetkisi doğru
  dashboard.js    → ✅ Temiz

  SORUNLAR:
    1. tasks.js → UPDATE, DELETE, GET/:id endpoint'leri YOK
    2. auth.js → Validation middleware uygulanmamış
    3. DUPLICATE route'lar:
       - leaves → hem attendance.js hem leaves.js'de
       - announcements → hem notifications.js hem announcements.js'de
       - company-settings → hem notifications.js hem settings.js'de
    4. companyIsolation middleware HIÇBIR route'ta kullanılmıyor
    5. authorizeRoles sadece reports.js ve settings.js'de var
       → Diğer tüm route'larda rol kontrolü yok
    6. Leave onay/red endpoint'i hiç yok
    7. Dosya silme endpoint'i yok
================================================================================


================================================================================
KÜME 5A: CONTROLLERS — Auth, User, Workspace, Project, Department
================================================================================

  MİMARİ NOT:
    Controller'lar "ince" tasarlanmış — iş mantığını Service katmanına
    delege ediyorlar. Controller sadece request/response yönetimi yapıyor.
    Bu iyi bir mimari pratik (separation of concerns).

    Akış: Route → Controller → Service → Repository → Model (DB)

────────────────────────────────────────────────────────────────────────────────
1. controllers/AuthController.js — Kimlik Doğrulama
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kayıt ve giriş işlemlerini yönetir.
                Tüm iş mantığını AuthService'e delege eder.

  Fonksiyonlar:
    registerCompany(req, res)
      → req.body'den { company, admin } alır
      → AuthService.registerCompany(company, admin) çağırır
      → 201 döner

    registerEmployee(req, res)
      → req.body'den çalışan verilerini alır
      → AuthService.registerEmployee(employeeData) çağırır
      → 201 döner

    login(req, res)
      → req.body'den { email, password } alır
      → AuthService.login(email, password) çağırır
      → 200 döner, hata ise 401

⚠️ UYARILAR:
  - registerEmployee'de company_id KONTROL EDİLMİYOR.
    Herhangi biri herhangi bir şirkete çalışan kaydedebilir.
    authenticate middleware YOK — herkes çağırabilir.
  - Hata kodları hep 400/401 — 500 durumu yakalanmıyor.

Durum: ⚠️ registerEmployee güvenlik açığı.

────────────────────────────────────────────────────────────────────────────────
2. controllers/UserController.js — Kullanıcı Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcı CRUD işlemlerini yönetir.

  Fonksiyonlar:
    list(req, res)
      → UserService.listByCompany(req.user.company_id)
      → Şirket bazlı filtreleme VAR ✅ (company_id controller'dan geliyor)

    get(req, res)
      → UserService.getUserWithSkills(req.params.id)
      → Kullanıcı + yetenekler birlikte geliyor
      → 404 kontrolü var ✅

    create(req, res)
      → UserService.createUser(req.body)

    update(req, res)
      → UserService.updateUser(req.params.id, req.body)

⚠️ UYARILAR:
  - list() şirket izolasyonu DOĞRU yapıyor ✅
  - get() şirket kontrolü YOK — başka şirketin kullanıcısı okunabilir
  - create() req.body direkt gönderiliyor — company_id enjekte edilmiyor.
    Kullanıcı başka şirkete kayıt oluşturabilir.
  - update() sahiplik kontrolü yok — başka şirketin kullanıcısı güncellenebilir

────────────────────────────────────────────────────────────────────────────────
3. controllers/WorkspaceController.js — Çalışma Alanı Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Workspace CRUD ve üye yönetimi.

  Fonksiyonlar:
    list    → WorkspaceService.getByCompany(req.user.company_id) ✅
    get     → WorkspaceService.getById(id)
    create  → company_id ve created_by enjekte ediyor ✅
    update  → WorkspaceService.update(id, body)
    delete  → WorkspaceService.delete(id)
    addMember    → WorkspaceService.addMember(id, user_id, role)
    removeMember → WorkspaceService.removeMember(id, userId)

  İYİ YÖNLER:
    - list() şirket filtrelemesi doğru ✅
    - create() company_id ve created_by doğru enjekte ediliyor ✅

⚠️ UYARILAR:
  - get/update/delete'te şirket kontrolü yok — başka şirketin
    workspace'i okunabilir/güncellenebilir.
  - addMember'da eklenen kullanıcının aynı şirketten olduğu
    kontrol edilmiyor.

────────────────────────────────────────────────────────────────────────────────
4. controllers/ProjectController.js — Proje Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Proje CRUD ve üye yönetimi.

  Fonksiyonlar:
    list    → ProjectService.getByWorkspace(workspaceId)
    get     → ProjectService.getById(id)
    create  → created_by enjekte ediliyor ✅
    update  → ProjectService.update(id, body)
    delete  → ProjectService.delete(id)
    addMember    → ProjectService.addMember(id, user_id, role)
    removeMember → ProjectService.removeMember(id, userId)

  WorkspaceController ile neredeyse aynı yapıda.

⚠️ UYARILAR:
  - create'te company_id enjekte EDİLMİYOR (Workspace'te ediliyordu).
    Proje hangi workspace'e ait ise o workspace'in şirketine bağlı
    — ama doğrudan kontrol yok.
  - Şirket izolasyonu dolaylı (workspace üzerinden).

────────────────────────────────────────────────────────────────────────────────
5. controllers/DepartmentController.js — Departman Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Departman CRUD işlemleri.

  Fonksiyonlar:
    list    → DepartmentService.getByCompany(req.user.company_id) ✅
    get     → DepartmentService.getById(id)
    create  → company_id enjekte ediyor ✅
    update  → DepartmentService.update(id, body)
    delete  → DepartmentService.delete(id)

  İYİ YÖNLER:
    - list() şirket filtrelemesi doğru ✅
    - create() company_id doğru enjekte ediliyor ✅

⚠️ UYARILAR:
  - get/update/delete'te şirket kontrolü yok — aynı sorun.

────────────────────────────────────────────────────────────────────────────────
KÜME 5A ÖZET
────────────────────────────────────────────────────────────────────────────────
  AuthController.js      → ⚠️ registerEmployee güvenlik açığı
  UserController.js      → ⚠️ get/create/update'te şirket kontrolü eksik
  WorkspaceController.js → ✅ create iyi, diğerlerde şirket kontrolü eksik
  ProjectController.js   → ✅ Yapı iyi, şirket kontrolü dolaylı
  DepartmentController.js→ ✅ list/create iyi, diğerlerde kontrol eksik

  GENEL PATTERN SORUNU:
    → list() ve create() genellikle company_id enjekte ediyor ✅
    → get(), update(), delete() HIÇBIRINDE şirket doğrulaması yok.
      Bir kullanıcı başka şirketin kaydını ID ile okuyabilir/
      güncelleyebilir/silebilir.
    → Bu tüm controller'larda tekrarlayan bir güvenlik açığı.
================================================================================


================================================================================
KÜME 5B: CONTROLLERS — Task, TaskList, TaskComment, TaskLog
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. controllers/TaskController.js — Görev Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev oluşturma ve listeleme. En kritik controller.

  Fonksiyonlar:
    createTask(req, res)
      → TaskRepository.create(req.body)
      → 201 döner

    getTasksByList(req, res)
      → TaskRepository.findByTaskList(listId)
      → Bir listeye ait görevleri getirir

  ⚠️ KRİTİK SORUNLAR:

  1. MİMARİ TUTARSIZLIK:
     Diğer controller'lar Service katmanı kullanıyor:
       UserController → UserService
       WorkspaceController → WorkspaceService
     AMA TaskController DOĞRUDAN Repository'yi çağırıyor!
       TaskController → TaskRepository (Service ATLANDI)
     Bu mimari tutarlılığı bozuyor.

  2. SADECE 2 FONKSİYON:
     En kritik modülde sadece create ve listByList var.
     Eksikler:
       → getById() — tek görev detayı YOK
       → update() — görev güncelleme YOK
       → delete() — görev silme YOK
       → assign() — görev atama YOK
       → changeStatus() — durum değiştirme YOK

  3. GÜVENLİK:
     → createTask'ta company_id ve creator_id enjekte EDİLMİYOR.
       req.body direkt repository'ye gidiyor.
       Kullanıcı body'de istediği company_id'yi gönderebilir.
     → getTasksByList'te şirket kontrolü yok.

Durum: ⚠️ ÇOK EKSİK + mimari tutarsız + güvenlik açığı.

────────────────────────────────────────────────────────────────────────────────
2. controllers/TaskListController.js — Görev Listesi Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: TaskList (Kanban sütunları) CRUD işlemleri.

  Fonksiyonlar:
    list(req, res)    → taskListRepo.getByProject(projectId)
    get(req, res)     → taskListRepo.findById(id), 404 kontrolü ✅
    create(req, res)  → taskListRepo.create(body)
    update(req, res)  → taskListRepo.update(id, body)
    delete(req, res)  → taskListRepo.delete(id)

  ⚠️ SORUNLAR:

  1. MİMARİ TUTARSIZLIK:
     TaskListController → DOĞRUDAN Repository çağırıyor.
     Service katmanı atlanmış (TaskController ile aynı sorun).

  2. GÜVENLİK:
     → Hiçbir şirket kontrolü yok.
     → create'te company_id / bağlam doğrulaması yok.

Durum: ⚠️ Service atlanmış + güvenlik eksik.

────────────────────────────────────────────────────────────────────────────────
3. controllers/TaskCommentController.js — Görev Yorum Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Göreve yorum ekleme ve okuma.

  Fonksiyonlar:
    addComment(req, res)
      → user_id enjekte ediyor ✅ (req.user.id)
      → TaskCommentRepo.create(data)

    getComments(req, res)
      → TaskCommentRepo.findByTask(taskId)

  İYİ: user_id doğru şekilde enjekte ediliyor ✅.

  ⚠️ SORUNLAR:

  1. MİMARİ TUTARSIZLIK:
     Repository doğrudan çağrılıyor, Service yok.

  2. EKSİK FONKSİYONLAR:
     → updateComment() — yorum düzenleme YOK
     → deleteComment() — yorum silme YOK

  3. GÜVENLİK:
     → getComments'te görevin kullanıcının şirketine ait
       olduğu kontrol edilmiyor.

Durum: ⚠️ Service yok, update/delete eksik.

────────────────────────────────────────────────────────────────────────────────
4. controllers/TaskLogController.js — Görev Zaman Kaydı Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev üzerinde çalışma süresi loglama (timer).

  Fonksiyonlar:
    list(req, res)   → TaskLogService.getByTask(taskId)
    create(req, res) → user_id enjekte ediyor ✅
    update(req, res) → TaskLogService.update(id, body)
    delete(req, res) → TaskLogService.delete(id)

  İYİ YÖNLER:
    → Service katmanı kullanıyor ✅ (TaskLogService)
    → create'te user_id doğru enjekte ediliyor ✅
    → Tam CRUD ✅

  ⚠️ UYARI:
    → update/delete'te log'un sahibi kontrol edilmiyor.
      Başka kullanıcının logunu düzenleyebilir/silebilir.

Durum: ✅ İyi yapılandırılmış (şirket kontrolü hariç).

────────────────────────────────────────────────────────────────────────────────
KÜME 5B ÖZET
────────────────────────────────────────────────────────────────────────────────
  TaskController.js        → ⚠️ ÇOK EKSİK (2 fonksiyon, Service yok)
  TaskListController.js    → ⚠️ CRUD var ama Service atlanmış
  TaskCommentController.js → ⚠️ update/delete yok, Service yok
  TaskLogController.js     → ✅ İyi (Service kullanıyor, tam CRUD)

  SORUNLAR:

  1. MİMARİ TUTARSIZLIK:
     TaskController, TaskListController, TaskCommentController
     → DOĞRUDAN Repository çağırıyor (Service atlanmış)
     TaskLogController → Service kullanıyor ✅
     Diğer controller'lar (User, Workspace vb.) → Service kullanıyor ✅

     3 controller'da mimari tutarlılık bozulmuş.
     Ya hepsi Service kullansın ya da hiçbiri.

  2. TaskController ÇOK EKSİK:
     30 model tanımlı bir projede en önemli controller olan
     TaskController'da sadece create ve listByList var.
     update, delete, getById, assign, changeStatus eksik.

  3. GÜVENLİK (tüm 4 controller'da):
     → company_id doğrulaması yok
     → Kayıt sahipliği kontrolü yok
================================================================================


================================================================================
KÜME 5C: CONTROLLERS — HR, Dosya, Bildirim, Rapor, Ayarlar, Dashboard
================================================================================

────────────────────────────────────────────────────────────────────────────────
1. controllers/AttendanceController.js — Yoklama (Giriş-Çıkış)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Çalışanın günlük giriş ve çıkış kaydı.

  Fonksiyonlar:
    checkIn(req, res)
      → Bugünün tarihini hesaplıyor
      → Kullanıcının bugüne ait kaydını arıyor
      → Zaten giriş yapmışsa hata veriyor ✅
      → Kayıt yoksa yeni oluşturuyor, varsa güncellüyor
      → user_id: req.user.id ✅

    checkOut(req, res)
      → Bugünün kaydını buluyor
      → check_in yoksa hata veriyor ✅
      → check_out'u şimdiki zamanla dolduruyor

  İYİ YÖNLER:
    → user_id doğru enjekte ediliyor ✅
    → Çift giriş kontrolü var ✅
    → Giriş yapmadan çıkış engeli var ✅

  MİMARİ: Repository doğrudan çağrılıyor (Service yok).

⚠️ UYARILAR:
  - IP adresi ve cihaz bilgisi kaydedilMİYOR!
    Model'de ip_address ve device alanları var ama
    controller bunları DOLDURMAMIS. req.ip kullanılabilir.
  - Yoklama listesi endpoint'i YOK — yönetici
    çalışanların devamsızlığını göremez.

Durum: ✅ Temel akış doğru ama IP/cihaz atlanmış, liste eksik.

────────────────────────────────────────────────────────────────────────────────
2. controllers/BreakController.js — Mola Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Çalışanın molaya başlama ve bitirme kaydı.

  Fonksiyonlar:
    startBreak(req, res)
      → req.body'den attendance_id ve break_type_id alıyor
      → start_time = new Date()
      → BreakRepo.create(...)

    endBreak(req, res)
      → breakId ile mola kaydını buluyor
      → end_time = new Date()
      → br.save()

  MİMARİ: Repository doğrudan çağrılıyor (Service yok).

⚠️ SORUNLAR:
  1. startBreak'te attendance_id body'den geliyor!
     Kullanıcı başkasının attendance kaydına mola ekleyebilir.
     Doğrusu: req.user.id ile bugünün attendance'ını bulup
     o attendance'a bağlamak.

  2. is_violated hesaplanmıyor!
     Model'de is_violated (süre ihlali) alanı var ama
     endBreak'te süre kontrolü yapılmıyor. BreakType'daki
     max_duration ile karşılaştırma yok.

  3. endBreak'te sahiplik kontrolü yok!
     Herhangi biri breakId bilerek başkasının molasını
     bitirebilir.

Durum: ⚠️ Güvenlik açığı + is_violated hesaplanmıyor.

────────────────────────────────────────────────────────────────────────────────
3. controllers/LeaveController.js — İzin Talebi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Çalışanın izin talebi oluşturması ve listeleme.

  Fonksiyonlar:
    createLeave(req, res)
      → user_id: req.user.id enjekte ediyor ✅
      → LeaveRepo.create(...)

    getMyLeaves(req, res)
      → LeaveRepo.findByUser(req.user.id)
      → Sadece kendi izinlerini görebilir ✅

  MİMARİ: Repository doğrudan çağrılıyor (Service yok).

⚠️ SORUNLAR:
  1. ONAY / RED fonksiyonları YOK!
     Model'de approval_status, approved_by, approved_at,
     rejection_reason alanları var ama:
       → approveLeave() YOK
       → rejectLeave() YOK
     Yönetici izinleri onaylayamıyor/reddedemiyGR.

  2. Tüm izin talepleri listesi (yönetici için) YOK.
     Yönetici bekleyen izinleri göremez.

Durum: ⚠️ Onay/red mekanizması tamamen eksik.

────────────────────────────────────────────────────────────────────────────────
4. controllers/FileController.js — Dosya Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Dosya kaydı oluşturma ve listeleme.

  Fonksiyonlar:
    uploadFile(req, res)
      → company_id: req.user.company_id ✅
      → uploaded_by: req.user.id ✅
      → FileRepo.create(data)

    getFilesByCompany(req, res)
      → FileRepo.findByCompany(req.user.company_id) ✅

  İYİ YÖNLER:
    → company_id ve uploaded_by doğru enjekte ediliyor ✅
    → Şirket bazlı listeleme ✅

  ⚠️ SORUNLAR:
  1. GERÇEK DOSYA YÜKLEME YOK!
     Multer middleware KULLANILMIYOR. Sadece body'den
     file_name ve file_url alarak kayıt oluşturuyor.
     Aslında dosya yüklenmiyor, sadece metadata kaydediliyor.
     package.json'da multer var ama hiçbir yerde kullanılmıyor.

  2. Dosya silme (delete) fonksiyonu YOK.

Durum: ⚠️ Gerçek dosya upload yok, sadece metadata.

────────────────────────────────────────────────────────────────────────────────
5. controllers/NotificationController.js — Bildirim Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Bildirimleri listeleme ve okundu işaretleme.

  Fonksiyonlar:
    list(req, res)
      → user_id: req.user.id ile filtreleme ✅
      → Tarihe göre sıralı (DESC) ✅
      → AMA: NotificationRepo.model.findAll() kullanıyor
        (Repository'nin kendi metodu yerine doğrudan model erişimi)

    markRead(req, res)
      → Bildirim ID ile bulup is_read = true yapıyor
      → 404 kontrolü ✅

  ⚠️ UYARI:
    → markRead'de bildirim SAHİPLİĞİ kontrol edilmiyor!
      Herkes herhangi bir bildirimi okundu yapabilir.
      Doğrusu: notification.user_id === req.user.id kontrolü.

Durum: ⚠️ markRead'de sahiplik kontrolü yok.

────────────────────────────────────────────────────────────────────────────────
6. controllers/AnnouncementController.js — Duyuru Yönetimi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Duyuru CRUD işlemleri.

  Fonksiyonlar:
    list(req, res)
      → AnnouncementRepo.getByCompany(company_id) ✅

    create(req, res)
      → company_id ve user_id enjekte ediliyor ✅

    update(req, res)
      → findByPk(id) + Object.assign(announcement, req.body)
      → 404 kontrolü ✅

    delete(req, res)
      → findByPk(id) + destroy()
      → 404 kontrolü ✅

  İYİ YÖNLER:
    → list ve create'te şirket bilgisi doğru ✅

  ⚠️ UYARILAR:
    → update/delete'te şirket kontrolü yok — başka şirketin
      duyurusu güncellenebilir/silinebilir.
    → Object.assign → body'deki her şey modele atanıyor.
      company_id bile değiştirilebilir (mass assignment riski).
    → Rol kontrolü yok — herkes duyuru oluşturup silebilir.

Durum: ⚠️ Şirket kontrolü ve rol kontrolü eksik.

────────────────────────────────────────────────────────────────────────────────
7. controllers/CompanySettingController.js — Şirket Ayarları
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Şirket çalışma saati ve mola ayarlarını yönetir.

  Fonksiyonlar:
    get(req, res)
      → CompanySettingRepo.getByCompany(company_id) ✅

    update(req, res)
      → Şirket ayarını bulup güncellüyor
      → Object.assign + save
      → company_id doğru kullanılıyor ✅

  NOT: Bu controller İKİ KERE erişilebilir:
    1. routes/notifications.js → /api/notifications/company-settings
       (YETKİLENDİRMESİZ — herkes güncelleyebilir)
    2. routes/settings.js → /api/settings
       (authorizeRoles("boss") — sadece boss güncelleyebilir ✅)

  SONUÇ: Aynı controller iki farklı güvenlik seviyesinde erişiliyor.
         notifications.js'deki yol güvenlik açığı yaratıyor.

Durum: ⚠️ Duplicate route nedeniyle güvenlik açığı.

────────────────────────────────────────────────────────────────────────────────
8. controllers/ReportController.js — Raporlar
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev, yoklama ve izin raporları.

  Fonksiyonlar:
    taskReport(req, res)
      → ReportService.getTaskReport(company_id) ✅

    attendanceReport(req, res)
      → ReportService.getAttendanceReport(company_id, startDate, endDate)
      → Query parametrelerinden tarih aralığı ✅

    leaveReport(req, res)
      → ReportService.getLeaveReport(company_id) ✅

  İYİ YÖNLER:
    → Service katmanı kullanıyor ✅
    → company_id doğru ✅
    → Route'ta authorizeRoles("boss","manager") var ✅

Durum: ✅ En iyi yapılandırılmış controller'lardan biri.

────────────────────────────────────────────────────────────────────────────────
9. controllers/SettingsController.js — Genel Ayarlar
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: CompanySettingController ile aynı şeyi yapıyor ama
                farklı bir yaklaşımla.

  Fonksiyonlar:
    get(req, res)
      → CompanySetting.findOne({ where: { company_id } })
      → MODEL DOĞRUDAN kullanılıyor (Repo veya Service yok!)

    update(req, res)
      → Varsa güncelle, yoksa oluştur (upsert mantığı) ✅
      → company_id enjekte ediliyor ✅

  ⚠️ SORUNLAR:
  1. MİMARİ TUTARSIZLIK:
     CompanySettingController → Repository kullanıyor
     SettingsController → Model doğrudan kullanıyor
     İkisi de aynı tabloyu yönetiyor!

  2. DUPLICATE: CompanySettingController ile aynı iş.

Durum: ⚠️ Tamamen gereksiz duplicate.

────────────────────────────────────────────────────────────────────────────────
10. controllers/DashboardController.js — Dashboard Özet
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Ana sayfa için özet istatistikleri döner.

  Fonksiyonlar:
    getSummary(req, res)
      → Promise.all ile 5 sorguyu paralel çalıştırıyor ✅ (performans)
      → Dönen veriler:
        - totalUsers: Aktif kullanıcı sayısı
        - totalTasks: Toplam görev sayısı
        - todayAttendance: Bugünkü yoklama sayısı
        - pendingLeaves: Bekleyen izin talepleri
        - announcements: Son 5 duyuru

  İYİ YÖNLER:
    → Promise.all ile paralel sorgu — performanslı ✅
    → company_id filtrelemesi var ✅

  ⚠️ UYARILAR:
    → todayAttendance'ta company_id filtresi YOK!
      Tüm şirketlerin bugünkü yoklamasını sayıyor.
      Doğrusu: include User + where company_id.

  MİMARİ:
    → Service/Repository yok — Model doğrudan kullanılıyor.
      Bu tek bir "özet" fonksiyonu için kabul edilebilir,
      ama büyürse Service'e taşınmalı.

Durum: ✅ Genel olarak iyi ama todayAttendance şirket filtresi eksik.

────────────────────────────────────────────────────────────────────────────────
KÜME 5C ÖZET
────────────────────────────────────────────────────────────────────────────────
  AttendanceController.js    → ✅ Temel akış doğru, IP/cihaz atlanmış
  BreakController.js         → ⚠️ Güvenlik açığı + is_violated hesaplanmıyor
  LeaveController.js         → ⚠️ Onay/red mekanizması TAMAMEN EKSİK
  FileController.js          → ⚠️ Gerçek dosya upload yok (multer kullanılmıyor)
  NotificationController.js  → ⚠️ markRead sahiplik kontrolü yok
  AnnouncementController.js  → ⚠️ Şirket + rol kontrolü eksik
  CompanySettingController.js→ ⚠️ Duplicate route güvenlik açığı
  ReportController.js        → ✅ En iyi controller (Service + rol kontrolü)
  SettingsController.js      → ⚠️ CompanySettingController ile duplicate
  DashboardController.js     → ✅ İyi (todayAttendance filtre eksik)

  SORUNLAR:
    1. LeaveController → onay/red fonksiyonları yok
    2. FileController → Multer kullanılmıyor, gerçek upload yok
    3. BreakController → attendance sahiplik kontrolü yok
    4. CompanySetting → İKİ controller + İKİ route = güvenlik açığı
    5. SettingsController → CompanySettingController ile duplicate
    6. Mimari karışık: bazıları Repo, bazıları Service, bazıları
       doğrudan Model kullanıyor — tutarlılık yok

  TÜM CONTROLLER'LAR MİMARİ ÖZET:
    Service kullanan    : UserCtrl, WorkspaceCtrl, ProjectCtrl,
                          DepartmentCtrl, TaskLogCtrl, ReportCtrl
    Repository kullanan : TaskCtrl, TaskListCtrl, TaskCommentCtrl,
                          AttendanceCtrl, BreakCtrl, LeaveCtrl,
                          FileCtrl, NotificationCtrl, AnnouncementCtrl,
                          CompanySettingCtrl
    Model doğrudan      : SettingsCtrl, DashboardCtrl
================================================================================


================================================================================
KÜME 6: SERVICES (İş Mantığı Katmanı)
================================================================================

  Toplam 16 service dosyası.
  Akış: Controller → Service → Repository → Model

  NOT: Bazı controller'lar Service'i atlayıp doğrudan Repository
  çağırıyor (Küme 5'te tespit edildi). Service katmanı iş mantığı,
  doğrulama ve çapraz işlemler için doğru yer.

────────────────────────────────────────────────────────────────────────────────
1. services/AuthService.js — Kimlik Doğrulama İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kayıt, giriş ve JWT üretimi.

  Fonksiyonlar:
    generateCompanyCode()
      → 8 haneli rastgele alfanumerik kod üretir (A-Z, 0-9)
      → Şirket kaydında kullanılır

    generateJWT(user)
      → Payload: { id, company_id, role }
      → Süre: 7 gün
      → JWT_SECRET env'den okunuyor

    registerCompany(companyData, adminData)
      → Şirket kodu üretip şirket oluşturuyor
      → Şifreyi bcrypt ile hash'liyor ✅ (salt: 10)
      → İlk kullanıcıyı "boss" rolünde kaydediyor
      → Token döndürüyor

    registerEmployee(employeeData)
      → Şifreyi hash'liyor ✅
      → Default rol: "employee"
      → Token döndürüyor

    login(email, password)
      → Email ile kullanıcıyı buluyor
      → bcrypt.compare ile şifre doğruluyor ✅
      → Token döndürüyor

  İYİ YÖNLER:
    → Şifre hash'leme doğru ✅ (bcrypt, salt 10)
    → JWT payload'da gerekli bilgiler var ✅
    → Login'de hata mesajları var ✅

  ⚠️ SORUNLAR:
    1. generateCompanyCode() → Üretilen kodun UNIQUE olduğu kontrol
       edilmiyor! DB'de aynı kod varsa hata verir.
       Doğrusu: while döngüsü ile tekrar üretmek.

    2. registerEmployee() → company_id doğrulaması YOK!
       Herhangi biri isteğe company_id koyarak herhangi bir
       şirkete çalışan kaydedebilir. Bu fonksiyonu sadece
       authenticated + authorized kullanıcı çağırmalı.

    3. login() → password alanı direkt response'ta dönebilir!
       User objesi dönerken password hash gönderilebilir.
       user.password = undefined yapılmalı veya attributes
       ile password hariç tutulmalı.

    4. registerEmployee → role body'den set edilebilir.
       Kullanıcı role: "boss" gönderirse boss olarak kaydolur.

────────────────────────────────────────────────────────────────────────────────
2. services/UserService.js — Kullanıcı İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Kullanıcı oluşturma, güncelleme, listeleme.

  Fonksiyonlar:
    createUser(data)
      → Şifreyi hash'liyor ✅
      → UserRepo.create(data)

    updateUser(id, data)
      → Şifre değişiyorsa hash'liyor ✅
      → UserRepo.update(id, data)

    getUserWithSkills(user_id)
      → UserRepo.getWithSkills(user_id)
      → Kullanıcı + yetenek bilgileri

    listByCompany(company_id)
      → UserRepo.getByCompany(company_id)

  İYİ: Şifre hash'leme hem create hem update'te var ✅.

Durum: ✅ Temiz ve doğru. İnce service.

────────────────────────────────────────────────────────────────────────────────
3. services/WorkspaceService.js — Çalışma Alanı İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Workspace CRUD + otomatik üye ekleme.

  ÖNEMLİ DAVRANIŞ:
    create(data):
      → Workspace oluşturuyor
      → Oluşturanı OTOMATİK olarak "admin" üye yapıyor ✅
      Bu çok iyi bir tasarım.

    addMember(workspace_id, user_id, role)
      → WorkspaceMember.create(...)
      → Default rol: "member"

    removeMember(workspace_id, user_id)
      → findOne + destroy
      → Bulamazsa hata fırlatıyor ✅

Durum: ✅ İyi — otomatik üye atama akıllı tasarım.

────────────────────────────────────────────────────────────────────────────────
4. services/ProjectService.js — Proje İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Proje CRUD + otomatik üye ekleme.

  ÖNEMLİ DAVRANIŞ:
    create(data):
      → Proje oluşturuyor
      → Oluşturanı OTOMATİK olarak "lead" üye yapıyor ✅
      Workspace ile aynı mantık.

  WorkspaceService ile neredeyse birebir aynı yapıda.

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
5. services/DepartmentService.js — Departman İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Repository'ye doğrudan proxy. Ek iş mantığı yok.

  Fonksiyonlar: create, getByCompany, getById, update, delete
  → Hepsi departmentRepo'ya direkt delege.

  NOT: Bu service sadece "geçiş katmanı" — ileride iş mantığı
  eklenecekse hazır (örn: departman silinince kullanıcıların
  department_id'sini null yapma).

Durum: ✅ Temiz ama boş proxy.

────────────────────────────────────────────────────────────────────────────────
6. services/TaskService.js — Görev İş Mantığı ⭐ ÖNEMLİ
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Görev CRUD, atama, detaylı getById.

  Fonksiyonlar:
    create(data) → taskRepo.create(data)

    getById(id)
      → DETAYLI SORGU:
        include: creator (User), TaskStatus, TaskPriority,
                 TaskAssignment (+ User), Tag
      → Tek bir görevle birlikte tüm ilişkili veriler geliyor ✅

    getByTaskList(task_list_id) → taskRepo.findByTaskList(...)

    update(id, data) → taskRepo.update(id, data)

    delete(id) → taskRepo.delete(id)

    assignUser(task_id, user_id)
      → TaskAssignment.create({ task_id, user_id })

    removeAssignment(task_id, user_id)
      → findOne + destroy

  ⚠️ KRİTİK SORUN:
    Bu service MEVCUT AMA KULLANILMIYOR!
    TaskController doğrudan TaskRepository çağırıyor.
    TaskService'teki getById, update, delete, assignUser,
    removeAssignment fonksiyonları hiçbir yerden çağrılmıyor.

    Yani:
      - TaskService.getById() → zengin include sorgusu VAR ama kullanılmıyor
      - TaskService.assignUser() → atama fonksiyonu VAR ama endpoint yok
      - TaskService.update/delete → VAR ama route/controller yok

    TaskController'ın Service yerine Repository kullanması
    tüm bu hazır fonksiyonları boşa çıkarıyor.

Durum: ⚠️ İyi yazılmış ama KULLANILMIYOR — boşta duruyor.

────────────────────────────────────────────────────────────────────────────────
7. services/TaskLogService.js — Görev Zaman Kaydı İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: TaskLog CRUD. Repository'ye proxy.

  Ekstra: getByUser(user_id) — kullanıcının tüm logları
          (Controller'da kullanılmıyor ama hazır).

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
8. services/TaskCommentService.js — Görev Yorum İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: TaskComment CRUD. Repository'ye proxy.

  ⚠️ SORUN: TaskCommentController bu service'i KULLANMIYOR.
     Doğrudan TaskCommentRepository çağırıyor.
     Bu service de boşta duruyor.

Durum: ⚠️ Kullanılmıyor.

────────────────────────────────────────────────────────────────────────────────
9. services/ReportService.js — Rapor İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Rapor verilerini repository'den çeker.

  Fonksiyonlar:
    getTaskReport(company_id) → Duruma göre görev sayıları
    getAttendanceReport(company_id, startDate, endDate) → Yoklama özeti
    getLeaveReport(company_id) → İzin talep sayıları

  ReportController tarafından KULLANILIYOR ✅.

Durum: ✅ Temiz ve aktif kullanımda.

────────────────────────────────────────────────────────────────────────────────
10. services/NotificationService.js — Bildirim İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Bildirim CRUD + toplu okundu işaretleme.

  Fonksiyonlar:
    create(data)         → Yeni bildirim oluştur
    getByUser(user_id)   → Kullanıcının bildirimleri
    getUnreadByUser(id)  → Okunmamış bildirimler
    markAsRead(id)       → Tek bildirim okundu
    markAllAsRead(user_id) → Tüm bildirimleri okundu yap

  ⚠️ SORUN: NotificationController bu service'i KULLANMIYOR!
     Doğrudan NotificationRepo.model.findAll() çağırıyor.
     markAllAsRead gibi güzel fonksiyonlar boşta.

Durum: ⚠️ İyi fonksiyonlar var ama KULLANILMIYOR.

────────────────────────────────────────────────────────────────────────────────
11. services/AttendanceService.js — Yoklama İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Giriş/çıkış iş mantığı. AttendanceController ile
                AYNI KODU içeriyor.

  Fonksiyonlar:
    checkIn(user_id)  → Controller'daki ile aynı mantık
    checkOut(user_id) → Controller'daki ile aynı mantık
    getByUserAndDate(user_id, date)

  ⚠️ SORUN: AttendanceController bu service'i KULLANMIYOR!
     Controller aynı mantığı kendi içinde yazıyor.
     Service boşta duruyor — CODE DUPLICATION.

Durum: ⚠️ Kullanılmıyor + Controller ile duplicate kod.

────────────────────────────────────────────────────────────────────────────────
12. services/LeaveService.js — İzin İş Mantığı ⭐ ÖNEMLİ
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: İzin talebi CRUD + ONAY/RED mekanizması.

  Fonksiyonlar:
    create(data)    → İzin talebi oluştur
    getByUser(id)   → Kullanıcının izinleri
    getById(id)     → Tek izin detayı

    approve(id, approvedBy)
      → approval_status = "approved"
      → approved_by ve approved_at doldurarak kaydet ✅

    reject(id, approvedBy, rejectionReason)
      → approval_status = "rejected"
      → rejection_reason ile birlikte kaydet ✅

  ⚠️ KRİTİK SORUN:
    approve() ve reject() fonksiyonları İYİ YAZILMIŞ ama
    HİÇBİR YERDEN ÇAĞRILMIYOR!
    LeaveController sadece create ve getMyLeaves kullanıyor.
    Route'ta onay/red endpoint'i YOK.

    Yani model'de alan var, service'te fonksiyon var,
    ama controller'da metod ve route'ta endpoint YOK.
    Zincir kırılmış.

Durum: ⚠️ Onay/red hazır ama bağlanmamış.

────────────────────────────────────────────────────────────────────────────────
13. services/FileService.js — Dosya İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: File CRUD. Repository'ye proxy.

  ⚠️ FileController bu service'i KULLANMIYOR.
     Doğrudan FileRepository çağırıyor.

Durum: ⚠️ Kullanılmıyor.

────────────────────────────────────────────────────────────────────────────────
14. services/AnnouncementService.js — Duyuru İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Duyuru CRUD. Repository'ye proxy.

  ⚠️ AnnouncementController bu service'i KULLANMIYOR.
     Doğrudan AnnouncementRepository çağırıyor.

Durum: ⚠️ Kullanılmıyor.

────────────────────────────────────────────────────────────────────────────────
15. services/MailService.js — E-posta Servisi
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: E-posta gönderme altyapısı. HENÜZ TAMAMLANMAMIŞ.

  Fonksiyonlar:
    sendMail(to, subject, html)
      → TODO: SMTP entegrasyonu yapılacak
      → Şu an sadece logger.info ile "gönderildi" yazıyor
      → Gerçek mail GİTMİYOR

    sendLeaveApprovalMail(userEmail, status)
      → İzin onay/red maili şablonu hazır

    sendWelcomeMail(userEmail, firstName)
      → Hoş geldin maili şablonu hazır

  ⚠️ DURUMU:
    → Mail şablonları hazır ama SMTP bağlantısı yok.
    → Hiçbir yerden ÇAĞRILMIYOR (LeaveService'te bile yok).
    → package.json'da nodemailer bağımlılığı YOK.

Durum: ⚠️ Stub (taslak) — gerçek implementasyon yok.

────────────────────────────────────────────────────────────────────────────────
16. services/RecurringTaskService.js — Tekrarlayan Görev İş Mantığı
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Tekrarlayan görev şablonlarını yönetir.

  Fonksiyonlar:
    create, getByCompany, getById, update, delete
    + toggleActive(id) → is_active true/false geçişi ✅

  ⚠️ SORUNLAR:
    1. Hiçbir controller veya route bu service'i KULLANMIYOR.
       Tamamen erişilemez durumda.
    2. Repository kullanMIYOR — Model doğrudan çağrılıyor.
    3. Zamanlayıcı (scheduler/cron) YOK — Bu service CRUD yapıyor
       ama görev otomatik oluşturma mantığı hiç yok.

Durum: ⚠️ TAMAMEN BAĞLANMAMIŞ — route yok, controller yok, scheduler yok.

────────────────────────────────────────────────────────────────────────────────
KÜME 6 ÖZET
────────────────────────────────────────────────────────────────────────────────

  AKTİF KULLANIMDA (Controller bağlı):
    AuthService          → ✅ Aktif (AuthController kullanıyor)
    UserService          → ✅ Aktif (UserController kullanıyor)
    WorkspaceService     → ✅ Aktif (WorkspaceController kullanıyor)
    ProjectService       → ✅ Aktif (ProjectController kullanıyor)
    DepartmentService    → ✅ Aktif (DepartmentController kullanıyor)
    TaskLogService       → ✅ Aktif (TaskLogController kullanıyor)
    ReportService        → ✅ Aktif (ReportController kullanıyor)

  YAZILMIŞ AMA KULLANILMIYOR (Controller bağlamamış):
    TaskService          → ⚠️ En zengin service, KULLANILMIYOR
    TaskCommentService   → ⚠️ KULLANILMIYOR
    NotificationService  → ⚠️ KULLANILMIYOR (markAllAsRead boşta)
    AttendanceService    → ⚠️ KULLANILMIYOR (Controller ile duplicate)
    LeaveService         → ⚠️ approve/reject hazır ama BAĞLANMAMIŞ
    FileService          → ⚠️ KULLANILMIYOR
    AnnouncementService  → ⚠️ KULLANILMIYOR

  TASLAK (Stub):
    MailService          → ⚠️ SMTP yok, hiçbir yerden çağrılmıyor
    RecurringTaskService → ⚠️ Route/controller/scheduler hiç yok

  SORUNLAR:
    1. 16 service'ten sadece 7'si aktif kullanımda (%44)!
    2. 7 service yazılmış ama controller'lar ATLIYOR
    3. LeaveService.approve/reject → Route/Controller bağlanmamış
    4. TaskService → assignUser, getById (include) boşta
    5. MailService → SMTP entegrasyonu eksik + nodemailer paketi yok
    6. RecurringTaskService → Tamamen erişilemez + scheduler yok
    7. AuthService → company code uniqueness + password response riski
================================================================================


================================================================================
KÜME 7: REPOSITORIES (Veri Erişim Katmanı)
================================================================================

  Toplam 17 repository dosyası.
  Akış: Service → Repository → Model (DB)

  Mimari: BaseRepository pattern kullanılıyor.
  Tüm repository'ler BaseRepository'den türetiliyor ve
  temel CRUD işlemlerini kalıtım yoluyla alıyor.

────────────────────────────────────────────────────────────────────────────────
1. repositories/BaseRepository.js — Temel Repository (Üst Sınıf)
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Tüm repository'lerin türetildiği temel sınıf.
                Generic CRUD işlemlerini sağlar.

  Constructor: model parametresi alır (Sequelize model)

  Ortak Fonksiyonlar (tüm alt sınıflar kullanır):
    findAll(options)   → Tüm kayıtlar (filtreleme opsiyonel)
    findById(id)       → ID ile tek kayıt (findByPk)
    create(data)       → Yeni kayıt oluştur
    update(id, data)   → findByPk + update (yoksa hata)
    delete(id)         → findByPk + destroy (yoksa hata)

  İYİ YÖNLER:
    → update ve delete'te "not found" kontrolü var ✅
    → Generic pattern — kod tekrarını önlüyor ✅
    → Model adını hata mesajında gösteriyor ✅

Durum: ✅ İyi tasarım. Tutarlı ve DRY.

────────────────────────────────────────────────────────────────────────────────
2. repositories/UserRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByEmail(email)     → Login için email ile arama
    getByCompany(company_id) → Şirketin kullanıcıları
                               include: Department ✅
    getWithSkills(user_id) → Kullanıcı + yetenekler
                               include: UserSkill ✅

  NOT: getByCompany'de Department include ediliyor ama
       index.js'de User ↔ Department ilişkisi TANIMLI DEĞİL!
       Bu sorgu HATA VERECEK. (Küme 3A'da tespit edilmişti)

Durum: ⚠️ Department include'u ilişki eksikliğinden çalışmaz.

────────────────────────────────────────────────────────────────────────────────
3. repositories/TaskRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByTaskList(task_list_id) → Listeye ait görevler

  NOT: Çok minimal. TaskService'teki zengin include sorgusu
       (creator, status, priority, assignments, tags)
       burada YOK — Service'te doğrudan model kullanılıyor.

Durum: ✅ Temiz ama basit.

────────────────────────────────────────────────────────────────────────────────
4. repositories/WorkspaceRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByCompany(company_id) → Şirketin workspace'leri
    findWithMembers(id) → Workspace + üyeler + kullanıcı bilgileri
                          include: WorkspaceMember → User ✅
                          (id, first_name, last_name, email, avatar_url)

Durum: ✅ include yapısı iyi.

────────────────────────────────────────────────────────────────────────────────
5. repositories/ProjectRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByWorkspace(workspace_id) → Workspace'in projeleri
    findWithMembers(id) → Proje + üyeler + kullanıcı bilgileri
                          WorkspaceRepository ile aynı yapı ✅

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
6. repositories/DepartmentRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByCompany(company_id) → Şirketin departmanları

Durum: ✅ Basit ve temiz.

────────────────────────────────────────────────────────────────────────────────
7. repositories/TaskListRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    getByProject(project_id)
      → order: order_no ASC ✅ (sıralama desteği)
      → include: Project ✅

Durum: ✅ Temiz, sıralama doğru.

────────────────────────────────────────────────────────────────────────────────
8. repositories/TaskCommentRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByTask(task_id)
      → order: created_at ASC ✅ (kronolojik sıra)

  ⚠️ UYARI: User include EDİLMİYOR.
     Yorumları listelerken kimin yazdığı gösterilemiyor.
     include: User eklenmeli.

Durum: ⚠️ User include eksik.

────────────────────────────────────────────────────────────────────────────────
9. repositories/TaskLogRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByTask(task_id)
      → include: User (id, first_name, last_name) ✅
      → order: start_time DESC ✅

    findByUser(user_id)
      → order: start_time DESC ✅

Durum: ✅ İyi — User include edilmiş, sıralama doğru.

────────────────────────────────────────────────────────────────────────────────
10. repositories/AttendanceRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByUserAndDate(user_id, date) → Kullanıcının o günkü kaydı

Durum: ✅ Basit ve temiz.

────────────────────────────────────────────────────────────────────────────────
11. repositories/BreakRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByAttendance(attendance_id) → Günün molaları

Durum: ✅ Basit ve temiz.

────────────────────────────────────────────────────────────────────────────────
12. repositories/LeaveRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByUser(user_id) → Kullanıcının izin talepleri

  ⚠️ UYARI: Yönetici için tüm bekleyen izinleri listeleme
     fonksiyonu YOK. findPendingByCompany(company_id) gibi
     bir metod eksik.

Durum: ✅ Basit ama yönetici sorgusu eksik.

────────────────────────────────────────────────────────────────────────────────
13. repositories/FileRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    findByCompany(company_id) → Şirketin dosyaları

Durum: ✅ Basit ve temiz.

────────────────────────────────────────────────────────────────────────────────
14. repositories/NotificationRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    getUnreadByUser(user_id)
      → is_read: false filtresi ✅
      → created_at DESC sıralama ✅

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
15. repositories/AnnouncementRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    getByCompany(company_id)
      → created_at DESC sıralama ✅

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
16. repositories/CompanySettingRepository.js
────────────────────────────────────────────────────────────────────────────────
  Ekstra fonksiyonlar:
    getByCompany(company_id) → findOne (şirket başına tek ayar)

Durum: ✅ Temiz.

────────────────────────────────────────────────────────────────────────────────
17. repositories/ReportRepository.js — ⭐ FARKLI YAPI
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Rapor sorguları. BaseRepository'den TÜREMEZ.
                Doğrudan raw SQL sorguları kullanır.

  Fonksiyonlar:
    getTaskCountsByStatus(company_id)
      → Duruma göre görev sayıları (GROUP BY ts.name)
      → Raw SQL + replacements (parameterized) ✅

    getAttendanceSummary(company_id, startDate, endDate)
      → Kullanıcı bazlı yoklama özeti
      → Tarih aralığı filtresi
      → Raw SQL + replacements ✅

    getLeaveRequestCounts(company_id)
      → Onay durumuna göre izin sayıları
      → Raw SQL + replacements ✅

  İYİ YÖNLER:
    → Raw SQL kullanılması rapor sorguları için doğru ✅
    → Replacements (parameterized queries) — SQL injection korunması ✅
    → company_id tüm sorgularda var ✅

  NOT: BaseRepository'den türememesi mantıklı çünkü
       bu repository tek bir model değil, birden fazla
       tabloyu JOIN eden rapor sorguları çalıştırıyor.

Durum: ✅ İyi tasarım ve güvenli sorgular.

────────────────────────────────────────────────────────────────────────────────
KÜME 7 ÖZET
────────────────────────────────────────────────────────────────────────────────

  BaseRepository           → ✅ İyi generic CRUD pattern
  UserRepository           → ⚠️ Department include ilişki eksikliği
  TaskRepository           → ✅ Basit (zengin sorgular Service'te)
  WorkspaceRepository      → ✅ İyi (members include)
  ProjectRepository        → ✅ İyi (members include)
  DepartmentRepository     → ✅ Basit
  TaskListRepository       → ✅ İyi (sıralama + include)
  TaskCommentRepository    → ⚠️ User include eksik
  TaskLogRepository        → ✅ İyi (User include + sıralama)
  AttendanceRepository     → ✅ Basit
  BreakRepository          → ✅ Basit
  LeaveRepository          → ✅ Basit (yönetici sorgusu eksik)
  FileRepository           → ✅ Basit
  NotificationRepository   → ✅ İyi (unread filtresi)
  AnnouncementRepository   → ✅ İyi (sıralama)
  CompanySettingRepository  → ✅ Basit
  ReportRepository         → ✅ İyi (raw SQL, parameterized)

  SORUNLAR:
    1. UserRepository → getByCompany'de Department include edilmiş
       ama index.js'de User ↔ Department ilişkisi YOK → HATA VERECEK
    2. TaskCommentRepository → findByTask'ta User include edilmemiş
       → Kimin yazdığı sorgulanamıyor
    3. LeaveRepository → Yönetici için bekleyen izinleri listeleme
       fonksiyonu eksik (findPendingByCompany)

  GENEL DEĞERLENDİRME:
    Repository katmanı TUTARLI ve TEMİZ tasarlanmış.
    BaseRepository pattern iyi çalışıyor.
    Sorunlar modellerdeki ilişki eksikliklerinden kaynaklanıyor.
================================================================================


================================================================================
KÜME 8: UTILS (Yardımcı Araçlar)
================================================================================

  Toplam 4 util dosyası.

────────────────────────────────────────────────────────────────────────────────
1. utils/logger.js — Loglama
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Winston ile yapılandırılmış log sistemi.

  Log Seviyesi: env'den (LOG_LEVEL) veya default "info"

  Format:
    [2026-03-07 14:30:00] INFO: Mesaj
    [2026-03-07 14:30:00] ERROR: Hata mesajı
      stack trace...

  Transport'lar (log çıktıları):
    1. Console → Terminale yaz
    2. logs/error.log → Sadece error seviyesi
    3. logs/combined.log → Tüm loglar

  İYİ YÖNLER:
    → Timestamp formatlı ✅
    → Error stack trace dahil ✅
    → Dosya + console çift çıktı ✅

  KULLANIMDA: database.js, handlers.js, MailService.js

Durum: ✅ Temiz ve iyi yapılandırılmış.

────────────────────────────────────────────────────────────────────────────────
2. utils/dateUtils.js — Tarih Yardımcıları
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Tarih formatlama ve hesaplama fonksiyonları.

  Fonksiyonlar:
    formatDate(date)       → "2026-03-07" formatı
    formatDateTime(date)   → "2026-03-07 14:30:00" formatı
    today()                → Bugünün tarihi
    diffInDays(d1, d2)     → İki tarih arası gün farkı
    diffInMinutes(d1, d2)  → İki tarih arası dakika farkı

  ⚠️ UYARI:
    → Bu fonksiyonlar HİÇBİR YERDE KULLANILMIYOR!
      AttendanceController'da tarih hesaplaması doğrudan
      new Date().toISOString().split("T")[0] ile yapılıyor.
      today() kullanılabilirdi.
    → diffInMinutes mola süresi hesaplamasında kullanılabilir
      ama BreakController'da kullanılmamış.

Durum: ✅ Temiz ama KULLANILMIYOR.

────────────────────────────────────────────────────────────────────────────────
3. utils/encryption.js — Şifreleme
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: AES-256-CBC simetrik şifreleme/şifre çözme.

  Fonksiyonlar:
    encrypt(text, secretKey) → IV + şifreli metin (hex)
    decrypt(encryptedText, secretKey) → Orijinal metin

  Teknik: crypto.scryptSync ile key derivation, random IV

  ⚠️ SORUNLAR:
    1. HİÇBİR YERDE KULLANILMIYOR!
       Muhtemelen ileride hassas veri şifreleme için hazırlanmış.

    2. Salt DEĞERİ SABİT: "salt" string'i hardcoded.
       Güvenli kullanımda salt her işlem için rastgele olmalı.
       Şu haliyle aynı key + aynı salt = aynı derived key.
       IV rastgele olduğu için yine de farklı çıktı üretiyor
       ama yine de iyi pratik değil.

Durum: ⚠️ Kullanılmıyor + sabit salt.

────────────────────────────────────────────────────────────────────────────────
4. utils/ValidationUtils.js — Doğrulama Yardımcıları
────────────────────────────────────────────────────────────────────────────────
Ne işe yarıyor: Basit veri doğrulama fonksiyonları.

  Fonksiyonlar:
    isEmail(value)        → Email regex kontrolü
    isPhone(value)        → Telefon regex kontrolü (+901234567890)
    isPositiveInt(value)  → Pozitif integer mi
    isNotEmpty(value)     → Boş mu (null, undefined, "")
    isInEnum(value, arr)  → İzin verilen değerler listesinde mi

  ⚠️ UYARI:
    → HİÇBİR YERDE KULLANILMIYOR!
      Validation işleri express-validator ile
      ValidationMiddleware.js'de yapılıyor (o da çoğu
      route'ta uygulanmamış).
    → Bu fonksiyonlar service/controller'da manual
      kontrol için hazırlanmış ama hiç bağlanmamış.

Durum: ⚠️ Kullanılmıyor.

────────────────────────────────────────────────────────────────────────────────
KÜME 8 ÖZET
────────────────────────────────────────────────────────────────────────────────
  logger.js          → ✅ Aktif kullanımda, iyi yapılandırılmış
  dateUtils.js       → ⚠️ Kullanılmıyor (tarih hesaplamaları inline)
  encryption.js      → ⚠️ Kullanılmıyor + sabit salt
  ValidationUtils.js → ⚠️ Kullanılmıyor

  4 utils'ten sadece 1'i aktif kullanımda (%25).



################################################################################
################################################################################
##                                                                            ##
##                        GENEL ÖZET VE TÜM SORUNLAR                         ##
##                                                                            ##
################################################################################
################################################################################

================================================================================
A. PROJE GENEL YAPISI
================================================================================

  Proje Adı: SAM (System Active Monitors)
  Tür      : Multi-tenant iş yönetim platformu
  Teknoloji: Node.js + Express + Sequelize + MySQL + Socket.io
  Mimari   : Katmanlı (Route → Controller → Service → Repository → Model)

  Toplam Dosya Sayıları:
    Models       : 30
    Controllers  : 18
    Services     : 16
    Repositories : 17
    Routes       : 18
    Middleware   : 5
    Utils        : 4
    Config       : 1
    Entry points : 2 (server.js, app.js)

  Özellikler:
    → Şirket bazlı veri izolasyonu (multi-tenant)
    → JWT kimlik doğrulama
    → Rol bazlı yetkilendirme (boss, manager, employee, customer)
    → Görev yönetimi (Workspace → Project → TaskList → Task)
    → Mesai/yoklama takibi (check-in/check-out)
    → Mola yönetimi + süre ihlali
    → İzin talebi + onay akışı
    → Bildirim sistemi (Socket.io ile gerçek zamanlı)
    → Duyuru yönetimi
    → Rapor sistemi
    → Dosya yönetimi
    → Tekrarlayan görev şablonları
    → Otomasyon kuralları
    → Dashboard özet
    → Kullanıcı yetenek takibi

================================================================================
B. AKTİF KULLANIM ORANI
================================================================================

  KOD KULLANIMDA MI?

  Katman            Yazılan   Aktif   Oran
  ──────────────────────────────────────────
  Services            16        7      %44
  Utils                4        1      %25
  Middleware           5        3      %60
  Routes              18       18     %100 (ama app.js'de bağlı DEĞİL)

  Toplamda yazılan kodun yaklaşık %40'ı hiçbir yerden ÇAĞRILMIYOR.

================================================================================
C. TÜM TESPİT EDİLEN SORUNLAR — ÖNCELİĞE GÖRE
================================================================================

╔══════════════════════════════════════════════════════════════════════════════╗
║  KRİTİK — SİSTEMİN ÇALIŞMASINI ENGELLEYEN                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

  K1. app.js → Route'lar YORUM SATIRINDA
      Satır 34-35: routes require ve app.use('/api', routes) kapalı.
      Backend hiçbir API endpoint'i sunmuyor.
      ÇÖZ: Yorum satırlarını aç.

  K2. app.js → Error handler'lar BAĞLI DEĞİL
      handlers.js'deki notFound ve errorHandler app.js'de
      use edilmemiş. 404 ve global hata yönetimi çalışmıyor.
      ÇÖZ: app.use(notFound) ve app.use(errorHandler) ekle.

  K3. UserRepository → Department include HATA VERECEK
      getByCompany'de Department include edilmiş ama
      index.js'de User ↔ Department ilişkisi tanımlı değil.
      Sequelize çalışma zamanında hata fırlatır.
      ÇÖZ: index.js'e User.belongsTo(Department) ekle.

╔══════════════════════════════════════════════════════════════════════════════╗
║  YÜKSEK — GÜVENLİK AÇIKLARI                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

  G1. companyIsolation middleware HİÇBİR route'ta kullanılmıyor
      Bir kullanıcı başka şirketin verilerini ID ile okuyabilir,
      güncelleyebilir, silebilir.

  G2. authorizeRoles sadece reports.js ve settings.js'de var
      Diğer tüm route'larda herhangi bir çalışan her işlemi yapabilir
      (departman silme, duyuru oluşturma, kullanıcı güncelleme vb.)

  G3. registerEmployee endpoint'i korumasız
      Herkes (login olmadan) herhangi bir şirkete çalışan
      kaydedebilir. authenticate middleware yok.

  G4. registerEmployee → role body'den ayarlanabiliyor
      Kullanıcı role: "boss" göndererek boss olarak kaydolabilir.

  G5. get/update/delete işlemlerinde ŞIRKET KONTROLÜ YOK
      Tüm controller'larda list() ve create() company_id
      kullanıyor ama get(), update(), delete() kontrol etmiyor.

  G6. CompanySetting → İKİ FARKLI route ile erişilebilir
      notifications.js → yetkilendirmesiz (herkes güncelleyebilir)
      settings.js → authorizeRoles("boss") ✅
      Aynı veri iki farklı güvenlik seviyesinde erişiliyor.

  G7. BreakController → attendance_id body'den geliyor
      Başkasının yoklama kaydına mola eklenebilir.

  G8. NotificationController → markRead sahiplik kontrolü yok
      Herkes herhangi bir bildirimi okundu yapabilir.

  G9. AnnouncementController → Object.assign mass assignment riski
      Body'deki her alan (company_id dahil) modele atanıyor.

  G10. AuthService → login response'ta password hash dönebilir
       User objesi password alanıyla birlikte dönüyor.

╔══════════════════════════════════════════════════════════════════════════════╗
║  ORTA — EKSİK FONKSİYONALİTE                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

  E1. TaskController → sadece 2 endpoint (create + listByList)
      update, delete, getById, assign, changeStatus EKSİK.
      TaskService'te hazır fonksiyonlar var ama bağlanmamış.

  E2. Leave onay/red → LeaveService'te approve/reject HAZIR
      ama controller'da metod ve route'ta endpoint YOK.
      Zincir: Model ✅ → Service ✅ → Controller ❌ → Route ❌

  E3. FileController → Gerçek dosya upload YOK
      Multer paketi var ama hiçbir yerde kullanılmıyor.
      Sadece metadata kaydediliyor.

  E4. Dosya silme endpoint'i YOK

  E5. TaskComment → update/delete endpoint'leri YOK

  E6. Yoklama listesi endpoint'i YOK
      Yönetici çalışanların devamsızlığını göremez.

  E7. Break → is_violated (süre ihlali) hesaplanmıyor

  E8. Attendance → IP adresi ve cihaz bilgisi kaydedilmiyor
      Model'de alanlar var ama controller doldurmamış.

  E9. RecurringTaskService → Tamamen erişilemez
      Route yok, controller yok, scheduler/cron yok.

  E10. AutomationRule → Model var ama otomasyon motoru yok

  E11. MailService → SMTP entegrasyonu yok, nodemailer paketi yok

  E12. User DELETE endpoint'i yok

╔══════════════════════════════════════════════════════════════════════════════╗
║  DÜŞÜK — MİMARİ / KOD KALİTESİ                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

  M1. Mimari tutarsızlık — Controller'lar karışık katman kullanıyor
      6 controller → Service
      10 controller → doğrudan Repository
      2 controller → doğrudan Model
      Standart: HEPSI Service kullanmalı.

  M2. 9 Service yazılmış ama KULLANILMIYOR
      TaskService, TaskCommentService, NotificationService,
      AttendanceService, LeaveService, FileService,
      AnnouncementService, MailService, RecurringTaskService

  M3. 3 Utils dosyası KULLANILMIYOR
      dateUtils.js, encryption.js, ValidationUtils.js

  M4. Duplicate route'lar
      leaves → attendance.js + leaves.js
      announcements → notifications.js + announcements.js
      company-settings → notifications.js + settings.js

  M5. roleCheck.js → authMiddleware.js'deki authorizeRoles ile duplicate

  M6. SettingsController → CompanySettingController ile duplicate

  M7. ValidationMiddleware rules tanımlı ama hiçbir route'ta uygulanmamış

  M8. DashboardController → todayAttendance şirket filtresi yok

  M9. TaskCommentRepository → User include eksik

╔══════════════════════════════════════════════════════════════════════════════╗
║  EKSİK İLİŞKİLER (models/index.js)                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

  İ1. User ↔ Department ilişkisi tanımlı değil
  İ2. TaskLog → Task ve User ilişkileri tanımlı değil
  İ3. TaskHistory → Task ve User ilişkileri tanımlı değil
  İ4. Task → parent_task_id self-referencing ilişki yok
  İ5. TaskComment → parent_comment_id self-referencing ilişki yok
  İ6. LeaveRequest → approved_by User ilişkisi (as: approver) yok
  İ7. RecurringTask → assignee_id User ilişkisi yok
  İ8. RecurringTask → task_list_id / project_id alanı yok

  İ9. AuthService → generateCompanyCode uniqueness kontrolü yok

================================================================================
D. ÖNERİLEN DÜZELTME SIRASI
================================================================================

  ADIM 1 — SİSTEMİ AYAĞA KALDIR (K1-K3)
    □ app.js'de route'ları aç
    □ app.js'de notFound + errorHandler bağla
    □ index.js'de User ↔ Department ilişkisi ekle

  ADIM 2 — GÜVENLİK AÇIKLARINI KAPAT (G1-G10)
    □ Route'lara companyIsolation middleware ekle
    □ Route'lara authorizeRoles ekle
    □ registerEmployee'yi authenticate ile koru
    □ get/update/delete'te şirket kontrolü ekle
    □ Duplicate route'ları temizle
    □ Login response'tan password'ü çıkar

  ADIM 3 — EKSİK FONKSİYONLARI TAMAMLA (E1-E12)
    □ TaskController'ı TaskService'e bağla, eksik CRUD ekle
    □ Leave onay/red route + controller bağla
    □ Multer ile gerçek dosya upload ekle
    □ Eksik endpoint'leri ekle (delete, update)

  ADIM 4 — MİMARİYİ DÜZELTi (M1-M9)
    □ Tüm controller'ları Service katmanı üzerinden çalıştır
    □ Kullanılmayan Service'leri bağla
    □ Duplicate dosyaları temizle
    □ Eksik ilişkileri (İ1-İ9) tamamla

  ADIM 5 — İLERİ ÖZELLİKLER (E9-E11)
    □ RecurringTask scheduler/cron sistemi kur
    □ AutomationRule motoru yaz
    □ MailService SMTP entegrasyonu + nodemailer paketi

================================================================================
                     ANALİZ TAMAMLANDI
           Toplam 8 küme, ~100 dosya incelendi
           3 kritik, 10 güvenlik, 12 eksik, 9 mimari sorun
================================================================================
