import type { GuildMember } from "discord.js";

import prisma from "./db";

export function levelForXp(xp: number): number {
	return Math.floor(Math.sqrt(xp / 120));
}

/**
 * Ensures the given member has the correct level role for their XP,
 * removing any old level roles and adding the correct one if needed.
 *
 * @returns last role ID removed (if any) and the new role ID added.
 */
export async function ensureCorrectLevelRole(
	member: GuildMember,
	userXp?: number,
): Promise<{ oldId?: string; newId: string }> {
	// fetch user xp if not provided
	if (!userXp) {
		const user = await prisma.user.findUnique({
			where: { id: member.user.id },
		});
		userXp = user?.xp;
	}

	const level = levelForXp(userXp ?? 0);
	const newId = getLevelRole(level);
	const promises = [];

	// remove old level roles
	let oldId: string | undefined;
	let oldLevel = -1;
	for (const role of levelRoles) {
		if (role.id !== newId && member.roles.cache.has(role.id)) {
			// track the highest level role being removed
			if (role.level > oldLevel) {
				oldId = role.id;
				oldLevel = role.level;
			}

			promises.push(member.roles.remove(role.id, "remove old level role"));
		}
	}

	// add new level role
	if (newId && !member.roles.cache.has(newId)) {
		promises.push(member.roles.add(newId, "add new level role"));
	}

	await Promise.all(promises);
	return { newId, oldId };
}

/**
 * Returns the role ID for a given level.
 */
export function getLevelRole(level: number): string {
	let rankId = "";
	for (const reward of levelRoles) {
		if (level >= reward.level) rankId = reward.id;
		else break;
	}

	return rankId;
}

type LevelRole = { level: number; id: string };

/**
 * IDs of roles that are awarded based on XP levels.
 */
export const levelRoles: LevelRole[] = [
	{ id: "441943660016173058", level: 0 }, // elf
	{ id: "466738306881814536", level: 2 }, // goblin
	{ id: "441944499149602816", level: 4 }, // gnome
	{ id: "466738333649731587", level: 6 }, // brownie
	{ id: "441944655450603520", level: 8 }, // fairy
	{ id: "441945051296301057", level: 10 }, // leprechaun
	{ id: "441945301721415681", level: 12 }, // faun
	{ id: "466739322054246401", level: 14 }, // harpy
	{ id: "453950866815320085", level: 16 }, // leshy
	{ id: "453950669573849091", level: 18 }, // nymph
	{ id: "441945780119535637", level: 20 }, // dryad
	{ id: "453947107825680396", level: 22 }, // centaur
	{ id: "453950089451405322", level: 24 }, // warlock
	{ id: "466738356831649793", level: 26 }, // phoenix
	{ id: "453947113643048982", level: 28 }, // griffin
	{ id: "453949450902044715", level: 30 }, // sphinx
	{ id: "453947119842099222", level: 32 }, // unicorn
	{ id: "466739004432318466", level: 34 }, // dragon
	{ id: "453950908640788480", level: 36 }, // hydra
	{ id: "635836969527541770", level: 38 }, // behemoth
	{ id: "640501774985461790", level: 40 }, // eldritch being
	{ id: "799084406354346054", level: 42 }, // banshee
	{ id: "799084468144308274", level: 44 }, // cockatrice
	{ id: "799084509667655721", level: 46 }, // barghest
	{ id: "801521919454609438", level: 48 }, // draugr
	{ id: "799084536151277588", level: 50 }, // treant
	{ id: "799084584067137580", level: 52 }, // dullahan
	{ id: "801518871927455794", level: 54 }, // yokai
	{ id: "801518874113474631", level: 56 }, // kelpie
	{ id: "801518876395044904", level: 58 }, // jötnar
	{ id: "801518878211571713", level: 60 }, // rusalka
	{ id: "801518880656064592", level: 62 }, // kitsune
	{ id: "801518881314177116", level: 64 }, // fomorian
	{ id: "801518884863606845", level: 66 }, // jörmungandr
	{ id: "799084559366881321", level: 68 }, // erlking
	{ id: "801518887053033502", level: 70 }, // river deity
	{ id: "801518889102999602", level: 72 }, // spriggan
	{ id: "801518890978246706", level: 74 }, // hippogriff
	{ id: "801518911165825125", level: 76 }, // pixie
	{ id: "801518914190180392", level: 78 }, // pegasus
	{ id: "801518919055573063", level: 80 }, // chimera
	{ id: "801520771876913242", level: 82 }, // basilisk
	{ id: "801520780876841001", level: 84 }, // forest spirit
	{ id: "801520784555769888", level: 86 }, // moth man
	{ id: "799084616350040064", level: 88 }, // dirt
	{ id: "799084438402891786", level: 90 }, // david bowie
	{ id: "801520795347320853", level: 92 }, // rel
	{ id: "801520798430265374", level: 94 }, // dwayne "the rock" johnson
	{ id: "799084638936367155", level: 96 }, // gandalf
	{ id: "801520799189958676", level: 98 }, // how?
];
