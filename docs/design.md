# UI/UX Design Document
## Web Kasir + Reservasi Tempat

**Version**: 1.0  
**Last Updated**: 30 Juli 2026  
**Status**: Design Specification

---

## 1. Design Philosophy

### 1.1 Design Principles

**Modern & Professional**:
- Clean, minimalist interface
- Premium feel dengan attention to detail
- Professional untuk business context

**User-Centric**:
- Intuitive navigation
- Clear hierarchy
- Minimal cognitive load
- Efficient workflows

**Mobile-First**:
- Responsive dari 320px hingga 4K
- Touch-friendly interactions
- Optimized untuk mobile booking

**Accessible**:
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

**Performance**:
- Fast-loading interfaces
- Optimistic UI updates
- Smooth animations (60fps)
- Progressive enhancement

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors

```css
/* Brand Primary - Blue */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
--primary-950: #172554;
```

#### Secondary Colors

```css
/* Brand Secondary - Indigo */
--secondary-50: #EEF2FF;
--secondary-100: #E0E7FF;
--secondary-200: #C7D2FE;
--secondary-300: #A5B4FC;
--secondary-400: #818CF8;
--secondary-500: #6366F1;  /* Main */
--secondary-600: #4F46E5;
--secondary-700: #4338CA;
--secondary-800: #3730A3;
--secondary-900: #312E81;
```

#### Neutral Colors

```css
/* Grayscale */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
--gray-950: #030712;
```

#### Status Colors

```css
/* Success - Green */
--success-50: #F0FDF4;
--success-500: #22C55E;
--success-700: #15803D;

/* Warning - Yellow */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;
--warning-700: #B45309;

/* Error - Red */
--error-50: #FEF2F2;
--error-500: #EF4444;
--error-700: #B91C1C;

/* Info - Cyan */
--info-50: #ECFEFF;
--info-500: #06B6D4;
--info-700: #0E7490;
```

#### Place Status Colors

```css
/* Available */
--status-available: #22C55E;
--status-available-bg: #F0FDF4;

/* Reserved */
--status-reserved: #EF4444;
--status-reserved-bg: #FEF2F2;

/* Occupied */
--status-occupied: #F59E0B;
--status-occupied-bg: #FFFBEB;

/* Maintenance */
--status-maintenance: #6B7280;
--status-maintenance-bg: #F3F4F6;
```

### 2.2 Typography

#### Font Family

```css
/* Primary Font - Inter */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Monospace Font - JetBrains Mono (untuk code/numbers) */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Rationale**: Inter adalah sans-serif modern dengan excellent readability di berbagai ukuran layar. Variable font support untuk optimal performance.

#### Font Sizes

```css
/* Typography Scale (using 1.250 - Major Third) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
--text-7xl: 4.5rem;      /* 72px */
```

#### Font Weights

```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

#### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 2.3 Spacing System

```css
/* Spacing Scale (4px base) */
--spacing-0: 0px;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-7: 1.75rem;    /* 28px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
--spacing-32: 8rem;      /* 128px */
```

### 2.4 Border Radius

```css
--radius-none: 0px;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### 2.5 Shadows

```css
/* Elevation System */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

### 2.6 Animation & Transitions

#### Timing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

#### Common Transitions

```css
--transition-all: all var(--duration-150) var(--ease-out);
--transition-colors: color, background-color, border-color var(--duration-150) var(--ease-out);
--transition-transform: transform var(--duration-200) var(--ease-out);
--transition-opacity: opacity var(--duration-200) var(--ease-out);
```

#### Framer Motion Variants

```typescript
// Fade In
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

// Slide Up
export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3 }
};

// Scale
export const scale = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2 }
};

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

---

## 3. Component Library

### 3.1 Buttons

#### Primary Button

```tsx
<button className="
  px-6 py-3
  bg-primary-600 hover:bg-primary-700
  text-white font-medium
  rounded-lg
  shadow-sm hover:shadow-md
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Book Now
</button>
```

**Variants**:
- **Primary**: Blue background (CTA)
- **Secondary**: Gray background
- **Outline**: Border only
- **Ghost**: No background
- **Danger**: Red background (destructive actions)

**Sizes**:
- **sm**: px-3 py-1.5, text-sm
- **md**: px-4 py-2, text-base (default)
- **lg**: px-6 py-3, text-lg
- **xl**: px-8 py-4, text-xl

### 3.2 Input Fields

#### Text Input

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    className="
      w-full px-4 py-2
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-primary-500 focus:border-transparent
      transition-colors duration-200
      placeholder:text-gray-400
    "
    placeholder="you@example.com"
  />
  <p className="text-sm text-gray-500">
    We'll never share your email.
  </p>
</div>
```

**States**:
- **Default**: Gray border
- **Focus**: Primary ring
- **Error**: Red border + error message
- **Disabled**: Opacity 50% + cursor not-allowed
- **Success**: Green border (optional)

### 3.3 Cards

#### Product/Place Card

```tsx
<motion.div
  whileHover={{ y: -4 }}
  className="
    group
    bg-white rounded-xl
    shadow-md hover:shadow-xl
    transition-all duration-300
    overflow-hidden
  "
>
  {/* Image */}
  <div className="relative aspect-[4/3] overflow-hidden">
    <img
      src="/place-image.jpg"
      alt="Place name"
      className="
        w-full h-full object-cover
        group-hover:scale-105
        transition-transform duration-300
      "
    />
    {/* Status Badge */}
    <div className="absolute top-3 right-3">
      <span className="
        px-3 py-1
        bg-success-500 text-white
        text-xs font-medium
        rounded-full
        shadow-lg
      ">
        Available
      </span>
    </div>
  </div>

  {/* Content */}
  <div className="p-5 space-y-3">
    {/* Category */}
    <span className="text-sm text-primary-600 font-medium">
      VIP Room
    </span>

    {/* Title */}
    <h3 className="text-xl font-semibold text-gray-900">
      Meeting Room A
    </h3>

    {/* Description */}
    <p className="text-gray-600 line-clamp-2">
      Spacious meeting room with modern facilities
    </p>

    {/* Features */}
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
        <Icon name="users" size={14} />
        10 persons
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
        <Icon name="wifi" size={14} />
        WiFi
      </span>
    </div>

    {/* Price & CTA */}
    <div className="flex items-center justify-between pt-3 border-t">
      <div>
        <span className="text-2xl font-bold text-gray-900">
          Rp 100K
        </span>
        <span className="text-sm text-gray-500">
          /hour
        </span>
      </div>
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Book
      </button>
    </div>
  </div>
</motion.div>
```

### 3.4 Modals/Dialogs

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-lg
          bg-white rounded-2xl
          shadow-2xl
          z-50
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">
            Confirm Booking
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {children}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Confirm
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 3.5 Tables

```tsx
<div className="overflow-x-auto rounded-lg border border-gray-200">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Code
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Customer
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Amount
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          RSV-20260730-0001
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">John Doe</div>
            <div className="text-sm text-gray-500">john@example.com</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
            Confirmed
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
          Rp 150,000
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. Customer Interface Design

### 4.1 Landing Page

#### Hero Section

**Layout**:
- Full-width hero dengan gradient background
- Center-aligned content
- Large heading + subheading
- Prominent CTA button
- Background image dengan overlay

```tsx
<section className="relative min-h-screen flex items-center">
  {/* Background */}
  <div className="absolute inset-0 -z-10">
    <img
      src="/hero-bg.jpg"
      alt="Background"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-secondary-900/90" />
  </div>

  {/* Content */}
  <div className="container mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto text-center text-white"
    >
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        Book Your Perfect Space
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-gray-100">
        Find and reserve amazing places instantly. From coworking spaces to private rooms.
      </p>
      <button className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        Explore Places
      </button>
    </motion.div>
  </div>
</section>
```

#### Featured Places Section

**Layout**:
- Grid layout (3 columns desktop, 1 column mobile)
- Card-based design
- Hover effects
- Lazy loading images

```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Featured Places
      </h2>
      <p className="text-xl text-gray-600">
        Most popular spaces for your needs
      </p>
    </div>

    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </motion.div>
  </div>
</section>
```

### 4.2 Place Listing Page

#### Filter Sidebar

```tsx
<aside className="w-full lg:w-64 space-y-6">
  {/* Category Filter */}
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-4">
      Category
    </h3>
    <div className="space-y-2">
      {categories.map((cat) => (
        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-gray-700 group-hover:text-primary-600 transition-colors">
            {cat.name}
          </span>
          <span className="ml-auto text-sm text-gray-500">
            ({cat.count})
          </span>
        </label>
      ))}
    </div>
  </div>

  {/* Price Range */}
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-4">
      Price Range
    </h3>
    <div className="space-y-4">
      <input
        type="range"
        min="0"
        max="1000000"
        className="w-full"
      />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Rp 0</span>
        <span>Rp 1,000,000</span>
      </div>
    </div>
  </div>

  {/* Capacity */}
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-4">
      Capacity
    </h3>
    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
      <option>Any</option>
      <option>1-5 people</option>
      <option>6-10 people</option>
      <option>11+ people</option>
    </select>
  </div>

  {/* Facilities */}
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-4">
      Facilities
    </h3>
    <div className="space-y-2">
      {facilities.map((fac) => (
        <label key={fac} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-gray-700">{fac}</span>
        </label>
      ))}
    </div>
  </div>
</aside>
```

### 4.3 Place Detail Page

#### Image Gallery

```tsx
<div className="grid grid-cols-4 gap-4 h-[500px]">
  {/* Main Image */}
  <div className="col-span-3 row-span-2">
    <img
      src={images[selectedIndex]}
      alt="Place"
      className="w-full h-full object-cover rounded-2xl"
    />
  </div>

  {/* Thumbnails */}
  {images.slice(1, 5).map((img, idx) => (
    <div
      key={idx}
      className="cursor-pointer overflow-hidden rounded-xl"
      onClick={() => setSelectedIndex(idx + 1)}
    >
      <img
        src={img}
        alt={`Thumbnail ${idx + 1}`}
        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
  ))}
</div>
```

### 4.4 Booking Flow

#### Step Indicator

```tsx
<div className="flex items-center justify-between mb-12">
  {steps.map((step, idx) => (
    <React.Fragment key={step.id}>
      <div className="flex flex-col items-center">
        {/* Circle */}
        <div className={`
          w-12 h-12 rounded-full
          flex items-center justify-center
          font-semibold text-lg
          transition-all duration-300
          ${currentStep > idx
            ? 'bg-primary-600 text-white'
            : currentStep === idx
            ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-200'
            : 'bg-gray-200 text-gray-500'
          }
        `}>
          {currentStep > idx ? <Icon name="check" /> : idx + 1}
        </div>

        {/* Label */}
        <span className={`
          mt-2 text-sm font-medium
          ${currentStep >= idx ? 'text-gray-900' : 'text-gray-500'}
        `}>
          {step.label}
        </span>
      </div>

      {/* Connector Line */}
      {idx < steps.length - 1 && (
        <div className={`
          flex-1 h-1 mx-4
          transition-colors duration-300
          ${currentStep > idx ? 'bg-primary-600' : 'bg-gray-200'}
        `} />
      )}
    </React.Fragment>
  ))}
</div>
```

### 4.5 Payment Selection

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {paymentMethods.map((method) => (
    <label
      key={method.id}
      className={`
        relative flex items-center gap-4
        p-5 border-2 rounded-xl
        cursor-pointer
        transition-all duration-200
        ${selected === method.id
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <input
        type="radio"
        name="payment"
        value={method.id}
        className="sr-only"
      />

      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
        <img src={method.icon} alt={method.name} className="w-8 h-8" />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="font-semibold text-gray-900">
          {method.name}
        </div>
        <div className="text-sm text-gray-600">
          {method.description}
        </div>
      </div>

      {/* Checkmark */}
      {selected === method.id && (
        <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center">
          <Icon name="check" size={16} />
        </div>
      )}
    </label>
  ))}
</div>
```

---

## 5. Admin Dashboard Design

### 5.1 Dashboard Layout

#### Sidebar Navigation

```tsx
<aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
  {/* Logo */}
  <div className="p-6 border-b">
    <img src="/logo.svg" alt="Logo" className="h-8" />
  </div>

  {/* Navigation */}
  <nav className="p-4 space-y-1">
    {menuItems.map((item) => (
      <Link
        key={item.path}
        href={item.path}
        className={`
          flex items-center gap-3
          px-4 py-3 rounded-lg
          font-medium
          transition-colors duration-200
          ${isActive(item.path)
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <Icon name={item.icon} size={20} />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    ))}
  </nav>

  {/* User Profile */}
  <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
      <img
        src="/avatar.jpg"
        alt="User"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          John Doe
        </div>
        <div className="text-xs text-gray-500">
          Admin
        </div>
      </div>
      <Icon name="settings" size={18} className="text-gray-400" />
    </div>
  </div>
</aside>
```

---

## 6. Summary

Design system ini menyediakan foundation lengkap untuk implementasi aplikasi Web Kasir + Reservasi Tempat dengan:

✅ **Comprehensive Design Tokens**: Colors, typography, spacing yang consistent  
✅ **Reusable Components**: Button, inputs, cards, modals, tables  
✅ **Customer Interface**: Landing page, place listing, booking flow, payment  
✅ **Admin Dashboard**: Sidebar navigation dan layout structure  
✅ **Mobile Responsive**: Mobile-first approach dengan breakpoints defined  
✅ **Accessibility**: WCAG 2.1 AA compliance guidelines  
✅ **Animations**: Framer Motion specifications untuk smooth UX  
✅ **Performance**: Optimized untuk fast loading dan smooth interactions

**Design Reference**:
- **Inspiration**: Modern SaaS dashboards (Linear, Vercel, Stripe)
- **Component Library**: Shadcn/ui + custom components
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS

**Implementation Notes**:
- Use Next.js Image component untuk optimized images
- Implement lazy loading untuk below-fold content
- Code split by route untuk better performance
- Use CSS containment where applicable
- Maintain consistency dengan design tokens

**Ready for Development**: Design specifications complete dan siap untuk diimplementasikan dengan Next.js 15, TypeScript, dan Tailwind CSS.

---

**Document Version**: 1.0  
**Last Updated**: 30 Juli 2026  
**Status**: Ready for Implementation  
**Design System**: Complete
