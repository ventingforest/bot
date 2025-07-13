import {
  Client,
  GatewayIntentBits,
  type GuildTextBasedChannel,
} from "discord.js";
import processChannel from "./process";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`logged in as ${client.user?.tag}!`);

  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const channels = await guild.channels
    .fetch()
    .then((channels) => channels.filter((channel) => channel?.isTextBased()));

  for (const channel of channels.values()) {
    console.time(`${channel!.name}`);
    await processChannel(channel as GuildTextBasedChannel);
    console.timeEnd(`${channel!.name}`);
  }

  await client.destroy();
});

client.login(process.env.BOT_TOKEN!);
