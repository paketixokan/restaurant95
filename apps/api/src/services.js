// Service Layer for Restaurant95

class NotificationService {
  async sendWhatsApp(phone, message) {
    // TODO: Integrate with WhatsApp Business API
    console.log(`[WHATSAPP] To: ${phone}, Message: ${message}`)
    return { sent: true, mockMode: true }
  }
}

class AIService {
  async assignCourier(orderId, urgency = 'normal') {
    console.log(`[AI] Assigning courier for order ${orderId}`)
    
    // Simulate AI decision
    const decision = {
      orderId,
      courierId: 'CRR-' + Math.random().toString(36).substr(2, 9),
      estimatedTime: urgency === 'high' ? 15 : 30,
      confidence: 0.95,
      dryRun: false
    }
    
    console.log(`[AI] Decision:`, decision)
    return decision
  }
  
  async predictDeliveryTime(distance, timeOfDay) {
    // ML model would go here
    const baseTime = distance * 3 // 3 min per km
    const rushHourMultiplier = (timeOfDay >= 18 && timeOfDay <= 20) ? 1.5 : 1
    return Math.round(baseTime * rushHourMultiplier)
  }
}

class OrderService {
  constructor() {
    this.orders = []
    this.notification = new NotificationService()
    this.ai = new AIService()
  }
  
  async processAdisyoOrder(data) {
    // 1. Create order
    const order = {
      id: 'ORD-' + Date.now(),
      source: 'ADISYO',
      externalId: data.id,
      customer: data.customer,
      items: data.items,
      total: data.total_amount,
      status: 'CONFIRMED',
      createdAt: new Date()
    }
    
    this.orders.push(order)
    
    // 2. Assign courier via AI
    const courier = await this.ai.assignCourier(order.id, 'normal')
    order.courier = courier
    
    // 3. Send notifications
    if (data.customer?.phone) {
      const message = `Merhaba ${data.customer.name}, siparişiniz alındı! Tahmini teslimat: ${courier.estimatedTime} dakika. Kurye: ${courier.courierId}`
      await this.notification.sendWhatsApp(data.customer.phone, message)
    }
    
    return order
  }
  
  getOrders() {
    return this.orders
  }
}

module.exports = { OrderService, NotificationService, AIService }
