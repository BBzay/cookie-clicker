import { ItemView, WorkspaceLeaf, Notice, setIcon } from 'obsidian';
import type CookieClickerPlugin from './main';
import {
	BUILDINGS, UPGRADES,
	getBuildingCost, getCps, getClickValue, formatNumber,
	GameState
} from './game-data';

export const VIEW_TYPE_COOKIE = 'cookie-clicker-view';

export class CookieClickerView extends ItemView {
	plugin: CookieClickerPlugin;
	private tickInterval: number | null = null;
	private renderInterval: number | null = null;

	// DOM references for efficient updates
	private cookieCountEl: HTMLElement | null = null;
	private cpsEl: HTMLElement | null = null;
	private cookieBtn: HTMLElement | null = null;
	private buildingListEl: HTMLElement | null = null;
	private upgradeListEl: HTMLElement | null = null;
	private floatingNumbers: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: CookieClickerPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string { return VIEW_TYPE_COOKIE; }
	getDisplayText(): string { return 'Cookie Clicker'; }
	getIcon(): string { return 'cookie'; }

	private get state(): GameState {
		return this.plugin.gameState;
	}

	async onOpen(): Promise<void> {
		// Award offline diamonds
		this.awardOfflineCookies();

		const container = this.contentEl;
		container.empty();
		container.addClass('cookie-clicker-container');

		// --- Header ---
		const header = container.createDiv('cc-header');
		header.createEl('h2', { text: 'Netherite Clicker', cls: 'cc-title' });

		// --- Cookie Display ---
		const cookieSection = container.createDiv('cc-cookie-section');

		this.cookieCountEl = cookieSection.createDiv('cc-cookie-count');
		this.cpsEl = cookieSection.createDiv('cc-cps');

		// Cookie button
		const cookieBtnWrapper = cookieSection.createDiv('cc-cookie-btn-wrapper');
		this.floatingNumbers = cookieBtnWrapper.createDiv('cc-floating-numbers');
		this.cookieBtn = cookieBtnWrapper.createDiv('cc-cookie-btn');
		this.cookieBtn.innerHTML = `<span class="cc-cookie-emoji">🟫</span>`;
		this.cookieBtn.addEventListener('click', (e) => this.handleClick(e));

		// --- Tabs ---
		const tabBar = container.createDiv('cc-tab-bar');
		const buildingsTab = tabBar.createEl('button', { text: 'Buildings', cls: 'cc-tab cc-tab-active' });
		const upgradesTab = tabBar.createEl('button', { text: 'Upgrades', cls: 'cc-tab' });

		// --- Shop panels ---
		const shopContainer = container.createDiv('cc-shop-container');
		this.buildingListEl = shopContainer.createDiv('cc-building-list cc-shop-panel cc-panel-active');
		this.upgradeListEl = shopContainer.createDiv('cc-upgrade-list cc-shop-panel');

		buildingsTab.addEventListener('click', () => {
			buildingsTab.addClass('cc-tab-active');
			upgradesTab.removeClass('cc-tab-active');
			this.buildingListEl?.addClass('cc-panel-active');
			this.upgradeListEl?.removeClass('cc-panel-active');
		});
		upgradesTab.addEventListener('click', () => {
			upgradesTab.addClass('cc-tab-active');
			buildingsTab.removeClass('cc-tab-active');
			this.upgradeListEl?.addClass('cc-panel-active');
			this.buildingListEl?.removeClass('cc-panel-active');
		});

		// --- Footer ---
		const footer = container.createDiv('cc-footer');
		const resetBtn = footer.createEl('button', { text: 'Reset Game', cls: 'cc-reset-btn' });
		resetBtn.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all progress?')) {
				this.plugin.resetGame();
				this.renderAll();
				new Notice('Cookie Clicker reset!');
			}
		});

		// --- Initial render ---
		this.renderAll();

		// --- Game tick: 50ms for smooth CPS accumulation ---
		this.tickInterval = window.setInterval(() => {
			const cps = getCps(this.state);
			if (cps > 0) {
				this.state.cookies += cps / 20; // 50ms tick = 1/20th of a second
				this.state.totalCookies += cps / 20;
			}
		}, 50);

		// --- UI render: every 100ms ---
		this.renderInterval = window.setInterval(() => {
			this.renderCookieDisplay();
		}, 100);
	}

	async onClose(): Promise<void> {
		if (this.tickInterval !== null) clearInterval(this.tickInterval);
		if (this.renderInterval !== null) clearInterval(this.renderInterval);
		this.plugin.saveGameState();
		this.contentEl.empty();
	}

	private awardOfflineCookies() {
		if (this.state.lastSaved > 0) {
			const elapsed = (Date.now() - this.state.lastSaved) / 1000;
			const cps = getCps(this.state);
			if (cps > 0 && elapsed > 5) {
				// Award 50% of offline production (standard idle game mechanic)
				const earned = cps * elapsed * 0.5;
				this.state.cookies += earned;
				this.state.totalCookies += earned;
				new Notice(`Welcome back! You earned ${formatNumber(earned)} netherite while away.`);
			}
		}
	}

	private handleClick(e: MouseEvent) {
		const clickVal = getClickValue(this.state);
		this.state.cookies += clickVal;
		this.state.totalCookies += clickVal;

		// Animate cookie
		this.cookieBtn?.addClass('cc-cookie-clicked');
		setTimeout(() => this.cookieBtn?.removeClass('cc-cookie-clicked'), 100);

		// Floating number
		this.spawnFloatingNumber(e, clickVal);

		this.renderCookieDisplay();
	}

	private spawnFloatingNumber(e: MouseEvent, value: number) {
		if (!this.floatingNumbers) return;
		const el = document.createElement('span');
		el.className = 'cc-float-num';
		el.textContent = `+${formatNumber(value)}`;

		// Position near click
		const rect = this.floatingNumbers.getBoundingClientRect();
		const x = e.clientX - rect.left + (Math.random() * 30 - 15);
		const y = e.clientY - rect.top - 10;
		el.style.left = `${x}px`;
		el.style.top = `${y}px`;

		this.floatingNumbers.appendChild(el);
		setTimeout(() => el.remove(), 900);
	}

	// --- Render methods ---

	private renderCookieDisplay() {
		if (this.cookieCountEl) {
			this.cookieCountEl.textContent = `${formatNumber(this.state.cookies)} netherite`;
		}
		if (this.cpsEl) {
			const cps = getCps(this.state);
			this.cpsEl.textContent = `per second: ${formatNumber(cps)}`;
		}
		// Update affordability styling
		this.updateAffordability();
	}

	private renderAll() {
		this.renderCookieDisplay();
		this.renderBuildings();
		this.renderUpgrades();
	}

	private renderBuildings() {
		if (!this.buildingListEl) return;
		this.buildingListEl.empty();

		for (let i = 0; i < BUILDINGS.length; i++) {
			const b = BUILDINGS[i]!;
			const owned = this.state.buildingCounts[i]!;
			const cost = getBuildingCost(b, owned);
			const canAfford = this.state.cookies >= cost;

			const row = this.buildingListEl.createDiv({
				cls: `cc-building-row ${canAfford ? 'cc-affordable' : 'cc-too-expensive'}`
			});

			const left = row.createDiv('cc-building-left');
			left.createSpan({ text: b.icon, cls: 'cc-building-icon' });
			const info = left.createDiv('cc-building-info');
			info.createDiv({ text: b.name, cls: 'cc-building-name' });
			info.createDiv({ text: `${formatNumber(cost)} netherite`, cls: 'cc-building-cost' });

			const right = row.createDiv('cc-building-right');
			right.createSpan({ text: owned.toString(), cls: 'cc-building-owned' });

			row.addEventListener('click', () => {
				this.buyBuilding(i);
			});

			// Tooltip on hover
			row.setAttribute('aria-label', b.description);
		}
	}

	private renderUpgrades() {
		if (!this.upgradeListEl) return;
		this.upgradeListEl.empty();

		let anyVisible = false;

		for (let i = 0; i < UPGRADES.length; i++) {
			const u = UPGRADES[i]!;

			// Already purchased
			if (this.state.upgradePurchased[i]) continue;

			// Check unlock requirement
			if (u.targetBuilding >= 0) {
				const owned = this.state.buildingCounts[u.targetBuilding]!;
				if (owned < u.requirement) continue;
			}

			// Check that previous upgrades of same target are purchased
			const prevUpgrades = UPGRADES.slice(0, i).filter(
				(prev, j) => prev.targetBuilding === u.targetBuilding && !this.state.upgradePurchased[j]
			);
			if (prevUpgrades.length > 0) continue;

			anyVisible = true;
			const canAfford = this.state.cookies >= u.cost;

			const row = this.upgradeListEl.createDiv({
				cls: `cc-upgrade-row ${canAfford ? 'cc-affordable' : 'cc-too-expensive'}`
			});

			const left = row.createDiv('cc-upgrade-left');
			left.createSpan({ text: u.icon, cls: 'cc-upgrade-icon' });
			const info = left.createDiv('cc-upgrade-info');
			info.createDiv({ text: u.name, cls: 'cc-upgrade-name' });
			info.createDiv({ text: u.description, cls: 'cc-upgrade-desc' });
			info.createDiv({ text: `${formatNumber(u.cost)} netherite`, cls: 'cc-upgrade-cost' });

			row.addEventListener('click', () => {
				this.buyUpgrade(i);
			});
		}

		if (!anyVisible) {
			this.upgradeListEl.createDiv({
				text: 'Buy more buildings to unlock upgrades!',
				cls: 'cc-empty-message'
			});
		}
	}

	private updateAffordability() {
		// Update building affordability
		if (this.buildingListEl) {
			const rows = this.buildingListEl.querySelectorAll('.cc-building-row');
			rows.forEach((row, i) => {
				const cost = getBuildingCost(BUILDINGS[i]!, this.state.buildingCounts[i]!);
				const canAfford = this.state.cookies >= cost;
				row.classList.toggle('cc-affordable', canAfford);
				row.classList.toggle('cc-too-expensive', !canAfford);
			});
		}
		// Update upgrade affordability
		if (this.upgradeListEl) {
			const rows = this.upgradeListEl.querySelectorAll('.cc-upgrade-row');
			rows.forEach((row) => {
				const costText = row.querySelector('.cc-upgrade-cost')?.textContent ?? '';
				// Re-render upgrades less frequently (only on purchase)
			});
		}
	}

	// --- Buy actions ---

	private buyBuilding(index: number) {
		const b = BUILDINGS[index]!;
		const owned = this.state.buildingCounts[index]!;
		const cost = getBuildingCost(b, owned);

		if (this.state.cookies >= cost) {
			this.state.cookies -= cost;
			this.state.buildingCounts[index]!++;
			this.renderAll();
			this.plugin.saveGameState();
		}
	}

	private buyUpgrade(index: number) {
		const u = UPGRADES[index]!;

		if (this.state.cookies >= u.cost && !this.state.upgradePurchased[index]) {
			this.state.cookies -= u.cost;
			this.state.upgradePurchased[index] = true;
			this.renderAll();
			this.plugin.saveGameState();
			new Notice(`Upgrade unlocked: ${u.name}!`);
		}
	}
}
