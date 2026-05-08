import { getElementById, ELEMENTS } from './gameData';
import type { GameElement } from '@/types/game';

interface TagRule {
  tagsA: string[];
  tagsB: string[];
  result: { name: string; emoji: string; type: string };
  priority: number;
}

// Rules are checked in priority order. First match wins.
const TAG_RULES: TagRule[] = [
  // Fire interactions
  { tagsA: ['fire'], tagsB: ['water', 'wet', 'liquid'], result: { name: 'Steam', emoji: '♨️', type: 'gas' }, priority: 100 },
  { tagsA: ['fire'], tagsB: ['plant', 'wood', 'organic'], result: { name: 'Ash', emoji: '⚪', type: 'matter' }, priority: 100 },
  { tagsA: ['fire'], tagsB: ['earth', 'ground', 'stone'], result: { name: 'Lava', emoji: '🌋', type: 'matter' }, priority: 100 },
  { tagsA: ['fire'], tagsB: ['metal'], result: { name: 'Molten Metal', emoji: '🔥', type: 'matter' }, priority: 90 },
  { tagsA: ['fire'], tagsB: ['air', 'gas', 'wind'], result: { name: 'Energy', emoji: '⚡', type: 'energy' }, priority: 100 },
  { tagsA: ['fire'], tagsB: ['sand'], result: { name: 'Glass', emoji: '🥃', type: 'matter' }, priority: 100 },
  
  // Water interactions
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['earth', 'ground', 'soil'], result: { name: 'Mud', emoji: '💩', type: 'liquid' }, priority: 100 },
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['air', 'gas', 'wind'], result: { name: 'Rain', emoji: '🌧️', type: 'liquid' }, priority: 100 },
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['plant', 'seed', 'life'], result: { name: 'Plant', emoji: '🌱', type: 'life' }, priority: 100 },
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['cold', 'ice', 'snow'], result: { name: 'Ice', emoji: '🧊', type: 'matter' }, priority: 90 },
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['fire', 'hot', 'heat'], result: { name: 'Steam', emoji: '♨️', type: 'gas' }, priority: 100 },
  { tagsA: ['water', 'wet', 'liquid'], tagsB: ['salt'], result: { name: 'Salt Water', emoji: '🌊', type: 'liquid' }, priority: 80 },
  
  // Plant/Life interactions
  { tagsA: ['plant', 'life', 'organic'], tagsB: ['plant', 'life', 'organic'], result: { name: 'Garden', emoji: '🌷', type: 'life' }, priority: 100 },
  { tagsA: ['plant', 'life', 'organic'], tagsB: ['sun', 'light', 'bright'], result: { name: 'Flower', emoji: '🌸', type: 'life' }, priority: 100 },
  { tagsA: ['plant', 'life', 'organic'], tagsB: ['earth', 'ground', 'soil'], result: { name: 'Tree', emoji: '🌳', type: 'life' }, priority: 100 },
  { tagsA: ['plant', 'life', 'organic'], tagsB: ['water', 'wet', 'liquid'], result: { name: 'Plant', emoji: '🌱', type: 'life' }, priority: 100 },
  { tagsA: ['seed'], tagsB: ['soil', 'earth', 'ground'], result: { name: 'Plant', emoji: '🌱', type: 'life' }, priority: 100 },
  { tagsA: ['seed'], tagsB: ['water', 'wet', 'liquid'], result: { name: 'Sprout', emoji: '🌿', type: 'life' }, priority: 100 },
  { tagsA: ['flower'], tagsB: ['flower'], result: { name: 'Bouquet', emoji: '💐', type: 'life' }, priority: 90 },
  { tagsA: ['flower'], tagsB: ['plant'], result: { name: 'Garden', emoji: '🌷', type: 'life' }, priority: 100 },
  { tagsA: ['tree'], tagsB: ['tree'], result: { name: 'Forest', emoji: '🌲', type: 'life' }, priority: 100 },
  { tagsA: ['tree'], tagsB: ['tool', 'axe'], result: { name: 'Wood', emoji: '🪵', type: 'matter' }, priority: 100 },
  
  // Earth/Stone interactions
  { tagsA: ['earth', 'ground', 'stone'], tagsB: ['earth', 'ground', 'stone'], result: { name: 'Mountain', emoji: '⛰️', type: 'matter' }, priority: 90 },
  { tagsA: ['stone', 'rock'], tagsB: ['fire', 'hot', 'heat'], result: { name: 'Metal', emoji: '🔩', type: 'matter' }, priority: 100 },
  { tagsA: ['stone', 'rock'], tagsB: ['air', 'wind'], result: { name: 'Sand', emoji: '🏜️', type: 'matter' }, priority: 100 },
  { tagsA: ['stone', 'rock'], tagsB: ['water', 'wet'], result: { name: 'Erosion', emoji: '🌊', type: 'matter' }, priority: 80 },
  { tagsA: ['sand'], tagsB: ['fire', 'hot'], result: { name: 'Glass', emoji: '🥃', type: 'matter' }, priority: 100 },
  { tagsA: ['sand'], tagsB: ['water', 'wet'], result: { name: 'Beach', emoji: '🏖️', type: 'matter' }, priority: 90 },
  { tagsA: ['mud'], tagsB: ['fire', 'hot'], result: { name: 'Brick', emoji: '🧱', type: 'matter' }, priority: 100 },
  
  // Metal/Tool interactions
  { tagsA: ['metal'], tagsB: ['energy', 'electric', 'power'], result: { name: 'Electricity', emoji: '💡', type: 'energy' }, priority: 100 },
  { tagsA: ['metal'], tagsB: ['tool'], result: { name: 'Machine', emoji: '⚙️', type: 'matter' }, priority: 90 },
  { tagsA: ['metal'], tagsB: ['fire', 'hot'], result: { name: 'Sword', emoji: '⚔️', type: 'matter' }, priority: 90 },
  { tagsA: ['tool'], tagsB: ['wood'], result: { name: 'Wheel', emoji: '☸️', type: 'matter' }, priority: 90 },
  { tagsA: ['tool'], tagsB: ['stone'], result: { name: 'Blade', emoji: '🔪', type: 'matter' }, priority: 90 },
  
  // Energy/Electric interactions
  { tagsA: ['energy', 'electric', 'power'], tagsB: ['air', 'gas', 'wind'], result: { name: 'Lightning', emoji: '⚡', type: 'energy' }, priority: 100 },
  { tagsA: ['energy', 'electric', 'power'], tagsB: ['metal'], result: { name: 'Magnet', emoji: '🧲', type: 'matter' }, priority: 80 },
  { tagsA: ['energy', 'electric', 'power'], tagsB: ['light'], result: { name: 'Laser', emoji: '🔦', type: 'energy' }, priority: 80 },
  
  // Sky/Cloud/Air interactions
  { tagsA: ['sky'], tagsB: ['water', 'wet', 'liquid'], result: { name: 'Rain', emoji: '🌧️', type: 'liquid' }, priority: 100 },
  { tagsA: ['cloud'], tagsB: ['air', 'wind'], result: { name: 'Storm', emoji: '⛈️', type: 'energy' }, priority: 90 },
  { tagsA: ['cloud'], tagsB: ['sun', 'light'], result: { name: 'Rainbow', emoji: '🌈', type: 'cosmic' }, priority: 100 },
  { tagsA: ['air', 'gas', 'wind'], tagsB: ['air', 'gas', 'wind'], result: { name: 'Wind', emoji: '🌬️', type: 'gas' }, priority: 90 },
  { tagsA: ['air', 'gas', 'wind'], tagsB: ['water', 'wet'], result: { name: 'Wave', emoji: '🌊', type: 'liquid' }, priority: 80 },
  
  // Celestial interactions
  { tagsA: ['sun'], tagsB: ['moon'], result: { name: 'Eclipse', emoji: '🌒', type: 'cosmic' }, priority: 100 },
  { tagsA: ['sun'], tagsB: ['water', 'wet'], result: { name: 'Rainbow', emoji: '🌈', type: 'cosmic' }, priority: 100 },
  { tagsA: ['star'], tagsB: ['star'], result: { name: 'Galaxy', emoji: '🌌', type: 'cosmic' }, priority: 100 },
  { tagsA: ['star'], tagsB: ['void', 'dark', 'empty'], result: { name: 'Black Hole', emoji: '🕳️', type: 'cosmic' }, priority: 100 },
  { tagsA: ['moon'], tagsB: ['water', 'ocean'], result: { name: 'Tide', emoji: '🌊', type: 'liquid' }, priority: 100 },
  { tagsA: ['galaxy'], tagsB: ['void', 'dark'], result: { name: 'Universe', emoji: '🌠', type: 'cosmic' }, priority: 100 },
  
  // Vehicle/Transport
  { tagsA: ['wheel'], tagsB: ['wood'], result: { name: 'Cart', emoji: '🛒', type: 'matter' }, priority: 100 },
  { tagsA: ['cart'], tagsB: ['energy', 'power'], result: { name: 'Car', emoji: '🚗', type: 'matter' }, priority: 100 },
  { tagsA: ['car'], tagsB: ['air', 'sky'], result: { name: 'Airplane', emoji: '✈️', type: 'matter' }, priority: 100 },
  { tagsA: ['car'], tagsB: ['metal'], result: { name: 'Train', emoji: '🚂', type: 'matter' }, priority: 100 },
  
  // Building/Craft
  { tagsA: ['brick'], tagsB: ['brick'], result: { name: 'Wall', emoji: '🧱', type: 'matter' }, priority: 100 },
  { tagsA: ['wall'], tagsB: ['wall'], result: { name: 'House', emoji: '🏠', type: 'matter' }, priority: 100 },
  { tagsA: ['house'], tagsB: ['plant', 'garden'], result: { name: 'Garden', emoji: '🌷', type: 'life' }, priority: 90 },
  { tagsA: ['house'], tagsB: ['water', 'pond'], result: { name: 'Pool', emoji: '🏊', type: 'liquid' }, priority: 80 },
  
  // Time
  { tagsA: ['tool'], tagsB: ['sun', 'light'], result: { name: 'Clock', emoji: '🕐', type: 'matter' }, priority: 90 },
  
  // Cold/Ice
  { tagsA: ['cold', 'ice'], tagsB: ['water', 'wet'], result: { name: 'Ice', emoji: '🧊', type: 'matter' }, priority: 100 },
  { tagsA: ['cold', 'ice'], tagsB: ['air', 'wind'], result: { name: 'Snow', emoji: '❄️', type: 'matter' }, priority: 100 },
  
  // Light interactions
  { tagsA: ['light', 'bright'], tagsB: ['dark', 'void', 'shadow'], result: { name: 'Shadow', emoji: '👤', type: 'cosmic' }, priority: 90 },
  { tagsA: ['light', 'bright'], tagsB: ['prism', 'glass'], result: { name: 'Rainbow', emoji: '🌈', type: 'cosmic' }, priority: 90 },
  
  // Ocean/Water bodies
  { tagsA: ['lake'], tagsB: ['water', 'wet'], result: { name: 'Ocean', emoji: '🌊', type: 'liquid' }, priority: 100 },
  { tagsA: ['pond'], tagsB: ['water', 'wet'], result: { name: 'Lake', emoji: '🏖️', type: 'liquid' }, priority: 100 },
  { tagsA: ['ocean'], tagsB: ['earth', 'ground'], result: { name: 'Island', emoji: '🏝️', type: 'matter' }, priority: 100 },
  
  // Desert/Sand
  { tagsA: ['sand'], tagsB: ['sun', 'hot'], result: { name: 'Desert', emoji: '🏜️', type: 'matter' }, priority: 100 },
  
  // Paper/Writing
  { tagsA: ['paper'], tagsB: ['tool', 'pen'], result: { name: 'Book', emoji: '📖', type: 'matter' }, priority: 80 },
];

function elementMatchesTags(element: GameElement, tags: string[]): boolean {
  if (!element.tags) return false;
  const elementTags = element.tags.map(t => t.toLowerCase());
  return tags.some(tag => elementTags.includes(tag.toLowerCase()));
}

export function findTagBasedCombination(a: string, b: string): { name: string; emoji: string; type: string } | null {
  const elA = getElementById(a);
  const elB = getElementById(b);
  if (!elA || !elB) return null;

  // Check all rules, highest priority first
  const sortedRules = [...TAG_RULES].sort((r1, r2) => r2.priority - r1.priority);
  
  for (const rule of sortedRules) {
    const aMatchesB = elementMatchesTags(elA, rule.tagsA) && elementMatchesTags(elB, rule.tagsB);
    const bMatchesA = elementMatchesTags(elA, rule.tagsB) && elementMatchesTags(elB, rule.tagsA);
    
    if (aMatchesB || bMatchesA) {
      return rule.result;
    }
  }

  return null;
}