# SAM System - Design System & Consistency Guide

## 🎨 Renk Standartları

### Primary Button Colors
- **Primary Action**: `bg-blue-500 hover:bg-blue-600`
  - Usage: Ana aksiyonlar (Kaydet, Ekle, Gönder)
  - Gradient: `from-blue-500 to-cyan-500`

- **Danger/Delete**: `bg-red-500 hover:bg-red-600`
  - Usage: Silme, İptal, Tehlikeli işlemler
  - Gradient: `from-red-500 to-pink-500`

- **Success**: `bg-emerald-500 hover:bg-emerald-600`
  - Usage: Başarılı işlemler, Onayla, Tamamla
  - Gradient: `from-emerald-500 to-teal-500`

- **Warning**: `bg-amber-500 hover:bg-amber-600`
  - Usage: Uyarılar, Dikkat gerektiren işlemler
  - Gradient: `from-amber-500 to-orange-500`

- **Info**: `bg-indigo-500 hover:bg-indigo-600`
  - Usage: Bilgilendirme, Detaylar
  - Gradient: `from-indigo-500 to-purple-500`

### Status Colors
- **Completed**: `text-emerald-500` / `bg-emerald-100 dark:bg-emerald-900/30`
- **In Progress**: `text-blue-500` / `bg-blue-100 dark:bg-blue-900/30`
- **Pending**: `text-amber-500` / `bg-amber-100 dark:bg-amber-900/30`
- **Cancelled**: `text-red-500` / `bg-red-100 dark:bg-red-900/30`
- **On Hold**: `text-slate-500` / `bg-slate-100 dark:bg-slate-700/30`

### Priority Colors
- **High**: `text-red-500`
- **Medium**: `text-amber-500`
- **Low**: `text-blue-500`

### Background Colors (Dark Mode)
- **Base**: `bg-slate-900`
- **Card**: `bg-slate-800`
- **Card Secondary**: `bg-slate-800/50` or `bg-slate-700/30`
- **Hover**: `hover:bg-slate-700/50`
- **Border**: `border-slate-700`

### Background Colors (Light Mode)
- **Base**: `bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50`
- **Card**: `bg-white`
- **Card Secondary**: `bg-slate-50`
- **Hover**: `hover:bg-slate-50`
- **Border**: `border-slate-200`

---

## 📐 Spacing Standartları

### Button Padding
- **Small**: `px-3 py-1.5` (12px x 6px)
- **Medium**: `px-4 py-2.5` (16px x 10px) - **DEFAULT**
- **Large**: `px-6 py-3` (24px x 12px)

### Card Padding
- **Compact**: `p-4` (16px)
- **Standard**: `p-6` (24px) - **DEFAULT**
- **Spacious**: `p-8` (32px)

### Gap/Space Between Elements
- **Tight**: `gap-2` (8px)
- **Normal**: `gap-4` (16px) - **DEFAULT**
- **Loose**: `gap-6` (24px)

### Margin Bottom (Sections)
- **Small**: `mb-4` (16px)
- **Medium**: `mb-6` (24px) - **DEFAULT**
- **Large**: `mb-8` (32px)

---

## 🔤 Typography Standartları

### Font Sizes
- **Heading 1**: `text-2xl font-bold` (24px)
- **Heading 2**: `text-xl font-bold` (20px)
- **Heading 3**: `text-lg font-semibold` (18px)
- **Body**: `text-base` (16px) - **DEFAULT**
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)
- **Caption**: `text-xs text-slate-400`

### Font Weights
- **Bold**: `font-bold` (700)
- **Semibold**: `font-semibold` (600) - **Preferred for headings**
- **Medium**: `font-medium` (500)
- **Normal**: `font-normal` (400) - **DEFAULT**

---

## 🎯 Border Radius Standartları

- **Small**: `rounded-lg` (8px)
- **Medium**: `rounded-xl` (12px) - **DEFAULT for cards**
- **Large**: `rounded-2xl` (16px) - **Preferred for main cards**
- **Extra Large**: `rounded-3xl` (24px) - **Hero sections**
- **Full**: `rounded-full` - **Icons, badges, pills**

---

## 🖼️ Icon Standartları

### Icon Library
- **Primary**: Lucide React (`lucide-react`)
- **Consistency**: Tüm iconlar lucide-react'tan kullanılmalı

### Icon Sizes
- **Small**: `size={14}` - Inline text, badges
- **Medium**: `size={16}` - Buttons, menu items
- **Regular**: `size={18}` - Default button size
- **Large**: `size={20}` - Headers, prominent actions
- **Extra Large**: `size={24}` - Hero sections, emphasis

### Common Icons Mapping
```javascript
// Actions
Plus - Ekle/Yeni
Edit - Düzenle
Trash2 - Sil
Save - Kaydet
X - Kapat/İptal
Check - Onayla
Copy - Kopyala
Download - İndir
Upload - Yükle
Send - Gönder
Search - Ara

// Navigation
LayoutDashboard - Ana Sayfa
ClipboardList - Görevler
Users - Çalışanlar
Settings - Ayarlar
Calendar - Takvim
Bell - Bildirimler
Menu - Menü
ChevronDown - Dropdown

// Status
CheckCircle2 - Tamamlandı
Clock - Beklemede
TrendingUp - Devam Ediyor
AlertTriangle - Uyarı
XCircle - İptal

// Business
Building2 - Şirket/Departman
Briefcase - İş/Pozisyon
Phone - Telefon
Mail - E-posta
Globe - Website
MapPin - Adres
```

---

## 📝 Türkçe Terminoloji Standartları

### Görev Durumları (Task Status)
- `pending` → "Bekleyen"
- `in_progress` → "Devam Eden"
- `review` → "İncelemede"
- `completed` → "Tamamlandı"
- `cancelled` → "İptal Edildi"
- `on_hold` → "Askıda"

### Öncelik Seviyeleri (Priority)
- `low` → "Düşük"
- `medium` → "Orta"
- `high` → "Yüksek"

### Genel Terimler
- Save → "Kaydet"
- Cancel → "İptal"
- Delete → "Sil"
- Edit → "Düzenle"
- Add → "Ekle"
- Search → "Ara"
- Filter → "Filtrele"
- Export → "Dışa Aktar"
- Import → "İçe Aktar"
- Upload → "Yükle"
- Download → "İndir"
- Send → "Gönder"
- Close → "Kapat"
- Confirm → "Onayla"
- View → "Görüntüle"
- Details → "Detaylar"
- Settings → "Ayarlar"
- Profile → "Profil"
- Logout → "Çıkış Yap"

### Modül İsimleri
- Dashboard → "Ana Sayfa" / "Genel Bakış"
- Tasks → "Görevler"
- Employees → "Çalışanlar"
- Calendar → "Takvim"
- Reports → "Raporlar"
- Announcements → "Duyurular"
- Leaves → "İzinler"
- Time Tracker → "Mesai Takibi"
- Settings → "Ayarlar"

---

## 🎨 Gradient Standartları

### Pre-defined Gradients (CSS Classes)
```css
.gradient-primary { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
.gradient-success { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
.gradient-warning { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
.gradient-danger { background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); }
.gradient-info { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); }
```

### Tailwind Gradients
```javascript
// Primary
bg-gradient-to-r from-blue-500 to-cyan-500
bg-gradient-to-br from-indigo-500 to-purple-500

// Success
bg-gradient-to-r from-emerald-500 to-teal-500

// Warning
bg-gradient-to-r from-amber-500 to-orange-500

// Danger
bg-gradient-to-r from-red-500 to-pink-500

// Info
bg-gradient-to-r from-indigo-500 to-purple-600
```

---

## 📱 Responsive Breakpoints

### Tailwind Breakpoints
- **sm**: `640px` - Small devices (large phones)
- **md**: `768px` - Medium devices (tablets)
- **lg**: `1024px` - Large devices (desktops)
- **xl**: `1280px` - Extra large devices
- **2xl**: `1536px` - Ultra wide screens

### Mobile-First Usage
```jsx
// Default: mobile
// md: tablet and up
// lg: desktop and up

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Touch Targets (Mobile)
- **Minimum Button Height**: 44px
- **Minimum Input Height**: 48px
- **Minimum Tap Area**: 44px x 44px
- **Font Size (Inputs)**: 16px minimum (prevents iOS zoom)

---

## 🔐 Permission-Based UI Patterns

### Role Checks
```javascript
const isBoss = user?.role === 'boss';
const canManage = isBoss || user?.role === 'manager';
```

### Conditional Rendering
```jsx
{isBoss && <AdminPanel />}
{canManage && <button>Ekle</button>}
{(isBoss || canManage) && <ReportsPage />}
```

---

## 🎭 Animation & Transition Standartları

### Transition Durations
- **Fast**: `transition-all duration-150` - Hover effects
- **Normal**: `transition-all duration-300` - **DEFAULT** - Buttons, cards
- **Slow**: `transition-all duration-500` - Page transitions

### Hover Effects
```jsx
// Standard card hover
className="card-hover" // CSS: transform: translateY(-4px)

// Button hover
hover:bg-blue-600 hover:shadow-lg

// Scale effect
hover:scale-105 transition-transform
```

---

## ✅ Code Quality Checklist

### Before Committing
- [ ] All colors follow the defined palette
- [ ] All icons are from lucide-react
- [ ] Turkish terminology is consistent
- [ ] Spacing follows 4px grid (gap-2, gap-4, gap-6, etc.)
- [ ] Buttons have consistent padding (px-4 py-2.5)
- [ ] Cards use rounded-2xl for borders
- [ ] Dark mode support is implemented
- [ ] Mobile responsive (grid-cols-1 md:grid-cols-2)
- [ ] Touch targets are minimum 44px
- [ ] Animations use standard durations

### Validation Checklist
- [ ] Forms use validation.js utilities
- [ ] Error messages are user-friendly Turkish
- [ ] Success notifications use toast system
- [ ] Loading states are implemented
- [ ] Empty states have helpful messages

---

## 📦 Component Pattern Library

### Button Patterns
```jsx
// Primary Action
<button className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all">
  Kaydet
</button>

// Danger Action
<button className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all">
  Sil
</button>

// Secondary Action
<button className={`px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
  İptal
</button>

// Icon Button
<button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
  <Edit size={18} />
</button>
```

### Card Patterns
```jsx
// Standard Card
<div className={`rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
  {/* Content */}
</div>

// Card with Header
<div className={`rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
  <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Başlık</h3>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Input Patterns
```jsx
// Standard Input
<input
  type="text"
  placeholder="Başlık..."
  className={`w-full px-4 py-2.5 rounded-lg border ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
/>

// Textarea
<textarea
  rows={4}
  placeholder="Açıklama..."
  className={`w-full px-4 py-2.5 rounded-lg border ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
/>
```

### Badge Patterns
```jsx
// Status Badge
<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
  status === 'completed' 
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
    : status === 'in_progress'
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
}`}>
  {statusLabel}
</span>

// Priority Badge
<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
  priority === 'high'
    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
    : priority === 'medium'
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
}`}>
  {priorityLabel}
</span>
```

---

## 🚀 Performance Best Practices

### Image Optimization
- Use WebP format when possible
- Lazy load images below the fold
- Optimize images for display size
- Use base64 for small icons (<5KB)

### Code Splitting
- Lazy load routes with React.lazy()
- Use dynamic imports for heavy components
- Split vendor bundles

### LocalStorage Management
- Limit stored data size (<5MB)
- Clean old entries periodically
- Use JSON.stringify/parse carefully
- Implement data versioning

---

## 📚 Documentation Standards

### Component Documentation
```javascript
/**
 * ComponentName - Brief description
 * 
 * @param {object} props
 * @param {boolean} props.isDark - Dark mode flag
 * @param {function} props.onAction - Callback function
 * @param {string} [props.className] - Optional CSS classes
 * 
 * @example
 * <ComponentName isDark={true} onAction={handleAction} />
 */
```

### Function Documentation
```javascript
/**
 * functionName - Brief description
 * 
 * @param {string} param1 - Description
 * @param {number} param2 - Description
 * @returns {boolean} Description of return value
 */
```

---

## 🎯 Accessibility (A11y) Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `tabIndex` appropriately
- Implement focus styles
- ESC to close modals
- Enter to submit forms

### ARIA Labels
```jsx
<button aria-label="Kapat">
  <X size={20} />
</button>

<input aria-describedby="email-help" />
<small id="email-help">Geçerli bir e-posta adresi girin</small>
```

### Color Contrast
- Text contrast ratio: minimum 4.5:1
- Large text: minimum 3:1
- Use color + icons for status (not just color)

---

## 🔧 Maintenance Notes

### Regular Reviews
- Review color usage monthly
- Update documentation with new patterns
- Refactor inconsistent code
- Update dependencies quarterly

### Version Control
- Use semantic versioning
- Document breaking changes
- Keep CHANGELOG.md updated
- Tag releases properly

---

**Last Updated**: 2024-02-15
**Version**: 1.0.0
**Maintained by**: SAM System Development Team
