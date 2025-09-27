class PaketixClient {
  constructor(config) {
    this.baseUrl = config.baseUrl
    this.username = config.username
    this.password = config.password
    this.token = null
  }

  async authenticate() {
    console.log('Authenticating with Paketix...')
    this.token = 'mock-token-' + Date.now()
    return this.token
  }

  async assignCourier(orderId, addresses) {
    return {
      courierId: 'PKT-' + Math.random().toString(36).substr(2, 9),
      estimatedTime: 25,
      courierName: 'Mock Courier'
    }
  }
}

module.exports = { PaketixClient }
