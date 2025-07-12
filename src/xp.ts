import { userMessages, type MessageInfo } from "./process";

const cooldown = 1000 * 10; // 10 seconds

// keeps the last time a user sent a message during computation
const lastMessageTime = new Map<string, number>();

export default function calculateXp() {
  userMessages.forEach((messages, author) => {
    let total = 0;
    messages.forEach((message) => {
      const xp = xpForMessage(author, message);
      total += xp;
    });
    console.log(`total XP for ${author}: ${total}`);
  });
}

export function xpForMessage(
  author: string,
  { time, length }: MessageInfo
): number {
  const last = lastMessageTime.get(author) || 0;

  if (time - last < cooldown) {
    // within cooldown period, no XP
    return 0;
  }

  // compute xp
  // min 5 points
  // max 10 points
  // 20 chars ~= 1 point
  const xp = Math.min(10, Math.max(5, Math.floor(length / 20)));

  return xp;
}
