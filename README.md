# Digital Menu Management System

A full-stack application for restaurant owners to manage digital menus and for customers to view them via shared links. Built with the T3 Stack (Next.js, TypeScript, tRPC, Tailwind CSS, Prisma), deployed on Vercel, and using PostgreSQL on Neon.

## Live Demo
- Deployed App: [https://restaurant-menu-management.vercel.app](https://restaurant-menu-management.vercel.app)


## Quick Start
1. Clone the repo: `git clone https://github.com/vimalsaraswat/menu-management-system.git`
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`):
   - Database: Neon PostgreSQL URL
   - SMTP: For email verification (e.g., Resend or Gmail)
   - Redis: For OTP storage
   - JWT_SECRET: For authentication
4. Run migrations: `npm run db:migrate`
5. Start dev server: `npm run dev`
6. Access at `http://localhost:3000`

## Features
- **User Auth**: Email-based registration/login with OTP verification (no passwords).
- **Admin Dashboard**: Create/manage multiple restaurants, categories, and dishes (with multi-category support).
- **Public Menu**: View-only interface for customers with fixed category headers and floating navigation.
- **Responsive UI**: Built with shadcn/ui components and Tailwind CSS.
- **Error Handling**: TRPC errors, form validation with Zod, and user feedback via toasts.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: Custom JWT + OTP (Redis for storage, Nodemailer for emails)
- **Deployment**: Vercel
- **Other**: Superjson for data transformation, Sonner for toasts

## File Structure
```
src/
├── app/                 # Next.js pages and layouts
├── components/          # UI components (auth, menu, dashboard)
├── lib/                 # Utilities (JWT, Redis, Mail)
├── server/              # API routers (tRPC), actions, DB
└── trpc/                # tRPC setup and hooks
```

## Approach to Solving the Problem
I started by initializing the T3 Stack via `create-t3-app` (skipping NextAuth as instructed). I designed the Prisma schema with relations: User → Restaurant → Category → Dish (many-to-many via DishCategory for multi-category dishes).

For auth, I implemented custom OTP-based flow using Redis for temporary storage and Nodemailer for emails. tRPC routers handle CRUD for restaurants, categories, and dishes with ownership checks (e.g., only the owner can edit their data). The public menu uses server-side rendering for SEO/performance.

UI follows shadcn/ui patterns: Forms with React Hook Form + Zod, and sticky/floating elements for the menu view. I prioritized type safety with TypeScript and end-to-end validation. Testing involved manual edge-case simulations in dev mode.

The project emphasizes modularity: Separate routers for each domain, shared utils, and clean separation of server/client code.

## IDE Used
Zed (a modern code editor designed for speed and collaboration).
