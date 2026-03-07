# FRONTEND ANALİZİ — Backend Birleştirme Odaklı

## A. GENEL YAPI

```
Teknoloji: React 19 + Vite 7 + Tailwind CSS 4 + Lucide Icons
Port: 3000 (dev) → Vite proxy /api → localhost:5000 (backend)  ✅ HAZIR
Build: → Backend/public/ klasörüne çıktı verir  ✅ HAZIR
State: Context API + localStorage (Redux/Zustand YOK)
HTTP Kütüphanesi: YOK (axios/fetch hiç kullanılmamış)
Router: YOK (react-router yok, activeTab ile sayfa değiştirme)
```

## B. DOSYA HARİTASI

```
src/
├── main.jsx                    → Giriş noktası
├── App.jsx                     → Provider sarmalayıcı + auth kontrolü
├── context/
│   ├── AuthContext.jsx          → Login/Register (MOCK — simülasyon)
│   ├── ThemeContext.jsx         → Dark/Light tema (localStorage) ✅ TAMAM
│   ├── LanguageContext.jsx      → TR/EN çeviri (localStorage) ✅ TAMAM
│   ├── NotificationContext.jsx  → Toast + Push bildirim (browser API)
│   └── ActivityLogContext.jsx   → Aktivite logu (localStorage)
├── data/
│   ├── mockData.js              → Sahte şirket/kullanıcı/görev/duyuru verileri
│   └── dummyData.js             → Workspace/member/task (farklı format!)
├── pages/
│   ├── LoginPage.jsx            → Giriş formu (companyCode + email + password)
│   ├── RegisterPage.jsx         → Boss kayıt + Employee katılma
│   └── Dashboard.jsx            → ⚠️ 186KB TEK DOSYA — Her şey burada
└── components/
    ├── TimeTracker.jsx          → Mesai (hardcoded mock)
    ├── KanbanBoard.jsx          → Kanban (props'tan task alır)
    ├── CalendarView.jsx         → Takvim (props'tan task alır)
    ├── LeaveRequestSystem.jsx   → İzin (hardcoded mock)
    ├── FileSharing.jsx          → Dosya paylaşım (localStorage)
    ├── NotificationCenter.jsx   → Bildirimler (context)
    ├── ProjectModule.jsx        → Proje yönetimi (localStorage)
    ├── CustomerCRM.jsx          → Müşteri CRM (localStorage)
    ├── SupportSystem.jsx        → Destek sistemi (localStorage)
    ├── RecurringTasks.jsx       → Tekrarlayan görev (localStorage)
    ├── ReportsPage.jsx          → Raporlar (props)
    ├── SurveySystem.jsx         → Anket (localStorage)
    ├── TaskCard.jsx             → Görev kartı
    ├── TaskDetailModal.jsx      → Görev detay modal
    ├── Sidebar.jsx              → Sol menü
    └── ...diğer                 → (BlogPost, AdvancedSearch, TagManager vb.)
```

## C. VERİ KAYNAKLARI — MEVCUT DURUM

| Component | Şu anda nereden veri alıyor | Backend'de karşılığı |
|---|---|---|
| **AuthContext** | mockData.js (sahte login) | AuthController ✅ |
| **Dashboard tasks** | localStorage + initialTasks (hardcoded) | TaskController ⚠️ (2 endpoint) |
| **Dashboard employees** | localStorage + mockData.users | UserController ✅ |
| **Dashboard announcements** | localStorage + mockData.announcements | AnnouncementController ✅ |
| **TimeTracker** | Hardcoded weeklyLogs | AttendanceController ✅ |
| **LeaveRequestSystem** | Hardcoded requests[] | LeaveController ⚠️ (onay yok) |
| **KanbanBoard** | Props (Dashboard'dan) | TaskController ⚠️ |
| **CalendarView** | Props (Dashboard'dan) | TaskController ⚠️ |
| **FileSharing** | localStorage (sam_shared_files) | FileController ⚠️ (upload yok) |
| **ProjectModule** | localStorage (projects) | ProjectController ✅ |
| **CustomerCRM** | localStorage (sam_customers) | ❌ YOK (backend'de model yok) |
| **SupportSystem** | localStorage (sam_support_tickets) | ❌ YOK (backend'de model yok) |
| **RecurringTasks** | localStorage (recurringTemplates) | RecurringTaskService ⚠️ (route yok) |
| **SurveySystem** | localStorage | ❌ YOK (backend'de model yok) |
| **NotificationCenter** | Context (browser) | NotificationController ✅ |
| **ActivityLog** | localStorage | AuditLog model ✅ (ama controller yok) |
| **ReportsPage** | Props (hesaplama frontend'de) | ReportController ✅ |


## D. ALAN ADI UYUMSUZLUKLARI (Frontend vs Backend)

Frontend'in kullandığı alan adları ile Backend model alanları farklı:

### User
| Frontend (mockData) | Backend (User model) |
|---|---|
| `firstName` | `first_name` |
| `lastName` | `last_name` |
| `companyId` | `company_id` |
| `department` (string) | `department_id` (FK) |
| `skills` (nested array) | UserSkill (ayrı tablo) |
| `avatar` | `profile_photo` |
| `status` (active/on_leave) | `is_active` (boolean) |

### Task
| Frontend (Dashboard) | Backend (Task model) |
|---|---|
| `assignedTo` (user object) | `TaskAssignment` (ayrı tablo) |
| `assignedBy` (user object) | `created_by` (FK) |
| `department` (string) | ❌ yok (project üzerinden) |
| `dueDate` | `due_date` |
| `createdAt` | `created_at` |
| `completedAt` | `completed_at` |
| `estimatedHours` | `estimated_hours` |
| `actualHours` | `actual_hours` |
| `tags` (string array) | TaskTag (ayrı tablo) |

### Company
| Frontend | Backend |
|---|---|
| `companyCode` | `company_code` |
| `logoUrl` | `logo` |

### Leave
| Frontend | Backend |
|---|---|
| `employeeId`/`employeeName` | `user_id` (FK) |
| `type` | `leave_type` |
| `days` | Backend'de hesaplanmıyor |
| `startDate`/`endDate` | `start_date`/`end_date` |


## E. BİRLEŞTİRME İÇİN YAPILMASI GEREKENLER

### ADIM 1 — Altyapı Hazırlığı
```
□ axios veya fetch wrapper paketi ekle (npm install axios)
□ src/services/ klasörü oluştur → API çağrıları merkezi olsun
□ src/services/api.js → axios instance (baseURL, token interceptor)
□ src/services/authService.js
□ src/services/taskService.js
□ src/services/userService.js
□ ... (her modül için ayrı service)
□ Hata yönetimi: 401 → otomatik logout, toast göster
```

### ADIM 2 — AuthContext → Gerçek API
```
□ login() → POST /api/auth/login (companyCode + email + password)
□ registerCompany() → POST /api/auth/register
□ joinCompany() → POST /api/auth/register-employee
□ Token'ı localStorage'a kaydet
□ Her istekte Authorization: Bearer <token> header'ı gönder
□ Sayfa yenilenmesinde token'dan user bilgisi al
```

### ADIM 3 — Dashboard Verileri → Gerçek API
```
□ tasks → GET /api/tasks (şu anda backend'de sadece listByList var)
□ employees → GET /api/users
□ announcements → GET /api/announcements
□ CRUD: create/update/delete → POST/PUT/DELETE ilgili endpoint'ler
□ Alan adı dönüşümü: snake_case ↔ camelCase mapper fonksiyonu
```

### ADIM 4 — Component'ler → Gerçek API
```
□ TimeTracker → GET/POST /api/attendance + /api/breaks
□ LeaveRequestSystem → GET/POST /api/leaves + approve/reject
□ FileSharing → POST /api/files (gerçek upload — multer lazım)
□ ProjectModule → GET/POST /api/projects
□ NotificationCenter → GET /api/notifications + Socket.io
□ RecurringTasks → Backend'de route lazım
□ ReportsPage → GET /api/reports
```

### ADIM 5 — Backend'de Olmayan Modüller
```
Bunlar için ya backend'e yeni modül eklenmeli ya da frontend'den kaldırılmalı:

□ CustomerCRM → Backend'de Customer modeli yok
□ SupportSystem → Backend'de Ticket modeli yok
□ SurveySystem → Backend'de Survey modeli yok
□ BlogPost component → Backend'de Blog modeli yok
□ ChannelList (chat) → Backend'de Message modeli yok
```


## F. KRİTİK UYARILAR

### F1. Dashboard.jsx = 186KB TEK DOSYA
Tüm tab'lar, modal'lar, form'lar, CRUD fonksiyonları
TEK dosyada. Bakım imkansız. Birleştirme öncesi veya
sırasında parçalara ayırmak şart değil ama zorlayacak.

### F2. İki Farklı Mock Data
mockData.js ve dummyData.js farklı veri yapıları kullanıyor.
dummyData.js daha çok workspace/channel yapısı (Discord benzeri).
mockData.js iş takip yapısı. Birleştirmede tek standart lazım.

### F3. react-router YOK
Tüm navigasyon activeTab state'i ile. URL değişmiyor.
/tasks, /employees gibi URL'ler yok. Browser geri tuşu çalışmaz.
Birleştirmede react-router eklemek iyi olur ama zorunlu değil.

### F4. camelCase vs snake_case
Frontend: camelCase (firstName, dueDate)
Backend: snake_case (first_name, due_date)
Bir dönüştürme katmanı (mapper) lazım. Ya frontend service'te
ya da backend response'ta çevirilmeli.

### F5. Vite Proxy HAZIR
vite.config.js'de /api → localhost:5000 proxy'si tanımlı.
Development'ta CORS sorunu olmayacak. ✅
Build'da Backend/public/ klasörüne çıktı veriyor. ✅

### F6. Socket.io Eksik
Backend'de Socket.io var ama Frontend'de socket.io-client yok.
Gerçek zamanlı bildirim için: npm install socket.io-client
