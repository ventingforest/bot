/**
 * Is the bot running in production mode?
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * The ID of the guild the bot is in.
 */
export const guildId = "435894444101861408";

export const xp = {
  /**
   * The cooldown period in milliseconds before a user can receive XP for sending another message.
   */
  cooldown: 1000 * 10, // 10 seconds

  /**
   * The minimum amount of XP a user can receive for a message.
   */
  minimum: 5,

  /**
   * The maximum amount of XP a user can receive for a message.
   */
  maximum: 10,

  /**
   * The number of characters in a message required to receive 1 XP.
   */
  charsPerPoint: 20,
};

export const levels = {
  /**
   * How many users to show on a page of the leaderboard.
   */
  pageLength: 10,
};
