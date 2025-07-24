import { isProduction } from "$lib/data";

// id: token
export const anonWebhooks = new Map<string, string>();

/**
 * The channel ID for the anonymous vent channel.
 */
// todo: production id
export const channelId = isProduction ? "" : "1397637713980817520";

/**
 * The amount of webhooks to pool for the anonymous vent channel.
 */
export const webhookPoolSize = isProduction ? 10 : 2;
