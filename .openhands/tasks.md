# Restaurant95 - OpenHands Tasks

## Current State
- Fastify API running on port 3001
- Adisyo webhook receives orders
- Mock AI service assigns couriers
- In-memory database

## Priority Tasks

### Task 1: Paketix Integration
Create real Paketix courier integration:
- OutSystems REST API wrapper
- Authentication with stored credentials
- assignCourier() method that calls real API
- getCourierStatus() method
- Error handling for API failures

### Task 2: Real Database
Replace mock with PostgreSQL:
- Use existing Prisma schema
- Implement repository pattern
- Add connection pooling
- Migration scripts

### Task 3: OpenAI Integration
Real AI decision making:
- GPT-4 function calling setup
- Structured output for courier selection
- Cost optimization logic
- Delivery time prediction

### Task 4: Order State Machine
Implement proper order flow:
- PENDING -> CONFIRMED -> PREPARING -> READY -> DELIVERING -> DELIVERED
- Webhook handlers for each state
- Rollback mechanisms

## Code Standards
- Use async/await everywhere
- Add JSDoc comments
- Error messages in Turkish
- Log with correlation IDs
- All money values in kuruş (integer)
