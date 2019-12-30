import * as Discord from 'discord.js';
import * as winston from 'winston';
import User from '../models/user';
import * as fs from 'fs';
import * as mongoose from 'mongoose';

import TVFEmojis from '../constants/Emojis';
import TVFChannels from '../constants/Channels';
import TVFRoles from '../constants/Roles';
import TVFColours from '../constants/Colours';
import TVFUsers from '../constants/Users';
import TVFOther from '../constants/Other';

type Colour =
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'black'
    | 'white'
    | 'random';

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
    prefix = this.isProduction ? 'tvf ' : 'tvfbeta ';
    auth = {
    	discord: this.isProduction ? process.env.STABLE : process.env.BETA,
    	mongo: process.env.MONGO,
    };

    /**
     * Constructs the Client class.
     * @param {Discord.ClientOptions={}} options
     */
    constructor(options: Discord.ClientOptions = {}) {
    	// create the bot instance
    	this.bot = new Discord.Client(options);

    	// create the logger
    	winston.addColors({
    		error: 'bold red',
    		warn: 'bold yellow',
    		info: 'bold cyan',
    		debug: 'bold white',
    	});

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
    start() {
    	mongoose.connect(this.auth.mongo, {
    		useNewUrlParser: true,
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

    	return this.bot.login(this.auth.discord);
    }

    /**
     * Creates an embed.
     * @param {Color} colour - which colour you would like the embed to be - orange by default.
     * @param {boolean} timestamp - whether the time should be displayed on the embed.
     * @returns {Discord.RichEmbed} a simply configured RichEmbed.
     */
    createEmbed(
    	colour: Colour = 'orange',
    	timestamp: boolean = true,
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

    	if (timestamp) {
    		embed.setTimestamp(new Date());
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
    sendToChannel(id: string, content: any, ...params) {
    	((this.bot.channels.get(id)) as Discord.TextChannel).send(content, ...params);
    }

    /**
     * Shortens a string
     * @param {string} str The string to shorten
     * @param {number} n The max length the string may be
     * @returns {string} The shortened string
     */
    truncate(str: string, n: number): string {
    	if (str.length > n) {
    		return `${str.slice(0, n)}...`;
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
    checkForMember(msg: Discord.Message, args: string[]): Discord.GuildMember {
    	return msg.mentions.members.first() === undefined
    		? msg.guild.members.find(({ user }) => user.tag === args.join(' '))
    		: msg.mentions.members.first();
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
