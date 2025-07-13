import { client, logger } from "$ctx";
import { Events } from "discord.js";
import { synchronise } from "./db";

client.once(Events.ClientReady, async () => {
  logger.info`Logged in as ${client.user?.tag}`;

  if (process.env.NODE_ENV === "production") {
    await synchronise();
  }
});

await client.login(process.env.BOT_TOKEN!);
