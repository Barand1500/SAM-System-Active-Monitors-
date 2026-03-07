# BİRLEŞTİRME MANTIĞI — Frontend ↔ Backend

## ŞU AN NE VAR?

```
Frontend (React)                    Backend (Express)
─────────────────                   ─────────────────
Sahte veri ile çalışıyor            Veritabanı ile çalışıyor
localStorage'da tutuyor             MySQL'de tutuyor
Hiçbir API çağrısı yok             API endpoint'leri var (ama kapalı)
Kullanıcı arayüzü HAZIR            Veri işleme mantığı HAZIR
```

İkisi de kendi başına yarım. Birleştirme = Frontend'in sahte verilerini kaldırıp,
Backend'in gerçek verilerini kullanmasını sağlamak.


## BİRLEŞTİRME NEDİR, NE DEĞİLDİR?

**NEDİR:**
Frontend bir butona tıklandığında → Backend'e HTTP isteği gönderir →
Backend veritabanından veriyi alır → Frontend'e JSON olarak döner →
Frontend ekrana gösterir.

**NE DEĞİLDİR:**
İki projeyi tek dosyaya birleştirmek değil. İkisi ayrı kalacak.
Frontend port 3000'de, Backend port 5000'de çalışmaya devam edecek.
Aralarında HTTP ile konuşacaklar.


## AKIŞ NASIL ÇALIŞACAK?

```
Kullanıcı tıklar
    ↓
Frontend → fetch("/api/tasks") → HTTP isteği gönderir
    ↓
Vite Proxy bu isteği localhost:5000'e yönlendirir (zaten ayarlı ✅)
    ↓
Backend → Route → Controller → Service → Repository → Model → MySQL
    ↓
Backend JSON döner: { success: true, data: [...] }
    ↓
Frontend JSON'ı alır → state'e yazar → ekran güncellenir
```


## DOSYA DOSYA KARŞILIK TABLOSU

### 1. AUTH (Giriş/Kayıt)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
context/AuthContext.jsx               
  ├── login()                    →    POST /api/auth/login
  │   Şu an: mockData'dan                AuthController.login()
  │   kullanıcı arıyor                   AuthService.login()
  │   Şifre: hep "123456"                → email+password ile DB'den bulur
  │                                       → JWT token döner
  │
  ├── registerCompany()          →    POST /api/auth/register
  │   Şu an: localStorage'a              AuthController.register()
  │   fake şirket kaydediyor              AuthService.register()
  │                                       → Yeni Company + boss User oluşturur
  │                                       → company_code üretir
  │
  ├── joinCompany()              →    POST /api/auth/register-employee
  │   Şu an: hardcoded company_code       AuthController.registerEmployee()
  │   kontrol ediyor                      → companyCode ile şirketi bulur
  │                                       → Yeni employee User oluşturur
  │
  └── logout()                   →    Token'ı sil (sadece frontend işi)
```

**Ne değişecek:** AuthContext.jsx'te `setTimeout` + `mockData` bloklarını
kaldırıp, yerine gerçek `fetch("/api/auth/login", ...)` çağrısı koyacaksın.
Backend'den dönen JWT token'ı localStorage'a kaydedeceksin. Her sonraki
istekte bu token'ı header olarak göndereceksin.


### 2. GÖREVLER (Tasks)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
pages/Dashboard.jsx
  ├── tasks state                →    GET /api/tasks
  │   Şu an: initialTasks                TaskController → henüz listAll yok!
  │   (hardcoded dizi)                    ⚠️ Backend'de sadece 2 endpoint var
  │                                       (create + listByList)
  │                                       → Önce backend'e CRUD eklenecek
  │
  ├── addTask()                  →    POST /api/tasks
  │   Şu an: setTasks ile                TaskController.create() ✅ var
  │   local state'e ekliyor
  │
  ├── updateTask()               →    PUT /api/tasks/:id
  │   Şu an: state güncelleme            ⚠️ Backend'de YOK — eklenecek
  │
  ├── deleteTask()               →    DELETE /api/tasks/:id
  │   Şu an: state'ten silme             ⚠️ Backend'de YOK — eklenecek
  │
  │
  components/KanbanBoard.jsx
  │   Props ile task alıyor               Aynı task endpoint'leri
  │   onUpdateTask callback               PUT /api/tasks/:id (status değişimi)
  │
  components/CalendarView.jsx
  │   Props ile task alıyor               Aynı task endpoint'leri
  │   Takvimde gösteriyor                 GET /api/tasks?month=2026-03
  │
  components/TaskDetailModal.jsx
  │   Tek görev detayı                    GET /api/tasks/:id
  │   Yorum ekleme                        POST /api/tasks/:id/comments
  │   Alt görev (checklist)               ⚠️ Backend'de checklist yok
```

**Ne değişecek:** Dashboard.jsx'teki `initialTasks` ve `loadFromStorage('app_tasks')`
kalkacak. Yerine sayfa açılınca `GET /api/tasks` çağrısı yapılacak. addTask, updateTask,
deleteTask fonksiyonları önce backend'e istek gönderecek, başarılı olursa state'i
güncelleyecek. KanbanBoard ve CalendarView zaten props ile çalışıyor, onlar
otomatik güncellenecek.

**AMA ÖNCE:** Backend'de TaskController'a getAll, getById, update, delete
fonksiyonları eklenmeli. Şu an sadece create ve listByList var.


### 3. ÇALIŞANLAR (Employees)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
pages/Dashboard.jsx
  ├── employees state            →    GET /api/users
  │   Şu an: mockData.users              UserController.list()
  │   (6 sahte kullanıcı)                → company_id ile filtreler
  │
  ├── addEmployee()              →    POST /api/users  (veya register-employee)
  │   Şu an: state'e ekleme              UserController.create()
  │
  ├── updateEmployee()           →    PUT /api/users/:id
  │   Şu an: state güncelleme            UserController.update()
  │
  ├── deleteEmployee()           →    DELETE /api/users/:id
  │   Şu an: state'ten silme             ⚠️ Backend'de delete endpoint YOK
```

**Ne değişecek:** `initialUsers` import'u kalkacak. Sayfa açılınca `GET /api/users`
çağrılacak. Ama dikkat: Frontend `firstName` diyor, Backend `first_name` döndürüyor.
Ya frontend'i snake_case'e çevireceksin ya da bir dönüştürme fonksiyonu yazacaksın.


### 4. MESAİ / YOKLAMA (Attendance)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
components/TimeTracker.jsx
  ├── clockIn                    →    POST /api/attendance/check-in
  │   Şu an: hardcoded                   AttendanceController.checkIn()
  │   weeklyLogs dizisi                   → Yeni attendance kaydı oluşturur
  │
  ├── clockOut                   →    POST /api/attendance/check-out
  │   Şu an: local state                 AttendanceController.checkOut()
  │                                       → check_out zamanını yazar
  │
  ├── breakStart                 →    POST /api/attendance/break-start
  │                                       BreakController.start()
  │
  ├── breakEnd                   →    POST /api/attendance/break-end
  │                                       BreakController.end()
  │
  ├── weeklyLogs (tablo)         →    GET /api/attendance/my
  │   Şu an: sabit veri                  → Kullanıcının haftalık kayıtları
```

**Ne değişecek:** Hardcoded `weeklyLogs` kalkacak. Sayfa açılınca
`GET /api/attendance/my` ile gerçek kayıtlar çekilecek. Clock in/out
butonları backend'e POST yapacak.


### 5. İZİNLER (Leaves)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
components/LeaveRequestSystem.jsx
  ├── İzin listesi               →    GET /api/leaves
  │   Şu an: hardcoded requests[]        LeaveController.list()
  │
  ├── İzin talebi oluştur        →    POST /api/leaves
  │                                       LeaveController.create()
  │
  ├── İzin onayla                →    PUT /api/leaves/:id/approve
  │   Frontend'te butonu var              ⚠️ Backend'de approve endpoint YOK
  │   ama sahte işlem yapıyor             LeaveService'te fonksiyon HAZIR
  │                                       ama route + controller bağlı değil
  │
  ├── İzin reddet                →    PUT /api/leaves/:id/reject
  │   Aynı durum                          Aynı — route + controller bağlanacak
```

**Ne değişecek:** Hardcoded `requests[]` kalkacak. ANCAK backend'de approve/reject
endpoint'leri olmadığı için önce backend tarafında LeaveService'teki hazır
fonksiyonları controller'a bağlayıp route tanımlamak gerekiyor.


### 6. DUYURULAR (Announcements)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
pages/Dashboard.jsx (AnnouncementsTab)
  ├── Duyuru listesi             →    GET /api/announcements
  │   Şu an: mockData.announcements      AnnouncementController.list()
  │
  ├── Duyuru oluştur             →    POST /api/announcements
  │                                       AnnouncementController.create()
  │
  ├── Duyuru güncelle            →    PUT /api/announcements/:id
  │                                       AnnouncementController.update()
  │
  ├── Duyuru sil                 →    DELETE /api/announcements/:id
  │                                       AnnouncementController.delete()
```

**Ne değişecek:** Bu en kolay modül. Backend CRUD'u hazır.
`initialAnnouncements` import'u kalkacak, yerine API çağrısı gelecek.


### 7. DOSYALAR (Files)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
components/FileSharing.jsx
  ├── Dosya listesi              →    GET /api/files
  │   Şu an: localStorage                FileController.list()
  │   (sam_shared_files)
  │
  ├── Dosya yükle                →    POST /api/files/upload
  │   Şu an: sahte kayıt                 ⚠️ Backend'de gerçek upload YOK
  │   (metadata yazıyor)                  multer paketi var ama kullanılmamış
  │                                       → multer middleware eklenecek
  │
  ├── Dosya indir                →    GET /api/files/:id/download
  │                                       ⚠️ Backend'de download YOK
```

**Ne değişecek:** localStorage kalkacak. AMA backend'de dosya upload
gerçekten çalışmıyor. Önce backend'e multer konfigürasyonu + upload
endpoint'i eklenmeli.


### 8. PROJELER (Projects)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
components/ProjectModule.jsx
  ├── Proje listesi              →    GET /api/workspaces/:id/projects
  │   Şu an: localStorage                ProjectController.list()
  │   (projects)
  │
  ├── Proje oluştur              →    POST /api/workspaces/:id/projects
  │                                       ProjectController.create()
  │
  ├── Proje güncelle             →    PUT /api/projects/:id
  │                                       ProjectController.update()
  │
  ├── Proje sil                  →    DELETE /api/projects/:id
  │                                       ProjectController.delete()
```

**Ne değişecek:** localStorage kalkacak. Backend CRUD'u var ama
route yapısı workspace altında (`/workspaces/:id/projects`). Frontend'in
aktif workspace_id'yi bilmesi lazım.


### 9. BİLDİRİMLER (Notifications)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
context/NotificationContext.jsx
  ├── Bildirim listesi           →    GET /api/notifications
  │   Şu an: sadece browser              NotificationController.list()
  │   Notification API
  │
  ├── Okundu işaretle            →    PUT /api/notifications/:id/read
  │   Şu an: local state                 NotificationController.markRead()
  │
  ├── Gerçek zamanlı             →    Socket.io
  │   Şu an: sadece tarayıcı             Backend'de socket var
  │   push notification                   Frontend'te socket.io-client YOK
  │                                       → npm install socket.io-client
```

**Ne değişecek:** NotificationContext'e socket.io-client bağlantısı
eklenecek. Backend bir olay olduğunda socket ile frontend'e push
yapacak. Frontend'teki addNotification fonksiyonu socket event'i
dinleyecek.


### 10. RAPORLAR (Reports)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
components/ReportsPage.jsx
  ├── Her şeyi props'tan alıyor  →    GET /api/reports/...
  │   ve FRONTEND'TE hesaplıyor          ReportController.getTaskReport()
  │   (task sayıları, yüzde,            ReportController.getAttendanceReport()
  │   departman dağılımı vb.)            ReportController.getLeaveReport()
  │                                       → Backend SQL ile hesaplıyor
```

**Ne değişecek:** Frontend'teki hesaplama mantığı kaldırılıp
backend'den hazır rapor verisi çekilecek. VEYA mevcut yapı kalabilir:
frontend tüm task'ları çekip kendi hesaplıyor. Veri az iken sorun yok
ama büyüdükçe backend raporu daha performanslı.


### 11. AYARLAR (Settings)

```
Frontend                              Backend
────────────────────────────────────  ────────────────────────────────────
pages/Dashboard.jsx (SettingsTab)
  ├── Şirket bilgileri güncelle  →    PUT /api/settings/company
  │   Şu an: AuthContext.                CompanySettingController.update()
  │   updateCompany() ile
  │   localStorage değiştiriyor
  │
  ├── Şirket kodu değiştir       →    ⚠️ Backend'de özel endpoint yok
  │   Şu an: localStorage
  │
  ├── Tema (dark/light)          →    Sadece frontend işi (localStorage) ✅
  │   Değişmeyecek
  │
  ├── Dil (TR/EN)                →    Sadece frontend işi (localStorage) ✅
  │   Değişmeyecek
```


## BACKEND'DE KARŞILIĞI OLMAYAN FRONTEND MODÜLLERİ

Bunlar frontend'te var ama backend'de ne model, ne route, ne controller var:

| Frontend Component | Karar Gerekiyor |
|---|---|
| **CustomerCRM.jsx** | Backend'e Customer modeli + CRUD eklenecek mi? |
| **SupportSystem.jsx** | Backend'e Ticket modeli + CRUD eklenecek mi? |
| **SurveySystem.jsx** | Backend'e Survey modeli + CRUD eklenecek mi? |
| **ChannelList.jsx** (chat) | Backend'e Message modeli + Socket eklenecek mi? |
| **BlogPost.jsx** | Backend'e Blog modeli eklenecek mi? |
| **DashboardCustomizer.jsx** | UserDashboardSetting modeli var ama controller yok |
| **AdvancedSearch.jsx** | Genel arama endpoint'i yok |

**Öneri:** Birleştirmenin ilk aşamasında bunları ATLAYIP, önce temel
modülleri (auth, tasks, employees, attendance, leaves) bağla. Sonra
gerekirse backend'e yeni modüller ekle.


## ALAN ADI DÖNÜŞÜM MANTIĞI

Frontend ve Backend farklı isimlendirme kullanıyor. Bu en çok karşına
çıkacak sorun:

```
Frontend (JavaScript geleneği)     Backend (Veritabanı geleneği)
──────────────────────────────     ──────────────────────────────
firstName                          first_name
lastName                           last_name
companyId                          company_id
companyCode                        company_code
dueDate                            due_date
createdAt                          created_at
assignedTo                         → TaskAssignment tablosu
profilePhoto                       profile_photo
isActive                           is_active
```

**Çözüm Seçenekleri:**

1. **Frontend'i değiştir:** Tüm component'lerde camelCase'i snake_case yap
   → Çok iş, React geleneğine aykırı

2. **Backend'i değiştir:** Sequelize response'ları camelCase döndürsün
   → Model'lerde `underscored: false` veya özel getter'lar
   → Sıfırdan DB değişikliği gerekir

3. **Arada dönüştürücü yaz (ÖNERİLEN):**
   Frontend'te bir `mapFromApi()` ve `mapToApi()` fonksiyonu.
   API'den gelen veriyi frontend formatına çevir.
   API'ye gönderirken tekrar backend formatına çevir.
   Tek bir yerde yapılır, tüm component'ler etkilenmez.


## BİRLEŞTİRME SIRASI — MANTIĞI

```
AŞAMA 0: Backend'i ayağa kaldır
├── app.js'de route'ları aç (şu an yorum satırında)
├── Error handler'ları bağla
├── MySQL veritabanını oluştur
├── npm install + npm start
└── Postman ile test et: API çalışıyor mu?

AŞAMA 1: Frontend'e HTTP altyapısı kur
├── npm install axios
├── src/services/api.js oluştur (merkezi axios instance)
├── Token yönetimi (her istekte Authorization header)
└── Hata yakalama (401 → logout, 500 → toast)

AŞAMA 2: Auth bağlantısı (EN ÖNCELİKLİ)
├── AuthContext.jsx → gerçek API çağrısı
├── Login çalışınca diğer her şey çalışabilir
└── Token olmadan diğer API'ler 401 döner

AŞAMA 3: Ana veri modülleri (Tasks + Employees)
├── Dashboard'daki mock veriyi API ile değiştir
├── CRUD fonksiyonlarını API'ye bağla
└── Alan adı dönüşümünü uygula

AŞAMA 4: Yan modüller (birer birer)
├── Attendance + Breaks
├── Leaves
├── Announcements
├── Files
├── Projects
├── Notifications + Socket.io
└── Reports

AŞAMA 5: Eksik backend modüllerini ekle (gerekirse)
├── CustomerCRM
├── SupportSystem
├── SurveySystem
└── ...
```


## İNDİRİLMESİ GEREKEN PAKETLER

### Frontend (cd Frontend)

```bash
# ZORUNLU — API çağrıları için
npm install axios

# ZORUNLU — Gerçek zamanlı bildirim için (backend'de socket.io zaten var)
npm install socket.io-client

# ÖNERİLEN — URL bazlı sayfa yönetimi için (şu an activeTab ile yapılıyor)
npm install react-router-dom

# ÖNERİLEN — Tarih formatlama (backend'den gelen ISO tarihleri güzel göstermek)
npm install date-fns
```

**Tek komutta hepsi:**
```bash
cd Frontend
npm install axios socket.io-client react-router-dom date-fns
```

### Backend (cd Backend)

```bash
# Backend'de zaten çoğu paket var. Eksik olanlar:

# ÖNERİLEN — Mail gönderimi için (MailService.js yazılmış ama paket yok)
npm install nodemailer

# ÖNERİLEN — Tekrarlayan görevler için zamanlayıcı (RecurringTaskService için)
npm install node-cron
```

**Tek komutta:**
```bash
cd Backend
npm install nodemailer node-cron
```

### MEVCUT PAKET DURUMU

```
FRONTEND — Şu an kurulu:
──────────────────────────
✅ react 19.2         → Ana framework
✅ react-dom 19.2     → DOM render
✅ lucide-react       → İkonlar
✅ tailwindcss 4.1    → CSS framework
✅ vite 7.3           → Build tool
❌ axios              → YOK — API çağrısı yapamıyor
❌ socket.io-client   → YOK — Gerçek zamanlı bildirim alamıyor
❌ react-router-dom   → YOK — URL yönetimi yok
❌ date-fns           → YOK — Tarih formatlama manuel

BACKEND — Şu an kurulu:
──────────────────────────
✅ express 4.21       → Web framework
✅ sequelize 6.37     → ORM (veritabanı)
✅ mysql2 3.12        → MySQL sürücüsü
✅ jsonwebtoken 9.0   → JWT token
✅ bcrypt 5.1         → Şifre hash
✅ socket.io 4.8      → Gerçek zamanlı iletişim
✅ multer 2.1         → Dosya upload (kurulu ama kullanılmamış)
✅ cors 2.8           → Cross-origin izni
✅ helmet 8.0         → Güvenlik header'ları
✅ express-validator  → Input doğrulama
✅ winston 3.17       → Loglama
✅ dotenv             → Ortam değişkenleri
✅ nodemon            → Dev auto-restart
❌ nodemailer         → YOK — Mail gönderemiyor
❌ node-cron          → YOK — Zamanlı görev çalıştıramıyor
```

### ORTAM GEREKSİNİMLERİ

```
□ Node.js 18+ kurulu olmalı
□ MySQL 8+ kurulu ve çalışıyor olmalı
□ Backend/.env dosyası oluşturulmalı:

  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=sam_db
  DB_USER=root
  DB_PASS=şifren
  JWT_SECRET=rastgele-uzun-bir-string
  PORT=5000
```


## TEK CÜMLEYLE ÖZET

**Birleştirme = Frontend'teki her `localStorage`/`mockData`/`hardcoded`
veri kaynağını bulup, yerine `fetch("/api/...")` çağrısı koymak.
Ama önce backend'in o API'yi gerçekten sunduğundan emin olmak.**
