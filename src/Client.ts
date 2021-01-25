import * as Discord from 'discord.js';
import * as winston from 'winston';
import * as fs from 'fs';
import mongoose = require('mongoose');
import PastebinAPI from 'pastebin-js';
import * as jimp from 'jimp';
import * as path from 'path';
import axios from 'axios';

import User, { IUser } from './models/user';
import { IConstants } from './Constants';

export default class Client {
  // properties
  isProduction = process.env.NODE_ENV === 'production';
  bot: Discord.Client;
  logger: winston.Logger;
  commands: Discord.Collection<string, Command> = new Discord.Collection();
  events: Discord.Collection<string, any> = new Discord.Collection();
  server: Discord.Guild
  config: BotConfig = {
    botbanner: true,
  };
  pastebin = new PastebinAPI({
    'api_dev_key': process.env.PASTEBIN_KEY,
    'api_user_name': process.env.PASTEBIN_USERNAME,
    'api_user_password': process.env.PASTEBIN_PASSWORD
  });
  talkedRecently = new Set();

  // constants
  moment = 'ddd, MMM Do, YYYY h:mm A';
  blankField: Discord.EmbedFieldData = { name: '\u200B', value: '\u200B' };
  invite = 'https://discord.gg/RS69ssj';
  banAppeal = 'https://forms.gle/EoUp6hxmNvuAJXJfA';
  prefix = this.isProduction ? 'tvf ': 'tvf beta ';
  privateTimeout = 21600000;

  embedLimit = {
    title: 256,
    description: 2048,
    footer: 2048,
    author: 256,
    field: {
      title: 256,
      value: 1024
    }
  }

  const: IConstants;

  db: { user: mongoose.Model<IUser>, connection: mongoose.Connection | null } = {
    user: User,
    connection: null,
  }

  // constructor
  constructor() {
    // create the logger
    winston.addColors({
      error: 'bold red',
      warn: 'bold yellow',
      info: 'bold cyan',
      debug: 'bold white',
    });

    const timestamp = winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm '});

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.printf(log => winston.format.colorize().colorize(log.level, `${log.timestamp} - ${log.level}: ${log.message}`))),
        })
      ]
    });

    const winstonError = {
      apply: (target: any, _: any, argumentsList: any[]) => {
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

    // set properties
    this.bot = new Discord.Client();
    this.logger = logger;
    logger.info('Discord client and logger are both initialised');
  }

  /**
   * Gets a user's unbelievaboat balance.
   * @param {string} id
   */
  async getBalance(id: string): Promise<UserBalance> {
    const res = await axios.get(`https://unbelievaboat.com/api/v1/guilds/${this.server.id}/users/${id}`, { headers: { 'Authorization': process.env.UNBELIEVABOAT }});
    return { cash: res.data.cash, bank: res.data.bank, total: res.data.total };
  }

  /**
   * Updates a user's unbelievaboat balance.
   * @param {string} id 
   * @param data 
   */
  async updateBalance(id: string, data: { cash?: number, bank?: number, reason?: number }): Promise<UserBalance> {
    const res = await axios.patch(`https://unbelievaboat.com/api/v1/guilds/${this.server.id}/users/${id}`, data, { headers: { 'Authorization': process.env.UNBELIEVABOAT }});
    return { cash: res.data.cash, bank: res.data.bank, total: res.data.total };
  }

  /**
   * Calculates the amount of xp required for a level.
   * @param {number} x
   */
  xpFor(x: number): number {
    return Math.floor(5/6 * x * (2 * x ** 2 + 27 * x + 91));
  }

  /**
   * Gets the user's rank in the level rankings.
   * @param {string} id
   */
  async rankInServer(id: string): Promise<number> {
      const docs = await User.find({}).sort([['xp', -1]]).exec();
      return docs.filter(e => this.server.member(e.id)).findIndex(d => d.id === id) + 1;
  }

  /**
   * Generates an embed that satisfies the provided options.
   * @param {EmbedOptions} options
   * @param {Discord.Message} msg 
   */
  createEmbed(options: EmbedOptions = { colour: this.const.white, timestamp: false, thumbnail: true, author: false, }, msg?: Discord.Message): Discord.MessageEmbed {
    // create an embed and configure it accordinly
    const embed = new Discord.MessageEmbed()
      .setColor(options.colour || this.const.green);

    if (options.timestamp) embed.setTimestamp();
    if (options.thumbnail) embed.setThumbnail(this.server.iconURL());
    if (msg && options.author) embed.setAuthor(msg.author.tag, msg.author.avatarURL());

    return embed;
  }

  /**
   * Generates a string formatted with an emoji and a message.
   * @param {string} emoji
   * @param {string} msg 
   */
  emojiMessage(emoji: string, msg: string): string {
    return `**${emoji}  |** ${msg}`;
  }

  /**
   * Checks if a user has a staff role.
   * @param {StaffRole | 'Staff'} role
   * @param {Discord.GuildMember} member
   */
  isUser(role: StaffRole | 'Staff', member: Discord.GuildMember): boolean {
    return role === 'Support' ? member.roles.cache.has(this.const.staffRoles.support.id) || member.roles.cache.has(this.const.staffRoles.heads.support.id) :
           role === 'Engagement' ? member.roles.cache.has(this.const.staffRoles.engagement.id) || member.roles.cache.has(this.const.staffRoles.heads.engagement.id) :
           role === 'Moderation' ? member.roles.cache.has(this.const.staffRoles.moderators.id) || member.roles.cache.has(this.const.staffRoles.heads.moderators.id) :
           role === 'Admin' ? member.roles.cache.has(this.const.staffRoles.admins.id) :
           role === 'Staff' ? member.roles.cache.has(this.const.staffRoles.staff.id)
           : false;
  }

  /**
   * Gets a user based on their ID. Used to fetch User objects for members that have left the server.
   * @param {string} id
   */
  async resolveUser(id: string): Promise<Discord.User> {
    return await this.bot.users.fetch(id);
  }

  /**
   * Fetches a user's document from the database.
   * @param {string} id
   */
  async userDoc(id: string): Promise<IUser> {
    return await User.findOne({ id }, (err, doc) => err ? this.logger.error(err) : doc);
  }

  /**
   * Saves a document to the database.
   * @param {mongoose.Document} doc
   */
  saveDoc(doc: mongoose.Document): any {
    doc.save().catch(err => this.logger.error(`There was an error saving that document: ${err}`));
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
    return await image.getBufferAsync(jimp.MIME_PNG);
  }

  /**
   * Formats a number.
   * @param {number} x
   */
  formatNumber(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Starts the bot.
   */
  async start() {
    // connect to the database
    mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // get all of the files in the event folder and command folders
    const eventFiles = fs.readdirSync(`${__dirname}/events/`).filter(f => f.endsWith('.js'));
    const categories = fs.readdirSync(`${__dirname}/commands/`).filter(f => !f.endsWith('.js'));

    categories.forEach(category => {
      const files = fs.readdirSync(`${__dirname}/commands/${category}/`).filter(f => f.endsWith('.js'));

      for (const file of files) {
          let { default: command }: { default: Command } = require(`./commands/${category}/${file}`);
          command.category = category;
          this.commands.set(command.name, command);
          this.logger.info(`"${command.name}" command loaded from the "${command.category}" category!`);
      }
    });

    // error events
    this.bot.on('debug', m => this.logger.debug(m));
    this.bot.on('warn', m => this.logger.warn(m));
    this.bot.on('error', m => this.logger.error(m));
    process.on('uncaughtException', m => this.logger.error(m));

    // discord events
    for (const file of eventFiles) {
      // get the event file and add it to the collection
      const name = file.substring(0, file.length - 3);
      const { default: event } = require(`./events/${file}`);
      this.events.set(name, event);

      // load the event
      // @ts-ignore
      this.bot.on(name, (...args: any[]) => event(this, ...args));

      // log that the event has been loaded
      this.logger.info(`${name} event loaded.`);
    }

    // database events
    this.db.connection = mongoose.connection
      .on('connected', () => this.logger.info('Connected to database!'))
      .on('error', err => this.logger.error(`The database has thrown an error - ${err}`))
      .on('disconnect', () => this.logger.info('Disconnected from the database.'));

    // log into discord
    await this.bot.login(this.isProduction ? process.env.STABLE : process.env.BETA);

    // save the server for use in other methods
    this.server = this.bot.guilds.cache.get('435894444101861408');
  }
}
