import * as Discord from 'discord.js';
import * as winston from 'winston';
import logdnaWinston from 'logdna-winston';
import mongoose = require('mongoose');
import { PastebinClient } from '@catte_/pastebin.js';
import * as path from 'path';	
import moment from 'moment';
import si from 'systeminformation';
import * as dotenv from 'dotenv';
import {
	AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler,
} from 'discord-akairo';
import User, { IUser } from './models/user';
import Constants from './Constants';

dotenv.config();

class TVFClient extends AkairoClient {
	// properties
	isProduction = process.env.NODE_ENV === 'production';
	logger: Logger;
	server: Discord.Guild;
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	inhibitorHandler: InhibitorHandler;
	pastebin = new PastebinClient(process.env.PASTEBIN_KEY, process.env.PASTEBIN_USERNAME, process.env.PASTEBIN_PASSWORD);
	talkedRecently: Set<string> = new Set();
	constants: ReturnType<typeof Constants>;
	prefix = this.isProduction ? 'tvf ' : 'tvf beta ';
	botBanner = true;
	db: { user: mongoose.Model<IUser>, connection: mongoose.Connection | null } = {
		user: User,
		connection: null,
	};

	// constructor
	constructor() {
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

		(async () => {
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
			this.logger = winston.createLogger({
				transports: [
					new winston.transports.Console({
						format: winston.format.combine(winston.format.printf(log => winston.format.colorize().colorize(log.level, `${moment().format('ddd, MMM Do, YYYY h:mm A')} - ${log.level}: ${log.message}`))),
					}),
				],
				levels: {
					debug: 0,
					command: 1,
					db: 2,
					info: 3,
					warn: 4,
					error: 5,
				},
			}) as Logger;

			// Add LogDNA transport to logger
			const network = (await si.networkInterfaces())[0];
			this.logger.add(new logdnaWinston({
				key: process.env.LOGDNA, hostname: 'tvf-bot', ip: network.ip4, mac: network.mac, app: this.isProduction ? 'tvf-bot' : 'tvf-bot-beta', env: this.isProduction ? 'Production' : 'Development', level: 'info', indexMeta: true,
			}));

			this.logger.info('Logger initialised!');

			// Error events
			this.on('debug', (m) => this.logger.debug(m));
			this.on('warn', (m) => this.logger.warn(m));
			this.on('error', (m) => this.logger.error(m));
			process.on('uncaughtException', (m) => this.logger.error(m));

			// Connect to the database
			mongoose.connect(process.env.MONGO, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});

			// Database events
			this.db.connection = mongoose.connection
				.on('connected', () => this.logger.db('Connected to database!'))
				.on('error', (err) => this.logger.error(`The database has thrown an error - ${err}`))
				.on('disconnect', () => this.logger.db('Disconnected from the database.'));

			// Set up Akairo listeners
			this.commandHandler = new CommandHandler(this, {
				directory: path.join(__dirname, 'commands'),
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
				automateCategories: true
			});

			this.commandHandler.loadAll();
			this.logger.info('Commands loaded!');

			this.inhibitorHandler = new InhibitorHandler(this, {
				directory: path.join(__dirname, 'inhibitors'),
			});

			this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
			this.inhibitorHandler.loadAll();
			this.logger.info('Inhibitors bound to command handler and loaded!');

			this.listenerHandler = new ListenerHandler(this, {
				directory: path.join(__dirname, 'listeners'),
			});

			this.listenerHandler.setEmitters({
				commandHandler: this.commandHandler,
				inhibitorHandler: this.inhibitorHandler,
				listenerHandler: this.listenerHandler
			});

			this.commandHandler.useListenerHandler(this.listenerHandler);
			this.listenerHandler.loadAll();
			this.logger.info('Listeners bound to command handler and loaded!');

			// Log into pastebin
			await this.pastebin.login();
			this.logger.info('Logged into Pastebin!');

			// Log into discord
			await this.login(this.isProduction ? process.env.STABLE : process.env.BETA);
			this.logger.info('Logged into Discord!');

			// Save the server for use in other methods
			this.server = this.guilds.cache.get('435894444101861408');
			this.logger.info('Saved server to Client!');
		})();
	}

	/**
	 * Calculates the amount of xp required for a level.
	 * @param {number} x
	 */
	xpFor(x: number): number {
		return Math.floor(5 / 6 * x * (2 * x ** 2 + 27 * x + 91));
	}

	/**
	 * Finds the level reward for a given level!
	 * @param {number} level
	 */
	levelReward(level: number): LevelReward {
		const levelIndex = this.constants.levelRoles.findIndex(l => level % 2 === 0 ? l.level === level : l.level === level - 1);
		return this.constants.levelRoles[levelIndex];
	}

	/**
	 * Gets the user's rank in the level rankings.
	 * @param {string} id
	 */
	async rankInServer(id: string): Promise<number> {
		const docs = await User.find({}).sort([['xp', -1]]).exec();
		return docs.filter((e) => this.server.member(e.id)).findIndex((d) => d.id === id) + 1;
	}

	/**
	 * Checks if a user has a staff role.
	 * @param {StaffRole | 'Staff'} role
	 * @param {Discord.GuildMember} member
	 */
	isUser(role: StaffRole, member: Discord.GuildMember): boolean {
		return role === 'Support' ? member.roles.cache.has(this.constants.roles.staff.support.id) || member.roles.cache.has(this.constants.roles.staff.supportHead.id) || member.roles.cache.has(this.constants.roles.staff.admins.id)
			: role === 'Moderation' ? member.roles.cache.has(this.constants.roles.staff.moderators.id) || member.roles.cache.has(this.constants.roles.staff.modHead.id) || member.roles.cache.has(this.constants.roles.staff.admins.id)
				: role === 'Admin' ? member.roles.cache.has(this.constants.roles.staff.admins.id)
					: role === 'Staff' ? member.roles.cache.has(this.constants.roles.staff.staff.id)
						: false;
	}

	/**
	 * Fetches a user's document from the database.
	 * @param {string} id
	 */
	async userDoc(id: string): Promise<IUser> {
		return User.findOne({ id }, (err, doc) => (err ? this.logger.error(err) : doc));
	}

	/**
	 * Saves a document to the database.
	 * @param {mongoose.Document} doc
	 */
	saveDoc(doc: mongoose.Document): void {
		doc.save().catch((err) => this.logger.error(`There was an error saving that document: ${err}`));
	}

	/**
	 * Formats a number.
	 * @param {number} x
	 */
	formatNumber(x: number): string {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	/**
	 * Calculate the join position of a member based on their ID.
	 * @param {string} id
	 */
	joinPosition(id: string): number {
		if (!this.server.member(id)) return;

		const arr = this.server.members.cache.array();
		arr.sort((a, b) => {
			const newA = Date.UTC(a.joinedAt.getFullYear(), a.joinedAt.getMonth(), a.joinedAt.getDate());
			const newB = Date.UTC(b.joinedAt.getFullYear(), b.joinedAt.getMonth(), b.joinedAt.getDate())
			return newA - newB;
		});

		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id === id) return i + 1;
		}
	}

	/**
	 * Send a DM to a member!
	 * @param {Discord.User} user
	 * @param {MessageContent} content
	 */
	async sendDM(user: Discord.User, content: MessageContent): Promise<Discord.Message> {
		return user.send(content).catch(() => {
			const embed = this.util.embed()
				.setTitle('Sorry, I was unable to DM you!')
				.setDescription('I tried to send you a DM, but there was an issue! This may be because you are not accepting DMs from server members. Please check if you have got it enabled, as shown below!')
				.setThumbnail(this.server.iconURL())
				.setImage('https://i.imgur.com/iY7a8RO.png');

			this.constants.channels.community.discussion.send(embed);
		}) as Promise<Discord.Message>;
	}

	/**
	 * Clean up prompts!
	 * @param {Discord.Message} msg
	 */
	deletePrompts(msg: Discord.Message) {
		if (msg.util.messages.size > 0) msg.util.messages.forEach(m => m.delete({ reason: 'Cleaning prompts.' }));
	}

	/**
     * A simple utility method to get a custom user log description
     * @param {Discord.User} u
     */
	userLogCompiler(u: Discord.User): string {
        return `${u.tag} (${u.id})`;
    }
}

export default new TVFClient();
