import {
  GuildMember,
  type User,
  type Interaction,
  type InteractionUpdateOptions,
} from "discord.js";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { calculateLevel, pageLength, rankInGuild } from "$lib/level";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import type { Props } from "$interactions/leaderboard";
import { drawAvatar } from "$lib/level/canvas/avatar";
import { container } from "@sapphire/framework";
import { c, drawText } from "$lib/level/canvas";
import type { User as DbUser } from "$prisma";

const scale = 4;
const canvasWidth = 50 * pageLength.pretty * scale;

const avatarRadius = canvasWidth / (pageLength.pretty * 4);
const userSpacing = avatarRadius / 2;
const userHeight = avatarRadius * 2 + userSpacing + avatarRadius / 8;

const canvasHeight = userHeight * (pageLength.pretty + 1);
const dy = userHeight;

export async function getPrettyPage(
  interaction: Interaction,
  { current, pretty, page }: Props,
  maxPage: number,
  users: DbUser[],
): Promise<InteractionUpdateOptions> {
  // create the canvas
  const canvas = new Canvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");
  let y = userHeight;

  // background
  ctx.fillStyle = c.base.hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // users
  for (const db of users) {
    if (db.present) {
      await drawUser(
        ctx,
        await interaction.guild?.members.fetch(db.id)!,
        db,
        y,
        current,
      );
    } else {
      await drawUser(
        ctx,
        await container.client.users.fetch(db.id),
        db,
        y,
        current,
      );
    }
    y += dy;
  }

  return {
    files: [
      {
        attachment: await canvas.toBuffer("webp"),
        name: `page-${page}.webp`,
      },
    ],
  };
}

async function drawUser(
  ctx: CanvasRenderingContext2D,
  member: GuildMember | User,
  db: DbUser,
  y: number,
  present: boolean,
) {
  const user = member instanceof GuildMember ? member.user : member;
  let x = avatarRadius * 2;

  // avatar
  const rank = await rankInGuild(user.id, present);

  let medalColour: string | undefined;
  if (rank === 1) medalColour = c.yellow.hex;
  else if (rank === 2) medalColour = c.subtext1.hex;
  else if (rank === 3) medalColour = c.peach.hex;
  else medalColour = undefined;

  await drawAvatar(
    ctx,
    member,
    {
      x,
      y,
      r: avatarRadius,
      borderColour: medalColour,
    },
    {
      text: `#${rank}`,
      font: `700 ${5 * scale}px Nunito, sans-serif`,
      w: 12 * scale,
      h: 8 * scale,
      bgColour: medalColour,
    },
  );

  // username
  x += avatarRadius * 2;
  const usernameY = y - avatarRadius / 2;
  drawText(
    ctx,
    user.username,
    { x, y: usernameY },
    `850 ${8 * scale}px Nunito, sans-serif`,
  );

  // level
  drawText(
    ctx,
    `Level ${calculateLevel(db.xp)}`,
    { x, y: y + scale },
    `600 ${6 * scale}px Nunito, sans-serif`,
    c.subtext0.hex,
  );

  // progress bar
  const stats = progressStats(db);
  drawProgress(
    ctx,
    stats,
    { x, y: y + avatarRadius / 3 },
    canvasWidth - x - avatarRadius * 2,
    avatarRadius / 2,
    `${((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(2)}%`,
    4 * scale,
  );
}
