import { ID } from 'appwrite';
import { getAppwriteClient, APPWRITE_CONFIG } from './appwrite';
import type { UserProfile } from '@/types/game';

function generateGuestName(): string {
  const adjectives = ['Mystic', 'Ancient', 'Bright', 'Dark', 'Swift', 'Wise', 'Noble', 'Curious'];
  const nouns = ['Alchemist', 'Mage', 'Seeker', 'Weaver', 'Smith', 'Dreamer', 'Knight'];
  const num = Math.floor(Math.random() * 9999);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} #${num}`;
}

function getLocalProfile(): UserProfile {
  const userId = localStorage.getItem('aethercraft_guest_id') || `guest_${Date.now().toString(36)}`;
  localStorage.setItem('aethercraft_guest_id', userId);
  const displayName = localStorage.getItem('aethercraft_guest_name') || generateGuestName();
  localStorage.setItem('aethercraft_guest_name', displayName);
  return {
    userId,
    displayName,
    isAnonymous: true,
    createdAt: Date.now(),
  };
}

export async function initAuth(): Promise<UserProfile> {
  const { account, databases } = getAppwriteClient();
  if (!account) {
    return getLocalProfile();
  }

  let user: any = null;

  try {
    user = await account.get();
  } catch {
    // Invalid or expired session — clean up and create anonymous
    try {
      await account.deleteSessions();
    } catch {
      // ignore — may fail if there is no active session
    }

    try {
      await account.createAnonymousSession();
      user = await account.get();
    } catch {
      return getLocalProfile();
    }
  }

  if (!user) return getLocalProfile();
  if (!databases) return getLocalProfile();

  try {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userProfiles,
      user.$id
    );
    return {
      userId: doc.userId,
      displayName: doc.displayName,
      isAnonymous: doc.isAnonymous,
      createdAt: new Date(doc.createdAt).getTime(),
    };
  } catch {
    const name = generateGuestName();
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.userProfiles,
        user.$id,
        {
          userId: user.$id,
          displayName: name,
          isAnonymous: true,
          createdAt: new Date().toISOString(),
        }
      );
    } catch {
      // ignore
    }
    return { userId: user.$id, displayName: name, isAnonymous: true, createdAt: Date.now() };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  const { account } = getAppwriteClient();
  if (!account) throw new Error('Appwrite not configured');

  // Clear any existing session before logging in
  try {
    await account.deleteSessions();
  } catch {
    // ignore
  }

  try {
    await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    console.error('Login error:', e);
    if (e?.code === 401) {
      throw new Error(
        'Invalid email or password. If you are sure they are correct, check that Email/Password authentication is enabled in your Appwrite Console (Auth > Settings > Email/Password).'
      );
    }
    if (e?.code === 403) {
      throw new Error(
        'Email authentication is disabled in your Appwrite project. Please enable it in Console > Auth > Settings > Email/Password.'
      );
    }
    throw new Error(e?.message || 'Login failed. Please try again.');
  }
}

export async function registerWithEmail(email: string, password: string, name: string): Promise<void> {
  const { account } = getAppwriteClient();
  if (!account) throw new Error('Appwrite not configured');

  // Nettoyer toute session existante avant de register
  try {
    await account.deleteSessions();
  } catch {
    // ignore
  }

  try {
    await account.create(ID.unique(), email, password, name);
  } catch (e: any) {
    console.error('Register error:', e);
    if (e?.code === 409 || e?.message?.includes('already exists')) {
      throw new Error('An account with this email already exists. Please login instead.');
    }
    if (e?.code === 403) {
      throw new Error(
        'Email registration is disabled in your Appwrite project. Please enable it in Console > Auth > Settings > Email/Password.'
      );
    }
    throw new Error(e?.message || 'Registration failed. Please try again.');
  }

  try {
    await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    console.error('Session creation after register:', e);
    if (e?.code === 401) {
      throw new Error('Account created but auto-login failed. Please login manually.');
    }
    throw new Error(e?.message || 'Session creation failed.');
  }
}

export async function updateDisplayName(name: string): Promise<void> {
  localStorage.setItem('aethercraft_guest_name', name);
  const { account, databases } = getAppwriteClient();
  if (!account || !databases) return;
  try {
    const user = await account.get();
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userProfiles,
      user.$id,
      { displayName: name }
    );
  } catch {
    // ignore
  }
}