#!/bin/bash

echo "Setting up Restaurant95 project structure..."

# Create directories
mkdir -p docs
mkdir -p apps/api
mkdir -p apps/dashboard
mkdir -p apps/customer
mkdir -p packages/database
mkdir -p packages/ai-bridge
mkdir -p packages/turkish-kit

# Create package.json
echo '{
  "name": "restaurant95",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.3.3"
  }
}' > package.json

# Create turbo.json
echo '{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false
    }
  }
}' > turbo.json

# Create .gitignore
echo 'node_modules
.env.local
.env
dist
.next
.turbo
*.log' > .gitignore

# Create .env.example
echo '# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant95"
REDIS_URL="redis://localhost:6379"

# AI
OPENAI_API_KEY=""
CLAUDE_API_KEY=""

# Turkish Services
OKC_API_URL=""
OKC_USERNAME=""
OKC_PASSWORD=""

# WhatsApp
WHATSAPP_BUSINESS_TOKEN=""

# Paketix
PAKETIX_API_KEY=""' > .env.example

echo "✅ Setup complete!"
