const db = {
  restaurants: [],
  orders: [],
  menus: [],
  
  addOrder: (order) => {
    order.id = 'ORD-' + Date.now()
    order.createdAt = new Date()
    db.orders.push(order)
    return order
  },
  
  getOrder: (id) => {
    return db.orders.find(o => o.id === id)
  },
  
  getAllOrders: () => {
    return db.orders
  }
}

module.exports = db
