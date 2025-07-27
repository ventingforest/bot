/**
 * The ID of the guild the bot operates in.
 */
export const guildId = "435894444101861408";

export const levelConf = {
	/**
	 * The number of characters in a message required to receive 1 XP.
	 */
	charsPerPoint: 20,
	/**
	 * The cooldown period in milliseconds before a user can receive XP for sending another message.
	 */
	cooldown: 10 * 1000, // 10 seconds
	/**
	 * The maximum amount of XP a user can receive for a message.
	 */
	maximum: 10,
	/**
	 * The minimum amount of XP a user can receive for a message.
	 */
	minimum: 5,
};
