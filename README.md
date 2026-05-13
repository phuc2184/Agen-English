# Agen-English: AI-Powered Language Learning Platform

Agen-English is a modern, gamified English learning platform that leverages AI for pronunciation assessment, spaced repetition for vocabulary mastery, and a premium mobile-first user experience.

## 🚀 Features

- **AI Pronunciation Feedback**: Real-time scoring of pronunciation and fluency using Azure Speech SDK and custom scoring algorithms.
- **Spaced Repetition System (SRS)**: Optimized learning using the SM-2 algorithm to ensure long-term retention of vocabulary.
- **Gamified Experience**: Earn XP, maintain streaks, and climb the leaderboard as you learn.
- **Multimedia Lessons**: Interactive lessons with integrated audio and visual aids.
- **Premium Design**: A "Mint-Dark" aesthetic with a consistent 24px corner radius for a modern look and feel.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules)
- **Icons**: FontAwesome

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth
- **AI Services**: Azure Speech SDK, OpenAI API

## 📦 Project Structure

### Backend
- `src/modules`: Feature-specific modules (Auth, Lesson, Vocab, etc.)
- `src/common`: Shared services (Prisma, SM-2 logic) and utilities.
- `src/config`: Centralized environment configuration.

### Frontend
- `src/app`: Next.js pages and layouts.
- `src/components/common`: Atomic UI components (Buttons, Inputs).
- `src/components/layout`: Global layout components (Header, Nav).
- `src/components/features`: Feature-specific UI components.
- `src/services`: API integration layers.

## 🛠 Local Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Azure Speech SDK Key (optional for AI features)
- OpenAI API Key (optional for AI features)

### Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file from `.env.example`.
3. Run `npm install`.
4. Start the database using `docker-compose up -d` (if using local docker) or ensure your `DATABASE_URL` is correct.
5. Run `npx prisma migrate dev` to initialize the database.
6. Start the server: `npm run dev`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Create a `.env` file from `.env.example`.
3. Run `npm install`.
4. Start the development server: `npm run dev`.

## 🚢 Deployment

- **Frontend**: Optimized for Vercel (see `vercel.json`).
- **Backend**: Dockerized for production (see `Dockerfile`).

---
Developed by **Antigravity** for **Agen-English**.
