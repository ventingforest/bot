import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, REST } from "discord.js";
import { guildId } from "$lib/data";
import token from "$shared/token";
import Logger from "$lib/logger";

const client = new SapphireClient({
  intents: [
    // read messages
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,

    // see guild members
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  loadMessageCommandListeners: true,
  logger: {
    instance: new Logger(),
  },
});

await client.login(token);
