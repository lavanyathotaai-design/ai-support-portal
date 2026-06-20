# 🤖 AI Support Ticket Portal

A full-stack AI-powered Support Ticket Portal built using Next.js, TypeScript, Prisma, PostgreSQL, NextAuth, and Vercel.

## 🚀 Live Demo

- **Application:** https://project-nr996.vercel.app/
- **Dashboard:** https://project-nr996.vercel.app/dashboard

## ✨ Features

- 🔐 Secure Login with NextAuth
- 🎫 Create, View & Update Support Tickets
- 🧠 AI-Generated Response Suggestions (Google Gemini)
- 💬 Human Reply / Support Conversation Thread
- 🔍 Search Tickets
- 📂 Filter Tickets by Status
- 📊 Dashboard Overview with Clickable Metrics
- 🗄️ PostgreSQL Database (Neon)
- 🔄 REST API Integration
- ☁️ Deployed on Vercel

## 🛠️ Tech Stack

- Next.js 16
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth
- Tailwind CSS
- Google Gemini API
- Vercel

## 👤 Demo Login

Email:    admin@supportdesk.com
Password: Admin@123

## ⚙️ Run Locally

```bash
git clone https://github.com/lavanyathotaai-design/ai-support-portal.git
cd ai-support-portal
npm install
```

Set up your environment variables:

```bash
cp .env.example .env
```

Then fill in `.env` with your own values:
- `DATABASE_URL` — your PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NEXTAUTH_URL` — `http://localhost:3000`
- `GEMINI_API_KEY` — get one free at https://aistudio.google.com/apikey

Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

Start the app:

```bash
npm run dev
```

Open: http://localhost:3000

## 📚 Skills Demonstrated

- Full-Stack Development
- Authentication & Authorization
- Database Design with Prisma
- REST API Development
- CRUD Operations
- AI API Integration
- Environment Variable Management
- Cloud Database Integration
- Production Deployment on Vercel

## 👩‍💻 Author

Lavanya Thota