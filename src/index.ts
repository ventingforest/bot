import * as Discord from 'discord.js';
import * as winston from 'winston';
import logdnaWinston from 'logdna-winston';
import mongoose = require('mongoose');
import PastebinAPI from 'pastebin-js';
import * as jimp from 'jimp';
import * as path from 'path';
import axios from 'axios';
import moment from 'moment';
import si from 'systeminformation';
import * as dotenv from 'dotenv';
import {
	AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler,
} from 'discord-akairo';
import User, { IUser } from './models/user';
import { default as Constants, IConstants } from './Constants';

dotenv.config();

class TVFClient extends AkairoClient {
	// properties
	isProduction = process.env.NODE_ENV === 'production';
	logger: Logger;
	server: Discord.Guild;
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	inhibitorHandler: InhibitorHandler;
	botBanner = true;
	pastebin = new PastebinAPI({
		api_dev_key: process.env.PASTEBIN_KEY,
		api_user_name: process.env.PASTEBIN_USERNAME,
		api_user_password: process.env.PASTEBIN_PASSWORD,
	});
	talkedRecently: Set<string> = new Set();
	constants: IConstants;

	// constants
	moment = 'ddd, MMM Do, YYYY h:mm A';

	blankField: Discord.EmbedFieldData = { name: '\u200B', value: '\u200B' };

	invite = 'https://discord.gg/RS69ssj';

	banAppeal = 'https://forms.gle/EoUp6hxmNvuAJXJfA';

	prefix = this.isProduction ? 'tvf ' : 'tvf beta ';

	privateTimeout = 21600000;

	embedLimit = {
		title: 256,
		description: 2048,
		footer: 2048,
		author: 256,
		field: {
			title: 256,
			value: 1024,
		},
	};

	const: IConstants;

	db: { user: mongoose.Model<IUser>, connection: mongoose.Connection | null } = {
		user: User,
		connection: null,
	};

	// constructor
	constructor() {
		super({ ownerID: ['326767126406889473'] }, { disableMentions: 'everyone' });

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
				key: process.env.LOGDNA, hostname: 'tvf-bot', ip: network.ip4, mac: network.mac, app: 'tvf-bot', env: this.isProduction ? 'Production' : 'Development', level: 'info', indexMeta: true,
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

			this.commandHandler.useListenerHandler(this.listenerHandler);
			this.listenerHandler.loadAll();
			this.logger.info('Listeners bound to command handler and loaded!');

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
		return role === 'Support' ? member.roles.cache.has(this.const.roles.staff.support.id) || member.roles.cache.has(this.const.roles.staff.supportHead.id)
			: role === 'Engagement' ? member.roles.cache.has(this.const.roles.staff.engagement.id) || member.roles.cache.has(this.const.roles.staff.engagementHead.id)
				: role === 'Moderation' ? member.roles.cache.has(this.const.roles.staff.moderators.id) || member.roles.cache.has(this.const.roles.staff.modHead.id)
					: role === 'Admin' ? member.roles.cache.has(this.const.roles.staff.admins.id)
						: role === 'Staff' ? member.roles.cache.has(this.const.roles.staff.staff.id)
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
	 * Overlays a pride flag over a user's profile picture.
	 * @param {Discord.User} user
	 * @param {string} type
	 * @param {number} opacity
	 */
	async pridePfp(user: Discord.User, type: string, opacity: number): Promise<Buffer> {
		// load the necessary images
		const image = await jimp.read(user.avatarURL({ size: 512, format: 'png' }));
		const flag = await jimp.read(path.resolve(`assets/pride/${type}.png`));

		// resize the flag and set opacity to 50%
		flag.resize(image.getWidth(), image.getHeight());
		flag.opacity(opacity);

		// overlay the flag onto the image
		image.blit(flag, 0, 0);

		// return the manipulated image's buffer
		return image.getBufferAsync(jimp.MIME_PNG);
	}

	/**
	 * Formats a number.
	 * @param {number} x
	 */
	formatNumber(x: number): string {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
}

export default new TVFClient();
