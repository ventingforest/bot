import { PrismaClient, User, Private } from '@prisma/client';
import TVFClient from './TVFClient';

export default class TVFDB extends PrismaClient {
	private client: TVFClient;

	/**
	 * Initialises an instance of the TVFDB helper
	 * @param client An instance of TVF Bot
	 */
	constructor(client: TVFClient) {
		super();
		this.client = client;
	}

	/**
	 * Get a user from the database - if it does not exist, create a row and return
	 * @param id The ID of the user
	 * @returns The user's data
	 */
	async getUser(id: string): Promise<User> {
		const user = await this.user.findUnique({ where: { id }});
		console.log(user);
		const discUser = this.client.users.cache.get(user.id);

		if (!user) {
			return await this.user.create({
				data: {
					id,
					level: 1,
					xp: 1
				}
			})
				.then(u => {
					this.client.logger.db(`Could not find row for User ${this.client.userLogCompiler(discUser)} - creating one now.`);
					return u;
				});
		} else return user;
	}

	/**
	 * Update a user in the database
	 * @param id The ID of the user
	 * @param data The data to overwrite
	 * @returns The updated user
	 */
	async updateUser(id: string, data: Optional<User>) {
		return await this.user.update({
			where: { id },
			data: data
		});
	}

	/**
	 * Get a user's private venting session from the database
	 * @param id The ID of the user
	 * @returns The user's private venting session, if it exists
	 */
	async getPrivate(id: string): Promise<Private> {
		const privateVent = await this.private.findUnique({ where: { id }});
		return privateVent;
	}

	/**
	 * Update a private venting session in the database
	 * @param id The ID of the user who owns the session
	 * @param data The data to overwrite
	 * @returns The updated private venting session
	 */
	async updatePrivate(id: string, data: Optional<Private>) {
		return await this.private.update({
			where: { id },
			data: data
		});
	}

	/**
	 * Deletes a private venting session from the database
	 * @param id The ID of the user who owns the session
	 * @returns The deleted private venting session
	 */
	async deletePrivate(id: string) {
		return await this.private.delete({ where: { id }});
	}
}
