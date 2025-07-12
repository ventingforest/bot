import { Client, GatewayIntentBits, type TextBasedChannel } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const channels = await guild.channels
    .fetch()
    .then((channels) => channels.filter((channel) => channel?.isTextBased()));

  for (const channel of channels.values()) {
    if (channel!.name !== "the-dungeon") continue;
  }
});

client.login(process.env.BOT_TOKEN!);
