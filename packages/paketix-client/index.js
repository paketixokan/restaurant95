const axios = require('axios');

/**
 * Custom error classes for Paketix API
 */
class PaketixError extends Error {
  constructor(message, code, statusCode = null, response = null) {
    super(message);
    this.name = 'PaketixError';
    this.code = code;
    this.statusCode = statusCode;
    this.response = response;
  }
}

class PaketixAuthenticationError extends PaketixError {
  constructor(message, response = null) {
    super(message, 'AUTHENTICATION_ERROR', 401, response);
    this.name = 'PaketixAuthenticationError';
  }
}

class PaketixNetworkError extends PaketixError {
  constructor(message, originalError) {
    super(message, 'NETWORK_ERROR');
    this.name = 'PaketixNetworkError';
    this.originalError = originalError;
  }
}

class PaketixValidationError extends PaketixError {
  constructor(message, response = null) {
    super(message, 'VALIDATION_ERROR', 400, response);
    this.name = 'PaketixValidationError';
  }
}

/**
 * Paketix OutSystems API Client
 * Provides integration with Paketix courier services through OutSystems REST API
 */
class PaketixClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.apiKey = config.apiKey;
    this.token = null;
    this.tokenExpiry = null;
    this.serviceName = config.serviceName || 'PaketixService';
    
    // Retry configuration
    this.maxRetries = config.maxRetries || 3;
    this.baseDelay = config.baseDelay || 1000; // 1 second
    this.maxDelay = config.maxDelay || 30000; // 30 seconds
    
    // Request timeout
    this.timeout = config.timeout || 30000; // 30 seconds
    
    // Initialize axios instance
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Restaurant95-PaketixClient/1.0.0'
      }
    });
    
    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      (config) => {
        if (this.token && this.isTokenValid()) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null;
          this.tokenExpiry = null;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if current token is valid and not expired
   */
  isTokenValid() {
    return this.token && this.tokenExpiry && new Date() < this.tokenExpiry;
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return Math.min(delay + jitter, this.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute HTTP request with retry logic and exponential backoff
   */
  async executeWithRetry(requestFn, context = 'API request') {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication errors or validation errors
        if (error.response?.status === 401 || error.response?.status === 400) {
          throw this.handleError(error, context);
        }
        
        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Calculate delay and wait before retry
        const delay = this.calculateDelay(attempt);
        console.warn(`${context} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`, {
          error: error.message,
          status: error.response?.status
        });
        
        await this.sleep(delay);
      }
    }
    
    throw this.handleError(lastError, context);
  }

  /**
   * Handle and transform errors into appropriate PaketixError types
   */
  handleError(error, context = 'API request') {
    if (error instanceof PaketixError) {
      return error;
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return new PaketixNetworkError(`Network error during ${context}: ${error.message}`, error);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || `HTTP ${status} error during ${context}`;
      
      switch (status) {
        case 401:
          return new PaketixAuthenticationError(message, error.response);
        case 400:
          return new PaketixValidationError(message, error.response);
        default:
          return new PaketixError(message, 'HTTP_ERROR', status, error.response);
      }
    }
    
    return new PaketixError(`Unexpected error during ${context}: ${error.message}`, 'UNKNOWN_ERROR');
  }

  /**
   * Build OutSystems REST API URL
   */
  buildApiUrl(methodName) {
    return `/rest/${this.serviceName}/${methodName}`;
  }

  /**
   * Authenticate with Paketix OutSystems API
   * Supports both username/password and API key authentication
   */
  async authenticate() {
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('Authenticate');
      
      let authPayload;
      if (this.apiKey) {
        authPayload = { apiKey: this.apiKey };
      } else {
        authPayload = {
          username: this.username,
          password: this.password
        };
      }
      
      console.log('Authenticating with Paketix OutSystems API...');
      
      const response = await this.httpClient.post(url, authPayload);
      
      if (!response.data?.token) {
        throw new PaketixAuthenticationError('Authentication response missing token');
      }
      
      this.token = response.data.token;
      
      // Set token expiry (default to 1 hour if not provided)
      const expiresIn = response.data.expiresIn || 3600; // seconds
      this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
      
      console.log('Successfully authenticated with Paketix API');
      
      return {
        token: this.token,
        expiresIn: expiresIn,
        expiresAt: this.tokenExpiry.toISOString()
      };
    }, 'authentication');
  }

  /**
   * Ensure valid authentication before making API calls
   */
  async ensureAuthenticated() {
    if (!this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * Assign a courier to an order with pickup and delivery addresses
   */
  async assignCourier(orderId, addresses) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('AssignCourier');
      
      // Validate required parameters
      if (!orderId) {
        throw new PaketixValidationError('Order ID is required');
      }
      
      if (!addresses || !addresses.pickup || !addresses.delivery) {
        throw new PaketixValidationError('Both pickup and delivery addresses are required');
      }
      
      const payload = {
        orderId: orderId,
        pickupAddress: {
          street: addresses.pickup.street,
          city: addresses.pickup.city,
          postalCode: addresses.pickup.postalCode,
          country: addresses.pickup.country || 'TR',
          coordinates: addresses.pickup.coordinates || null,
          contactName: addresses.pickup.contactName,
          contactPhone: addresses.pickup.contactPhone,
          instructions: addresses.pickup.instructions || null
        },
        deliveryAddress: {
          street: addresses.delivery.street,
          city: addresses.delivery.city,
          postalCode: addresses.delivery.postalCode,
          country: addresses.delivery.country || 'TR',
          coordinates: addresses.delivery.coordinates || null,
          contactName: addresses.delivery.contactName,
          contactPhone: addresses.delivery.contactPhone,
          instructions: addresses.delivery.instructions || null
        },
        priority: addresses.priority || 'normal',
        packageDetails: addresses.packageDetails || {},
        scheduledPickupTime: addresses.scheduledPickupTime || null
      };
      
      console.log(`Assigning courier for order ${orderId}...`);
      
      const response = await this.httpClient.post(url, payload);
      
      if (!response.data?.courierId) {
        throw new PaketixError('Invalid response: missing courier ID');
      }
      
      return {
        courierId: response.data.courierId,
        courierName: response.data.courierName,
        courierPhone: response.data.courierPhone,
        estimatedPickupTime: response.data.estimatedPickupTime,
        estimatedDeliveryTime: response.data.estimatedDeliveryTime,
        trackingCode: response.data.trackingCode,
        status: response.data.status || 'assigned'
      };
    }, 'courier assignment');
  }

  /**
   * Get real-time location and status of assigned courier
   */
  async getCourierLocation(courierId) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('GetCourierLocation');
      
      if (!courierId) {
        throw new PaketixValidationError('Courier ID is required');
      }
      
      console.log(`Getting location for courier ${courierId}...`);
      
      const response = await this.httpClient.get(url, {
        params: { courierId }
      });
      
      return {
        courierId: response.data.courierId,
        currentLocation: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          address: response.data.currentAddress,
          timestamp: response.data.locationTimestamp
        },
        status: response.data.status,
        estimatedArrival: response.data.estimatedArrival,
        distanceToDestination: response.data.distanceToDestination,
        route: response.data.route || null,
        lastUpdate: response.data.lastUpdate
      };
    }, 'courier location tracking');
  }

  /**
   * Cancel courier assignment for an order
   */
  async cancelAssignment(courierId, reason = null) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('CancelAssignment');
      
      if (!courierId) {
        throw new PaketixValidationError('Courier ID is required');
      }
      
      const payload = {
        courierId: courierId,
        reason: reason || 'Cancelled by restaurant',
        timestamp: new Date().toISOString()
      };
      
      console.log(`Cancelling assignment for courier ${courierId}...`);
      
      const response = await this.httpClient.post(url, payload);
      
      return {
        courierId: response.data.courierId,
        status: response.data.status,
        cancellationId: response.data.cancellationId,
        refundAmount: response.data.refundAmount || 0,
        cancellationFee: response.data.cancellationFee || 0,
        message: response.data.message
      };
    }, 'courier assignment cancellation');
  }

  /**
   * Get courier assignment history and statistics
   */
  async getAssignmentHistory(filters = {}) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('GetAssignmentHistory');
      
      const params = {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        status: filters.status || null,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      };
      
      console.log('Fetching assignment history...');
      
      const response = await this.httpClient.get(url, { params });
      
      return {
        assignments: response.data.assignments || [],
        totalCount: response.data.totalCount || 0,
        pagination: {
          limit: params.limit,
          offset: params.offset,
          hasMore: response.data.hasMore || false
        }
      };
    }, 'assignment history retrieval');
  }

  /**
   * Update courier assignment with new information
   */
  async updateAssignment(courierId, updates) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('UpdateAssignment');
      
      if (!courierId) {
        throw new PaketixValidationError('Courier ID is required');
      }
      
      const payload = {
        courierId: courierId,
        updates: updates,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Updating assignment for courier ${courierId}...`);
      
      const response = await this.httpClient.put(url, payload);
      
      return {
        courierId: response.data.courierId,
        status: response.data.status,
        updatedFields: response.data.updatedFields || [],
        message: response.data.message
      };
    }, 'assignment update');
  }

  /**
   * Get available couriers in a specific area
   */
  async getAvailableCouriers(location, radius = 5000) {
    await this.ensureAuthenticated();
    
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('GetAvailableCouriers');
      
      if (!location || !location.latitude || !location.longitude) {
        throw new PaketixValidationError('Location with latitude and longitude is required');
      }
      
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: radius // meters
      };
      
      console.log(`Finding available couriers near ${location.latitude}, ${location.longitude}...`);
      
      const response = await this.httpClient.get(url, { params });
      
      return {
        couriers: response.data.couriers || [],
        searchRadius: radius,
        searchLocation: location,
        totalFound: response.data.totalFound || 0
      };
    }, 'available couriers search');
  }

  /**
   * Health check method to verify API connectivity
   */
  async healthCheck() {
    return this.executeWithRetry(async () => {
      const url = this.buildApiUrl('HealthCheck');
      
      console.log('Performing health check...');
      
      const response = await this.httpClient.get(url);
      
      return {
        status: response.data.status || 'unknown',
        timestamp: response.data.timestamp || new Date().toISOString(),
        version: response.data.version || 'unknown',
        uptime: response.data.uptime || null
      };
    }, 'health check');
  }
}

module.exports = { 
  PaketixClient,
  PaketixError,
  PaketixAuthenticationError,
  PaketixNetworkError,
  PaketixValidationError
};
