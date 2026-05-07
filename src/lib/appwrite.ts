// Mock Appwrite client for MVP
// Replace with actual Appwrite SDK when self-hosted backend is ready

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost:80/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'aethercraft',
  databaseId: 'aethercraft_db',
  collections: {
    elements: 'elements',
    combinations: 'combinations',
    packs: 'origin_packs',
    users: 'users',
  },
  functions: {
    combine: 'combineElements',
    seed: 'seedDatabase',
  },
  realtimeChannels: {
    combinations: 'databases.aethercraft_db.collections.combinations',
  },
};

export const mockAppwrite = {
  database: {
    listDocuments: async () => ({ documents: [] }),
    createDocument: async () => ({}),
    getDocument: async () => ({}),
  },
  functions: {
    createExecution: async () => ({ response: '{}' }),
  },
  realtime: {
    subscribe: () => ({ unsubscribe: () => {} }),
  },
  account: {
    get: async () => null,
    createAnonymousSession: async () => ({}),
  },
};