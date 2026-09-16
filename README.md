# Kasir - POS & Reservation System

Modern Point of Sale and Place Reservation System built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Overview

Kasir is a comprehensive web application designed for businesses such as restaurants, cafes, billiard halls, karaoke venues, coworking spaces, and entertainment venues. The system provides both customer-facing reservation features and admin/cashier management tools.

## 🏗️ Architecture

### Frontend
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/ui** - Reusable UI components

### Backend
- **Next.js Server Actions** - Server-side logic
- **Next.js Route Handlers** - API endpoints
- **Supabase** - Backend-as-a-Service

### Database
- **Supabase PostgreSQL** - Relational database with Row Level Security

### Authentication
- **Supabase Auth** - User authentication and authorization

### Storage
- **Supabase Storage** - File and image storage

### Realtime
- **Supabase Realtime** - Live updates for place availability

### Payment Gateway
- **Midtrans** - Indonesian payment gateway
  - QRIS support
  - Virtual Account
  - E-wallet integration
  - Bank transfer

## 📋 Features

### Customer Features
- Browse available places with real-time status
- Make reservations with date/time selection
- Online payment via multiple methods
- Cash payment option at venue
- Reservation history and management

### Admin/Kasir Features
- Dashboard with analytics
- Place management
- Product/menu management
- POS (Point of Sale) system
- Payment processing
- Reservation management
- Reports and analytics

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
│   ├── (customer)/          # Customer-facing pages
│   ├── admin/               # Admin dashboard
│   ├── kasir/               # Cashier interface
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Shadcn/ui components
│   ├── customer/            # Customer components
│   ├── admin/               # Admin components
│   └── kasir/               # Cashier components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
│   └── database.types.ts   # Database types
├── docs/                    # Documentation
│   ├── database-schema.md  # Database schema
│   ├── PRD.md              # Product requirements
│   └── design.md           # Design system
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware
├── tailwind.config.ts       # Tailwind configuration
├── next.config.ts           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- **[Database Schema](docs/database-schema.md)** - Complete database design
- **[Product Requirements](docs/PRD.md)** - Feature specifications and user flows
- **[Design System](docs/design.md)** - UI/UX guidelines and component architecture

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