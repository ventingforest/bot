import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import Logger from "$lib/logger";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,

    GatewayIntentBits.GuildMembers,
  ],
  loadMessageCommandListeners: true,
  logger: {
    instance: new Logger(),
  },
});

const token =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_TOKEN || process.env.DEV_TOKEN
    : process.env.DEV_TOKEN || process.env.PROD_TOKEN;
await client.login(token!);
