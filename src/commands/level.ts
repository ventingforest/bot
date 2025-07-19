import {
  ContextMenuCommandInteraction,
  MessageFlags,
  User,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  container,
  type ChatInputCommand,
  type ContextMenuCommand,
} from "@sapphire/framework";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { drawAvatar, type AvatarData } from "$lib/level/canvas/avatar";
import { calculateLevel, rankInGuild } from "$lib/level";
import { c, drawText } from "$lib/level/canvas";
import { Command, Config } from "$command";
import { Canvas } from "skia-canvas";

@Config({
  slash: {
    name: "level",
    description: "Check your current level",
    idHints: ["1396170993386389514"],
    options: builder => {
      builder.addUserOption(option =>
        option
          .setName("user")
          .setDescription("the user to check the level of")
          .setRequired(false),
      );
    },
  },
  contextMenu: {
    name: "View level",
    idHints: ["1396170994598674536"],
  },
})
export class Level extends Command {
  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    await respond(
      interaction,
      interaction.options.getUser("user") || interaction.user,
    );
  }

  override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
    _: ContextMenuCommand.RunContext,
  ) {
    await respond(
      interaction,
      await this.container.client.users.fetch(interaction.targetId),
    );
  }
}

async function respond(
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
  user: User,
) {
  // don't allow bots
  if (user.bot) {
    return interaction.reply({
      content: "bots don't have levels! please choose a person.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const member = interaction.guild?.members.cache.get(user.id)!;
  const users = await container.db.user.findMany({
    where: { present: true },
  });
  const row = users.find(u => u.id === user.id)!;

  // create the canvas
  const canvas = new Canvas(500 * scale, 144 * scale);
  const ctx = canvas.getContext("2d");

  // background with border
  ctx.fillStyle = c.mantle.hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = c.base.hex;
  const border = 12 * scale;
  ctx.fillRect(
    border,
    border,
    canvas.width - border * 2,
    canvas.height - border * 2,
  );

  // avatar
  const level = calculateLevel(row.xp);
  await drawAvatar(ctx, member, avatarData, {
    text: level.toString(),
    font: `800 ${18 * scale}px Nunito, sans-serif`,
    ...levelBox,
  });

  // username
  drawText(
    ctx,
    user.username!,
    { x: avatarData.x + avatarData.r * 2, y: 20 * scale },
    `850 ${30 * scale}px Nunito, sans-serif`,
    c.text.hex,
    "left",
    "top",
  );

  // rank
  const rank = rankInGuild(users, user.id);
  drawText(
    ctx,
    `Rank #${rank.toLocaleString()}`,
    { x: avatarData.x + avatarData.r * 2, y: 55 * scale },
    `600 ${14 * scale}px Nunito, sans-serif`,
    c.subtext0.hex,
    "left",
    "top",
  );

  // progress bar
  const stats = progressStats(row);
  drawProgress(
    ctx,
    stats,
    {
      x: avatarData.x + avatarData.r * 2,
      y: avatarData.y + avatarData.r - levelBox.h,
    },
    300 * scale,
    18 * scale,
    `${stats.xpInLevel.toLocaleString()} / ${stats.xpNeeded.toLocaleString()} XP`,
  );

  // send
  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    files: [
      {
        attachment: await canvas.toBuffer("webp"),
        name: `${user.username}.webp`,
      },
    ],
  });
}

const scale = 3;

const avatarData: AvatarData = {
  x: 72 * scale,
  y: 72 * scale,
  r: 48 * scale,
};

const levelBox = {
  w: 40 * scale,
  h: 24 * scale,
};
