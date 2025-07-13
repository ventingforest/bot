import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import Logger from "$lib/logger";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  loadMessageCommandListeners: true,
  logger: {
    instance: new Logger(),
  },
});

await client.login(process.env.BOT_TOKEN!);
