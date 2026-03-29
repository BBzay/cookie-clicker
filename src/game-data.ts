export interface GameState {
	cookies: number;
	totalCookies: number;       // lifetime cookies earned
	cookiesPerClick: number;
	buildingCounts: number[];
	upgradePurchased: boolean[];
	lastSaved: number;
}

export interface Building {
	name: string;
	baseCost: number;
	baseCps: number;            // cookies per second
	description: string;
	icon: string;               // emoji
}

export interface Upgrade {
	name: string;
	cost: number;
	description: string;
	icon: string;
	// Which building this upgrades (-1 = clicking)
	targetBuilding: number;
	multiplier: number;
	// Minimum buildings of that type required to unlock
	requirement: number;
}

export const BUILDINGS: Building[] = [
	{
		name: 'Cursor',
		baseCost: 15,
		baseCps: 0.1,
		description: 'Autoclicks once every 10 seconds.',
		icon: '👆'
	},
	{
		name: 'Grandma',
		baseCost: 100,
		baseCps: 1,
		description: 'A nice grandma to bake more cookies.',
		icon: '👵'
	},
	{
		name: 'Farm',
		baseCost: 1100,
		baseCps: 8,
		description: 'Grows cookie plants from cookie seeds.',
		icon: '🌾'
	},
	{
		name: 'Mine',
		baseCost: 12000,
		baseCps: 47,
		description: 'Mines out cookie dough and chocolate chips.',
		icon: '⛏️'
	},
	{
		name: 'Factory',
		baseCost: 130000,
		baseCps: 260,
		description: 'Produces large quantities of cookies.',
		icon: '🏭'
	},
	{
		name: 'Bank',
		baseCost: 1400000,
		baseCps: 1400,
		description: 'Generates cookies from interest.',
		icon: '🏦'
	},
	{
		name: 'Temple',
		baseCost: 20000000,
		baseCps: 7800,
		description: 'Full of precious, ancient cookie recipes.',
		icon: '🛕'
	},
	{
		name: 'Wizard Tower',
		baseCost: 330000000,
		baseCps: 44000,
		description: 'Conjures cookies with magic spells.',
		icon: '🧙'
	},
];

export const UPGRADES: Upgrade[] = [
	// Click upgrades
	{ name: 'Reinforced Index Finger', cost: 100, description: 'Clicking gains +1 cookie.', icon: '☝️', targetBuilding: -1, multiplier: 2, requirement: 0 },
	{ name: 'Carpal Tunnel Prevention', cost: 500, description: 'Clicking gains +2 cookies.', icon: '🖐️', targetBuilding: -1, multiplier: 2, requirement: 0 },
	{ name: 'Ambidextrous', cost: 10000, description: 'Clicking gains +5 cookies.', icon: '👐', targetBuilding: -1, multiplier: 3, requirement: 0 },

	// Cursor upgrades
	{ name: 'Faster Cursors', cost: 100, description: 'Cursors are twice as efficient.', icon: '🖱️', targetBuilding: 0, multiplier: 2, requirement: 1 },
	{ name: 'Titanium Mouse', cost: 500, description: 'Cursors are twice as efficient.', icon: '🔧', targetBuilding: 0, multiplier: 2, requirement: 1 },

	// Grandma upgrades
	{ name: 'Forwards from Grandma', cost: 1000, description: 'Grandmas are twice as efficient.', icon: '✉️', targetBuilding: 1, multiplier: 2, requirement: 1 },
	{ name: 'Steel-plated Rolling Pins', cost: 5000, description: 'Grandmas are twice as efficient.', icon: '🔩', targetBuilding: 1, multiplier: 2, requirement: 5 },

	// Farm upgrades
	{ name: 'Cheap Hoes', cost: 11000, description: 'Farms are twice as efficient.', icon: '🌱', targetBuilding: 2, multiplier: 2, requirement: 1 },
	{ name: 'Fertilizer', cost: 55000, description: 'Farms are twice as efficient.', icon: '🧪', targetBuilding: 2, multiplier: 2, requirement: 5 },

	// Mine upgrades
	{ name: 'Sugar Gas', cost: 120000, description: 'Mines are twice as efficient.', icon: '💨', targetBuilding: 3, multiplier: 2, requirement: 1 },
	{ name: 'Megadrill', cost: 600000, description: 'Mines are twice as efficient.', icon: '🔩', targetBuilding: 3, multiplier: 2, requirement: 5 },

	// Factory upgrades
	{ name: 'Sturdier Conveyor Belts', cost: 1300000, description: 'Factories are twice as efficient.', icon: '⚙️', targetBuilding: 4, multiplier: 2, requirement: 1 },
	{ name: 'Child Labor', cost: 6500000, description: 'Factories are twice as efficient.', icon: '👶', targetBuilding: 4, multiplier: 2, requirement: 5 },

	// Bank upgrades
	{ name: 'Taller Tellers', cost: 14000000, description: 'Banks are twice as efficient.', icon: '📊', targetBuilding: 5, multiplier: 2, requirement: 1 },

	// Temple upgrades
	{ name: 'Golden Idols', cost: 200000000, description: 'Temples are twice as efficient.', icon: '🗿', targetBuilding: 6, multiplier: 2, requirement: 1 },

	// Wizard upgrades
	{ name: 'Pointier Hats', cost: 3300000000, description: 'Wizard towers are twice as efficient.', icon: '🎩', targetBuilding: 7, multiplier: 2, requirement: 1 },
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
		// Apply upgrade multipliers
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
