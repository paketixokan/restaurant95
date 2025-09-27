const { OrderService } = require('./services')
const orderService = new OrderService()

async function adisyoWebhook(fastify) {
  
  fastify.post('/webhooks/adisyo', async (request, reply) => {
    const { event, data } = request.body
    
    console.log('[ADISYO WEBHOOK]', event)
    
    try {
      switch(event) {
        case 'order.created':
          const order = await orderService.processAdisyoOrder(data)
          return { 
            success: true, 
            message: 'Order processed with AI',
            order
          }
          
        case 'order.cancelled':
          console.log('Order cancelled:', data.id)
          return { success: true }
          
        case 'payment.completed':
          console.log('Payment received:', data.amount)
          return { success: true }
          
        default:
          return { success: false, error: 'Unknown event' }
      }
    } catch (error) {
      console.error('[ADISYO ERROR]', error)
      return { success: false, error: error.message }
    }
  })
  
  fastify.get('/orders/adisyo', async (request, reply) => {
    return { orders: orderService.getOrders() }
  })
}

module.exports = adisyoWebhook
