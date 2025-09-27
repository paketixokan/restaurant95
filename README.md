# Restaurant95 - AI-Native Restaurant Operating System
Restaurant 95 is a next-generation operating system for restaurant technology, aiming to be as disruptive for the food industry as Windows 95 was for personal computing. It unifies order management, courier orchestration, and customer engagement into one AI-native platform.

## 🚀 Mission
Türkiye'nin ilk AI-native restoran işletim sistemi. Paketix altyapısı üzerine inşa edilmiş.

## 🏗️ Tech Stack
- Backend: Node.js 20+, Fastify, PostgreSQL, Prisma
- Frontend: Next.js 15, Tailwind CSS
- AI: OpenAI GPT-4, Claude, Function Calling
- Turkish: ÖKC, E-Fatura, WhatsApp Business

## 📦 Project Structure

restaurant95/
├── apps/
│   ├── api/          # Fastify backend
│   ├── dashboard/    # Next.js restaurant dashboard
│   └── customer/     # Customer facing app
├── packages/
│   ├── database/     # Prisma schemas
│   ├── ai-bridge/    # AI function calling layer
│   └── turkish-kit/  # ÖKC, e-fatura utilities
└── docs/
    └── architecture/

## 🔥 Quick Start

npm install
npm run dev

## 📝 Documentation
- [Architecture](./docs/ARCHITECTURE.md)
- [AI Integration](./docs/AI_INTEGRATION.md)
- [Turkish Compliance](./docs/TURKISH_COMPLIANCE.md)
