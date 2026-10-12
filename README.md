# Up

A collaborative task and workspace app (ClickUp-style) with real-time sync, lists, chat, and AI agents. Built with Next.js, Convex, and WorkOS auth.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Convex](https://convex.dev) account
- [WorkOS](https://workos.com) account (for auth)

## Setup

1. **Install dependencies**

   ```bash
   npm i
   ```

2. **Add environment variables**

   Create a `.env.local` in the project root and set:

   | Variable | Scope | Description |
   |----------|--------|-------------|
   | `NEXT_PUBLIC_APP_URL` | Client | App URL (e.g. `http://localhost:3000`) |
   | `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Client | WorkOS redirect URI (e.g. `http://localhost:3000/callback`) |
   | `WORKOS_API_KEY` | Server | WorkOS API key |
   | `WORKOS_CLIENT_ID` | Server | WorkOS Client ID |
   | `WORKOS_COOKIE_PASSWORD` | Server | Min 32-character secret for cookie encryption |

   You can copy `.env.example` and fill in the values.

3. **Start Convex**

   In a separate terminal, run:

   ```bash
   npx convex dev
   ```

   Set these environment variables for your Convex deployment (in the [Convex dashboard](https://dashboard.convex.dev) or via the CLI):

   | Variable | Description |
   |----------|-------------|
   | `GROQ_API_KEY` | Groq API key (for AI) |
   | `WORKOS_API_KEY` | WorkOS API key |
   | `WORKOS_CLIENT_ID` | WorkOS Client ID |

   To add them via the CLI, run (replace `NAME` and `value` for each variable):

   ```bash
   npx convex env set NAME value
   ```

   Example: `npx convex env set GROQ_API_KEY your-key-here`

   - First time: sign in to Convex (browser) and create or link a project.
   - The CLI will sync your `convex/` functions and keep running; leave this terminal open.
   - Convex may write vars (e.g. `CONVEX_DEPLOYMENT`) to `.env.local` for you.

4. **Start the app**

   In another terminal:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — build for production
- `npm run start` — run production build

## Tech stack

Next.js, Convex, WorkOS, tRPC, React Query, Tailwind CSS, Radix UI.
