import * as Discord from 'discord.js';
import * as winston from 'winston';
import logdnaWinston from 'logdna-winston';
import { PastebinClient } from '@catte_/pastebin.js';
import * as path from 'path';	
import moment from 'moment';
import si from 'systeminformation';
import {
	AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler,
} from 'discord-akairo';
import Constants from '../Constants';
import TVFRoles from '../TVFRoles';
import TVFChannels from '../TVFChannels';
import TVFDB from './TVFDB';
import TVFSocial from './TVFSocial';
import TVFUtils from './TVFUtils';

export default class TVFClient extends AkairoClient {
	production = process.env.NODE_ENV === 'production';
	logger: Logger;
	server: Discord.Guild;
	commands: CommandHandler;
	listenerHandler: ListenerHandler;
	inhibitors: InhibitorHandler;
	pastebin: PastebinClient;
	constants: typeof Constants;
	tvfRoles: ReturnType<typeof TVFRoles>;
    tvfChannels: ReturnType<typeof TVFChannels>;
	db: TVFDB;
	social: TVFSocial;
	utils: TVFUtils;
	prefix = this.production ? 'tvf ' : 'tvf beta ';
	botBanner = true;

	/**
	 * Initialises an instance of TVF Bot's client
	 * @param constants The constants for the bot to use
	 */
	constructor(constants: typeof Constants) {
		super({ ownerID: ['326767126406889473'] }, {
			disableMentions: 'everyone', 
			ws: { 
				intents: [ 
					'GUILDS', 
					'GUILD_MEMBERS',
					'GUILD_PRESENCES', 
					'GUILD_BANS', 
					'GUILD_MESSAGES', 
					'GUILD_VOICE_STATES', 
					'DIRECT_MESSAGES'
				] 
			},
			presence: {
				activity: {
					name: 'out for you <3',
					type: 'WATCHING'
				},
				status: 'idle'
			}
		});

		this.constants = constants;
	}

	async start() {
		// Configure the logger's colour scheme
		winston.addColors({
			error: 'bold red',
			warn: 'bold yellow',
			info: 'bold cyan',
			debug: 'bold white',
			command: 'bold yellow',
			db: 'bold white',
		});

		// Create the logger
		const { ip4: ip, mac } = (await si.networkInterfaces())[0];

		const logger = winston.createLogger({
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(winston.format.printf(log => winston.format.colorize().colorize(log.level, `${moment().format(this.constants.moment)} - ${log.level}: ${log.message}`))),
				}),
				new logdnaWinston({
					key: process.env.LOGDNA,
					hostname: 'ayano',
					ip,
					mac,
					app: this.production ? 'ayano' : 'ayano-beta',
					env: this.production ? 'Production' : 'Development',
					level: 'info',
					indexMeta: true
				})
			],
			levels: {
				debug: 0,
				command: 1,
				db: 2,
				info: 3,
				warn: 4,
				error: 5,
			}
		}) as Logger;

		// Update class properties
		this.logger = logger;
		this.db = new TVFDB(this);
		this.utils = new TVFUtils(this);
		this.social = new TVFSocial(this);

		// Error events
		this.on('debug', (m) => this.logger.debug(m));
		this.on('warn', (m) => this.logger.warn(m));
		this.on('error', (m) => this.logger.error(m));
		process.on('uncaughtException', (m) => this.logger.error(m));

		// Set up Akairo listeners
		this.commands = new CommandHandler(this, {
			directory: path.join(__dirname, '..', 'commands'),
			prefix: this.prefix,
			commandUtil: true,
			storeMessages: true,
			argumentDefaults: {
				prompt: {
					modifyStart: (msg: Discord.Message, text: string) => `${msg.author}, ${text}\nType cancel to cancel this command!`,
					timeout: (msg: Discord.Message) => {
						this.deletePrompts(msg);
						return 'Time ran out, command has been cancelled!';
					},
					ended: (msg: Discord.Message) => {
						this.deletePrompts(msg);
						return 'Too many retries, command has been cancelled!';
					},
					cancel: (msg: Discord.Message) => {
						this.deletePrompts(msg);
						return 'Command cancelled!';
					},
					retries: 4,
					time: 30000
				}
			},
			aliasReplacement: /-/g,
			allowMention: true,
			defaultCooldown: 1000,
			ignoreCooldown: this.ownerID,
			automateCategories: true,
		});

		this.commands.loadAll();
		this.logger.info('Commands loaded!');

		this.inhibitors = new InhibitorHandler(this, {
			directory: path.join(__dirname, '..', 'inhibitors'),
		});

		this.commands.useInhibitorHandler(this.inhibitors);
		this.inhibitors.loadAll();
		this.logger.info('Inhibitors bound to command handler and loaded!');

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', 'listeners'),
		});

		this.listenerHandler.setEmitters({
			commands: this.commands,
			inhibitors: this.inhibitors,
			listenerHandler: this.listenerHandler
		});

		this.commands.useListenerHandler(this.listenerHandler);
		this.listenerHandler.loadAll();
		this.logger.info('Listeners bound to command handler and loaded!');

		// Log into pastebin
		this.pastebin = new PastebinClient(process.env.PASTEBIN_KEY, process.env.PASTEBIN_USERNAME, process.env.PASTEBIN_PASSWORD)
		await this.pastebin.login();
		this.logger.info('Logged into Pastebin!');

		// Log into discord
		await this.login(this.production ? process.env.STABLE : process.env.BETA);
		this.logger.info('Logged into Discord!');

		// Save the server for use in other methods
		this.server = this.guilds.cache.get('435894444101861408');
		this.logger.info('Saved server to Client!');
	}

	/**
     * A simple utility method to get a custom user log description
     * @param {Discord.User} u
     */
	userLogCompiler(u: Discord.User): string {
        return `${u.tag} (${u.id})`;
    }
}
