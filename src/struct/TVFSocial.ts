import TVFClient from './TVFClient';

export default class TVFSocial {
	private client: TVFClient;
	xpCooldown: Set<string>;

	/**
	 * Initialises an instance of the TVFSocial helper
	 * @param client An instance of TVF Bot
	 */
	constructor(client: TVFClient) {
		this.client = client;
		this.xpCooldown = new Set();
	}

	/**
	 * Calculates the amount of xp required for a level.
	 * @param {number} x
	 */
	xpFor(x: number): number {
		return Math.floor(5 / 6 * x * (2 * x ** 2 + 27 * x + 91));
	}

	/**
	 * Finds the level reward for a given level!
	 * @param {number} level
	 */
	levelReward(level: number): LevelReward {
		const levelIndex = this.client.constants.levelRoles.findIndex(l => level % 2 === 0 ? l.level === level : l.level === level - 1);
		return this.client.constants.levelRoles[levelIndex];
	}

	/**
	 * Calculate the join position of a member based on their ID.
	 * @param {string} id
	 */
	joinPosition(id: string): number {
		if (!this.client.server.member(id)) return;

		const arr = this.client.server.members.cache.array();
		arr.sort((a, b) => {
			const newA = Date.UTC(a.joinedAt.getFullYear(), a.joinedAt.getMonth(), a.joinedAt.getDate());
			const newB = Date.UTC(b.joinedAt.getFullYear(), b.joinedAt.getMonth(), b.joinedAt.getDate())
			return newA - newB;
		});

		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id === id) return i + 1;
		}
	}
}
