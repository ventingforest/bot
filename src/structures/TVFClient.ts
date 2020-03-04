import * as Discord from 'discord.js';
import * as winston from 'winston';
import * as logdna from 'logdna-winston';
import * as os from 'os';
import * as address from 'address';
import User from '../models/user';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { KSoftClient } from 'ksoft.js';

import TVFEmojis from '../constants/Emojis';
import TVFChannels from '../constants/Channels';
import TVFRoles from '../constants/Roles';
import TVFColours from '../constants/Colours';
import TVFUsers from '../constants/Users';
import TVFOther from '../constants/Other';

export default class TVFClient {
	// ==============================================================================================================================================================================================================================================================================================================================================================
	//
	//                    #####   #####     #####   #####   #####  #####    ######  ##  #####   ####
	//                    ##  ##  ##  ##   ##   ##  ##  ##  ##     ##  ##     ##    ##  ##     ##
	//                    #####   #####    ##   ##  #####   #####  #####      ##    ##  #####   ###
	//                    ##      ##  ##   ##   ##  ##      ##     ##  ##     ##    ##  ##        ##
	//                    ##      ##   ##   #####   ##      #####  ##   ##    ##    ##  #####  ####
	//
	// ==============================================================================================================================================================================================================================================================================================================================================================

    isProduction = process.env.NODE_ENV === 'production';
    bot: Discord.Client;
    logger: winston.Logger;
    commands: Discord.Collection<string, Command> = new Discord.Collection();
	events: Discord.Collection<string, any> = new Discord.Collection();
	server: Discord.Guild;
	ksoft: KSoftClient;

    db = {
    	users: User,
    };

    // constants
    emojis = TVFEmojis;
    channels = TVFChannels;
    roles = TVFRoles;
    colours = TVFColours;
    users = TVFUsers;
    other = TVFOther;

    // config
    prefix = this.isProduction ? 'tvf ' : 'tvf beta ';
    auth = {
    	discord: this.isProduction ? process.env.STABLE : process.env.BETA,
    	mongo: process.env.MONGO,
    	ksoft: process.env.KSOFT,
    	logdna: process.env.LOGDNA_INGESTION,
    };

    /**
     * Constructs the Client class.
     * @param {Discord.ClientOptions={}} options
     */
    constructor() {
    	// create the bot instance
    	this.bot = new Discord.Client({});

    	// create the logger
    	winston.addColors({
    		error: 'bold red',
    		warn: 'bold yellow',
    		info: 'bold cyan',
    		debug: 'bold white',
    	});

    	const ip = address.ip();
    	let mac: string;
    	address.mac((_e, macadd) => { mac = macadd; });

    	const logger = winston.createLogger({
    		transports: [
    			new winston.transports.Console({
    				format: winston.format.combine(
    					winston.format.timestamp({
    						format: 'DD-MM-YYYY HH:mm ',
    					}),
    					this.isProduction
    						? winston.format.printf(
    							(log) =>
    								`${log.timestamp} - ${log.level}: ${log.message}`,
    						)
    						: winston.format.printf((log) =>
    							winston.format
    								.colorize()
    								.colorize(
    									log.level,
    									`${log.timestamp} - ${log.level}: ${log.message}`,
    								),
    						),
    				),
    			}),
    			new logdna({
    				key: this.auth.logdna,
    				hostname: os.hostname(),
    				ip,
    				mac,
    				app: this.isProduction ? 'TVF Bot' : 'TVF Bot Beta',
    				handleExceptions: true,
    			}),
    		],
    	});

    	const winstonError = {
    		apply: (target, _, argumentsList: any[]) => {
    			if (
    				argumentsList.length >= 2 ||
                    argumentsList.length <= 0 ||
                    typeof argumentsList[0] === 'string' ||
                    argumentsList[0] instanceof String
    			) {
    				target.apply(logger, argumentsList);
    			}
    			else {
    				const error = argumentsList[0];
    				target.apply(logger, ['', error]);
    			}
    		},
    	};

    	logger.debug = new Proxy(logger.debug, winstonError);
    	logger.error = new Proxy(logger.error, winstonError);

    	this.logger = logger;
    	logger.info('Logger initialised.');

    	// initiate ksoft client
    	this.ksoft = new KSoftClient(this.auth.ksoft);
    	logger.info('ksoft.si client initialised.');
    }

    // ==============================================================================================================================================================================================================================================================================================================================================
    //
    //                    ###    ###  #####  ######  ##   ##   #####   ####     ####
    //                    ## #  # ##  ##       ##    ##   ##  ##   ##  ##  ##  ##
    //                    ##  ##  ##  #####    ##    #######  ##   ##  ##  ##   ###
    //                    ##      ##  ##       ##    ##   ##  ##   ##  ##  ##     ##
    //                    ##      ##  #####    ##    ##   ##   #####   ####    ####
    //
    // ==============================================================================================================================================================================================================================================================================================================================================

    /**
     * Log the bot into Discord and the database.
     */
    async start() {
    	mongoose.connect(this.auth.mongo, {
    		useNewUrlParser: true,
    		useUnifiedTopology: true,
    	});

    	mongoose.connection
    		.on('connected', () =>
    			this.logger.info(
    				`Mongoose default connection is open to ${this.auth.mongo}`,
    			),
    		)
    		.on('error', (error) =>
    			this.logger.error(
    				`Mongoose default connection has occurred "${error}" error.`,
    			),
    		)
    		.on('disconnect', () =>
    			this.logger.info('Mongoose default connection is disconnected.'),
    		);

    	const eventFiles = fs
    		.readdirSync(`${__dirname}/../events`)
    		.filter((f) => f.endsWith('.js'));

    	for (const file of eventFiles) {
    		const name = file.substring(0, file.length - 3);
    		const { default: event } = require(`../events/${file}`);

    		this.events.set(name, event);
    		this.bot.on(name, (...args) => {
    			event(this, ...args);
    		});

    		this.logger.info(`${name} event has been loaded.`);
    	}

    	this.bot.on('debug', (m) => this.logger.debug(m));
    	this.bot.on('warn', (m) => this.logger.warn(m));
    	this.bot.on('error', (m) => this.logger.error(m));
    	process.on('uncaughtException', (error) => this.logger.error(error));

    	const cmdFiles = fs
    		.readdirSync(`${__dirname}/../commands`)
    		.filter((f) => f.endsWith('.js'));

    	for (const file of cmdFiles) {
    		const { default: command } = require(`../commands/${file}`);
    		this.commands.set(command.config.name, command);

    		this.logger.info(`${command.config.name} loaded.`);
    	}

    	await this.bot.login(this.auth.discord);

    	// save the guild to the server property
    	this.server = this.bot.guilds.cache.get('435894444101861408');
    }

    /**
     * Creates an embed.
     * @param {Color} colour - which colour you would like the embed to be - defaults to orang.
	 * @param {EmbedOptions} options - the options for the embed
	 * @param {boolean} options.timestamp - whether the timestamp automatically appears on the embed - defaults to false.
	 * @param {boolean} options.thumbnail - whether the embed's thumbnail is automatically set to the server's icon - defaults to true.
     * @returns {Discord.MessageEmbed} a simply configured MessageEmbed.
     */
    createEmbed(
    	colour: Colour = 'orange',
    	options: EmbedOptions = {
    		timestamp: false,
    		thumbnail: true,
    	},
    ): Discord.MessageEmbed {
    	// create an embed and set the default options
    	const embed = new Discord.MessageEmbed();

    	switch (colour) {
    		case 'blue':
    			embed.setColor(this.colours.BLUE);
    			break;
    		case 'red':
    			embed.setColor(this.colours.RED);
    			break;
    		case 'purple':
    			embed.setColor(this.colours.PURPLE);
    			break;
    		case 'orange':
    			embed.setColor(this.colours.ORANGE);
    			break;
    		case 'green':
    			embed.setColor(this.colours.GREEN);
    			break;
    		case 'black':
    			embed.setColor(this.colours.BLACK);
    			break;
    		case 'white':
    			embed.setColor(this.colours.WHITE);
    			break;
    		case 'random':
    			embed.setColor('RANDOM');
    			break;
    	}

    	if (options.timestamp) {
    		embed.setTimestamp(new Date());
    	}

    	if (options.thumbnail) {
    		embed.setThumbnail(this.server.iconURL());
    	}

    	// return the embed
    	return embed;
    }

    /**
	 * Send to a specific channel
	 * @param {string} id The ID of the channel to send the message to
	 * @param {any} content The content of the message
	 * @param {any} params Any other parameters to be passed into the send function
	 */
    async sendToChannel(id: string, content: any, ...params) {
    	(await (this.bot.channels.fetch(id)) as Discord.TextChannel).send(content, ...params);
    }

    /**
	 * Check if a member is a certain role of staff
	 * @param {StaffRole} role The role of staff to check the member against
	 * @param {Discord.User} member The user to check the role against
	 * @returns {boolean} 'true' if the member is of that role, 'false' if not
	 */
    isUser(role: StaffRole, user: Discord.User): boolean {
    	const member = this.server.member(user);
    	return role === 'fk' ? member.roles.cache.has(this.roles.FK) : role === 'mod' ? member.roles.cache.has(this.roles.MOD) : role === 'admin' ? member.roles.cache.has(this.roles.ADMIN) || member.roles.cache.has(this.roles.TECHADMIN) || member.roles.cache.has(this.roles.NEWT2) : false;
    }

    /**
	 * Get a member by their ID
	 * @param {string} id The member's ID
	 * @returns {Discord.GuildMember} The member
	 */
    getMemberByID(id: string): Discord.GuildMember {
    	return this.server.members.cache.get(id);
    }

    /**
	 * Resolve an emoji as a string from an ID
	 * @param {string} id The ID of the emoji
	 * @returns {string}
	 */
    resolveEmoji(id: string): string {
    	return this.bot.emojis.cache.get(id).toString();
    }

    /**
     * Shortens a string
     * @param {string} str The string to shorten
     * @param {number} n The max length the string may be
     * @returns {string} The shortened string
     */
    truncate(str: string, n: number): string {
    	if (str.length > n) {
    		return `${str.slice(0, n - 3)}...`;
    	}
    	else {
    		return str;
    	}
    }

    /**
     * Gets all of the commands from a specific module.
     * @param {Discord.Collection<string, Command>} commands - the collection of commands.
     * @param {Module} module - the name of a module.
     * @returns {string} all of the commands from the specified module.
     */
    filterCommands(
    	commands: Discord.Collection<string, Command>,
    	module: Module,
    ): string {
    	return commands
    		.filter((c) => c.config.module === module)
    		.map((c) => `\`${c.config.name}\``)
    		.join(' ');
    }

    /**
     * Checks for a member in a message.
     * @param {Discord.Message} msg - the message to check.
     * @param {string[]} args - the arguments to the command.
     * @returns {Discord.GuildMember} a member mentioned in the message.
     */
    async checkForMember(msg: Discord.Message, args: string[]): Promise<Discord.GuildMember> {
    	return (msg.mentions.members.first() === undefined
    		? (await msg.guild.members.fetch()).filter(u => u.user.tag === args.join(' '))
    		: msg.mentions.members.first()) as Discord.GuildMember;
    }

    /**
     * Escapes all regex from a string
     * @param {string} str The string to escape
     * @returns {string} The string, without any regex in it
     */
    escapeRegex(str: string): string {
    	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
