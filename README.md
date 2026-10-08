# Kasir Pro - POS System

Modern Point of Sale System built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Overview

Kasir Pro is a comprehensive web application designed for retail businesses such as stores, warungs, cafes, and restaurants. The system provides POS features for transaction management, payment processing, and business analytics.

## 🏗️ Architecture

### Frontend
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend
- **Next.js Server Actions** - Server-side logic
- **Next.js Route Handlers** - API endpoints
- **Supabase** - Backend-as-a-Service

### Database
- **Supabase PostgreSQL** - Relational database with Row Level Security

### Authentication
- **Supabase Auth** - User authentication and authorization

### Payment Gateway
- **Midtrans** - Indonesian payment gateway
  - QRIS support
  - Virtual Account
  - E-wallet integration
  - Bank transfer

## 📋 Features

### Customer Features
- Browse available products
- Make purchases via POS
- Online payment via multiple methods
- Cash payment option
- Payment history

### Admin/Kasir Features
- Dashboard with analytics
- Product management
- POS (Point of Sale) system
- Payment processing
- Reports and analytics
- User management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Midtrans account (for payment integration)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd kasir
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Setup Supabase database
- Follow the database schema in `/docs/database-schema.md`
- Run SQL migrations in Supabase dashboard

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
kasir/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Admin dashboard
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── dashboard/           # Dashboard components
│   └── pos/                 # POS components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase clients
│   ├── auth/               # Auth actions
│   ├── dashboard/          # Dashboard queries
│   ├── orders/             # Order actions
│   ├── products/           # Product actions
│   ├── reports/            # Report queries
│   ├── users/              # User actions
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
│   └── database.types.ts   # Database types
├── docs/                    # Documentation
│   ├── PRD_POS.md          # Product requirements (POS-only)
│   ├── design.md           # Design system
│   └── PROJECT-SETUP.md    # Setup guide
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
├── next.config.ts           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- **[Product Requirements](docs/PRD_POS.md)** - Feature specifications and user flows
- **[Design System](docs/design.md)** - UI/UX guidelines and component architecture
- **[Setup Guide](docs/PROJECT-SETUP.md)** - How to setup the project

## 🔒 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Secure authentication with Supabase Auth
- Middleware protection for admin/kasir routes
- Input validation and sanitization
- Webhook signature verification for payment gateway

## 🛠️ Tech Stack Details

### Dependencies
- `next` - React framework
- `react` & `react-dom` - React library
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `framer-motion` - Animation library
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Supabase SSR helpers
- `lucide-react` - Icon library
- `clsx` & `tailwind-merge` - Utility functions

## 📈 Performance Optimizations

- Server Components for better performance
- Image optimization with Next.js Image
- Database indexing on frequently queried fields
- Caching strategies for static content
- Lazy loading for heavy components

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the development team.

## 📝 License

Private and Confidential

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Midtrans Documentation](https://docs.midtrans.com/)