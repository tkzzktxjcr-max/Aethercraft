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

  // 1. Essayer de récupérer l'utilisateur actuel
  try {
    user = await account.get();
  } catch {
    // 2. Pas de session active → en créer une anonyme
    try {
      await account.createAnonymousSession();
    } catch (e: any) {
      // Session peut déjà exister ou autre erreur → on ignore et on réessaye get()
      console.log('Session creation skipped:', e?.message || e);
    }

    // 3. Récupérer l'utilisateur (session existante ou nouvelle)
    try {
      user = await account.get();
    } catch {
      return getLocalProfile();
    }
  }

  if (!user) return getLocalProfile();
  if (!databases) return getLocalProfile();

  // 4. Récupérer ou créer le profil dans la base
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
  await account.createEmailPasswordSession(email, password);
}

export async function registerWithEmail(email: string, password: string, name: string): Promise<void> {
  const { account } = getAppwriteClient();
  if (!account) throw new Error('Appwrite not configured');
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
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