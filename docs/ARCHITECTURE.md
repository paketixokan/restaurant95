# Restaurant95 Architecture

## Core Principles
1. AI-First: Every feature starts with AI
2. Function Bridge Pattern: AI to Real World
3. Turkish Compliance: OKC, E-Fatura built-in
4. Opinionated: Best practices, no customization

## System Design

### AI Function Bridge
Every AI decision follows dry-run pattern with approval workflow

### Database Schema
- Multi-tenant with restaurant_id
- Audit logs for every AI decision
- TimescaleDB for analytics
- Redis for caching

### Integration Points
1. Adisyo POS
2. Yemeksepeti and Getir Delivery
3. OKC Fiscal
4. WhatsApp Business Orders
5. Paketix Courier
