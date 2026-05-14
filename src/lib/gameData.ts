import { GameElement, Combination, OriginPack } from '@/types/game';

export const ELEMENTS: Record<string, GameElement> = {
  // Classical base
  fire: { id: 'fire', name: 'Fire', emoji: '🔥', properties: ['heat', 'energy'], type: 'energy', tags: ['hot', 'energy', 'fire', 'bright', 'light'] },
  water: { id: 'water', name: 'Water', emoji: '💧', properties: ['liquid', 'cold'], type: 'liquid', tags: ['wet', 'liquid', 'cold', 'water'] },
  earth: { id: 'earth', name: 'Earth', emoji: '🌍', properties: ['solid', 'ground'], type: 'matter', tags: ['solid', 'ground', 'dry', 'earth', 'hard'] },
  air: { id: 'air', name: 'Air', emoji: '💨', properties: ['gas', 'wind'], type: 'gas', tags: ['gas', 'wind', 'air', 'light', 'fast'] },
  // Celestial base
  star: { id: 'star', name: 'Star', emoji: '⭐', properties: ['sky', 'bright'], type: 'cosmic', tags: ['celestial', 'bright', 'space', 'hot', 'light'] },
  void: { id: 'void', name: 'Void', emoji: '🌑', properties: ['empty', 'dark'], type: 'cosmic', tags: ['celestial', 'dark', 'space', 'cold', 'empty'] },
  sun: { id: 'sun', name: 'Sun', emoji: '☀️', properties: ['hot', 'bright'], type: 'cosmic', tags: ['celestial', 'bright', 'hot', 'light', 'sky'] },
  moon: { id: 'moon', name: 'Moon', emoji: '🌙', properties: ['night', 'sky'], type: 'cosmic', tags: ['celestial', 'dark', 'cold', 'sky', 'night'] },
  // Vital base
  seed: { id: 'seed', name: 'Seed', emoji: '🌰', properties: ['life', 'small'], type: 'life', tags: ['life', 'small', 'organic', 'plant'] },
  spore: { id: 'spore', name: 'Spore', emoji: '🍄', properties: ['small', 'life'], type: 'life', tags: ['life', 'small', 'organic', 'fungus'] },
  soil: { id: 'soil', name: 'Soil', emoji: '🪴', properties: ['earth', 'rich'], type: 'matter', tags: ['earth', 'organic', 'wet', 'ground'] },
  light: { id: 'light', name: 'Light', emoji: '✨', properties: ['bright', 'energy'], type: 'energy', tags: ['energy', 'bright', 'light', 'hot'] },
  // Derived
  steam: { id: 'steam', name: 'Steam', emoji: '♨️', properties: ['gas', 'heat'], type: 'gas', tags: ['gas', 'hot', 'wet', 'water'] },
  lava: { id: 'lava', name: 'Lava', emoji: '🌋', properties: ['heat', 'matter'], type: 'matter', tags: ['hot', 'liquid', 'earth', 'fire', 'hard'] },
  energy: { id: 'energy', name: 'Energy', emoji: '⚡', properties: ['power', 'force'], type: 'energy', tags: ['energy', 'hot', 'bright', 'fast', 'electric'] },
  mud: { id: 'mud', name: 'Mud', emoji: '💩', properties: ['liquid', 'matter'], type: 'liquid', tags: ['wet', 'earth', 'liquid', 'soft', 'organic'] },
  rain: { id: 'rain', name: 'Rain', emoji: '🌧️', properties: ['water', 'sky'], type: 'liquid', tags: ['water', 'sky', 'wet', 'cold', 'rain'] },
  dust: { id: 'dust', name: 'Dust', emoji: '🌫️', properties: ['small', 'earth'], type: 'matter', tags: ['small', 'earth', 'dry', 'air', 'soft'] },
  cloud: { id: 'cloud', name: 'Cloud', emoji: '☁️', properties: ['sky', 'water'], type: 'gas', tags: ['sky', 'water', 'gas', 'wet', 'white'] },
  sky: { id: 'sky', name: 'Sky', emoji: '🌌', properties: ['air', 'blue'], type: 'gas', tags: ['air', 'sky', 'blue', 'gas', 'big'] },
  plant: { id: 'plant', name: 'Plant', emoji: '🌱', properties: ['life', 'green'], type: 'life', tags: ['life', 'green', 'organic', 'plant', 'small'] },
  ash: { id: 'ash', name: 'Ash', emoji: '⚪', properties: ['grey', 'fire'], type: 'matter', tags: ['grey', 'fire', 'dry', 'small', 'soft'] },
  grass: { id: 'grass', name: 'Grass', emoji: '🌿', properties: ['life', 'green'], type: 'life', tags: ['life', 'green', 'organic', 'plant', 'small'] },
  tree: { id: 'tree', name: 'Tree', emoji: '🌳', properties: ['life', 'wood'], type: 'life', tags: ['life', 'wood', 'organic', 'plant', 'big'] },
  stone: { id: 'stone', name: 'Stone', emoji: '🪨', properties: ['hard', 'earth'], type: 'matter', tags: ['hard', 'earth', 'solid', 'stone', 'dry'] },
  metal: { id: 'metal', name: 'Metal', emoji: '🔩', properties: ['hard', 'shiny'], type: 'matter', tags: ['hard', 'shiny', 'solid', 'metal', 'synthetic'] },
  tool: { id: 'tool', name: 'Tool', emoji: '🔨', properties: ['useful', 'human'], type: 'matter', tags: ['useful', 'human', 'synthetic', 'tool', 'metal'] },
  wood: { id: 'wood', name: 'Wood', emoji: '🪵', properties: ['organic', 'brown'], type: 'matter', tags: ['organic', 'brown', 'solid', 'wood', 'plant'] },
  paper: { id: 'paper', name: 'Paper', emoji: '📄', properties: ['thin', 'white'], type: 'matter', tags: ['thin', 'white', 'synthetic', 'wood', 'small'] },
  electricity: { id: 'electricity', name: 'Electricity', emoji: '💡', properties: ['power', 'fast'], type: 'energy', tags: ['power', 'fast', 'energy', 'electric', 'bright'] },
  lightning: { id: 'lightning', name: 'Lightning', emoji: '⚡', properties: ['sky', 'energy'], type: 'energy', tags: ['sky', 'energy', 'electric', 'bright', 'fast'] },
  blade: { id: 'blade', name: 'Blade', emoji: '🔪', properties: ['sharp', 'metal'], type: 'matter', tags: ['sharp', 'metal', 'weapon', 'tool', 'hard'] },
  sword: { id: 'sword', name: 'Sword', emoji: '⚔️', properties: ['weapon', 'metal'], type: 'matter', tags: ['weapon', 'metal', 'sharp', 'tool', 'hard'] },
  brick: { id: 'brick', name: 'Brick', emoji: '🧱', properties: ['building', 'red'], type: 'matter', tags: ['building', 'red', 'solid', 'stone', 'synthetic'] },
  wall: { id: 'wall', name: 'Wall', emoji: '🧱', properties: ['building', 'big'], type: 'matter', tags: ['building', 'big', 'solid', 'stone', 'hard'] },
  house: { id: 'house', name: 'House', emoji: '🏠', properties: ['building', 'home'], type: 'matter', tags: ['building', 'home', 'big', 'solid', 'wood'] },
  garden: { id: 'garden', name: 'Garden', emoji: '🌷', properties: ['life', 'beautiful'], type: 'life', tags: ['life', 'beautiful', 'green', 'plant', 'organic'] },
  pond: { id: 'pond', name: 'Pond', emoji: '🏞️', properties: ['water', 'small'], type: 'liquid', tags: ['water', 'small', 'wet', 'liquid'] },
  lake: { id: 'lake', name: 'Lake', emoji: '🏖️', properties: ['water', 'big'], type: 'liquid', tags: ['water', 'big', 'wet', 'liquid'] },
  ocean: { id: 'ocean', name: 'Ocean', emoji: '🌊', properties: ['water', 'huge'], type: 'liquid', tags: ['water', 'huge', 'wet', 'liquid', 'salt'] },
  island: { id: 'island', name: 'Island', emoji: '🏝️', properties: ['land', 'surrounded'], type: 'matter', tags: ['land', 'surrounded', 'earth', 'ground', 'big'] },
  sand: { id: 'sand', name: 'Sand', emoji: '🏜️', properties: ['small', 'beach'], type: 'matter', tags: ['small', 'beach', 'dry', 'stone', 'soft'] },
  glass: { id: 'glass', name: 'Glass', emoji: '🥃', properties: ['transparent', 'fragile'], type: 'matter', tags: ['transparent', 'fragile', 'synthetic', 'sand', 'solid'] },
  desert: { id: 'desert', name: 'Desert', emoji: '🏜️', properties: ['dry', 'hot'], type: 'matter', tags: ['dry', 'hot', 'sand', 'big', 'earth'] },
  forest: { id: 'forest', name: 'Forest', emoji: '🌲', properties: ['life', 'many'], type: 'life', tags: ['life', 'many', 'green', 'plant', 'big', 'organic'] },
  campfire: { id: 'campfire', name: 'Campfire', emoji: '🔥', properties: ['heat', 'light'], type: 'energy', tags: ['heat', 'light', 'fire', 'small', 'wood'] },
  wind: { id: 'wind', name: 'Wind', emoji: '🌬️', properties: ['air', 'fast'], type: 'gas', tags: ['air', 'fast', 'gas', 'wind', 'cold'] },
  snow: { id: 'snow', name: 'Snow', emoji: '❄️', properties: ['cold', 'white'], type: 'matter', tags: ['cold', 'white', 'wet', 'solid', 'small'] },
  volcano: { id: 'volcano', name: 'Volcano', emoji: '🌋', properties: ['fire', 'mountain'], type: 'matter', tags: ['fire', 'mountain', 'hot', 'big', 'earth'] },
  clock: { id: 'clock', name: 'Clock', emoji: '🕐', properties: ['time', 'tool'], type: 'matter', tags: ['time', 'tool', 'synthetic', 'metal', 'small'] },
  wheel: { id: 'wheel', name: 'Wheel', emoji: '☸️', properties: ['round', 'tool'], type: 'matter', tags: ['round', 'tool', 'synthetic', 'wood', 'metal'] },
  cart: { id: 'cart', name: 'Cart', emoji: '🛒', properties: ['vehicle', 'wood'], type: 'matter', tags: ['vehicle', 'wood', 'synthetic', 'tool', 'wheel'] },
  car: { id: 'car', name: 'Car', emoji: '🚗', properties: ['vehicle', 'fast'], type: 'matter', tags: ['vehicle', 'fast', 'synthetic', 'metal', 'tool'] },
  train: { id: 'train', name: 'Train', emoji: '🚂', properties: ['vehicle', 'big'], type: 'matter', tags: ['vehicle', 'big', 'fast', 'synthetic', 'metal'] },
  airplane: { id: 'airplane', name: 'Airplane', emoji: '✈️', properties: ['vehicle', 'sky'], type: 'matter', tags: ['vehicle', 'sky', 'fast', 'synthetic', 'metal'] },
  blackhole: { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', properties: ['dark', 'gravity'], type: 'cosmic', tags: ['dark', 'gravity', 'space', 'celestial', 'huge'] },
  rainbow: { id: 'rainbow', name: 'Rainbow', emoji: '🌈', properties: ['color', 'sky'], type: 'cosmic', tags: ['color', 'sky', 'beautiful', 'light', 'celestial'] },
  tide: { id: 'tide', name: 'Tide', emoji: '🌊', properties: ['water', 'moon'], type: 'liquid', tags: ['water', 'moon', 'wet', 'liquid', 'celestial'] },
  darkness: { id: 'darkness', name: 'Darkness', emoji: '🌑', properties: ['dark', 'absence'], type: 'cosmic', tags: ['dark', 'absence', 'cold', 'void', 'empty'] },
  shadow: { id: 'shadow', name: 'Shadow', emoji: '👤', properties: ['dark', 'light'], type: 'cosmic', tags: ['dark', 'light', 'void', 'small', 'celestial'] },
  galaxy: { id: 'galaxy', name: 'Galaxy', emoji: '🌌', properties: ['space', 'stars'], type: 'cosmic', tags: ['space', 'stars', 'celestial', 'huge', 'bright'] },
  universe: { id: 'universe', name: 'Universe', emoji: '🌠', properties: ['space', 'everything'], type: 'cosmic', tags: ['space', 'everything', 'celestial', 'huge', 'void'] },
  nebula: { id: 'nebula', name: 'Nebula', emoji: '🌫️', properties: ['cloud', 'space'], type: 'cosmic', tags: ['cloud', 'space', 'celestial', 'color', 'gas'] },
  flower: { id: 'flower', name: 'Flower', emoji: '🌸', properties: ['beautiful', 'plant'], type: 'life', tags: ['beautiful', 'plant', 'life', 'color', 'organic', 'small'] },
  eclipse: { id: 'eclipse', name: 'Eclipse', emoji: '🌒', properties: ['sun', 'moon'], type: 'cosmic', tags: ['sun', 'moon', 'celestial', 'dark', 'rare'] },
  mushroom: { id: 'mushroom', name: 'Mushroom', emoji: '🍄', properties: ['fungus', 'small'], type: 'life', tags: ['fungus', 'small', 'organic', 'life', 'earth'] },
  generating: { id: 'generating', name: 'Generating...', emoji: '✨', properties: ['ai', 'pending'], type: 'energy', tags: ['ai', 'pending', 'generating'] },
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