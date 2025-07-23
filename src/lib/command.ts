import { ApplyOptions } from "@sapphire/decorators";
import {
	type ApplicationCommandRegistry,
	type Args,
	Command as SapphireCommand,
} from "@sapphire/framework";
import { ApplicationCommandType, type SlashCommandBuilder } from "discord.js";

import { guildId } from "$lib/data";

import makeLoad from "./load";

type SlashCommandOptions = (builder: SlashCommandBuilder) => void;

export function config(options: Command.Options) {
	// eslint-disable-next-line new-cap
	return ApplyOptions<Command.Options>(options);
}

/**
 * Load a {@link Command} piece.
 */
export const load = makeLoad("commands");

export class Command extends SapphireCommand<Args, Command.Options> {
	override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		const {
			options: { slash, contextMenu },
		} = this;
		const guildIds = [guildId];

		if (slash) {
			registry.registerChatInputCommand(
				builder => {
					const command = builder
						.setName(slash.name)
						.setDescription(slash.description);

					if (slash.options) {
						slash.options(command);
					}
				},
				{ guildIds, idHints: slash.idHints },
			);
		}

		if (contextMenu) {
			registry.registerContextMenuCommand(
				builder => {
					builder
						.setName(contextMenu.name)
						.setType(ApplicationCommandType.User);
				},
				{ guildIds, idHints: contextMenu.idHints },
			);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Command {
	type SubOptions = {
		name: string;
		idHints?: string[];
	};

	export type Options = SapphireCommand.Options & {
		slash?: SubOptions & {
			description: string;
			options?: SlashCommandOptions;
		};
		contextMenu?: SubOptions;
	};
}
