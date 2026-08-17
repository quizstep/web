# QuizStep 🎓

QuizStep is a modern, responsive web application designed for students preparing for competitive entrance examinations (**JEE**, **NEET**, **KEAM**, and **CUET**). Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

---

## 🚀 Features

- **🎯 Exam Hubs**: Dedicated portals for JEE, NEET, KEAM, and CUET with subject-specific resources and practice materials.
- **🔐 Secure Authentication**: Full email and password authentication powered by Supabase Auth (`@supabase/ssr`).
- **🛡️ Password Strength & Security**: Real-time password evaluation and common/compromised password blocklist checking.
- **⚡ Automated Profiles**: Database triggers automatically generate user profiles upon sign-up and protect against unauthorized role escalation.
- **🔒 Hardened RLS**: Strict Row-Level Security (RLS) policies ensuring students can only access and update their own data.
- **🌓 Theme Toggle**: Built-in Light and Dark mode with persistent user preference.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Row Level Security)
- **Icons & Assets**: Custom SVG & modern iconography

---

## 📂 Project Structure

```text
quizstep/
├── database/                   # Supabase SQL scripts
│   ├── schema/                 # Table definitions (001-009)
│   ├── functions/              # Triggers & database functions
│   └── policies/               # Row-Level Security (RLS) policies
│
├── public/                     # Static assets (favicons, logos, images)
│
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── cuet/               # CUET portal
│   │   ├── jee/                # JEE portal
│   │   ├── keam/               # KEAM portal
│   │   ├── neet/               # NEET portal
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── layout.tsx          # Root layout with Header, Footer, and Theme
│   │   ├── not-found.tsx       # Custom 404 page
│   │   └── page.tsx            # Landing / Home page
│   │
│   ├── components/
│   │   ├── auth/               # LoginForm, RegisterForm, PasswordInput, etc.
│   │   ├── exams/              # ExamCard, SubjectSelector, MaterialItem
│   │   ├── layout/             # Navbar, Footer, ThemeToggle
│   │   └── ui/                 # Reusable UI primitives (Button, Input, Alert)
│   │
│   ├── hooks/                  # Custom React hooks (useAuth, useTheme)
│   ├── lib/
│   │   ├── services/           # authService, examService
│   │   ├── supabase/           # Supabase client & server instances
│   │   └── utils/              # Validation & helper utilities
│   │
│   └── types/                  # TypeScript interface definitions
│       ├── auth.ts
│       ├── database.ts
│       └── exam.ts
│
├── .env.example                # Example environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/quizstepwebsitedev/website1.git
cd website1

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup (Supabase)

Execute the SQL scripts in your Supabase SQL Editor in the following order:

1. **Schema tables** (`database/schema/*.sql`):
   - `001_entrance_exams.sql`
   - `002_subjects.sql`
   - `003_chapters.sql`
   - `004_chapter_resources.sql`
   - `005_mcq_engine.sql`
   - `006_question_videos.sql`
   - `007_reports_feedback.sql`
   - `008_profiles.sql`
   - `009_user_sessions.sql`
2. **Functions & Triggers** (`database/functions/*.sql`):
   - `001_handle_new_user.sql` (Auto-creates profile on signup)
   - `002_profiles_triggers.sql` (Timestamp auto-updates & role protection)
3. **RLS Policies** (`database/policies/*.sql`):
   - `001_rls_profiles.sql`
   - `002_rls_mcq.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Compiles the production bundle and runs type checking |
| `npm run start` | Runs the compiled production application |
| `npm run lint` | Runs ESLint to check for code quality and style issues |

---

## 🔒 Security Best Practices

- **Never commit `.env` or `.env.local`** to source control.
- All Supabase table access is protected by **Row Level Security (RLS)**.
- User role changes (`role = 'admin'`) can only be executed by service roles and are blocked from client-side manipulation.
