# Paketix Client - OutSystems API Integration

A comprehensive Node.js client for integrating with Paketix courier services through OutSystems REST API.

## Features

- ✅ **Full OutSystems API Integration** - Complete REST API client
- ✅ **Token-based Authentication** - Automatic token management with expiry handling
- ✅ **Comprehensive Error Handling** - Custom error types for different scenarios
- ✅ **Exponential Backoff Retry Logic** - Automatic retries with jitter
- ✅ **Address Validation** - Input validation for Turkish addresses
- ✅ **Real-time Tracking** - Live courier location updates
- ✅ **TypeScript Ready** - Well-documented API for easy integration

## Installation

```bash
npm install axios
```

## Quick Start

```javascript
const { PaketixClient } = require('paketix-client');

const client = new PaketixClient({
  baseUrl: 'https://your-outsystems-domain.com',
  username: 'your-username',
  password: 'your-password',
  serviceName: 'PaketixService'
});

// Assign a courier
const assignment = await client.assignCourier('ORDER-123', {
  pickup: {
    street: 'Istiklal Caddesi 123',
    city: 'Istanbul',
    postalCode: '34430',
    contactName: 'Restaurant Manager',
    contactPhone: '+90 212 555 0123'
  },
  delivery: {
    street: 'Bagdat Caddesi 456',
    city: 'Istanbul',
    postalCode: '34728',
    contactName: 'Customer Name',
    contactPhone: '+90 532 555 0456'
  }
});

console.log('Courier assigned:', assignment.courierId);
```

## Configuration

### Constructor Options

```javascript
const client = new PaketixClient({
  baseUrl: 'https://your-domain.com',     // Required: OutSystems base URL
  username: 'your-username',              // Required (if not using apiKey)
  password: 'your-password',              // Required (if not using apiKey)
  apiKey: 'your-api-key',                // Alternative to username/password
  serviceName: 'PaketixService',         // Default: 'PaketixService'
  maxRetries: 3,                         // Default: 3
  baseDelay: 1000,                       // Default: 1000ms
  maxDelay: 30000,                       // Default: 30000ms
  timeout: 30000                         // Default: 30000ms
});
```

## API Methods

### Authentication

```javascript
// Authenticate (usually automatic)
const auth = await client.authenticate();
console.log('Token expires at:', auth.expiresAt);
```

### Courier Assignment

```javascript
const assignment = await client.assignCourier(orderId, {
  pickup: {
    street: 'Street address',
    city: 'City name',
    postalCode: '12345',
    country: 'TR',                    // Default: 'TR'
    contactName: 'Contact person',
    contactPhone: '+90 xxx xxx xxxx',
    instructions: 'Special instructions',
    coordinates: { lat: 41.0082, lng: 28.9784 } // Optional
  },
  delivery: {
    // Same structure as pickup
  },
  priority: 'normal',                 // 'low', 'normal', 'high', 'urgent'
  packageDetails: {
    weight: 2.5,                      // kg
    dimensions: { length: 30, width: 20, height: 15 }, // cm
    fragile: false,
    temperature: 'ambient'            // 'hot', 'cold', 'ambient'
  },
  scheduledPickupTime: '2024-01-01T10:00:00Z' // Optional
});
```

### Courier Tracking

```javascript
const location = await client.getCourierLocation(courierId);
console.log('Current location:', location.currentLocation);
console.log('ETA:', location.estimatedArrival);
```

### Assignment Cancellation

```javascript
const cancellation = await client.cancelAssignment(
  courierId,
  'Customer cancelled order'
);
console.log('Cancellation fee:', cancellation.cancellationFee);
```

### Additional Methods

```javascript
// Get assignment history
const history = await client.getAssignmentHistory({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'completed',
  limit: 50
});

// Update assignment
const update = await client.updateAssignment(courierId, {
  priority: 'urgent',
  specialInstructions: 'Handle with care'
});

// Find available couriers
const couriers = await client.getAvailableCouriers({
  latitude: 41.0082,
  longitude: 28.9784
}, 5000); // 5km radius

// Health check
const health = await client.healthCheck();
```

## Error Handling

The client provides specific error types for different scenarios:

```javascript
const { 
  PaketixError,
  PaketixAuthenticationError,
  PaketixNetworkError,
  PaketixValidationError 
} = require('paketix-client');

try {
  await client.assignCourier(orderId, addresses);
} catch (error) {
  if (error instanceof PaketixAuthenticationError) {
    console.log('Authentication failed:', error.message);
  } else if (error instanceof PaketixNetworkError) {
    console.log('Network error:', error.message);
  } else if (error instanceof PaketixValidationError) {
    console.log('Validation error:', error.message);
  } else {
    console.log('Other error:', error.message);
  }
}
```

## Retry Logic

The client automatically retries failed requests with exponential backoff:

- **Base delay**: 1 second (configurable)
- **Max retries**: 3 attempts (configurable)
- **Max delay**: 30 seconds (configurable)
- **Jitter**: 10% random variation to prevent thundering herd

Retries are **not** performed for:
- Authentication errors (401)
- Validation errors (400)

## OutSystems Integration

The client follows OutSystems REST API conventions:

- **URL Pattern**: `{baseUrl}/rest/{serviceName}/{methodName}`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`
- **Error Responses**: Standard HTTP status codes with JSON error details

### Expected OutSystems Methods

Your OutSystems service should implement these methods:

- `POST /rest/PaketixService/Authenticate`
- `POST /rest/PaketixService/AssignCourier`
- `GET /rest/PaketixService/GetCourierLocation`
- `POST /rest/PaketixService/CancelAssignment`
- `GET /rest/PaketixService/GetAssignmentHistory`
- `PUT /rest/PaketixService/UpdateAssignment`
- `GET /rest/PaketixService/GetAvailableCouriers`
- `GET /rest/PaketixService/HealthCheck`

## Turkish Address Support

The client is optimized for Turkish addresses with:

- Default country code: 'TR'
- Turkish postal code validation
- Support for Turkish characters in addresses
- Istanbul-specific coordinate examples

## Development

```bash
# Install dependencies
npm install

# Run example (update with real credentials first)
node example.js
```

## License

ISC License - see package.json for details.

## Support

For issues related to the OutSystems integration or API connectivity, please check:

1. OutSystems service is running and accessible
2. Authentication credentials are correct
3. Network connectivity to the OutSystems domain
4. API method implementations match expected signatures

---

**Implementation Details:**
- Lines of code: 500
- Dependencies: axios
- Node.js compatibility: 14+
- OutSystems compatibility: 11+