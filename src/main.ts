import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CookieClickerView, VIEW_TYPE_COOKIE } from './view';
import { GameState, DEFAULT_GAME_STATE } from './game-data';

export default class CookieClickerPlugin extends Plugin {
	gameState: GameState;
	private saveInterval: number | null = null;

	async onload() {
		await this.loadGameState();

		this.registerView(VIEW_TYPE_COOKIE, (leaf) => new CookieClickerView(leaf, this));

		this.addRibbonIcon('cookie', 'Cookie Clicker', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-cookie-clicker',
			name: 'Open Cookie Clicker',
			callback: () => {
				this.activateView();
			}
		});

		// Auto-save every 30 seconds
		this.saveInterval = window.setInterval(() => {
			this.saveGameState();
		}, 30000);
		this.registerInterval(this.saveInterval);
	}

	onunload() {
		this.saveGameState();
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_COOKIE);
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_COOKIE)[0];

		if (!leaf) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: VIEW_TYPE_COOKIE, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadGameState() {
		const data = await this.loadData();
		this.gameState = Object.assign({}, DEFAULT_GAME_STATE(), data?.gameState ?? {});
		// Ensure buildings array has correct length (in case new buildings were added)
		const defaults = DEFAULT_GAME_STATE();
		if (this.gameState.buildingCounts.length < defaults.buildingCounts.length) {
			while (this.gameState.buildingCounts.length < defaults.buildingCounts.length) {
				this.gameState.buildingCounts.push(0);
			}
		}
	}

	async saveGameState() {
		this.gameState.lastSaved = Date.now();
		await this.saveData({ gameState: this.gameState });
	}

	resetGame() {
		this.gameState = DEFAULT_GAME_STATE();
		this.saveGameState();
	}
}
