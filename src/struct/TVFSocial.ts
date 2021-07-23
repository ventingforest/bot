import TVFClient from './TVFClient';
import moment from 'moment';

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
}
