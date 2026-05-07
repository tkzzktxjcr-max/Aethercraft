export type ElementType = 'energy' | 'liquid' | 'life' | 'cosmic' | 'matter' | 'gas';

export interface GameElement {
  id: string;
  name: string;
  emoji: string;
  properties: string[];
  type: ElementType;
  isAIGenerated?: boolean;
  createdBy?: string;
  createdAt?: number;
  discovererName?: string;
}

export interface AIElement extends GameElement {
  isAIGenerated: true;
  createdBy: string;
  createdAt: number;
  discovererName: string;
}

export interface Combination {
  id: string;
  elementA: string;
  elementB: string;
  result: string;
}

export interface AICombination {
  id: string;
  elementA: string;
  elementB: string;
  resultId: string;
  discoveredBy: string;
  discoveredAt: number;
  discovererName: string;
  resultName?: string;
  resultEmoji?: string;
}

export type AIStatus = 'loading' | 'ready' | 'unavailable' | 'idle';

export interface OriginPack {
  id: string;
  name: string;
  description: string;
  elements: string[];
  themeColor: string;
}

export interface CanvasOrb {
  id: string;
  elementId: string;
  x: number;
  y: number;
  isNew?: boolean;
  isGenerating?: boolean;
}

export interface Discovery {
  id: string;
  elementId: string;
  elementName: string;
  elementEmoji: string;
  timestamp: number;
  isFirst: boolean;
  discoverer: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  isAnonymous: boolean;
  createdAt: number;
}