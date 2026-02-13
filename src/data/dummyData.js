// Dummy Data for Discord-inspired Collaboration Platform

export const workspaces = [
  {
    id: 1,
    name: 'Team Alpha',
    description: 'Ana proje geliştirme ekibi',
    icon: 'TA',
    color: '#5865f2',
    memberCount: 12,
  },
  {
    id: 2,
    name: 'Design Hub',
    description: 'UI/UX tasarım ekibi',
    icon: 'DH',
    color: '#eb459e',
    memberCount: 8,
  },
  {
    id: 3,
    name: 'DevOps Central',
    description: 'Altyapı ve deployment takımı',
    icon: 'DC',
    color: '#57f287',
    memberCount: 5,
  },
  {
    id: 4,
    name: 'Mobile Team',
    description: 'iOS ve Android geliştirme',
    icon: 'MT',
    color: '#fee75c',
    memberCount: 7,
  },
];

export const roles = [
  { id: 1, name: 'Backend', color: '#3498db', workspaceId: 1 },
  { id: 2, name: 'Frontend', color: '#9b59b6', workspaceId: 1 },
  { id: 3, name: 'DevOps', color: '#e74c3c', workspaceId: 1 },
  { id: 4, name: 'UI/UX', color: '#2ecc71', workspaceId: 1 },
  { id: 5, name: 'QA', color: '#f39c12', workspaceId: 1 },
];

export const members = [
  {
    id: 1,
    username: 'ahmet_dev',
    displayName: 'Ahmet Yılmaz',
    avatar: null,
    status: 'online',
    roleId: 1,
    role: 'Backend',
    roleColor: '#3498db',
  },
  {
    id: 2,
    username: 'fatma_design',
    displayName: 'Fatma Kaya',
    avatar: null,
    status: 'online',
    roleId: 4,
    role: 'UI/UX',
    roleColor: '#2ecc71',
  },
  {
    id: 3,
    username: 'mehmet_backend',
    displayName: 'Mehmet Demir',
    avatar: null,
    status: 'busy',
    roleId: 1,
    role: 'Backend',
    roleColor: '#3498db',
  },
  {
    id: 4,
    username: 'ayse_frontend',
    displayName: 'Ayşe Öztürk',
    avatar: null,
    status: 'away',
    roleId: 2,
    role: 'Frontend',
    roleColor: '#9b59b6',
  },
  {
    id: 5,
    username: 'can_devops',
    displayName: 'Can Arslan',
    avatar: null,
    status: 'online',
    roleId: 3,
    role: 'DevOps',
    roleColor: '#e74c3c',
  },
  {
    id: 6,
    username: 'zeynep_qa',
    displayName: 'Zeynep Çelik',
    avatar: null,
    status: 'offline',
    roleId: 5,
    role: 'QA',
    roleColor: '#f39c12',
  },
  {
    id: 7,
    username: 'emre_front',
    displayName: 'Emre Koç',
    avatar: null,
    status: 'online',
    roleId: 2,
    role: 'Frontend',
    roleColor: '#9b59b6',
  },
  {
    id: 8,
    username: 'elif_design',
    displayName: 'Elif Yıldız',
    avatar: null,
    status: 'online',
    roleId: 4,
    role: 'UI/UX',
    roleColor: '#2ecc71',
  },
];

export const tasks = [
  {
    id: 1,
    title: 'REST API Authentication Modülü',
    description: 'JWT tabanlı kimlik doğrulama sistemi implementasyonu. Refresh token mekanizması ve rate limiting dahil edilmeli.',
    videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
    targetRole: 'Backend',
    targetRoleColor: '#3498db',
    assignedTo: 'Ahmet Yılmaz',
    priority: 'high',
    status: 'in_progress',
    deadline: '2026-02-20',
    createdAt: '2026-02-10',
    comments: 5,
    attachments: 2,
  },
  {
    id: 2,
    title: 'Dashboard UI Redesign',
    description: 'Ana dashboard sayfasının yeniden tasarlanması. Dark mode desteği ve responsive layout gerekli.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    targetRole: 'Frontend',
    targetRoleColor: '#9b59b6',
    assignedTo: 'Ayşe Öztürk',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-02-25',
    createdAt: '2026-02-12',
    comments: 3,
    attachments: 4,
  },
  {
    id: 3,
    title: 'CI/CD Pipeline Optimizasyonu',
    description: 'GitHub Actions workflow\'larının optimize edilmesi. Build sürelerinin %40 azaltılması hedefleniyor.',
    videoUrl: null,
    targetRole: 'DevOps',
    targetRoleColor: '#e74c3c',
    assignedTo: 'Can Arslan',
    priority: 'urgent',
    status: 'in_progress',
    deadline: '2026-02-15',
    createdAt: '2026-02-08',
    comments: 8,
    attachments: 1,
  },
  {
    id: 4,
    title: 'Kullanıcı Onboarding Akışı',
    description: 'Yeni kullanıcılar için onboarding wizard tasarımı. 5 adımlı interaktif tanıtım turu.',
    videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    targetRole: 'UI/UX',
    targetRoleColor: '#2ecc71',
    assignedTo: 'Fatma Kaya',
    priority: 'medium',
    status: 'review',
    deadline: '2026-02-18',
    createdAt: '2026-02-05',
    comments: 12,
    attachments: 6,
  },
  {
    id: 5,
    title: 'Database Migration Script',
    description: 'PostgreSQL\'den MongoDB\'ye veri migrasyonu. Downtime olmadan canlı geçiş planı.',
    videoUrl: null,
    targetRole: 'Backend',
    targetRoleColor: '#3498db',
    assignedTo: 'Mehmet Demir',
    priority: 'high',
    status: 'pending',
    deadline: '2026-02-28',
    createdAt: '2026-02-11',
    comments: 2,
    attachments: 3,
  },
  {
    id: 6,
    title: 'E2E Test Coverage',
    description: 'Cypress ile kritik kullanıcı akışları için end-to-end testler yazılması. Minimum %80 coverage.',
    videoUrl: null,
    targetRole: 'QA',
    targetRoleColor: '#f39c12',
    assignedTo: 'Zeynep Çelik',
    priority: 'low',
    status: 'completed',
    deadline: '2026-02-12',
    createdAt: '2026-02-01',
    comments: 6,
    attachments: 0,
  },
];

export const taskLogs = [
  {
    id: 1,
    taskId: 1,
    type: 'progress',
    title: 'JWT Token Yapısı Tamamlandı',
    author: 'Ahmet Yılmaz',
    authorRole: 'Backend',
    authorRoleColor: '#3498db',
    content: `Access token ve refresh token üretimi tamamlandı. Token payload yapısı aşağıdaki gibi:

- **sub**: Kullanıcı ID
- **email**: Kullanıcı email
- **roles**: Kullanıcı rolleri array
- **exp**: Token geçerlilik süresi

Refresh token Redis'te saklanıyor, 7 gün geçerli.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      sub: user.id, 
      email: user.email,
      roles: user.roles 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return { accessToken, refreshToken };
};`,
      },
    ],
    reactions: [
      { emoji: '👍', count: 4 },
      { emoji: '🎉', count: 2 },
    ],
    createdAt: '2026-02-12T14:30:00',
  },
  {
    id: 2,
    taskId: 3,
    type: 'error',
    title: 'Docker Build Cache Sorunu',
    author: 'Can Arslan',
    authorRole: 'DevOps',
    authorRoleColor: '#e74c3c',
    content: `GitHub Actions'da Docker layer cache düzgün çalışmıyor. Her build'de tüm layer'lar yeniden oluşturuluyor.

### Denenen Çözümler:
1. ~~actions/cache@v3 kullanımı~~ - Çalışmadı
2. ~~docker/build-push-action cache-from~~ - Kısmen çalıştı
3. BuildKit inline cache - **Test ediliyor**

### Hata Mesajı:
\`WARN: cache miss for layer sha256:abc123...\``,
    codeSnippets: [
      {
        language: 'yaml',
        code: `# Mevcut Konfigürasyon
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max`,
      },
    ],
    reactions: [
      { emoji: '👀', count: 3 },
      { emoji: '🤔', count: 2 },
    ],
    createdAt: '2026-02-13T09:15:00',
  },
  {
    id: 3,
    taskId: 4,
    type: 'completion',
    title: 'Onboarding Wizard Tamamlandı 🎉',
    author: 'Fatma Kaya',
    authorRole: 'UI/UX',
    authorRoleColor: '#2ecc71',
    content: `5 adımlı onboarding wizard tasarımı ve implementasyonu tamamlandı!

### Adımlar:
1. **Hoş Geldin** - Kişiselleştirilmiş karşılama
2. **Profil Kurulumu** - Avatar ve temel bilgiler
3. **Workspace Turu** - İnteraktif tour.js entegrasyonu
4. **İlk Görev** - Örnek task oluşturma
5. **Tamamlandı** - Confetti animasyonu 🎊

### Metrikler:
- Ortalama tamamlama süresi: **3.5 dakika**
- Skip oranı: **%12**
- Kullanıcı memnuniyeti: **4.6/5**`,
    codeSnippets: [],
    reactions: [
      { emoji: '🎉', count: 8 },
      { emoji: '❤️', count: 5 },
      { emoji: '🚀', count: 3 },
    ],
    createdAt: '2026-02-13T16:45:00',
  },
  {
    id: 4,
    taskId: 2,
    type: 'progress',
    title: 'Component Library Güncellemesi',
    author: 'Ayşe Öztürk',
    authorRole: 'Frontend',
    authorRoleColor: '#9b59b6',
    content: `Dashboard için yeni component'ler eklendi:

- \`<StatCard />\` - İstatistik kartları
- \`<ActivityFeed />\` - Son aktiviteler listesi  
- \`<QuickActions />\` - Hızlı işlem butonları
- \`<NotificationBell />\` - Bildirim dropdown

Tüm component'ler Storybook'a eklendi ve dark mode destekliyor.`,
    codeSnippets: [
      {
        language: 'jsx',
        code: `// StatCard Kullanımı
<StatCard
  title="Aktif Görevler"
  value={42}
  change={+12}
  changeType="increase"
  icon={<TaskIcon />}
  color="blue"
/>`,
      },
    ],
    reactions: [
      { emoji: '👍', count: 6 },
      { emoji: '💯', count: 2 },
    ],
    createdAt: '2026-02-13T11:20:00',
  },
];

export const currentUser = {
  id: 1,
  username: 'ahmet_dev',
  displayName: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  avatar: null,
  status: 'online',
  role: 'Backend',
  roleColor: '#3498db',
};
