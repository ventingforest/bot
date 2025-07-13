import { client, logger } from "$ctx";
import { Events } from "discord.js";

client.once(Events.ClientReady, () => {
  logger.info`Logged in as ${client.user?.tag}`;
});

await client.login(process.env.BOT_TOKEN!);
