import * as Discord from 'discord.js';
import * as winston from 'winston';
import * as winstonError from 'winston-error';
import User from '../models/user';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { BLUE, RED, PURPLE, ORANGE, GREEN, BLACK, WHITE } from '../Constants';

type Colour =
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'black'
    | 'white'
    | 'random';

export default class Client {
    // properties
    public bot: Discord.Client;
    public logger: winston.Logger;

    public isProduction = process.env.NODE_ENV === 'production';
    public commands: Discord.Collection<
        string,
        Command
    > = new Discord.Collection();
    public events: Discord.Collection<string, any> = new Discord.Collection();

    public db = {
        users: User,
    };

    public config = {
        prefix: this.isProduction
            ? /tvf\s|<@!581144700547760128>\s/gi
            : /tvfbeta\s|beta\s|<@!597190196383055894>\s/gi,
        restricted: /discord\.gg\/|discord,gg\/|discord\.me\/|discord,me\/|nakedphotos\.club\/|nakedphotos,club\/|privatepage\.vip\/|privatepage,vip\/|redtube\.com\/|redtube,com\//g,
        roles: {
            isolation: '586251637539209216',
            fk: '452662935035052032',
            mod: '435897654682320925',
            admin: '452553630105468957',
            techAdmin: '462606587404615700',
        },
        channels: {
            isolation: '586251824563224576',
            fk: '453195365211176960',
            helper: '471799568015818762',
        },
        auth: {
            discord: this.isProduction
                ? process.env.DISCORD
                : process.env.DISCORDBETA,
            mongo: process.env.MONGO,
        },
    };

    /**
     * Constructs the Client class.
     *
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
                                      `${log.timestamp} - ${log.level}: ${log.message}`
                              )
                            : winston.format.printf((log) =>
                                  winston.format
                                      .colorize()
                                      .colorize(
                                          log.level,
                                          `${log.timestamp} - ${log.level}: ${log.message}`
                                      )
                              )
                    ),
                }),
            ],
        });

        winstonError(logger);
        this.logger = logger;
    }

    /**
     * Log the bot into Discord and the database.
     */
    public start() {
        return this.loadEvents()
            .loadCommands()
            .connectDB()
            .bot.login(this.config.auth.discord);
    }

    /**
     * Creates an embed.
     *
     * @param {Color} colour - which colour you would like the embed to be - orange by default.
     * @param {boolean} timestamp - whether the time should be displayed on the embed.
     * @returns {Discord.RichEmbed} a simply configured RichEmbed.
     */
    public createEmbed(
        colour: Colour = 'orange',
        timestamp: boolean = true
    ): Discord.MessageEmbed {
        // create an embed and set the default options
        const embed = new Discord.MessageEmbed();

        switch (colour) {
            case 'blue':
                embed.setColor(BLUE);
                break;
            case 'red':
                embed.setColor(RED);
                break;
            case 'purple':
                embed.setColor(PURPLE);
                break;
            case 'orange':
                embed.setColor(ORANGE);
                break;
            case 'green':
                embed.setColor(GREEN);
                break;
            case 'black':
                embed.setColor(BLACK);
                break;
            case 'white':
                embed.setColor(WHITE);
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
     * Gets all of the commands from a specific module.
     *
     * @param {Discord.Collection<string, Command>} commands - the collection of commands.
     * @param {Module} module - the name of a module.
     * @returns all of the commands from the specified module.
     */
    public filterCommands(
        commands: Discord.Collection<string, Command>,
        module: Module
    ): string {
        return commands
            .filter((c) => c.config.module === module)
            .map((c) => `\`${c.config.name}\``)
            .join(' ');
    }

    // private methods
    private loadEvents() {
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

        return this;
    }

    private loadCommands() {
        const cmdFiles = fs
            .readdirSync(`${__dirname}/../commands`)
            .filter((f) => f.endsWith('.js'));

        for (const file of cmdFiles) {
            const { default: command } = require(`../commands/${file}`);
            this.commands.set(command.config.name, command);

            this.logger.info(`${command.config.name} loaded.`);
        }

        return this;
    }

    private connectDB() {
        mongoose.connect(this.config.auth.mongo, {
            useNewUrlParser: true,
        });

        mongoose.connection.on('connected', () =>
            this.logger.info(
                `Mongoose default connection is open to ${this.config.auth.mongo}`
            )
        );
        mongoose.connection.on('error', (error) =>
            this.logger.error(
                `Mongoose default connection has occurred "${error}" error.`
            )
        );
        mongoose.connection.on('disconnect', () =>
            this.logger.info('Mongoose default connection is disconnected.')
        );

        return this;
    }
}
