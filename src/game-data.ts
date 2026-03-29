export interface GameState {
	cookies: number;
	totalCookies: number;
	cookiesPerClick: number;
	buildingCounts: number[];
	upgradePurchased: boolean[];
	lastSaved: number;
}

export interface Building {
	name: string;
	baseCost: number;
	baseCps: number;
	description: string;
	icon: string;
}

export interface Upgrade {
	name: string;
	cost: number;
	description: string;
	icon: string;
	targetBuilding: number;
	multiplier: number;
	requirement: number;
}

export const BUILDINGS: Building[] = [
	{
		name: 'Villager',
		baseCost: 15,
		baseCps: 0.1,
		description: 'A humble villager smelting netherite for you.',
		icon: '🧑‍🌾'
	},
	{
		name: 'Crafting Table',
		baseCost: 100,
		baseCps: 1,
		description: 'Auto-crafts netherite from ancient debris.',
		icon: '🔨'
	},
	{
		name: 'Wheat Farm',
		baseCost: 1100,
		baseCps: 8,
		description: 'Grows nether wart infused with netherite dust.',
		icon: '🌾'
	},
	{
		name: 'Mine Shaft',
		baseCost: 12000,
		baseCps: 47,
		description: 'Digs through the Nether for ancient debris.',
		icon: '⛏️'
	},
	{
		name: 'Redstone Factory',
		baseCost: 130000,
		baseCps: 260,
		description: 'Automated redstone contraption that smelts netherite.',
		icon: '🔴'
	},
	{
		name: 'Ender Chest Vault',
		baseCost: 1400000,
		baseCps: 1400,
		description: 'Stores netherite across dimensions.',
		icon: '📦'
	},
	{
		name: 'Nether Fortress',
		baseCost: 20000000,
		baseCps: 7800,
		description: 'Ancient blaze-powered netherite forge.',
		icon: '🔥'
	},
	{
		name: 'Enchanting Tower',
		baseCost: 330000000,
		baseCps: 44000,
		description: 'Conjures netherite with enchantment magic.',
		icon: '✨'
	},
];

export const UPGRADES: Upgrade[] = [
	// Click upgrades
	{ name: 'Iron Pickaxe', cost: 100, description: 'Mine harder! Clicking power doubled.', icon: '⛏️', targetBuilding: -1, multiplier: 2, requirement: 0 },
	{ name: 'Diamond Pickaxe', cost: 500, description: 'The classic. Clicking power doubled.', icon: '💎', targetBuilding: -1, multiplier: 2, requirement: 0 },
	{ name: 'Netherite Pickaxe', cost: 10000, description: 'Ultimate tool. Clicking power tripled.', icon: '🟫', targetBuilding: -1, multiplier: 3, requirement: 0 },

	// Villager upgrades
	{ name: 'Better Trades', cost: 100, description: 'Villagers are twice as efficient.', icon: '💰', targetBuilding: 0, multiplier: 2, requirement: 1 },
	{ name: 'Master Villagers', cost: 500, description: 'Villagers are twice as efficient.', icon: '👑', targetBuilding: 0, multiplier: 2, requirement: 1 },

	// Crafting Table upgrades
	{ name: 'Auto-Crafting', cost: 1000, description: 'Crafting tables are twice as efficient.', icon: '⚙️', targetBuilding: 1, multiplier: 2, requirement: 1 },
	{ name: 'Bulk Recipes', cost: 5000, description: 'Crafting tables are twice as efficient.', icon: '📖', targetBuilding: 1, multiplier: 2, requirement: 5 },

	// Wheat Farm upgrades
	{ name: 'Bone Meal', cost: 11000, description: 'Farms are twice as efficient.', icon: '🦴', targetBuilding: 2, multiplier: 2, requirement: 1 },
	{ name: 'Composter', cost: 55000, description: 'Farms are twice as efficient.', icon: '🪣', targetBuilding: 2, multiplier: 2, requirement: 5 },

	// Mine Shaft upgrades
	{ name: 'Fortune III', cost: 120000, description: 'Mines are twice as efficient.', icon: '🌟', targetBuilding: 3, multiplier: 2, requirement: 1 },
	{ name: 'Efficiency V', cost: 600000, description: 'Mines are twice as efficient.', icon: '⚡', targetBuilding: 3, multiplier: 2, requirement: 5 },

	// Redstone Factory upgrades
	{ name: 'Repeater Arrays', cost: 1300000, description: 'Factories are twice as efficient.', icon: '🔁', targetBuilding: 4, multiplier: 2, requirement: 1 },
	{ name: 'Comparator Logic', cost: 6500000, description: 'Factories are twice as efficient.', icon: '🔧', targetBuilding: 4, multiplier: 2, requirement: 5 },

	// Ender Chest upgrades
	{ name: 'Shulker Boxes', cost: 14000000, description: 'Vaults are twice as efficient.', icon: '🟪', targetBuilding: 5, multiplier: 2, requirement: 1 },

	// Nether Fortress upgrades
	{ name: 'Blaze Rods', cost: 200000000, description: 'Fortresses are twice as efficient.', icon: '🏹', targetBuilding: 6, multiplier: 2, requirement: 1 },

	// Enchanting Tower upgrades
	{ name: 'Infinity Books', cost: 3300000000, description: 'Towers are twice as efficient.', icon: '📚', targetBuilding: 7, multiplier: 2, requirement: 1 },
];

export function DEFAULT_GAME_STATE(): GameState {
	return {
		cookies: 0,
		totalCookies: 0,
		cookiesPerClick: 1,
		buildingCounts: new Array(BUILDINGS.length).fill(0),
		upgradePurchased: new Array(UPGRADES.length).fill(false),
		lastSaved: Date.now(),
	};
}

export function getBuildingCost(building: Building, owned: number): number {
	return Math.floor(building.baseCost * Math.pow(1.15, owned));
}

export function getCps(state: GameState): number {
	let totalCps = 0;
	for (let i = 0; i < BUILDINGS.length; i++) {
		let buildingCps = BUILDINGS[i]!.baseCps * state.buildingCounts[i]!;
		for (let j = 0; j < UPGRADES.length; j++) {
			if (state.upgradePurchased[j] && UPGRADES[j]!.targetBuilding === i) {
				buildingCps *= UPGRADES[j]!.multiplier;
			}
		}
		totalCps += buildingCps;
	}
	return totalCps;
}

export function getClickValue(state: GameState): number {
	let clickVal = 1;
	for (let j = 0; j < UPGRADES.length; j++) {
		if (state.upgradePurchased[j] && UPGRADES[j]!.targetBuilding === -1) {
			clickVal *= UPGRADES[j]!.multiplier;
		}
	}
	return clickVal;
}

export function formatNumber(n: number): string {
	if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString();
	if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
	if (n < 1e9) return (n / 1e6).toFixed(1) + 'M';
	if (n < 1e12) return (n / 1e9).toFixed(1) + 'B';
	if (n < 1e15) return (n / 1e12).toFixed(1) + 'T';
	return (n / 1e15).toFixed(1) + 'Qa';
}
