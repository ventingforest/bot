import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import Logger from "$lib/logger";
import { guildId } from "$const";

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

const guild = await client.guilds.fetch(guildId);
await client.emit("guildMemberAdd", await guild.members.fetch(client.user!.id));
