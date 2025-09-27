# First Task: Paketix Integration

## Context
Paketix is running on OutSystems platform. We need to integrate their courier API.

## Requirements
1. Create packages/paketix-client/index.js
2. Implement these methods:
   - authenticate() - Login and get session token
   - assignCourier(orderId, restaurantAddress, customerAddress)
   - getCourierLocation(courierId)
   - cancelAssignment(courierId)

## OutSystems API Pattern
BASE_URL + "/rest/APIName/MethodName"

Authentication requires Username and Password
Returns Token and ExpiresIn

## Expected Output
Working Paketix client that can be imported
