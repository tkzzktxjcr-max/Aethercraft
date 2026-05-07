import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: 'aethercraft_db',
  collections: {
    aiElements: 'ai_elements',
    aiCombinations: 'ai_combinations',
    userProfiles: 'user_profiles',
  },
};

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

export function initAppwrite() {
  if (!APPWRITE_CONFIG.projectId) return false;
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    account = new Account(client);
    databases = new Databases(client);
  }
  return true;
}

export function getAppwriteClient() {
  initAppwrite();
  return { client, account, databases };
}

export { client, account, databases, ID, Query };