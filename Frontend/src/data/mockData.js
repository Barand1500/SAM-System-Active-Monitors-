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
    avatar: null,
    skills: [
      { name: 'Proje Yönetimi', category: 'Yönetim', level: 'expert' },
      { name: 'Liderlik', category: 'Yönetim', level: 'expert' },
      { name: 'İngilizce', category: 'Dil', level: 'advanced' }
    ]
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
    avatar: null,
    skills: [
      { name: 'React', category: 'Frontend', level: 'advanced' },
      { name: 'Node.js', category: 'Backend', level: 'advanced' },
      { name: 'TypeScript', category: 'Frontend', level: 'intermediate' },
      { name: 'PostgreSQL', category: 'Veritabanı', level: 'intermediate' },
      { name: 'Agile', category: 'Yönetim', level: 'advanced' },
      { name: 'İngilizce', category: 'Dil', level: 'advanced' }
    ]
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
    avatar: null,
    skills: [
      { name: 'React', category: 'Frontend', level: 'expert' },
      { name: 'TypeScript', category: 'Frontend', level: 'advanced' },
      { name: 'Tailwind CSS', category: 'Frontend', level: 'expert' },
      { name: 'Next.js', category: 'Frontend', level: 'intermediate' },
      { name: 'JavaScript', category: 'Frontend', level: 'expert' },
      { name: 'Figma', category: 'Tasarım', level: 'intermediate' },
      { name: 'İngilizce', category: 'Dil', level: 'intermediate' }
    ]
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
    avatar: null,
    skills: [
      { name: 'Node.js', category: 'Backend', level: 'expert' },
      { name: 'Python', category: 'Backend', level: 'advanced' },
      { name: 'PostgreSQL', category: 'Veritabanı', level: 'expert' },
      { name: 'MongoDB', category: 'Veritabanı', level: 'advanced' },
      { name: 'Docker', category: 'DevOps', level: 'intermediate' },
      { name: 'Redis', category: 'Veritabanı', level: 'intermediate' },
      { name: 'İngilizce', category: 'Dil', level: 'advanced' },
      { name: 'Almanca', category: 'Dil', level: 'beginner' }
    ]
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
    avatar: null,
    skills: [
      { name: 'Figma', category: 'Tasarım', level: 'expert' },
      { name: 'Adobe XD', category: 'Tasarım', level: 'advanced' },
      { name: 'Photoshop', category: 'Tasarım', level: 'expert' },
      { name: 'Illustrator', category: 'Tasarım', level: 'advanced' },
      { name: 'UI/UX', category: 'Tasarım', level: 'expert' },
      { name: 'HTML', category: 'Frontend', level: 'intermediate' },
      { name: 'CSS', category: 'Frontend', level: 'intermediate' },
      { name: 'İngilizce', category: 'Dil', level: 'intermediate' }
    ]
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
    avatar: null,
    skills: [
      { name: 'React', category: 'Frontend', level: 'advanced' },
      { name: 'Node.js', category: 'Backend', level: 'advanced' },
      { name: 'Python', category: 'Backend', level: 'intermediate' },
      { name: 'MongoDB', category: 'Veritabanı', level: 'advanced' },
      { name: 'Docker', category: 'DevOps', level: 'advanced' },
      { name: 'AWS', category: 'DevOps', level: 'intermediate' },
      { name: 'React Native', category: 'Mobil', level: 'intermediate' },
      { name: 'Flutter', category: 'Mobil', level: 'beginner' },
      { name: 'İngilizce', category: 'Dil', level: 'advanced' }
    ]
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

// Destek Talepleri
export const supportTickets = [
  {
    id: 1,
    callerName: 'Ali Vural',
    callerPhone: '+90 532 999 1122',
    callerCompany: 'Mega Holding A.Ş.',
    subject: 'Fatura sistemi hata veriyor',
    description: 'Müşteri fatura oluştururken sistem 500 hatası veriyor. Son 2 gündür devam ediyor. Acil çözüm talep ediyor.',
    priority: 'high',
    category: 'technical',
    status: 'new',
    createdBy: { id: 3, firstName: 'Ayşe', lastName: 'Demir' },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    assignee: null,
    assignedAt: null,
    helpers: [],
    viewers: [{ userId: 3, viewedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString() }],
    history: [
      { type: 'created', userId: 3, userName: 'Ayşe Demir', at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() }
    ],
    notes: [],
    resolution: null,
    resolvedAt: null
  },
  {
    id: 2,
    callerName: 'Selin Koç',
    callerPhone: '+90 545 333 4455',
    callerCompany: 'DataSoft Bilişim',
    subject: 'Raporlama modülü çalışmıyor',
    description: 'Aylık rapor oluşturulamıyor. Excel export butonu tıklanınca sayfa donuyor. Chrome ve Firefox\'ta denedik aynı sorun.',
    priority: 'medium',
    category: 'technical',
    status: 'assigned',
    createdBy: { id: 4, firstName: 'Can', lastName: 'Özkan' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 5, firstName: 'Zeynep', lastName: 'Arslan', assignedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
    assignedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    helpers: [{ id: 4, firstName: 'Can', lastName: 'Özkan', joinedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() }],
    viewers: [
      { userId: 4, viewedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
      { userId: 5, viewedAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString() },
      { userId: 2, viewedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString() }
    ],
    history: [
      { type: 'created', userId: 4, userName: 'Can Özkan', at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { type: 'viewed', userId: 5, userName: 'Zeynep Arslan', at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString() },
      { type: 'assigned', userId: 5, userName: 'Zeynep Arslan', at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
      { type: 'helper_joined', userId: 4, userName: 'Can Özkan', at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() }
    ],
    notes: [
      { id: 1, userId: 5, userName: 'Zeynep Arslan', text: 'Sorunu inceliyorum, veritabanı bağlantısı ile ilgili olabilir.', at: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString() }
    ],
    resolution: null,
    resolvedAt: null
  },
  {
    id: 3,
    callerName: 'Burak Şen',
    callerPhone: '+90 555 666 7788',
    callerCompany: 'ABC Lojistik',
    subject: 'Şifre sıfırlama çalışmıyor',
    description: 'Müşteri şifre sıfırlama mailini almadığını söylüyor. Spam klasörünü de kontrol etmiş. 3 kez denemiş.',
    priority: 'low',
    category: 'info',
    status: 'resolved',
    createdBy: { id: 6, firstName: 'Emre', lastName: 'Yıldız' },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 6, firstName: 'Emre', lastName: 'Yıldız', assignedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() },
    assignedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    helpers: [],
    viewers: [
      { userId: 6, viewedAt: new Date(Date.now() - 47.5 * 60 * 60 * 1000).toISOString() }
    ],
    history: [
      { type: 'created', userId: 6, userName: 'Emre Yıldız', at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { type: 'assigned', userId: 6, userName: 'Emre Yıldız', at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() },
      { type: 'resolved', userId: 6, userName: 'Emre Yıldız', at: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString() }
    ],
    notes: [],
    resolution: 'Müşterinin mail adresi yanlış kayıtlıydı. Düzeltildi ve şifre sıfırlama başarıyla gerçekleşti.',
    resolvedAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString()
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
