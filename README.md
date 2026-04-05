# HotelFinder - VerifiedStay Nepal

A modern, full-stack hotel booking and management platform for Nepal. Built with React, TypeScript, Supabase, and Tailwind CSS.

![HotelFinder Screenshot](https://hotel-finder-red.vercel.app/og-image.png)

## Live Demo

- **Production**: https://hotel-finder-red.vercel.app

## Features

### For Travelers
- **Search & Filter**: Find hotels by location, price range, amenities, and ratings
- **Interactive Map**: View hotels on an interactive Leaflet map
- **Booking System**: Book rooms with date selection and guest management
- **Reviews & Ratings**: Read and write hotel reviews
- **User Dashboard**: Manage bookings and profile

### For Hotel Owners
- **Hotel Registration**: Register and list your property
- **Management Dashboard**: Manage rooms, pricing, and availability
- **Booking Management**: View and manage guest bookings

### For Admins
- **Admin Dashboard**: Manage all hotels, users, and bookings
- **Verification System**: Verify hotel listings
- **Analytics**: View platform statistics

### Authentication
- **Email/Password**: Traditional authentication with email verification
- **Google OAuth**: One-click sign-in with Google
- **Role-based Access**: User, Hotel Owner, and Admin roles

## Technology Stack

### Frontend
- **React 18.3** - UI library with hooks and functional components
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **React Router 6.30** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library built on Radix UI

### UI Components (shadcn/ui + Radix)
- **@radix-ui/*** - Headless UI primitives (40+ components)
- **lucide-react** - Beautiful icon library
- **class-variance-authority** - Component variant management
- **clsx + tailwind-merge** - Conditional class merging
- **embla-carousel-react** - Touch carousel slider
- **vaul** - Drawer component for mobile
- **cmdk** - Command palette component
- **react-day-picker** - Date picker component

### State Management & Data
- **TanStack Query 5.83** - Server state management and caching
- **React Hook Form 7.61** - Form handling with validation
- **Zod 3.25** - Schema validation library
- **@hookform/resolvers** - Form validation resolvers

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email/password + OAuth)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for images

### Maps & Location
- **Leaflet 1.9** - Open-source JavaScript map library
- **react-leaflet 4.2** - React components for Leaflet

### Charts & Visualizations
- **Recharts 2.15** - React charting library for analytics

### Testing
- **Vitest 3.2** - Fast unit testing framework
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM assertions
- **Playwright 1.57** - End-to-end testing
- **jsdom** - Browser environment for tests

### Developer Experience
- **ESLint 9.32** - Linting with TypeScript support
- **TypeScript ESLint** - TypeScript-specific lint rules
- **@types/*** - Type definitions for dependencies

## Project Architecture

```
HotelFinder/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx  # Authentication state
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   │   ├── supabase.ts      # Supabase client & DB helpers
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Home page
│   │   ├── Search.tsx       # Hotel search
│   │   ├── HotelDetail.tsx  # Hotel details
│   │   ├── Booking.tsx      # Booking page
│   │   ├── Login.tsx        # Login page
│   │   ├── Signup.tsx       # Signup page
│   │   ├── AuthCallback.tsx # OAuth callback handler
│   │   ├── MyBookings.tsx   # User bookings
│   │   ├── MyHotels.tsx     # Hotel owner dashboard
│   │   ├── RegisterHotel.tsx # Hotel registration
│   │   └── AdminDashboard.tsx # Admin panel
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── supabase/                # SQL migrations & scripts
│   ├── fix-permissions.sql
│   ├── update-schema.sql
│   └── *.sql
└── config files
```

## Database Schema

### Tables
- **users** - User profiles with roles (user, hotel_owner, admin)
- **hotels** - Hotel listings with details, location, amenities
- **rooms** - Room types and availability per hotel
- **bookings** - User bookings with dates and status
- **reviews** - User reviews and ratings for hotels
- **amenities** - Hotel amenities reference table

### Key Features
- **Row Level Security (RLS)** - Secure data access policies
- **Triggers** - Auto-update timestamps and computed fields
- **Foreign Keys** - Data integrity between tables
- **Indexes** - Optimized queries for search performance

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahul-gc/Hotel-Finder.git
   cd Hotel-Finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL migrations in `/supabase/` folder
   - Configure authentication providers (Email, Google OAuth)
   - Set up storage bucket for hotel images
   - Configure RLS policies

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   App will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
# or
bun run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes |

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
- Includes `netlify.toml` configuration
- Set build command: `npm run build`
- Set publish directory: `dist`

### Docker
```bash
docker build -t hotel-finder .
docker run -p 80:80 hotel-finder
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized JavaScript origins:
   - `https://hotel-finder-red.vercel.app`
   - `http://localhost:8080` (for development)
4. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID/Secret to Supabase Auth settings

## Testing

```bash
# Unit tests
npm run test

# E2E tests with Playwright
npx playwright test

# Test in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [Supabase](https://supabase.com/) - Open-source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Leaflet](https://leafletjs.com/) - Interactive maps library
