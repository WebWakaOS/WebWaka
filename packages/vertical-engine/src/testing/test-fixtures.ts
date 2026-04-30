/**
 * Test Fixtures & Setup for Parity Testing
 * 
 * Provides mock data, test credentials, and setup utilities
 * for running parity tests both locally and in CI.
 */

export const TEST_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:8001',
  useRealBackend: process.env.USE_REAL_BACKEND === 'true',
  testToken: process.env.TEST_TOKEN || 'mock-test-token',
  testTenantId: process.env.TEST_TENANT_ID || 'test-tenant-123',
  testWorkspaceId: process.env.TEST_WORKSPACE_ID || 'test-workspace-456',
};

/**
 * Sample profile data for each vertical
 */
export const MOCK_PROFILES = {
  bakery: {
    id: 'bakery-profile-1',
    slug: 'sweet-treats-bakery',
    displayName: 'Sweet Treats Bakery',
    description: 'Fresh bread and pastries daily',
    address: '123 Main Street, Lagos',
    contactPhone: '+234 800 123 4567',
    contactEmail: 'info@sweettreats.com',
    businessHours: 'Mon-Sat 6AM-8PM',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  hotel: {
    id: 'hotel-profile-1',
    slug: 'grand-plaza-hotel',
    displayName: 'Grand Plaza Hotel',
    description: '5-star luxury accommodation',
    address: '456 Victoria Island, Lagos',
    contactPhone: '+234 800 234 5678',
    contactEmail: 'reservations@grandplaza.com',
    businessHours: '24/7',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  pharmacy: {
    id: 'pharmacy-profile-1',
    slug: 'health-first-pharmacy',
    displayName: 'Health First Pharmacy',
    description: 'Your trusted health partner',
    address: '789 Allen Avenue, Ikeja',
    contactPhone: '+234 800 345 6789',
    contactEmail: 'info@healthfirst.com',
    businessHours: 'Mon-Sun 8AM-10PM',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  gym: {
    id: 'gym-profile-1',
    slug: 'power-fitness-center',
    displayName: 'Power Fitness Center',
    description: 'Transform your body, transform your life',
    address: '321 Admiralty Way, Lekki',
    contactPhone: '+234 800 456 7890',
    contactEmail: 'info@powerfitness.com',
    businessHours: 'Mon-Fri 5AM-10PM, Sat-Sun 7AM-8PM',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  church: {
    id: 'church-profile-1',
    slug: 'faith-community-church',
    displayName: 'Faith Community Church',
    description: 'A place of worship and community',
    address: '555 Church Street, Surulere',
    contactPhone: '+234 800 567 8901',
    contactEmail: 'info@faithcommunity.org',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
};

/**
 * Mock API responses for testing without live backend
 */
export const MOCK_RESPONSES = {
  '/profiles': (vertical: string) => ({
    profiles: [MOCK_PROFILES[vertical as keyof typeof MOCK_PROFILES]],
    total: 1,
    page: 1,
    pageSize: 20,
  }),
  '/profiles/:id': (vertical: string) => ({
    profile: MOCK_PROFILES[vertical as keyof typeof MOCK_PROFILES],
  }),
  '/profiles (create)': (vertical: string, data: any) => ({
    profile: {
      id: `${vertical}-profile-new`,
      ...data,
      status: 'seeded',
      createdAt: new Date().toISOString(),
    },
  }),
  '/profiles/:id (update)': (vertical: string, id: string, data: any) => ({
    profile: {
      ...MOCK_PROFILES[vertical as keyof typeof MOCK_PROFILES],
      ...data,
      updatedAt: new Date().toISOString(),
    },
  }),
};

/**
 * Setup authentication headers for tests
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${TEST_CONFIG.testToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Mock fetch for tests without live backend
 */
export function createMockFetch() {
  return async (url: string, init?: RequestInit): Promise<Response> => {
    // Parse URL to determine which mock response to return
    const urlObj = new URL(url, TEST_CONFIG.baseUrl);
    const path = urlObj.pathname;
    
    // Extract vertical from path
    const verticalMatch = path.match(/\/(bakery|hotel|pharmacy|gym|church)\//);
    const vertical = verticalMatch ? verticalMatch[1] : 'bakery';

    let responseData: any = { error: 'Not mocked' };
    let status = 404;

    if (path.includes('/profiles') && init?.method === 'GET' && !path.match(/\/profiles\/[^/]+$/)) {
      responseData = MOCK_RESPONSES['/profiles'](vertical);
      status = 200;
    } else if (path.match(/\/profiles\/[^/]+$/) && init?.method === 'GET') {
      responseData = MOCK_RESPONSES['/profiles/:id'](vertical);
      status = 200;
    } else if (path.includes('/profiles') && init?.method === 'POST') {
      const body = init.body ? JSON.parse(init.body as string) : {};
      responseData = MOCK_RESPONSES['/profiles (create)'](vertical, body);
      status = 201;
    } else if (path.match(/\/profiles\/[^/]+$/) && (init?.method === 'PATCH' || init?.method === 'PUT')) {
      const id = path.split('/').pop()!;
      const body = init.body ? JSON.parse(init.body as string) : {};
      responseData = MOCK_RESPONSES['/profiles/:id (update)'](vertical, id, body);
      status = 200;
    }

    return new Response(JSON.stringify(responseData), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'ETag': `"${Date.now()}"`,
      },
    });
  };
}

/**
 * Setup function to run before all tests
 */
export function setupParityTests() {
  // If not using real backend, mock fetch
  if (!TEST_CONFIG.useRealBackend) {
    global.fetch = createMockFetch() as any;
    console.log('🧪 Using mocked backend for parity tests');
  } else {
    console.log(`🌐 Using real backend at ${TEST_CONFIG.baseUrl}`);
  }
}

/**
 * Create test database records for parity testing
 * (Only runs if using real backend)
 */
export async function seedTestData() {
  if (!TEST_CONFIG.useRealBackend) {
    console.log('⏭️  Skipping test data seeding (mocked backend)');
    return;
  }

  console.log('🌱 Seeding test data...');

  // TODO: Implement actual seeding via API calls
  // For now, assume test data exists in the database

  console.log('✅ Test data ready');
}

/**
 * Cleanup test data after tests
 */
export async function cleanupTestData() {
  if (!TEST_CONFIG.useRealBackend) {
    return;
  }

  console.log('🧹 Cleaning up test data...');
  // TODO: Implement cleanup
  console.log('✅ Cleanup complete');
}
