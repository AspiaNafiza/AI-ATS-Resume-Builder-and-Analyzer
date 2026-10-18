# ATS Pro Suite 📄

> **Modern, Privacy-First, ATS-Friendly AI Resume, CV & Cover Letter Suite**  
> Built with **TanStack Start (SSR)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Google Gemini AI**, and **Clerk Auth**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?logo=react-query)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/Maintained%20with-pnpm-orange?logo=pnpm)](https://pnpm.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://aistudio.google.com/)

---

## 🌟 Overview

**ATS Pro Suite** is an intelligent, privacy-first career toolkit designed specifically for job seekers. It eliminates the headaches of applicant tracking systems (ATS) by generating human-crafted, cleanly formatted, and keyword-optimized job application documents—without robotic buzzwords or detectable "AI-style" designs.

Whether applying for corporate positions or academic appointments, ATS Pro Suite provides the exact document structure, typography, and content alignment hiring teams and automated parsing bots look for.

---

## 🎯 Key Features

### 1. 📄 ATS Resume Builder

- **Clean, Parser-Safe Layouts**: Strict single/multi-column layouts free from unparseable tables, graphical columns, or complex SVG icons.
- **Smart Sections**: Dedicated editors for Professional Summary, Skills, Work Experience, Education, Certifications, and Custom Projects/Extra.
- **Action-Oriented Bullet Points**: Emphasizes measurable achievements, numbers, and active verbs.
- **One-Click PDF & Text Export**: Generates pixel-perfect PDFs with optimal ATS margins and typography.

### 2. 🎓 ATS CV Builder (Academic & Professional)

- **Integrated Cover Letter on Page 1**: The cover letter is seamlessly included as part of your CV. In PDF export, it renders on **Page 1**, followed by an automatic page break and the full CV body.
- **Standard Hiring Manager Format**: Features a proven, professional letter template:
  ```text
  [Your Full Name]
  [City, State ZIP] | [Phone] | [Email] | [LinkedIn URL]

  [Month Day, Year]

  Dear [Hiring Manager's name, or "Hiring Team"],
  ...
  Sincerely,
  [Your Full Name]
  ```
- **References Section**: Support for professors, PhD advisors, department heads, and managers with contact details, institutional affiliations, and relationships.
- **Enclosures & Attachments**: Mention accompanying documents (Academic Transcripts, Letters of Recommendation, Degree Certificates, Portfolios) directly on your application.

### 3. ✉️ Standalone Cover Letter Builder

- Creates concise 3–4 paragraph letters tailored specifically to target job descriptions.
- Highlights your hardest requirement qualifications and past impact.
- Includes attachments and enclosure listings.

### 4. 🔍 ATS Document Analyzer & Auditor

- **Instant ATS Scoring (0–100)**: Evaluates formatting, readability, keyword density, section headers, and bullet strength.
- **Keyword & Skill Matching**: Side-by-side comparison of keywords and skills found vs. missing against target job descriptions.
- **Experience Relevance Critique**: Highlights strong accomplishment statements and flags weak or generic phrasing.
- **Actionable Recommendations**: Clear, bulleted suggestions to maximize your interview callback rate.

### 5. 🔒 Privacy-First Architecture

- **Server-Side PDF Parsing**: Uploaded PDF documents are parsed and analyzed directly on the server through secure gateway endpoints. Document content never touches client-side storage or insecure browser memory.
- **Environment-Controlled API Keys**: All AI provider keys are kept securely on the server via `.env.local`.

---

## 🛠️ Tech Stack

| Layer               | Technology                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- |
| **Framework**       | [TanStack Start](https://tanstack.com/start) (Full-Stack React SSR + Nitro engine)    |
| **Language**        | [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)                   |
| **Frontend**        | [React 19](https://react.dev/) + [TanStack Router](https://tanstack.com/router)       |
| **Data Fetching**   | [TanStack Query](https://tanstack.com/query)                                          |
| **Styling**         | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)   |
| **Icons**           | [Lucide React](https://lucide.dev/)                                                   |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.5-flash`, with lite fallbacks) |
| **Authentication**  | [Clerk](https://clerk.com/) (`@clerk/tanstack-react-start`)                           |
| **Database**        | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)               |
| **PDF Generation**  | [jsPDF](https://github.com/parallax/jsPDF)                                            |
| **Package Manager** | [pnpm](https://pnpm.io/)                                                              |

---

## 🚀 Getting Started with pnpm

### Prerequisites

Ensure you have installed:

1. **Node.js**: `v18.0.0` or higher (recommended: `v20+` or `v22+`)
2. **pnpm**: `v9.0.0` or higher

To install or enable `pnpm`:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

_(Or install globally via `npm install -g pnpm`)_

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/SYAAGalib/ats-pro-suite.git
cd ats-pro-suite
```

---

### Step 2: Install Dependencies

Use `pnpm` to install all project dependencies:

```bash
pnpm install
```

---

### Step 3: Configure Environment Variables

Copy the example environment configuration file to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and add your API credentials:

```ini
# ── Clerk Authentication ────────────────────────
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# ── Google Gemini AI ────────────────────────────
# Get your free API key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: override default model (defaults to gemini-3.5-flash)
# GEMINI_MODEL=gemini-3.5-flash
```

> [!IMPORTANT]
> Never commit `.env.local` to git. It is automatically ignored in `.gitignore`.

---

### Step 4: Run the Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

The application will be available at:

```
http://localhost:8080
```

---

### Step 5: Production Build & Preview

To create an optimized production bundle:

```bash
# Build client and server bundles
pnpm build

# Preview the production build locally
pnpm preview
```

---

## 📜 Available Scripts

| Command            | Action                                                   |
| ------------------ | -------------------------------------------------------- |
| `pnpm dev`         | Starts the Vite dev server with SSR support on port 8080 |
| `pnpm build`       | Compiles and builds the production application           |
| `pnpm preview`     | Serves the production build locally for verification     |
| `pnpm lint`        | Runs ESLint across the codebase                          |
| `pnpm format`      | Formats all code files using Prettier                    |
| `npx tsc --noEmit` | Performs strict TypeScript type checks across all files  |

---

## 📂 Project Structure

```text
ats-pro-suite/
├── data/                       # Local SQLite database (ats.db)
├── public/                     # Static assets (favicon.png, robots.txt)
├── src/
│   ├── components/             # Reusable UI components & shadcn primitives
│   │   ├── app/                # DocumentEditor, DocumentPreview, SiteHeader, etc.
│   │   └── ui/                 # Radix UI wrapper components (buttons, dialogs, inputs)
│   ├── lib/
│   │   ├── ai-gateway.server.ts # Server-side Google Gemini integration & fallback
│   │   ├── arie.functions.ts   # AI Document Intelligence Engine rules & prompts
│   │   ├── db.server.ts        # SQLite document persistence & draft management
│   │   ├── demo-docs.ts        # Built-in demo resumes, CVs, and cover letters
│   │   ├── pdf-export.ts       # jsPDF export with pagination & ATS styles
│   │   └── schemas.ts          # Zod validation & JSON schemas for AI responses
│   ├── routes/                 # TanStack file-based router pages
│   │   ├── __root.tsx          # Root shell layout with Clerk & Query providers
│   │   ├── index.tsx           # Home landing page
│   │   ├── builder.index.tsx   # Builder dashboard & document selector
│   │   ├── builder.$type.tsx   # Live builder (/builder/resume, /builder/cv, /builder/cover-letter)
│   │   ├── analyzer.index.tsx  # Analyzer selector & upload page
│   │   ├── analyzer.$type.tsx  # Live ATS document auditor & report view
│   │   └── sign-in.$.tsx       # Clerk sign-in route
│   └── styles.css              # Tailwind CSS styling and theme definitions
├── .env.example                # Template for environment variables
├── package.json                # Project dependencies and script declarations
├── pnpm-lock.yaml              # Deterministic pnpm dependency lockfile
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🛡️ Architecture & Rules

- **Durable Document Drafts**: Builder drafts use structured schema objects for experience, education, certifications, references, and attachments. Legacy drafts are gracefully normalized on load.
- **Privacy Assurance**: Documents and resumes uploaded to the Analyzer are parsed directly on the server and never exposed in client-side code or browser storage.
- **ATS Compliance**: All exported PDFs adhere strictly to ATS guidelines—standard fonts (Helvetica), standard section names, proper hierarchy, and linear text flow without nested tables or multi-column barriers.

---

---
