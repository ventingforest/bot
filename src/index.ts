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

  const reportChannel = (await guild.channels.fetch(
    process.env.REPORT_CHANNEL_ID!,
  )) as GuildTextBasedChannel;

  const results = [];
  for (const channel of channels.values()) {
    console.time(`${channel!.name}`);
    const stats = await processChannel(channel as GuildTextBasedChannel);
    results.push(stats);
    console.timeEnd(`${channel!.name}`);
    if (reportChannel) {
      await reportChannel.send(
        `#${stats.channelName} done\nmessages: ${stats.messageCount}\nusers: ${stats.userCount}\ntotal xp: ${stats.totalXp}`,
      );
    }
  }

  if (reportChannel) {
    await reportChannel.send(
      "all channels done.\nsummary:\n" +
        results
          .map(
            (s) =>
              `#${s.channelName}: ${s.messageCount} messages, ${s.userCount} users, ${s.totalXp} xp`,
          )
          .join("\n"),
    );
    console.log(`sent completion message to channel #${reportChannel.name}`);
  }

  await client.destroy();
});

client.login(process.env.BOT_TOKEN!);
