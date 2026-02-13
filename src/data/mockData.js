// Örnek Veriler - İş Takip Uygulaması

// Şirket
export const company = {
  id: 1,
  name: 'TechPro Yazılım A.Ş.',
  companyCode: 'TPY2024X',
  description: 'Kurumsal yazılım çözümleri',
  industry: 'Teknoloji',
  address: 'İstanbul, Türkiye',
  phone: '+90 212 555 0000',
  logoUrl: null
};

// Kullanıcılar
export const users = [
  {
    id: 1,
    companyId: 1,
    email: 'patron@techpro.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    role: 'boss',
    department: 'Yönetim',
    position: 'CEO',
    phone: '+90 532 111 2222',
    status: 'active',
    avatar: null
  },
  {
    id: 2,
    companyId: 1,
    email: 'mehmet@techpro.com',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    role: 'manager',
    department: 'Yazılım',
    position: 'Takım Lideri',
    phone: '+90 533 222 3333',
    status: 'active',
    avatar: null
  },
  {
    id: 3,
    companyId: 1,
    email: 'ayse@techpro.com',
    firstName: 'Ayşe',
    lastName: 'Demir',
    role: 'employee',
    department: 'Yazılım',
    position: 'Frontend Developer',
    phone: '+90 534 333 4444',
    status: 'active',
    avatar: null
  },
  {
    id: 4,
    companyId: 1,
    email: 'ali@techpro.com',
    firstName: 'Ali',
    lastName: 'Öztürk',
    role: 'employee',
    department: 'Yazılım',
    position: 'Backend Developer',
    phone: '+90 535 444 5555',
    status: 'active',
    avatar: null
  },
  {
    id: 5,
    companyId: 1,
    email: 'zeynep@techpro.com',
    firstName: 'Zeynep',
    lastName: 'Arslan',
    role: 'employee',
    department: 'Tasarım',
    position: 'UI/UX Designer',
    phone: '+90 536 555 6666',
    status: 'active',
    avatar: null
  },
  {
    id: 6,
    companyId: 1,
    email: 'can@techpro.com',
    firstName: 'Can',
    lastName: 'Yıldırım',
    role: 'employee',
    department: 'Yazılım',
    position: 'Full Stack Developer',
    phone: '+90 537 666 7777',
    status: 'on_leave',
    avatar: null
  }
];

// Departmanlar
export const departments = [
  { id: 1, name: 'Yazılım', color: '#6366f1', employeeCount: 4 },
  { id: 2, name: 'Tasarım', color: '#ec4899', employeeCount: 1 },
  { id: 3, name: 'Yönetim', color: '#f59e0b', employeeCount: 1 },
];

// Görevler
export const tasks = [
  {
    id: 1,
    title: 'Kullanıcı giriş sayfası tasarımı',
    description: 'Modern ve kullanıcı dostu bir giriş sayfası tasarlanacak',
    status: 'completed',
    priority: 'high',
    assignedTo: users[4], // Zeynep
    assignedBy: users[0], // Patron
    department: 'Tasarım',
    dueDate: '2024-02-10',
    createdAt: '2024-02-01',
    completedAt: '2024-02-09',
    estimatedHours: 8,
    actualHours: 6,
    tags: ['UI', 'Tasarım']
  },
  {
    id: 2,
    title: 'API entegrasyonu',
    description: 'Backend servisleri ile frontend bağlantısı kurulacak',
    status: 'in_progress',
    priority: 'high',
    assignedTo: users[3], // Ali
    assignedBy: users[1], // Mehmet
    department: 'Yazılım',
    dueDate: '2024-02-15',
    createdAt: '2024-02-05',
    completedAt: null,
    estimatedHours: 20,
    actualHours: 12,
    tags: ['Backend', 'API']
  },
  {
    id: 3,
    title: 'Dashboard komponenti',
    description: 'Ana dashboard ekranı için React komponenti geliştirilecek',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: users[2], // Ayşe
    assignedBy: users[1], // Mehmet
    department: 'Yazılım',
    dueDate: '2024-02-18',
    createdAt: '2024-02-08',
    completedAt: null,
    estimatedHours: 16,
    actualHours: 8,
    tags: ['Frontend', 'React']
  },
  {
    id: 4,
    title: 'Veritabanı optimizasyonu',
    description: 'Performans iyileştirmesi için veritabanı sorguları optimize edilecek',
    status: 'pending',
    priority: 'medium',
    assignedTo: users[3], // Ali
    assignedBy: users[0], // Patron
    department: 'Yazılım',
    dueDate: '2024-02-25',
    createdAt: '2024-02-10',
    completedAt: null,
    estimatedHours: 12,
    actualHours: 0,
    tags: ['Database', 'Optimizasyon']
  },
  {
    id: 5,
    title: 'Mobil uyumluluk kontrolü',
    description: 'Tüm sayfaların mobil cihazlarda düzgün görünmesi sağlanacak',
    status: 'review',
    priority: 'low',
    assignedTo: users[4], // Zeynep
    assignedBy: users[1], // Mehmet
    department: 'Tasarım',
    dueDate: '2024-02-20',
    createdAt: '2024-02-07',
    completedAt: null,
    estimatedHours: 10,
    actualHours: 9,
    tags: ['Responsive', 'Mobile']
  },
  {
    id: 6,
    title: 'Bildirim sistemi',
    description: 'Gerçek zamanlı bildirim sistemi kurulacak',
    status: 'pending',
    priority: 'urgent',
    assignedTo: null, // Henüz atanmadı
    assignedBy: users[0], // Patron
    department: 'Yazılım',
    dueDate: '2024-02-28',
    createdAt: '2024-02-12',
    completedAt: null,
    estimatedHours: 24,
    actualHours: 0,
    tags: ['Backend', 'WebSocket']
  }
];

// Duyurular
export const announcements = [
  {
    id: 1,
    title: 'Haftalık Toplantı',
    content: 'Bu cuma saat 14:00\'te genel değerlendirme toplantısı yapılacaktır.',
    priority: 'normal',
    isPinned: false,
    createdAt: '2024-02-12',
    createdBy: users[0]
  },
  {
    id: 2,
    title: 'Yeni Proje Duyurusu',
    content: 'Önümüzdeki ay başlayacak yeni e-ticaret projesi için hazırlıklara başlıyoruz.',
    priority: 'important',
    isPinned: true,
    createdAt: '2024-02-10',
    createdBy: users[0]
  }
];

// Bildirimler
export const notifications = [
  {
    id: 1,
    type: 'task_assigned',
    title: 'Yeni görev atandı',
    content: 'API entegrasyonu görevi size atandı.',
    isRead: false,
    createdAt: '2024-02-12 09:30'
  },
  {
    id: 2,
    type: 'deadline_reminder',
    title: 'Yaklaşan teslim tarihi',
    content: 'Dashboard komponenti görevi 3 gün içinde teslim edilmeli.',
    isRead: false,
    createdAt: '2024-02-12 08:00'
  },
  {
    id: 3,
    type: 'task_updated',
    title: 'Görev güncellendi',
    content: 'Kullanıcı giriş sayfası tasarımı görevi tamamlandı.',
    isRead: true,
    createdAt: '2024-02-09 17:00'
  }
];

// Mevcut oturum açmış kullanıcı (giriş sonrası değişecek)
export const currentUser = users[0]; // Varsayılan olarak patron

// Demo hesapları
export const demoAccounts = {
  boss: { email: 'patron@techpro.com', password: '123456' },
  manager: { email: 'mehmet@techpro.com', password: '123456' },
  employee: { email: 'ayse@techpro.com', password: '123456' }
};
