# SAM — System Active Monitors
## Tam Proje Dokümantasyonu

> **Hazırlayan:** GitHub Copilot  
> **Tarih:** Mart 2026  
> **Durum:** Frontend %90 Hazır — Backend Yapılacak

---

## İÇİNDEKİLER

1. [Proje Nedir?](#1-proje-nedir)
2. [Teknoloji Stack'i](#2-teknoloji-stacki)
3. [Frontend Dosya Yapısı ve Açıklamaları](#3-frontend-dosya-yapısı-ve-açıklamaları)
4. [Kullanıcı Rolleri ve Yetki Sistemi](#4-kullanıcı-rolleri-ve-yetki-sistemi)
5. [Kimlik Doğrulama Akışı](#5-kimlik-doğrulama-akışı)
6. [Frontend Ekranları ve Özellikleri](#6-frontend-ekranları-ve-özellikleri)
7. [Veritabanı Şeması](#7-veritabanı-şeması)
8. [Frontend Nasıl Çalıştırılır?](#8-frontend-nasıl-çalıştırılır)
9. [Backend Kurulum Rehberi (Node.js)](#9-backend-kurulum-rehberi-nodejs)
10. [Önerilen Backend Klasör Yapısı](#10-önerilen-backend-klasör-yapısı)
11. [Tüm API Endpoint'leri](#11-tüm-api-endpointleri)
12. [Frontend → Backend Bağlantısı (Ne Nerede Değişecek)](#12-frontend--backend-bağlantısı-ne-nerede-değişecek)
13. [Ortam Değişkenleri (.env)](#13-ortam-değişkenleri-env)
14. [Güvenlik Tavsiyeleri](#14-güvenlik-tavsiyeleri)
15. [Özellik Eksiklik Listesi](#15-özellik-eksiklik-listesi)
16. [Demo Giriş Bilgileri](#16-demo-giriş-bilgileri)

---

## 1. PROJE NEDİR?

**SAM (System Active Monitors)**, şirketler için geliştirilmiş tam kapsamlı bir **İş Takip ve Çalışan Yönetim Platformu**'dur. SaaS (Software as a Service) modeline uygun, multi-tenant (çok şirketli) bir yapıda tasarlanmıştır.

### Ne Yapar?

| Özellik | Açıklama |
|---------|----------|
| Görev Yönetimi | Patron/müdür çalışanlara görev atar, takip eder |
| Kanban Panosu | Görevleri sürükle-bırak ile yönet |
| Takvim | Görev ve izin tarihlerini takvimde gör |
| Zaman Takibi | Çalışanlar mesai giriş/çıkış saatlerini kaydeder |
| İzin Sistemi | İzin talebi oluştur, patron onaylasın/reddetsin |
| Raporlar | Departman ve kişi bazlı performans raporları |
| Duyurular | Şirket geneli veya departman duyuruları |
| Bildirimler | Gerçek zamanlı bildirim sistemi |
| Çalışan Yönetimi | Çalışan profili, beceriler, departman |
| Proje Modülü | Proje bazlı görev gruplandırması |
| Etkinlik Logu | Tüm sistem hareketleri kayıt altında |
| Dosya Yükleme | Göreve dosya ekleme sistemi |
| Tekrarlayan Görevler | Periyodik görev tanımlama |
| Çoklu Dil | Türkçe/İngilizce dil desteği |
| Dark/Light Mod | Tema değiştirme |
| PWA Desteği | Mobil uygulama gibi yüklenebilir |
| Offline Çalışma | Service Worker ile offline destek |

### Multi-Tenant Yapısı

Her şirketin **benzersiz 8 haneli şirket kodu** vardır (örn: `TPY2024X`).  
- Patron şirketi kurarken bu kod otomatik üretilir.  
- Çalışanlar bu kodu girerek şirkete katılır.  
- Farklı şirketlerin verileri birbirinden tamamen izole edilir.

---

## 2. TEKNOLOJİ STACK'İ

### Frontend (Mevcut — Tamamlandı)

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| React | 19.2.0 | UI Çerçevesi |
| Vite | 7.x | Build tool + Dev server |
| Tailwind CSS | 4.x | CSS framework |
| Lucide React | 0.563.0 | İkon seti |

### Backend (Yapılacak — Önerilen)

| Teknoloji | Kullanım |
|-----------|----------|
| Node.js (v20+) | Sunucu ortamı |
| Express.js | REST API framework |
| PostgreSQL (v15+) | Ana veritabanı |
| JWT (jsonwebtoken) | Kimlik doğrulama token'ı |
| bcrypt | Şifre hash'leme |
| Socket.io | Gerçek zamanlı bildirimler |
| Multer | Dosya yükleme |
| cors | Cross-origin istekler |
| dotenv | Ortam değişkenleri |
| pg (node-postgres) | PostgreSQL bağlantısı |
| express-validator | Input doğrulama |
| helmet | HTTP güvenlik başlıkları |

---

## 3. FRONTEND DOSYA YAPISI VE AÇIKLAMALARI

```
Frontend/
├── database-schema.sql          ← PostgreSQL veritabanı şeması (HAZIR - backend'e taşı)
├── index.html                   ← Ana HTML şablonu (PWA manifest bağlantısı var)
├── package.json                 ← Bağımlılıklar
├── vite.config.js               ← Vite yapılandırması
├── eslint.config.js             ← ESLint kuralları
│
├── public/
│   ├── manifest.json            ← PWA manifest (uygulama adı, ikon, renk)
│   └── sw.js                    ← Service Worker (offline destek + cache)
│
└── src/
    ├── App.jsx                  ← Ana uygulama + context sarmalayıcılar
    ├── App.css                  ← Global CSS
    ├── index.css                ← Tailwind import + font tanımları
    ├── main.jsx                 ← React entry point (DOM mount)
    │
    ├── assets/                  ← Görseller, SVG'ler
    │
    ├── pages/                   ← Tam sayfa bileşenleri
    │   ├── LoginPage.jsx        ← Giriş sayfası (şirket kodu + email + şifre)
    │   ├── RegisterPage.jsx     ← Kayıt sayfası (patron oluştur / çalışan katıl)
    │   └── Dashboard.jsx        ← ANA PANEL — tüm özellikler burada
    │
    ├── context/                 ← React Context API — global state
    │   ├── AuthContext.jsx      ← Kimlik doğrulama (user, company, login, logout)
    │   ├── ThemeContext.jsx     ← Dark/Light mod (isDark, toggleTheme)
    │   ├── NotificationContext.jsx  ← Bildirim sayısı ve listesi
    │   ├── LanguageContext.jsx  ← Aktif dil (tr/en)
    │   └── ActivityLogContext.jsx   ← Sistem aktivite logu
    │
    ├── components/              ← Yeniden kullanılabilir bileşenler
    │   ├── Sidebar.jsx          ← Sol kenar menüsü
    │   ├── MainContent.jsx      ← Sağ içerik alanı
    │   ├── ChannelList.jsx      ← Kanal/menü listesi (Workspace benzeri yapı)
    │   │
    │   ├── TaskCard.jsx         ← Tek görev kartı bileşeni
    │   ├── TaskDetailModal.jsx  ← Görev detay popup'ı (yorum, durum, ekler)
    │   ├── KanbanBoard.jsx      ← Kanban sütun görünümü
    │   ├── CalendarView.jsx     ← Aylık takvim görünümü
    │   ├── TimeTracker.jsx      ← Mesai giriş/çıkış sayacı
    │   │
    │   ├── ReportsPage.jsx      ← Genel / kişi / departman raporları
    │   ├── LeaveRequestSystem.jsx  ← İzin talebi oluştur + onayla/reddet
    │   ├── NotificationCenter.jsx  ← Bildirim listesi paneli
    │   ├── ActivityLogPanel.jsx ← Aktivite geçmişi
    │   ├── ProjectModule.jsx    ← Proje bazlı görev yönetimi
    │   │
    │   ├── MemberList.jsx       ← Çalışan listesi bileşeni
    │   ├── AdvancedSearch.jsx   ← Gelişmiş arama ve filtre
    │   ├── FileUploadSystem.jsx ← Dosya yükleme (göreve ek)
    │   ├── RecurringTasks.jsx   ← Tekrarlayan görev tanımları
    │   ├── TagManager.jsx       ← Etiket yönetimi
    │   ├── BlogPost.jsx         ← Duyuru/haber kartı bileşeni
    │   ├── DashboardCustomizer.jsx  ← Dashboard widget düzenleyici
    │   ├── LanguageSelector.jsx ← Dil seçme dropdown
    │   ├── MobileNavigation.jsx ← Alt mobil menü + Offline göstergesi
    │   └── ToastContainer.jsx   ← Bildirim toast mesajları
    │
    └── data/                    ← Geçici mock (sahte) veriler
        ├── mockData.js          ← Şirket, kullanıcılar, görevler, duyurular
        └── dummyData.js         ← Ek test verileri
```

---

## 4. KULLANICI ROLLERİ VE YETKİ SİSTEMİ

Sistemde **3 ayrı kullanıcı rolü** vardır:

### `boss` — Patron / CEO

| Yetki | Var mı? |
|-------|---------|
| Tüm çalışanları görme | ✅ |
| Tüm görevleri görme/düzenleme | ✅ |
| Çalışan ekleme/silme | ✅ |
| Departman yönetimi | ✅ |
| Tüm raporları görme | ✅ |
| İzin taleplerini onaylama | ✅ |
| Duyuru oluşturma | ✅ |
| Şirket kodu görme/kopyalama | ✅ |
| Mesai takibi (TimeTracker) | ❌ (patrona gerek yok) |

### `manager` — Müdür / Takım Lideri

| Yetki | Var mı? |
|-------|---------|
| Kendi departman çalışanlarını görme | ✅ |
| Görev atama | ✅ |
| Raporları görme | ✅ |
| İzin onaylama | ✅ |
| Duyuru oluşturma | ✅ |
| Mesai takibi | ✅ |
| Şirket günlük bildirim yönetimi | ✅ |

### `employee` — Çalışan

| Yetki | Var mı? |
|-------|---------|
| Sadece kendi görevlerini görme | ✅ |
| Görev durumunu güncelleme | ✅ |
| Yorum ekleme | ✅ |
| Mesai giriş/çıkış | ✅ |
| İzin talebi oluşturma | ✅ |
| Duyuruları okuma | ✅ |
| Başka çalışanları görme | ❌ |
| Rapor görme | ❌ |

### Kod İçinde Kontrol

```jsx
// AuthContext içindeki yardımcı değerler
const isBoss = user?.role === 'boss';
const isManager = user?.role === 'manager';
const canManage = isBoss || isManager;

// Dashboard menüsünde kullanım örneği:
...(canManage ? [{ id: 'reports', label: 'Raporlar', icon: BarChart3 }] : []),
...(canManage ? [{ id: 'employees', label: 'Çalışanlar', icon: Users }] : []),
...(!isBoss ? [{ id: 'timetracker', label: 'Mesai', icon: Timer }] : []),
```

---

## 5. KİMLİK DOĞRULAMA AKIŞI

### Mevcut Durum (Mock — Sahte Veri)

```
Kullanıcı giriş formu
    ↓
AuthContext.login(companyCode, email, password)
    ↓
mockData.js içindeki users dizisini kontrol et
    ↓
Şifre kontrolü: password === '123456'  ← SABİT, DEĞİŞTİRİLECEK
    ↓
User objesi localStorage'a kaydet
    ↓
Dashboard render edilir
```

### Olması Gereken Akış (Backend ile)

```
Kullanıcı giriş formu
    ↓
POST /api/auth/login  { companyCode, email, password }
    ↓
Backend: users tablosunda email bul, bcrypt.compare(password, hash)
    ↓
JWT token üret: { userId, companyId, role }
    ↓
Frontend: token'ı localStorage'a kaydet
    ↓
Sonraki tüm istekler: Authorization: Bearer <token>
    ↓
Dashboard render edilir
```

### Kayıt Akışı

**Patron Kaydı (Yeni Şirket):**
```
RegisterPage → "Şirket Kur" sekmesi
    ↓
POST /api/auth/register-company
  { companyName, industry, adminEmail, adminPassword, adminFirstName, adminLastName }
    ↓
Backend: companies tablosuna ekle, 8 haneli benzersiz kod üret
Backend: users tablosuna boss rolüyle ekle
    ↓
Otomatik giriş yap → Dashboard
```

**Çalışan Kaydı (Mevcut Şirkete Katıl):**
```
RegisterPage → "Şirkete Katıl" sekmesi
    ↓
POST /api/auth/register-employee
  { companyCode, email, password, firstName, lastName }
    ↓
Backend: company_code ile companies tablosunu kontrol et
Backend: users tablosuna employee rolüyle ekle
    ↓
Otomatik giriş yap → Dashboard
```

---

## 6. FRONTEND EKRANLARI VE ÖZELLİKLERİ

Dashboard içindeki sekmeler (`activeTab` state ile yönetilir):

### `overview` — Genel Bakış

- Görev istatistikleri (Toplam / Tamamlanan / Devam Eden / Bekleyen)
- Aktif görev kartları listesi
- Duyurular paneli
- Patron için: Çalışan listesi özeti
- Çalışan için: Sadece kendi görevleri

### `tasks` — Görevler

- Liste görünümü
- Filtreleme: durum, öncelik, departman
- Patron/Müdür: Yeni görev oluşturma modal'ı
  - Başlık, açıklama, atanan kişi, departman, bitiş tarihi, öncelik, tahmini saat, etiketler
- Göreve tıklanınca `TaskDetailModal` açılır:
  - Görev detayları
  - Durum güncelleme (çalışan için)
  - Yorum ekleme
  - Dosya ekleme

### `kanban` — Kanban Panosu

- 4 sütun: `Bekliyor | Devam Ediyor | İncelemede | Tamamlandı`
- Görev kartlarını sütunlar arasında sürükle-bırak
- Renk kodlu öncelik göstergesi

### `calendar` — Takvim

- Aylık takvim görünümü
- Görev bitiş tarihleri takvimde gösterilir
- İzin tarihleri takvimde işaretlenir
- Tarihe tıklayarak yeni görev başlangıcı

### `timetracker` — Mesai Takibi *(Çalışan/Müdür)*

- Anlık saat göstergesi
- **Giriş Yap** butonu (check-in kaydeder)
- **Mola** butonu (süre dondurulur)
- **Çıkış Yap** butonu (check-out, toplam süre hesaplanır)
- Haftalık çalışma geçmişi tablosu

### `reports` — Raporlar *(Patron/Müdür)*

3 alt sekme:
1. **Genel Rapor:** Tüm görev istatistikleri, departman performansı, öncelik dağılımı, haftalık trend
2. **Kişi Raporu:** Kişi seç → o kişinin tüm istatistikleri
3. **Departman Raporu:** Departman seç → departman istatistikleri

### `employees` — Çalışanlar *(Patron/Müdür)*

- Çalışan listesi (departman + rol + durum filtresi)
- Çalışan ekleme modal'ı
- Toplu çalışan ekleme (CSV)
- Çalışan profil düzenleme (isim, departman, pozisyon, rol)
- Çalışan silme

### `leaves` — İzinler

- **Çalışan:** Yeni izin talebi oluştur (yıllık/hastalık/mazeret/eğitim)
- **Patron/Müdür:** Bekleyen talepleri gör, onayla veya reddet
- Filtre: tümü / bekleyen / onaylanan / reddedilen

### `announcements` — Duyurular

- Duyuru listesi (önemli/acil öncelik renkleri)
- Sabitlenmiş duyurular en üstte
- Patron/Müdür: Yeni duyuru oluştur, düzenle, sil

### `settings` — Ayarlar

- Profil bilgilerini güncelleme
- Şifre değiştirme
- Bildirim tercihleri
- Tema seçimi (Dark/Light)
- Dil seçimi (TR/EN)

---

## 7. VERİTABANI ŞEMASI

> Şema dosyası: `Frontend/database-schema.sql` — Backend klasörüne taşı ve PostgreSQL'e uygula.

### Tablolar

```sql
companies        → Şirketler (id, name, company_code, industry, ...)
users            → Kullanıcılar (id, company_id, email, password_hash, role, ...)
departments      → Departmanlar (id, company_id, name, manager_id, color)
tasks            → Görevler (id, company_id, title, status, priority, assigned_to, due_date, ...)
task_updates     → Görev yorumları/güncellemeleri (task_id, user_id, type, content)
work_logs        → Mesai kayıtları (user_id, task_id, check_in, check_out, break_minutes)
notifications    → Bildirimler (user_id, type, title, is_read)
announcements    → Duyurular (company_id, user_id, title, content, priority, is_pinned)
leave_requests   → İzin talepleri (user_id, type, start_date, end_date, status, approved_by)
```

### Görev Durumları

```
pending      → Bekliyor
in_progress  → Devam Ediyor
review       → İncelemede
completed    → Tamamlandı
cancelled    → İptal Edildi
```

### Görev Öncelikleri

```
low     → Düşük
medium  → Orta
high    → Yüksek
urgent  → Acil
```

### İzin Türleri

```
annual    → Yıllık İzin
sick      → Hastalık İzni
personal  → Mazeret İzni
unpaid    → Ücretsiz İzin
```

---

## 8. FRONTEND NASIL ÇALIŞTIRILIR?

```powershell
# 1. Frontend klasörüne gir
cd "C:\Users\GTSERVER\Desktop\Ofis Kullanim\SAM-System-Active-Monitors-\Frontend"

# 2. Bağımlılıkları kur (ilk kez)
npm install

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda aç: **http://localhost:5173**

### Diğer Komutlar

```powershell
npm run build    # Production build (dist/ klasörü oluşturur)
npm run preview  # Production build'i önizle
npm run lint     # ESLint kontrolü
```

---

## 9. BACKEND KURULUM REHBERİ (NODE.JS)

### Adım 1: PostgreSQL Kur

1. https://www.postgresql.org/download/ adresinden indir
2. Kur, şifre belirle (`.env`'e yaz)
3. pgAdmin veya psql ile bağlan:

```sql
CREATE DATABASE sam_db;
```

4. Şemayı uygula:

```powershell
psql -U postgres -d sam_db -f Frontend/database-schema.sql
```

### Adım 2: Backend Klasörü Oluştur

```powershell
# Proje kökünde
mkdir Backend
cd Backend
npm init -y
```

### Adım 3: Bağımlılıkları Yükle

```powershell
# Üretim bağımlılıkları
npm install express pg bcrypt jsonwebtoken cors dotenv express-validator helmet multer socket.io

# Geliştirme bağımlılıkları
npm install --save-dev nodemon
```

### Adım 4: package.json Script'lerini Güncelle

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Adım 5: Backend'i Başlat

```powershell
npm run dev
```

API şu adreste çalışır: **http://localhost:5000**

---

## 10. ÖNERİLEN BACKEND KLASÖR YAPISI

```
Backend/
├── package.json
├── .env                          ← Ortam değişkenleri (git'e ekleme!)
├── .env.example                  ← Örnek .env dosyası (git'e ekle)
├── server.js                     ← Express app başlangıç noktası
│
├── config/
│   └── database.js               ← PostgreSQL bağlantı havuzu (pg.Pool)
│
├── middleware/
│   ├── auth.js                   ← JWT doğrulama middleware
│   ├── roleCheck.js              ← Rol bazlı yetki kontrolü
│   └── errorHandler.js           ← Global hata yakalayıcı
│
├── routes/
│   ├── auth.js                   ← /api/auth/*
│   ├── companies.js              ← /api/companies/*
│   ├── users.js                  ← /api/users/*
│   ├── tasks.js                  ← /api/tasks/*
│   ├── departments.js            ← /api/departments/*
│   ├── workLogs.js               ← /api/work-logs/*
│   ├── notifications.js          ← /api/notifications/*
│   ├── announcements.js          ← /api/announcements/*
│   └── leaveRequests.js          ← /api/leave-requests/*
│
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   ├── userController.js
│   ├── departmentController.js
│   ├── workLogController.js
│   ├── notificationController.js
│   ├── announcementController.js
│   └── leaveRequestController.js
│
└── uploads/                      ← Yüklenen dosyalar (gitignore'a ekle)
```

### server.js Örneği

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/work-logs', require('./routes/workLogs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/leave-requests', require('./routes/leaveRequests'));

// Socket.io bağlantısı (gerçek zamanlı bildirimler)
io.on('connection', (socket) => {
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
  });
  socket.on('disconnect', () => {});
});

// Global hata handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`SAM Backend çalışıyor: http://localhost:${PORT}`));
```

### config/database.js Örneği

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Veritabanı bağlantı hatası:', err);
});

module.exports = pool;
```

### middleware/auth.js Örneği

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, companyId, role }
    next();
  } catch {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = auth;
```

### middleware/roleCheck.js Örneği

```javascript
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  };
};

module.exports = roleCheck;
// Kullanım: router.delete('/:id', auth, roleCheck('boss', 'manager'), deleteTask)
```

---

## 11. TÜM API ENDPOINT'LERİ

> Tüm korumalı endpoint'ler `Authorization: Bearer <token>` başlığı gerektirir.

### AUTH — Kimlik Doğrulama

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `POST` | `/api/auth/login` | Giriş yap | Herkese açık |
| `POST` | `/api/auth/register-company` | Yeni şirket + patron kaydı | Herkese açık |
| `POST` | `/api/auth/register-employee` | Şirkete çalışan kaydı | Herkese açık |
| `POST` | `/api/auth/logout` | Çıkış (token iptal) | Giriş gerekli |
| `GET` | `/api/auth/me` | Giriş yapan kullanıcı bilgisi | Giriş gerekli |

**POST /api/auth/login — İstek Gövdesi:**
```json
{
  "companyCode": "TPY2024X",
  "email": "patron@techpro.com",
  "password": "güvenligüçlüşifre"
}
```

**Başarılı Yanıt:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "patron@techpro.com",
    "role": "boss",
    "department": "Yönetim",
    "position": "CEO"
  },
  "company": {
    "id": 1,
    "name": "TechPro Yazılım A.Ş.",
    "companyCode": "TPY2024X"
  }
}
```

---

### TASKS — Görevler

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/tasks` | Görev listesi (rol'e göre filtrelenir) | Herkese |
| `GET` | `/api/tasks/:id` | Tek görev detayı | Herkese |
| `POST` | `/api/tasks` | Yeni görev oluştur | boss, manager |
| `PUT` | `/api/tasks/:id` | Görevi düzenle | boss, manager |
| `PATCH` | `/api/tasks/:id/status` | Sadece durum güncelle | Atanan kişi + manager + boss |
| `DELETE` | `/api/tasks/:id` | Görevi sil | boss, manager |
| `GET` | `/api/tasks/:id/updates` | Görev yorumları | Herkese |
| `POST` | `/api/tasks/:id/updates` | Yorum ekle | Herkese |

**Query Parametreler (GET /api/tasks):**
```
?status=in_progress
?priority=high
?assignedTo=3
?department=Yazılım
?search=API
?page=1&limit=20
```

---

### USERS — Kullanıcılar

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/users` | Şirket çalışan listesi | boss, manager |
| `GET` | `/api/users/:id` | Kullanıcı profili | Herkese |
| `PUT` | `/api/users/:id` | Profil güncelle | Kendisi veya boss |
| `PATCH` | `/api/users/:id/role` | Rol değiştir | boss |
| `DELETE` | `/api/users/:id` | Kullanıcı sil | boss |
| `POST` | `/api/users/bulk` | Toplu kullanıcı ekle | boss |

---

### DEPARTMENTS — Departmanlar

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/departments` | Departman listesi | Herkese |
| `POST` | `/api/departments` | Yeni departman | boss |
| `PUT` | `/api/departments/:id` | Düzenle | boss |
| `DELETE` | `/api/departments/:id` | Sil | boss |

---

### WORK LOGS — Mesai Kayıtları

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `POST` | `/api/work-logs/check-in` | Mesai başlat | employee, manager |
| `PATCH` | `/api/work-logs/check-out` | Mesai bitir | employee, manager |
| `GET` | `/api/work-logs/my` | Kendi mesai geçmişi | Herkese |
| `GET` | `/api/work-logs/all` | Tüm mesai kayıtları | boss, manager |
| `PATCH` | `/api/work-logs/break` | Molaya geç / moladan dön | employee, manager |

---

### NOTIFICATIONS — Bildirimler

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/notifications` | Bildirim listesi | Herkese |
| `PATCH` | `/api/notifications/:id/read` | Okundu işaretle | Sahibi |
| `PATCH` | `/api/notifications/read-all` | Tümünü okundu yap | Herkese |

---

### ANNOUNCEMENTS — Duyurular

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/announcements` | Duyuru listesi | Herkese |
| `POST` | `/api/announcements` | Duyuru oluştur | boss, manager |
| `PUT` | `/api/announcements/:id` | Düzenle | boss, manager (sahibi) |
| `PATCH` | `/api/announcements/:id/pin` | Sabitle / Kaldır | boss |
| `DELETE` | `/api/announcements/:id` | Sil | boss, manager (sahibi) |

---

### LEAVE REQUESTS — İzin Talepleri

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/leave-requests` | İzin talep listesi | Yetkilere göre |
| `POST` | `/api/leave-requests` | Yeni izin talebi | employee, manager |
| `PATCH` | `/api/leave-requests/:id/approve` | Onayla | boss, manager |
| `PATCH` | `/api/leave-requests/:id/reject` | Reddet | boss, manager |
| `DELETE` | `/api/leave-requests/:id` | İptal et | Sahibi (pending iken) |

---

## 12. FRONTEND → BACKEND BAĞLANTISI (NE NEREDE DEĞİŞECEK)

Bu bölüm en kritik kısım. Mock veriyi kaldırıp API çağrılarına geçmek için hangi dosyada ne yapılacak:

### A. AuthContext.jsx — Kimlik Doğrulama

**Şu an:** `mockData.js`'ten okuyup `setTimeout` ile simüle ediyor.  
**Yapılacak:** `fetch` veya `axios` ile gerçek API çağrısı.

```jsx
// ÖNCE (mock) — AuthContext.jsx içinde login fonksiyonu:
const foundUser = users.find(u => u.email === email);
if (password !== '123456') { reject(...) }

// SONRA (gerçek API):
const login = async (companyCode, email, password) => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyCode, email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }
  const data = await res.json(); // { token, user, company }
  localStorage.setItem('token', data.token);
  localStorage.setItem('currentUser', JSON.stringify(data.user));
  localStorage.setItem('currentCompany', JSON.stringify(data.company));
  setUser(data.user);
  setCurrentCompany(data.company);
  return data.user;
};
```

### B. Dashboard.jsx — Ana Veri Yükleme

**Şu an:** `initialTasks`, `initialUsers` gibi sabit dizilerden okuyup localStorage'a yazıyor.  
**Yapılacak:** Component mount'ta API'den veri çek.

```jsx
// ÖNCE:
const [tasks, setTasks] = useState(() => loadFromStorage('app_tasks', initialTasks));

// SONRA:
const [tasks, setTasks] = useState([]);

useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('http://localhost:5000/api/tasks', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setTasks(data));
}, []);
```

### C. TimeTracker.jsx — Mesai Kaydetme

**Şu an:** Sadece local state, hiçbir şey kaydedilmiyor.  
**Yapılacak:** check-in / check-out API çağrısına bağla.

```jsx
// handleCheckIn içine ekle:
const token = localStorage.getItem('token');
await fetch('http://localhost:5000/api/work-logs/check-in', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ notes: '' })
});
```

### D. LeaveRequestSystem.jsx — İzin Talepleri

**Şu an:** Yerel state, mock data.  
**Yapılacak:** GET/POST/PATCH çağrıları ile API'ye bağla.

### E. Ortak API İstemcisi Oluştur (Tavsiye)

`src/utils/api.js` adıyla bir yardımcı dosya yaz:

```javascript
// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/';
    return;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Bir hata oluştu');
  }

  return res.json();
};

export const api = {
  get: (url) => apiRequest(url),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => apiRequest(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
};
```

---

## 13. ORTAM DEĞİŞKENLERİ (.env)

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

### Backend — `Backend/.env`

```env
# Sunucu
PORT=5000
NODE_ENV=development

# Veritabanı
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sam_db
DB_USER=postgres
DB_PASSWORD=güçlüşifreniyaz

# JWT
JWT_SECRET=buraya_cok_uzun_ve_rastgele_bir_string_yaz_minimum_32_karakter
JWT_EXPIRES_IN=7d

# Frontend URL (CORS için)
FRONTEND_URL=http://localhost:5173

# Dosya yükleme
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
```

> ⚠️ `.env` dosyasını `.gitignore`'a ekle! Şifreleri asla Git'e yükleme.

---

## 14. GÜVENLİK TAVSİYELERİ

### Backend Tarafı

1. **Şifre Hash'leme:** Şifreleri asla düz metin kaydetme.
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash(password, 12); // 12 rounds
   const match = await bcrypt.compare(password, hash);
   ```

2. **JWT Süresi:** Token'lar için makul süre belirle (7 gün önerilir).

3. **SQL Injection:** Parametreli sorgu kullan, asla string birleştirme yapma.
   ```javascript
   // YANLIŞ — SQL Injection açığı:
   db.query(`SELECT * FROM users WHERE email = '${email}'`)

   // DOĞRU — Parametreli sorgu:
   db.query('SELECT * FROM users WHERE email = $1', [email])
   ```

4. **Rol Kontrolü:** Her endpoint'te hem `auth` hem `roleCheck` middleware kullan.

5. **Input Doğrulama:** `express-validator` ile tüm gelen veriyi doğrula.

6. **Rate Limiting:** `express-rate-limit` ile brute-force saldırısını engelle.
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use('/api/auth/login', rateLimit({ windowMs: 15*60*1000, max: 5 }));
   ```

7. **Company Isolation:** Her sorguda `company_id = req.user.companyId` kontrolü yap. Bir şirketin başka şirketin verisine erişmesini engelle.

8. **Dosya Yükleme:** Multer ile yüklenen dosyaların tipini ve boyutunu kontrol et.

### Frontend Tarafı

1. **XSS:** React zaten JSX içinde HTML encode yapıyor. `dangerouslySetInnerHTML` kullanma.
2. **Token:** JWT'yi `localStorage` yerine `httpOnly cookie`'de saklamak daha güvenli (CSRF token ekle).
3. **HTTPS:** Production'da mutlaka SSL/TLS kullan.

---

## 15. ÖZELLİK EKSİKLİK LİSTESİ

Frontend'de hazırlığı var ama backend bağlantısı olmayan veya yarım kalan özellikler:

| Özellik | Durum | Not |
|---------|-------|-----|
| Mesai kayıtları → DB'ye kayıt | ❌ Eksik | TimeTracker sadece local state |
| Dosya yükleme → gerçek storage | ❌ Eksik | FileUploadSystem UI hazır, backend yok |
| Canlı bildirimler (Socket.io) | ❌ Eksik | NotificationCenter mock data kullanıyor |
| Gerçek arama (DB'den) | ❌ Eksik | AdvancedSearch sadece local filtre |
| Tekrarlayan görev tetikleme | ❌ Eksik | RecurringTasks UI var, scheduler yok |
| E-posta bildirimleri | ❌ Eksik | Hiç yok, nodemailer ile yapılabilir |
| Avatar/profil fotoğrafı yükleme | ❌ Eksik | UI var, backend endpoint yok |
| Export (PDF/Excel rapor) | ❌ Eksik | ReportsPage'de download butonu var |
| Şifre sıfırlama (e-posta) | ❌ Eksik | Login'de link var UI seviyesinde |
| 2FA (İki faktörlü doğrulama) | ❌ Eksik | Eklenmedi |
| Görev bağımlılıkları | ❌ Eksik | Bir görev bitmeden diğeri başlamasın |
| Zaman çizelgesi (Gantt) | ❌ Eksik | CalendarView basit, Gantt yok |

---

## 16. DEMO GİRİŞ BİLGİLERİ

> Şu an geçerli olan mock verilerle çalışmak için:

| Şirket Kodu | E-posta | Şifre | Rol |
|-------------|---------|-------|-----|
| `TPY2024X` | `patron@techpro.com` | `123456` | Patron (boss) |
| `TPY2024X` | `mehmet@techpro.com` | `123456` | Müdür (manager) |
| `TPY2024X` | `ayse@techpro.com` | `123456` | Çalışan (employee) |
| `TPY2024X` | `ali@techpro.com` | `123456` | Çalışan (employee) |

> Backend eklenince bu bilgiler PostgreSQL'deki gerçek kayıtlara dönüşecek.

---

## HIZLI BAŞLAMAK İÇİN SIRA

```
1. Frontend çalıştır        → npm run dev (http://localhost:5173)
2. PostgreSQL kur + DB oluştur
3. database-schema.sql uygula
4. Backend klasörü aç, bağımlılıkları yükle
5. .env dosyasını doldur
6. server.js + config/database.js yaz
7. İlk endpoint: POST /api/auth/login
8. AuthContext.jsx'teki login fonksiyonunu gerçek API'ye bağla
9. Diğer endpoint'leri birer birer ekle
10. Mock data import'larını sil
```

---

*SAM — System Active Monitors | Proje Dokümantasyonu*
