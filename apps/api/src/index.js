const fastify = require('fastify')({ logger: true })
const path = require('path')

// Mock database 
const db = {
  orders: [],
  
  addOrder: (order) => {
    order.id = 'ORD-' + Date.now()
    order.createdAt = new Date()
    db.orders.push(order)
    return order
  },
  
  getAllOrders: () => db.orders
}

// Routes
fastify.get('/', async (request, reply) => {
  return { status: 'Restaurant95 API Running', mode: 'In-Memory' }
})

fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  }
})

fastify.post('/orders', async (request, reply) => {
  const order = db.addOrder(request.body)
  return { success: true, order }
})

fastify.get('/orders', async (request, reply) => {
  return { orders: db.getAllOrders() }
})

fastify.post('/ai/execute', async (request, reply) => {
  const { functionName, params } = request.body
  
  if (functionName === 'assignCourier') {
    return {
      success: true,
      result: {
        orderId: params.orderId,
        courierId: 'CRR-' + Math.random().toString(36).substr(2, 9),
        estimatedTime: 30,
        dryRun: true
      }
    }
  }
  
  return { success: false, error: 'Unknown function' }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Server running at http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

// Register Adisyo webhook
const adisyoWebhook = require('./adisyo-webhook')
fastify.register(adisyoWebhook)
