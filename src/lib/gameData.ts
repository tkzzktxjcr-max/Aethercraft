import { GameElement, Combination, OriginPack } from '@/types/game';

export const ELEMENTS: Record<string, GameElement> = {
  // Classical base
  fire: { id: 'fire', name: 'Fire', emoji: '🔥', properties: ['heat', 'energy'], type: 'energy' },
  water: { id: 'water', name: 'Water', emoji: '💧', properties: ['liquid', 'cold'], type: 'liquid' },
  earth: { id: 'earth', name: 'Earth', emoji: '🌍', properties: ['solid', 'ground'], type: 'matter' },
  air: { id: 'air', name: 'Air', emoji: '💨', properties: ['gas', 'wind'], type: 'gas' },
  // Celestial base
  star: { id: 'star', name: 'Star', emoji: '⭐', properties: ['sky', 'bright'], type: 'cosmic' },
  void: { id: 'void', name: 'Void', emoji: '🌑', properties: ['empty', 'dark'], type: 'cosmic' },
  sun: { id: 'sun', name: 'Sun', emoji: '☀️', properties: ['hot', 'bright'], type: 'cosmic' },
  moon: { id: 'moon', name: 'Moon', emoji: '🌙', properties: ['night', 'sky'], type: 'cosmic' },
  // Vital base
  seed: { id: 'seed', name: 'Seed', emoji: '🌰', properties: ['life', 'small'], type: 'life' },
  spore: { id: 'spore', name: 'Spore', emoji: '🍄', properties: ['small', 'life'], type: 'life' },
  soil: { id: 'soil', name: 'Soil', emoji: '🪴', properties: ['earth', 'rich'], type: 'matter' },
  light: { id: 'light', name: 'Light', emoji: '✨', properties: ['bright', 'energy'], type: 'energy' },
  // Derived
  steam: { id: 'steam', name: 'Steam', emoji: '♨️', properties: ['gas', 'heat'], type: 'gas' },
  lava: { id: 'lava', name: 'Lava', emoji: '🌋', properties: ['heat', 'matter'], type: 'matter' },
  energy: { id: 'energy', name: 'Energy', emoji: '⚡', properties: ['power', 'force'], type: 'energy' },
  mud: { id: 'mud', name: 'Mud', emoji: '💩', properties: ['liquid', 'matter'], type: 'liquid' },
  rain: { id: 'rain', name: 'Rain', emoji: '🌧️', properties: ['water', 'sky'], type: 'liquid' },
  dust: { id: 'dust', name: 'Dust', emoji: '🌫️', properties: ['small', 'earth'], type: 'matter' },
  cloud: { id: 'cloud', name: 'Cloud', emoji: '☁️', properties: ['sky', 'water'], type: 'gas' },
  sky: { id: 'sky', name: 'Sky', emoji: '🌌', properties: ['air', 'blue'], type: 'gas' },
  plant: { id: 'plant', name: 'Plant', emoji: '🌱', properties: ['life', 'green'], type: 'life' },
  ash: { id: 'ash', name: 'Ash', emoji: '⚪', properties: ['grey', 'fire'], type: 'matter' },
  grass: { id: 'grass', name: 'Grass', emoji: '🌿', properties: ['life', 'green'], type: 'life' },
  tree: { id: 'tree', name: 'Tree', emoji: '🌳', properties: ['life', 'wood'], type: 'life' },
  stone: { id: 'stone', name: 'Stone', emoji: '🪨', properties: ['hard', 'earth'], type: 'matter' },
  metal: { id: 'metal', name: 'Metal', emoji: '🔩', properties: ['hard', 'shiny'], type: 'matter' },
  tool: { id: 'tool', name: 'Tool', emoji: '🔨', properties: ['useful', 'human'], type: 'matter' },
  wood: { id: 'wood', name: 'Wood', emoji: '🪵', properties: ['organic', 'brown'], type: 'matter' },
  paper: { id: 'paper', name: 'Paper', emoji: '📄', properties: ['thin', 'white'], type: 'matter' },
  electricity: { id: 'electricity', name: 'Electricity', emoji: '💡', properties: ['power', 'fast'], type: 'energy' },
  lightning: { id: 'lightning', name: 'Lightning', emoji: '⚡', properties: ['sky', 'energy'], type: 'energy' },
  blade: { id: 'blade', name: 'Blade', emoji: '🔪', properties: ['sharp', 'metal'], type: 'matter' },
  sword: { id: 'sword', name: 'Sword', emoji: '⚔️', properties: ['weapon', 'metal'], type: 'matter' },
  brick: { id: 'brick', name: 'Brick', emoji: '🧱', properties: ['building', 'red'], type: 'matter' },
  wall: { id: 'wall', name: 'Wall', emoji: '🧱', properties: ['building', 'big'], type: 'matter' },
  house: { id: 'house', name: 'House', emoji: '🏠', properties: ['building', 'home'], type: 'matter' },
  garden: { id: 'garden', name: 'Garden', emoji: '🌷', properties: ['life', 'beautiful'], type: 'life' },
  pond: { id: 'pond', name: 'Pond', emoji: '🏞️', properties: ['water', 'small'], type: 'liquid' },
  lake: { id: 'lake', name: 'Lake', emoji: '🏖️', properties: ['water', 'big'], type: 'liquid' },
  ocean: { id: 'ocean', name: 'Ocean', emoji: '🌊', properties: ['water', 'huge'], type: 'liquid' },
  island: { id: 'island', name: 'Island', emoji: '🏝️', properties: ['land', 'surrounded'], type: 'matter' },
  sand: { id: 'sand', name: 'Sand', emoji: '🏜️', properties: ['small', 'beach'], type: 'matter' },
  glass: { id: 'glass', name: 'Glass', emoji: '🥃', properties: ['transparent', 'fragile'], type: 'matter' },
  desert: { id: 'desert', name: 'Desert', emoji: '🏜️', properties: ['dry', 'hot'], type: 'matter' },
  forest: { id: 'forest', name: 'Forest', emoji: '🌲', properties: ['life', 'many'], type: 'life' },
  campfire: { id: 'campfire', name: 'Campfire', emoji: '🔥', properties: ['heat', 'light'], type: 'energy' },
  wind: { id: 'wind', name: 'Wind', emoji: '🌬️', properties: ['air', 'fast'], type: 'gas' },
  snow: { id: 'snow', name: 'Snow', emoji: '❄️', properties: ['cold', 'white'], type: 'matter' },
  volcano: { id: 'volcano', name: 'Volcano', emoji: '🌋', properties: ['fire', 'mountain'], type: 'matter' },
  clock: { id: 'clock', name: 'Clock', emoji: '🕐', properties: ['time', 'tool'], type: 'matter' },
  wheel: { id: 'wheel', name: 'Wheel', emoji: '☸️', properties: ['round', 'tool'], type: 'matter' },
  cart: { id: 'cart', name: 'Cart', emoji: '🛒', properties: ['vehicle', 'wood'], type: 'matter' },
  car: { id: 'car', name: 'Car', emoji: '🚗', properties: ['vehicle', 'fast'], type: 'matter' },
  train: { id: 'train', name: 'Train', emoji: '🚂', properties: ['vehicle', 'big'], type: 'matter' },
  airplane: { id: 'airplane', name: 'Airplane', emoji: '✈️', properties: ['vehicle', 'sky'], type: 'matter' },
  blackhole: { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', properties: ['dark', 'gravity'], type: 'cosmic' },
  rainbow: { id: 'rainbow', name: 'Rainbow', emoji: '🌈', properties: ['color', 'sky'], type: 'cosmic' },
  tide: { id: 'tide', name: 'Tide', emoji: '🌊', properties: ['water', 'moon'], type: 'liquid' },
  darkness: { id: 'darkness', name: 'Darkness', emoji: '🌑', properties: ['dark', 'absence'], type: 'cosmic' },
  shadow: { id: 'shadow', name: 'Shadow', emoji: '👤', properties: ['dark', 'light'], type: 'cosmic' },
  galaxy: { id: 'galaxy', name: 'Galaxy', emoji: '🌌', properties: ['space', 'stars'], type: 'cosmic' },
  universe: { id: 'universe', name: 'Universe', emoji: '🌠', properties: ['space', 'everything'], type: 'cosmic' },
  nebula: { id: 'nebula', name: 'Nebula', emoji: '🌫️', properties: ['cloud', 'space'], type: 'cosmic' },
  flower: { id: 'flower', name: 'Flower', emoji: '🌸', properties: ['beautiful', 'plant'], type: 'life' },
  eclipse: { id: 'eclipse', name: 'Eclipse', emoji: '🌒', properties: ['sun', 'moon'], type: 'cosmic' },
};

export const COMBINATIONS: Combination[] = [
  { id: 'c1', elementA: 'fire', elementB: 'water', result: 'steam' },
  { id: 'c2', elementA: 'fire', elementB: 'earth', result: 'lava' },
  { id: 'c3', elementA: 'fire', elementB: 'air', result: 'energy' },
  { id: 'c4', elementA: 'water', elementB: 'earth', result: 'mud' },
  { id: 'c5', elementA: 'water', elementB: 'air', result: 'rain' },
  { id: 'c6', elementA: 'earth', elementB: 'air', result: 'dust' },
  { id: 'c7', elementA: 'steam', elementB: 'air', result: 'cloud' },
  { id: 'c8', elementA: 'cloud', elementB: 'air', result: 'sky' },
  { id: 'c9', elementA: 'fire', elementB: 'sky', result: 'sun' },
  { id: 'c10', elementA: 'rain', elementB: 'earth', result: 'plant' },
  { id: 'c11', elementA: 'plant', elementB: 'fire', result: 'ash' },
  { id: 'c12', elementA: 'plant', elementB: 'earth', result: 'grass' },
  { id: 'c13', elementA: 'grass', elementB: 'sun', result: 'tree' },
  { id: 'c14', elementA: 'lava', elementB: 'water', result: 'stone' },
  { id: 'c15', elementA: 'stone', elementB: 'fire', result: 'metal' },
  { id: 'c16', elementA: 'metal', elementB: 'wood', result: 'tool' },
  { id: 'c17', elementA: 'tree', elementB: 'tool', result: 'wood' },
  { id: 'c18', elementA: 'wood', elementB: 'tool', result: 'paper' },
  { id: 'c19', elementA: 'metal', elementB: 'energy', result: 'electricity' },
  { id: 'c20', elementA: 'energy', elementB: 'air', result: 'lightning' },
  { id: 'c21', elementA: 'metal', elementB: 'stone', result: 'blade' },
  { id: 'c22', elementA: 'blade', elementB: 'wood', result: 'sword' },
  { id: 'c23', elementA: 'mud', elementB: 'fire', result: 'brick' },
  { id: 'c24', elementA: 'brick', elementB: 'brick', result: 'wall' },
  { id: 'c25', elementA: 'wall', elementB: 'wall', result: 'house' },
  { id: 'c26', elementA: 'plant', elementB: 'plant', result: 'garden' },
  { id: 'c27', elementA: 'garden', elementB: 'water', result: 'pond' },
  { id: 'c28', elementA: 'pond', elementB: 'water', result: 'lake' },
  { id: 'c29', elementA: 'lake', elementB: 'water', result: 'ocean' },
  { id: 'c30', elementA: 'ocean', elementB: 'earth', result: 'island' },
  { id: 'c31', elementA: 'stone', elementB: 'air', result: 'sand' },
  { id: 'c32', elementA: 'sand', elementB: 'fire', result: 'glass' },
  { id: 'c33', elementA: 'sand', elementB: 'sun', result: 'desert' },
  { id: 'c34', elementA: 'tree', elementB: 'tree', result: 'forest' },
  { id: 'c35', elementA: 'wood', elementB: 'fire', result: 'campfire' },
  { id: 'c36', elementA: 'air', elementB: 'energy', result: 'wind' },
  { id: 'c37', elementA: 'wind', elementB: 'rain', result: 'snow' },
  { id: 'c38', elementA: 'lava', elementB: 'earth', result: 'volcano' },
  { id: 'c39', elementA: 'tool', elementB: 'sun', result: 'clock' },
  { id: 'c40', elementA: 'wood', elementB: 'tool', result: 'wheel' },
  { id: 'c41', elementA: 'wheel', elementB: 'wood', result: 'cart' },
  { id: 'c42', elementA: 'cart', elementB: 'energy', result: 'car' },
  { id: 'c43', elementA: 'car', elementB: 'metal', result: 'train' },
  { id: 'c44', elementA: 'car', elementB: 'air', result: 'airplane' },
  { id: 'c45', elementA: 'star', elementB: 'void', result: 'blackhole' },
  { id: 'c46', elementA: 'sun', elementB: 'water', result: 'rainbow' },
  { id: 'c47', elementA: 'moon', elementB: 'ocean', result: 'tide' },
  { id: 'c48', elementA: 'void', elementB: 'air', result: 'darkness' },
  { id: 'c49', elementA: 'darkness', elementB: 'fire', result: 'shadow' },
  { id: 'c50', elementA: 'star', elementB: 'star', result: 'galaxy' },
  { id: 'c51', elementA: 'galaxy', elementB: 'void', result: 'universe' },
  { id: 'c52', elementA: 'star', elementB: 'cloud', result: 'nebula' },
  { id: 'c53', elementA: 'seed', elementB: 'soil', result: 'plant' },
  { id: 'c54', elementA: 'light', elementB: 'plant', result: 'flower' },
  { id: 'c55', elementA: 'sun', elementB: 'plant', result: 'flower' },
  { id: 'c56', elementA: 'sun', elementB: 'moon', result: 'eclipse' },
  { id: 'c57', elementA: 'light', elementB: 'darkness', result: 'shadow' },
  { id: 'c58', elementA: 'spore', elementB: 'water', result: 'mushroom' },
  { id: 'c59', elementA: 'spore', elementB: 'wood', result: 'mushroom' },
];

// Add mushroom element since it's in combinations
ELEMENTS.mushroom = { id: 'mushroom', name: 'Mushroom', emoji: '🍄', properties: ['fungus', 'small'], type: 'life' };

const combinationMap = new Map<string, string>();

function getComboKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

COMBINATIONS.forEach(c => {
  combinationMap.set(getComboKey(c.elementA, c.elementB), c.result);
});

export function findCombination(a: string, b: string): string | null {
  return combinationMap.get(getComboKey(a, b)) || null;
}

export function getElementById(id: string): GameElement | undefined {
  return ELEMENTS[id];
}

export const ORIGIN_PACKS: OriginPack[] = [
  {
    id: 'classical',
    name: 'Classical Elements',
    description: 'The ancient foundations of matter and energy. Perfect for builders and alchemists.',
    elements: ['fire', 'water', 'earth', 'air'],
    themeColor: '#f59e0b',
  },
  {
    id: 'celestial',
    name: 'Celestial Bodies',
    description: 'Forge creations from the cosmos itself. For those who reach for the stars.',
    elements: ['star', 'void', 'sun', 'moon'],
    themeColor: '#8b5cf6',
  },
  {
    id: 'vital',
    name: 'Vital Spark',
    description: 'Life, light, and growth. The path of nature and organic wonder.',
    elements: ['seed', 'spore', 'soil', 'light'],
    themeColor: '#10b981',
  },
];

export function getCombinationsForElement(elementId: string): Combination[] {
  return COMBINATIONS.filter(
    c => c.elementA === elementId || c.elementB === elementId
  );
}

export function getProvenance(elementId: string): Combination | null {
  return COMBINATIONS.find(c => c.result === elementId) || null;
}