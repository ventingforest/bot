import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import Logger from "./logger";

const client = new SapphireClient({
  intents: [GatewayIntentBits.GuildMembers],
  logger: {
    instance: new Logger(),
  },
});

await client.login(process.env.BOT_TOKEN!);
