const { PaketixClient, PaketixError } = require('./index.js');

/**
 * Example usage of the Paketix Client
 * This demonstrates how to integrate with the OutSystems API
 */

async function exampleUsage() {
  // Initialize the client with your configuration
  const client = new PaketixClient({
    baseUrl: 'https://your-outsystems-domain.com',
    username: 'your-username',
    password: 'your-password',
    // OR use API key authentication:
    // apiKey: 'your-api-key',
    serviceName: 'PaketixService', // Your OutSystems service name
    maxRetries: 3,
    baseDelay: 1000,
    timeout: 30000
  });

  try {
    // 1. Authenticate (optional - will be done automatically)
    console.log('Authenticating...');
    const authResult = await client.authenticate();
    console.log('Authenticated successfully:', authResult);

    // 2. Assign a courier to an order
    console.log('\nAssigning courier...');
    const assignment = await client.assignCourier('ORDER-12345', {
      pickup: {
        street: 'Istiklal Caddesi 123',
        city: 'Istanbul',
        postalCode: '34430',
        country: 'TR',
        contactName: 'Restaurant Manager',
        contactPhone: '+90 212 555 0123',
        instructions: 'Ring the bell twice'
      },
      delivery: {
        street: 'Bagdat Caddesi 456',
        city: 'Istanbul',
        postalCode: '34728',
        country: 'TR',
        contactName: 'John Doe',
        contactPhone: '+90 532 555 0456',
        instructions: 'Leave at door if no answer'
      },
      priority: 'high',
      packageDetails: {
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        fragile: false,
        temperature: 'hot'
      }
    });
    console.log('Courier assigned:', assignment);

    // 3. Track courier location
    console.log('\nTracking courier...');
    const location = await client.getCourierLocation(assignment.courierId);
    console.log('Courier location:', location);

    // 4. Get available couriers in area
    console.log('\nFinding available couriers...');
    const availableCouriers = await client.getAvailableCouriers({
      latitude: 41.0082,
      longitude: 28.9784
    }, 5000); // 5km radius
    console.log('Available couriers:', availableCouriers);

    // 5. Update assignment if needed
    console.log('\nUpdating assignment...');
    const updateResult = await client.updateAssignment(assignment.courierId, {
      priority: 'urgent',
      specialInstructions: 'Customer called - deliver ASAP'
    });
    console.log('Assignment updated:', updateResult);

    // 6. Get assignment history
    console.log('\nFetching assignment history...');
    const history = await client.getAssignmentHistory({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      limit: 10
    });
    console.log('Assignment history:', history);

    // 7. Cancel assignment if needed (uncomment to test)
    /*
    console.log('\nCancelling assignment...');
    const cancellation = await client.cancelAssignment(
      assignment.courierId,
      'Customer cancelled order'
    );
    console.log('Assignment cancelled:', cancellation);
    */

  } catch (error) {
    if (error instanceof PaketixError) {
      console.error('Paketix API Error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Health check example
async function healthCheckExample() {
  const client = new PaketixClient({
    baseUrl: 'https://your-outsystems-domain.com',
    apiKey: 'your-api-key'
  });

  try {
    const health = await client.healthCheck();
    console.log('API Health:', health);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Export for use in other modules
module.exports = {
  exampleUsage,
  healthCheckExample
};

// Run example if this file is executed directly
if (require.main === module) {
  console.log('🚀 Paketix Client Example Usage\n');
  console.log('Note: This example uses placeholder URLs and credentials.');
  console.log('Replace with your actual OutSystems configuration.\n');
  
  // Uncomment to run the example (will fail without real credentials)
  // exampleUsage().catch(console.error);
  
  console.log('Example code is ready to use with your real configuration!');
}