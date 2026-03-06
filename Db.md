# SAM - System Active Monitors
## MySQL Veritabani Semasi (Guncel - v2)
> **Veritabani:** MySQL 8.0+ | **Motor:** InnoDB | **Karakter Seti:** utf8mb4

---

## ICINDEKILER

1. [Organizasyon Hiyerarsisi](#organizasyon-hiyerarsisi)
2. [ER Diyagrami (Mantiksal)](#er-diyagrami)
3. [Tablo Listesi](#tablo-listesi)
4. [SQL Semasi](#sql-semasi)
5. [Degisiklik Gunlugu](#degisiklik-gunlugu)

---

## Organizasyon Hiyerarsisi

```
Company
   +-- Department
   +-- Workspace
         +-- Project
               +-- TaskList
                     +-- Task
                           +-- Subtask (parent_task_id)
```

---

## ER Diyagrami

```
companies
 +-- departments
 |     +-- users
 |           +-- user_skills
 |           +-- attendance
 |           |     +-- breaks <- break_types
 |           +-- leave_requests
 |           +-- task_assignments <- tasks
 |           +-- task_comments
 |           +-- task_logs
 |
 +-- workspaces
 |     +-- workspace_members <- users
 |     +-- projects
 |           +-- project_members <- users
 |           +-- task_lists
 |                 +-- tasks
 |                       +-- task_assignments
 |                       +-- task_tags <- tags
 |                       +-- task_comments
 |                       |     +-- comment_files <- files
 |                       +-- task_logs
 |                       +-- task_history
 |                       +-- task_files <- files
 |
 +-- task_statuses
 +-- task_priorities
 +-- categories
 +-- tags
 +-- files
 +-- announcements
 +-- notifications
 +-- company_settings
 +-- automation_rules
 +-- recurring_tasks
 +-- user_dashboard_settings
 +-- audit_logs
```

---

## Tablo Listesi

| #  | Tablo                    | Aciklama                        |
|----|--------------------------|:--------------------------------|
| 1  | companies                | Sirketler (multi-tenant kok)    |
| 2  | departments              | Departmanlar                    |
| 3  | users                    | Kullanicilar                    |
| 4  | user_skills              | Kullanici becerileri            |
| 5  | workspaces               | Calisma alanlari                |
| 6  | workspace_members        | Workspace erisim kontrolu       |
| 7  | projects                 | Projeler                        |
| 8  | project_members          | Proje uyeleri                   |
| 9  | task_lists               | Gorev listeleri                 |
| 10 | task_statuses            | Ozellestirilebilir gorev durumlari |
| 11 | task_priorities          | Gorev oncelikleri               |
| 12 | categories               | Gorev kategorileri              |
| 13 | tags                     | Etiketler                       |
| 14 | tasks                    | Gorevler + alt gorevler         |
| 15 | task_assignments         | Goreve atanan kisiler           |
| 16 | task_tags                | Gorev - Etiket pivot            |
| 17 | task_comments            | Gorev yorumlari                 |
| 18 | task_logs                | Gorev zaman takibi              |
| 19 | task_history             | Gorev degisiklik gecmisi        |
| 20 | files                    | Merkezi dosya deposu            |
| 21 | task_files               | Goreve eklenen dosyalar         |
| 22 | comment_files            | Yoruma eklenen dosyalar         |
| 23 | attendance               | Mesai giris/cikis (PDKS)        |
| 24 | break_types              | Mola tipleri                    |
| 25 | breaks                   | Mola kayitlari                  |
| 26 | leave_requests           | Izin talepleri                  |
| 27 | notifications            | Bildirimler                     |
| 28 | company_settings         | Sirket mesai ayarlari           |
| 29 | announcements            | Sirket duyurulari               |
| 30 | automation_rules         | Otomasyon kurallari             |
| 31 | recurring_tasks          | Tekrarlayan gorev sablonlari    |
| 32 | user_dashboard_settings  | Dashboard ozellestirme          |
| 33 | audit_logs               | Sistem denetim loglari          |

**Toplam: 33 tablo**

---

## SQL Semasi

```sql
-- =====================================================
-- SAM - System Active Monitors
-- MySQL 8.0+ Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS sam_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sam_db;

-- =====================================================
-- 1. COMPANIES
-- =====================================================
CREATE TABLE companies (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    company_code VARCHAR(8)   NOT NULL UNIQUE COMMENT '8 haneli benzersiz kod (orn: ABC12345)',
    description  TEXT,
    logo_url     VARCHAR(500),
    industry     VARCHAR(100),
    address      TEXT,
    phone        VARCHAR(20),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. DEPARTMENTS
-- =====================================================
CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id  BIGINT       NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    color       VARCHAR(7)   DEFAULT '#6366f1',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. USERS
-- =====================================================
CREATE TABLE users (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id    BIGINT       NOT NULL,
    department_id BIGINT       DEFAULT NULL,
    
    -- BAYİ VE HİYERARŞİ YAPISI
    parent_id     BIGINT       DEFAULT NULL COMMENT 'Üst bayinin id değeri (Eğer alt bayiyse)',
    is_reseller   TINYINT(1)   DEFAULT 0    COMMENT '1=Bayi, 0=Normal Müşteri/Çalışan',
    
    -- KİŞİ / KURUM TİPİ AYRIMI
    user_type     ENUM('individual_tr', 'individual_foreign', 'legal_entity') 
                  NOT NULL DEFAULT 'individual_tr' 
                  COMMENT 'individual_tr=Gerçek Kişi(TC), individual_foreign=Yabancı, legal_entity=Tüzel(Vergi)',
    
    -- KİMLİK VE VERGİ BİLGİLERİ (Type'a göre kod tarafında doldurulacak)
    identity_number VARCHAR(20)  DEFAULT NULL COMMENT 'TC Kimlik veya Pasaport No',
    tax_number      VARCHAR(20)  DEFAULT NULL COMMENT 'Vergi Numarası (Tüzel Kişiler için)',
    tax_office      VARCHAR(100) DEFAULT NULL COMMENT 'Vergi Dairesi (Tüzel Kişiler için)',
    company_name    VARCHAR(255) DEFAULT NULL COMMENT 'Eğer tüzel kişiyse resmi şirket adı',

    -- TEMEL KULLANICI BİLGİLERİ
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL     COMMENT 'bcrypt hash',
    avatar_url    VARCHAR(500) DEFAULT NULL,
    role          ENUM('boss','manager','employee','customer') NOT NULL DEFAULT 'employee'
                  COMMENT 'Sistemdeki yetki rolü',
    
    position      VARCHAR(100) DEFAULT NULL,
    phone         VARCHAR(20)  DEFAULT NULL,
    status        ENUM('active','inactive','on_leave') DEFAULT 'active',
    language      ENUM('tr','en') DEFAULT 'tr',
    theme         ENUM('light','dark') DEFAULT 'light',
    
    last_login    TIMESTAMP    NULL DEFAULT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- İLİŞKİLER (Constraints)
    FOREIGN KEY (company_id)    REFERENCES companies(id)   ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id)     REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

-- =====================================================
-- 4. USER_SKILLS
-- =====================================================
CREATE TABLE user_skills (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id  BIGINT       NOT NULL,
    name     VARCHAR(100) NOT NULL    COMMENT 'React, Node.js, Figma...',
    category VARCHAR(100) DEFAULT NULL COMMENT 'Frontend, Backend, Tasarim, Dil...',
    level    ENUM('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. WORKSPACES
-- =====================================================
CREATE TABLE workspaces (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id  BIGINT       NOT NULL,
    created_by  BIGINT       NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    icon        VARCHAR(10)  DEFAULT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. WORKSPACE_MEMBERS
-- =====================================================
CREATE TABLE workspace_members (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    workspace_id BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    role         ENUM('admin','member') DEFAULT 'member',
    joined_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ws_member (workspace_id, user_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 7. PROJECTS
-- =====================================================
CREATE TABLE projects (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    workspace_id BIGINT       NOT NULL,
    created_by   BIGINT       NOT NULL,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    status       ENUM('active','inactive','completed','archived') DEFAULT 'active',
    color        VARCHAR(7)   DEFAULT '#6366f1',
    icon         VARCHAR(10)  DEFAULT NULL,
    start_date   DATE         DEFAULT NULL,
    end_date     DATE         DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)   REFERENCES users(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 8. PROJECT_MEMBERS
-- =====================================================
CREATE TABLE project_members (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    role       ENUM('lead','member') DEFAULT 'member',
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_proj_member (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 9. TASK_LISTS
-- =====================================================
CREATE TABLE task_lists (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    project_id  BIGINT       NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    color       VARCHAR(7)   DEFAULT '#6366f1',
    order_no    INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 10. TASK_STATUSES
-- =====================================================
CREATE TABLE task_statuses (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL COMMENT 'pending, in_progress, review, completed, cancelled',
    color      VARCHAR(7)   DEFAULT '#6366f1',
    order_no   INT          DEFAULT 0,
    is_default BOOLEAN      DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 11. TASK_PRIORITIES
-- =====================================================
CREATE TABLE task_priorities (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL COMMENT 'low, medium, high, urgent',
    color      VARCHAR(7)   DEFAULT '#6366f1',
    order_no   INT          DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 12. CATEGORIES
-- =====================================================
CREATE TABLE categories (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7)   DEFAULT '#6366f1',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 13. TAGS
-- =====================================================
CREATE TABLE tags (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7)   DEFAULT '#6366f1',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_tag (company_id, name),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 14. TASKS
-- =====================================================
CREATE TABLE tasks (
    id               BIGINT           AUTO_INCREMENT PRIMARY KEY,
    task_list_id     BIGINT           NOT NULL,
    company_id       BIGINT           NOT NULL,
    parent_task_id   BIGINT           DEFAULT NULL  COMMENT 'NULL=ana gorev, dolu=alt gorev',
    creator_id       BIGINT           NOT NULL,
    department_id    BIGINT           DEFAULT NULL,
    title            VARCHAR(255)     NOT NULL,
    description      TEXT,
    type             ENUM('task','fault') DEFAULT 'task',
    status_id        BIGINT           NOT NULL,
    priority_id      BIGINT           NOT NULL,
    category_id      BIGINT           DEFAULT NULL,
    due_date         DATE             DEFAULT NULL,
    start_date       DATE             DEFAULT NULL,
    estimated_hours  DECIMAL(5,2)     DEFAULT 0     COMMENT 'Tahmini saat cinsinden',
    actual_hours     DECIMAL(5,2)     DEFAULT 0     COMMENT 'Gercek harcanan saat',
    progress_percent TINYINT UNSIGNED DEFAULT 0     COMMENT '0-100 arasi',
    created_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    started_at       TIMESTAMP        NULL DEFAULT NULL,
    completed_at     TIMESTAMP        NULL DEFAULT NULL,
    updated_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_list_id)   REFERENCES task_lists(id)      ON DELETE CASCADE,
    FOREIGN KEY (company_id)     REFERENCES companies(id)       ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id)           ON DELETE CASCADE,
    FOREIGN KEY (creator_id)     REFERENCES users(id)           ON DELETE SET NULL,
    FOREIGN KEY (department_id)  REFERENCES departments(id)     ON DELETE SET NULL,
    FOREIGN KEY (status_id)      REFERENCES task_statuses(id)   ON DELETE RESTRICT,
    FOREIGN KEY (priority_id)    REFERENCES task_priorities(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id)    REFERENCES categories(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 15. TASK_ASSIGNMENTS
-- =====================================================
CREATE TABLE task_assignments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    role        ENUM('lead','support') DEFAULT 'support',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active   BOOLEAN   DEFAULT TRUE,
    ended_at    TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_task_user (task_id, user_id),
    FOREIGN KEY (task_id)     REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 16. TASK_TAGS
-- =====================================================
CREATE TABLE task_tags (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    tag_id  BIGINT NOT NULL,
    UNIQUE KEY uq_task_tag (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 17. TASK_COMMENTS
-- =====================================================
CREATE TABLE task_comments (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id           BIGINT NOT NULL,
    user_id           BIGINT NOT NULL,
    parent_comment_id BIGINT DEFAULT NULL COMMENT 'Yanitlar icin',
    comment_text      TEXT   NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id)           REFERENCES tasks(id)         ON DELETE CASCADE,
    FOREIGN KEY (user_id)           REFERENCES users(id)         ON DELETE SET NULL,
    FOREIGN KEY (parent_comment_id) REFERENCES task_comments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 18. TASK_LOGS
-- =====================================================
CREATE TABLE task_logs (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id    BIGINT    NOT NULL,
    user_id    BIGINT    NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time   TIMESTAMP NULL DEFAULT NULL,
    duration   INT       DEFAULT 0 COMMENT 'Saniye cinsinden',
    note       TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 19. TASK_HISTORY
-- =====================================================
CREATE TABLE task_history (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    task_id    BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    action     VARCHAR(255) NOT NULL COMMENT 'status_changed, assigned, priority_changed...',
    old_value  TEXT,
    new_value  TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 20. FILES
-- =====================================================
CREATE TABLE files (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id  BIGINT       NOT NULL,
    uploaded_by BIGINT       NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_url    TEXT         NOT NULL,
    file_type   VARCHAR(50)  DEFAULT NULL COMMENT 'image/png, application/pdf...',
    file_size   BIGINT       DEFAULT NULL COMMENT 'Byte cinsinden',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 21. TASK_FILES
-- =====================================================
CREATE TABLE task_files (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    UNIQUE KEY uq_task_file (task_id, file_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 22. COMMENT_FILES
-- =====================================================
CREATE TABLE comment_files (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    file_id    BIGINT NOT NULL,
    UNIQUE KEY uq_comment_file (comment_id, file_id),
    FOREIGN KEY (comment_id) REFERENCES task_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id)    REFERENCES files(id)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 23. ATTENDANCE (PDKS)
-- =====================================================
CREATE TABLE attendance (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    date       DATE        NOT NULL,
    check_in   TIMESTAMP   NULL DEFAULT NULL,
    check_out  TIMESTAMP   NULL DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IPv4 veya IPv6',
    device     VARCHAR(255) DEFAULT NULL,
    note       TEXT,
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 24. BREAK_TYPES
-- =====================================================
CREATE TABLE break_types (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id   BIGINT       NOT NULL,
    name         VARCHAR(100) NOT NULL COMMENT 'Ogle Molasi, Cay Molasi...',
    max_duration INT          DEFAULT 0 COMMENT 'Dakika cinsinden',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 25. BREAKS
-- =====================================================
CREATE TABLE breaks (
    id            BIGINT    AUTO_INCREMENT PRIMARY KEY,
    attendance_id BIGINT    NOT NULL,
    break_type_id BIGINT    NOT NULL,
    start_time    TIMESTAMP NOT NULL,
    end_time      TIMESTAMP NULL DEFAULT NULL,
    is_violated   BOOLEAN   DEFAULT FALSE COMMENT 'Izin verilen sureyi asti mi',
    FOREIGN KEY (attendance_id) REFERENCES attendance(id)   ON DELETE CASCADE,
    FOREIGN KEY (break_type_id) REFERENCES break_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 26. LEAVE_REQUESTS
-- =====================================================
CREATE TABLE leave_requests (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    leave_type       ENUM('annual','sick','personal','unpaid','education') NOT NULL
                     COMMENT 'annual=Yillik, sick=Hastalik, personal=Mazeret, unpaid=Ucretsiz, education=Egitim',
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    leave_days       INT  DEFAULT NULL COMMENT 'Gun sayisi',
    reason_text      TEXT,
    document_url     VARCHAR(500) DEFAULT NULL,
    approval_status  ENUM('pending','approved','rejected') DEFAULT 'pending',
    approved_by      BIGINT    DEFAULT NULL,
    approved_at      TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT      DEFAULT NULL COMMENT 'Red nedeni',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 27. NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    message        TEXT,
    type           VARCHAR(50)  DEFAULT NULL COMMENT 'task_assigned, deadline_reminder, leave_approved...',
    reference_type VARCHAR(20)  DEFAULT NULL COMMENT 'task / user / leave / announcement',
    reference_id   BIGINT       DEFAULT NULL COMMENT 'Ilgili kaydin ID si',
    is_read        BOOLEAN      DEFAULT FALSE,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 28. COMPANY_SETTINGS
-- =====================================================
CREATE TABLE company_settings (
    id                BIGINT   AUTO_INCREMENT PRIMARY KEY,
    company_id        BIGINT   NOT NULL UNIQUE,
    work_start        TIME     DEFAULT '09:00:00',
    work_end          TIME     DEFAULT '18:00:00',
    max_break_minutes INT      DEFAULT 60,
    overtime_allowed  BOOLEAN  DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 29. ANNOUNCEMENTS
-- =====================================================
CREATE TABLE announcements (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id  BIGINT       NOT NULL,
    user_id     BIGINT       NOT NULL COMMENT 'Duyuruyu olusturan',
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    priority    ENUM('normal','important','urgent') DEFAULT 'normal',
    target_role VARCHAR(50)  DEFAULT NULL COMMENT 'NULL=herkese, boss/manager/employee=belirli role',
    is_pinned   BOOLEAN      DEFAULT FALSE,
    expiry_date DATE         DEFAULT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 30. AUTOMATION_RULES
-- =====================================================
CREATE TABLE automation_rules (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id    BIGINT       NOT NULL,
    name          VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(255) NOT NULL COMMENT 'task_status_changed, deadline_passed...',
    condition_    TEXT         DEFAULT NULL COMMENT 'JSON kosul objesi',
    action_       TEXT         DEFAULT NULL COMMENT 'JSON aksiyon objesi',
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 31. RECURRING_TASKS
-- =====================================================
CREATE TABLE recurring_tasks (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    company_id   BIGINT       NOT NULL,
    created_by   BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    frequency    ENUM('daily','weekly','biweekly','monthly') NOT NULL,
    day_of_week  TINYINT      DEFAULT NULL COMMENT '0=Pazar...6=Cumartesi (weekly icin)',
    day_of_month TINYINT      DEFAULT NULL COMMENT '1-31 (monthly icin)',
    time_of_day  TIME         DEFAULT '09:00:00',
    priority_id  BIGINT       DEFAULT NULL,
    assignee_id  BIGINT       DEFAULT NULL,
    is_active    BOOLEAN      DEFAULT TRUE,
    last_run_at  TIMESTAMP    NULL DEFAULT NULL,
    next_run_at  TIMESTAMP    NULL DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id)  REFERENCES companies(id)       ON DELETE CASCADE,
    FOREIGN KEY (created_by)  REFERENCES users(id)           ON DELETE SET NULL,
    FOREIGN KEY (priority_id) REFERENCES task_priorities(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id)           ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 32. USER_DASHBOARD_SETTINGS
-- =====================================================
CREATE TABLE user_dashboard_settings (
    id         BIGINT    AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT    NOT NULL UNIQUE,
    layout     JSON      COMMENT 'Widget sirasi, boyutu ve gorunurluk JSON verisi',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 33. AUDIT_LOGS
-- =====================================================
CREATE TABLE audit_logs (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    action     VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) DEFAULT NULL,
    record_id  BIGINT       DEFAULT NULL,
    old_value  TEXT,
    new_value  TEXT,
    ip_address VARCHAR(45)  DEFAULT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- INDEXLER
-- =====================================================
CREATE INDEX idx_users_company      ON users(company_id);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_tasks_company      ON tasks(company_id);
CREATE INDEX idx_tasks_task_list    ON tasks(task_list_id);
CREATE INDEX idx_tasks_status       ON tasks(status_id);
CREATE INDEX idx_tasks_due_date     ON tasks(due_date);
CREATE INDEX idx_task_assignments   ON task_assignments(user_id);
CREATE INDEX idx_attendance_user    ON attendance(user_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_leave_user         ON leave_requests(user_id, approval_status);
CREATE INDEX idx_company_code       ON companies(company_code);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);

-- =====================================================
-- SEED DATA - Yeni sirket kaydinda tetiklenecek varsayilan veriler
-- =====================================================
-- Her yeni sirket icin asagidaki INSERT'ler bir stored procedure ya da
-- backend servisinden cagirilmalidir:

-- INSERT INTO task_statuses (company_id, name, color, order_no, is_default) VALUES
--   (1, 'pending',     '#94a3b8', 1, TRUE),
--   (1, 'in_progress', '#3b82f6', 2, FALSE),
--   (1, 'review',      '#f59e0b', 3, FALSE),
--   (1, 'completed',   '#22c55e', 4, FALSE),
--   (1, 'cancelled',   '#ef4444', 5, FALSE);

-- INSERT INTO task_priorities (company_id, name, color, order_no) VALUES
--   (1, 'low',    '#94a3b8', 1),
--   (1, 'medium', '#3b82f6', 2),
--   (1, 'high',   '#f59e0b', 3),
--   (1, 'urgent', '#ef4444', 4);
```

---

## Degisiklik Gunlugu (v1 -> v2)

| #  | Degisiklik | Sebep |
|----|-----------|-------|
| 1  | `ref_code` -> `company_code` | Frontend bu adi bekliyor |
| 2  | `full_name` -> `first_name` + `last_name` | Frontend iki ayri field kullaniyor |
| 3  | `users`'a `avatar_url`, `position`, `phone`, `language`, `theme`, `last_login` eklendi | Frontend'de bu alanlar goruluyor |
| 4  | `users.role` ENUM Turkce -> Ingilizce (boss/manager/employee/customer) | Frontend Ingilizce deger kullaniyor |
| 5  | `task_statuses`, `task_priorities`, `categories` tablolari eklendi | `tasks` FK'lari karsilissiz kaliyordu (KRITIK) |
| 6  | `tags` + `task_tags` tablolari eklendi | TagManager.jsx icin gerekli |
| 7  | `recurring_tasks` tablosu eklendi | RecurringTasks.jsx icin gerekli |
| 8  | `user_dashboard_settings` tablosu eklendi | DashboardCustomizer.jsx icin gerekli |
| 9  | `project_members` tablosu eklendi | ProjectModule.jsx uye yapisi icin |
| 10 | `workspace_members` tablosu eklendi | Workspace erisim kontrolu icin |
| 11 | `user_skills` tablosu eklendi | Kullanici profil becerileri icin |
| 12 | `tasks`'a `actual_hours`, `progress_percent`, `start_date`, `updated_at` eklendi | Frontend bu alanlari goruluyor |
| 13 | `tasks.estimated_hours` -> DECIMAL(5,2) saat cinsinden | Frontend estimatedHours saat kullaniyor |
| 14 | `announcements`'a `user_id`, `priority`, `is_pinned` eklendi | Frontend bu alanlari goruluyor |
| 15 | `notifications`'a `reference_type` eklendi | related_id hangi tablodan olduğunu bildirmiyor |
| 16 | `leave_requests`'e `rejection_reason` eklendi | Patron red sebebi girebilmeli |
| 17 | `leave_requests.leave_type`'a `education` eklendi | LeaveRequestSystem.jsx'te Egitim Izni var |
| 18 | `projects`'e `color`, `icon`, `created_by` eklendi | ProjectModule.jsx'te renk mevcut |
| 19 | `task_comments`'e `parent_comment_id`, `updated_at` eklendi | Yanit/duzenleme ozelligi icin |
| 20 | `companies`'e `description`, `logo_url`, `industry`, `address`, `phone` eklendi | Frontend sirket detaylari gosteriyor |
| 21 | Tum ana tablolara `updated_at` eklendi | Degisiklik takibi icin |
| 22 | `workspaces`'e `created_by`, `icon` eklendi | Kim olusturdu bilgisi gerekli |
| 23 | SQL syntax saf MySQL 8+ | PostgreSQL karisikligi giderildi |