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

await client.login(process.env.BOT_TOKEN!);
