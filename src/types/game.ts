export type ElementType = 'energy' | 'liquid' | 'life' | 'cosmic' | 'matter' | 'gas';

export interface GameElement {
  id: string;
  name: string;
  emoji: string;
  properties: string[];
  type: ElementType;
}

export interface Combination {
  id: string;
  elementA: string;
  elementB: string;
  result: string;
}

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