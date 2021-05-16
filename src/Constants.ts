import * as Discord from 'discord.js';

export interface IConstants {
  // channels
  channels: {
    general: Discord.TextChannel;
    tw: Discord.TextChannel;
    resources: Discord.TextChannel;
    rules: Discord.TextChannel;
    roles: Discord.TextChannel;
    verification: Discord.TextChannel;
    meetTheStaff: Discord.TextChannel;
    announcements: Discord.TextChannel;
    botCommands: Discord.TextChannel;
    staff: {
      private: {
        category: Discord.CategoryChannel;
        logs: Discord.TextChannel;
      };
      isolation: {
        category: Discord.CategoryChannel;
        logs: Discord.TextChannel;
      };
      support: Discord.TextChannel;
      moderators: {
        chat: Discord.TextChannel;
        logs: Discord.TextChannel;
        modlogs: Discord.TextChannel;
      };
      hooters: Discord.TextChannel;
    },
    community: {
      suggestions: Discord.TextChannel;
      starboard: Discord.TextChannel;
      discussion: Discord.TextChannel;
      helper: Discord.TextChannel;
    },
  };

  // roles
  roles: {
    staff: {
      staff: Discord.Role;
      moderators: Discord.Role;
      support: Discord.Role;
      engagement: Discord.Role;
      hackerbeing: Discord.Role;
      admins: Discord.Role;
      modHead: Discord.Role;
      supportHead: Discord.Role;
      engagementHead: Discord.Role;
    },
    community: {
      helper: Discord.Role;
      welcomeTeam: Discord.Role;
    },
    other: {
      bot: Discord.Role;
      kaizen: Discord.Role;
    },
  };

  // colours
  colours: {
    red: string;
    green: string;
    orange: string;
    yellow: string;
    white: string;
  }

  // emojis
  emojis: {
    wave: string;
    tick: string;
    grimacing: string;
    square: string;
    cross: string;
    graph: string;
    confetti: string;
    suggestions: {
      upvote: Discord.GuildEmoji;
      downvote: Discord.GuildEmoji;
    }
    question: string;
  }

  // other
  friendlyPermissions: {
    CREATE_INSTANT_INVITE: string;
    STREAM: string;
    KICK_MEMBERS: string;
    BAN_MEMBERS: string;
    ADMINISTRATOR:string;
    MANAGE_CHANNELS:string;
    MANAGE_GUILD: string;
    ADD_REACTIONS: string;
    VIEW_AUDIT_LOG: string;
    PRIORITY_SPEAKER: string;
    VIEW_CHANNEL: string;
    READ_MESSAGES: string;
    SEND_MESSAGES: string;
    SEND_TTS_MESSAGES: string;
    MANAGE_MESSAGES: string;
    EMBED_LINKS: string;
    ATTACH_FILES: string;
    READ_MESSAGE_HISTORY: string;
    MENTION_EVERYONE: string;
    EXTERNAL_EMOJIS: string;
    USE_EXTERNAL_EMOJIS: string;
    CONNECT: string;
    SPEAK: string;
    MUTE_MEMBERS: string;
    DEAFEN_MEMBERS: string;
    MOVE_MEMBERS: string;
    USE_VAD: string;
    CHANGE_NICKNAME: string;
    MANAGE_NICKNAMES: string;
    MANAGE_ROLES: string;
    MANAGE_ROLES_OR_PERMISSIONS: string;
    MANAGE_WEBHOOKS: string;
    MANAGE_EMOJIS: string;
  };
  levelRoles: LevelReward[];
  moment: string;
  privateTimeout: number;
  blankField: Discord.EmbedFieldData;
}

export default (server: Discord.Guild): IConstants => {
	return {
		// channels
		channels: {
			general: (server.channels.cache.get('435894444584075265') as Discord.TextChannel),
			tw: (server.channels.cache.get('618002057189785601') as Discord.TextChannel),
			resources: (server.channels.cache.get('435923980336234516') as Discord.TextChannel),
			rules: (server.channels.cache.get('481124133606916096') as Discord.TextChannel),
			roles: (server.channels.cache.get('481131558296616961') as Discord.TextChannel),
			verification: (server.channels.cache.get('760809680598990878') as Discord.TextChannel),
			meetTheStaff: (server.channels.cache.get('479744966575390733') as Discord.TextChannel),
			announcements: (server.channels.cache.get('435910303864061962') as Discord.TextChannel),
			botCommands: (server.channels.cache.get('464655374050656256') as Discord.TextChannel),
			staff: {
				private: {
					category: (server.channels.cache.get('768113425867472936') as Discord.CategoryChannel),
					logs: (server.channels.cache.get('768113624861507624') as Discord.TextChannel),
				},
				isolation: {
					category: (server.channels.cache.get('769232209886183455') as Discord.CategoryChannel),
					logs: (server.channels.cache.get('769232273185833020') as Discord.TextChannel),
				},
				support: (server.channels.cache.get('761718388090863616') as Discord.TextChannel),
				moderators: {
					chat: (server.channels.cache.get('452905389596475404') as Discord.TextChannel),
					logs: (server.channels.cache.get('452822928355098635') as Discord.TextChannel),
					modlogs: (server.channels.cache.get('499652797638115348') as Discord.TextChannel),
				},
				hooters: (server.channels.cache.get('454382546181160961') as Discord.TextChannel),
			},
			community: {
				suggestions: (server.channels.cache.get('474242779623456779') as Discord.TextChannel),
				starboard: (server.channels.cache.get('646971709853007873') as Discord.TextChannel),
				discussion: (server.channels.cache.get('458009085829316609') as Discord.TextChannel),
				helper: (server.channels.cache.get('471799568015818762') as Discord.TextChannel),
			}
		},

		// roles
		roles: {
			staff: {
				staff: server.roles.cache.get('452662935035052032'),
				moderators: server.roles.cache.get('435897654682320925'),
				support: server.roles.cache.get('761713326597865483'),
				engagement: server.roles.cache.get('761713486597718026'),
				hackerbeing: server.roles.cache.get('462606587404615700'),
				admins: server.roles.cache.get('452553630105468957'),
				modHead: server.roles.cache.get('761714520535334922'),
				supportHead: server.roles.cache.get('761714525161652224'),
				engagementHead: server.roles.cache.get('761714529691631647'),
			},
			community: {
				helper: server.roles.cache.get('481130628344184832'),
				welcomeTeam: server.roles.cache.get('499302826028302368'),
			},
			other: {
				bot: server.roles.cache.get('451344230023954442'),
				kaizen: server.roles.cache.get('631002094467547148'),
			},
		},

		// colours
		colours: {
			red: '#ff6961',
			green: '#3aa4ae',
			orange: 'ffb861',
			yellow: '#ffc600',
			white: '#ffffff',
		},

		// emojis
		emojis: {
			wave: '👋',
			tick: '✅',
			grimacing: '😬',
			square: '▫',
			cross: '❌',
			confetti: '🎊',
			graph: '📈',
			suggestions: {
				upvote: server.emojis.cache.get('760820779344068609') ,
				downvote: server.emojis.cache.get('760820793507971093'),
			},
			question: '❓',
		},

		// other
		friendlyPermissions: {
			CREATE_INSTANT_INVITE: 'Create Instant Invite',
			STREAM: 'Stream',
			KICK_MEMBERS: 'Kick Members',
			BAN_MEMBERS: 'Ban Members',
			ADMINISTRATOR: 'Administrator',
			MANAGE_CHANNELS: 'Manage Channels',
			MANAGE_GUILD: 'Manage Guild',
			ADD_REACTIONS: 'Add Reactions',
			VIEW_AUDIT_LOG: 'View Audit Log',
			PRIORITY_SPEAKER: 'Priority Speaker',
			VIEW_CHANNEL: 'View Channel',
			READ_MESSAGES: 'Read Messages',
			SEND_MESSAGES: 'Send Messages',
			SEND_TTS_MESSAGES: 'Send TTS Messages',
			MANAGE_MESSAGES: 'Manage Messages',
			EMBED_LINKS: 'Embed Links',
			ATTACH_FILES: 'Attach Files',
			READ_MESSAGE_HISTORY: 'Read Message History',
			MENTION_EVERYONE: 'Mention Everyone',
			EXTERNAL_EMOJIS: 'External Emojis',
			USE_EXTERNAL_EMOJIS: 'Use External Emojis',
			CONNECT: 'Connect',
			SPEAK: 'Speak',
			MUTE_MEMBERS: 'Mute Members',
			DEAFEN_MEMBERS: 'Deafen Members',
			MOVE_MEMBERS: 'Move Members',
			USE_VAD: 'Use Voice Activity',
			CHANGE_NICKNAME: 'Change Nickname',
			MANAGE_NICKNAMES: 'Manage Nicknames',
			MANAGE_ROLES: 'Manage Roles',
			MANAGE_ROLES_OR_PERMISSIONS: 'Manage Roles',
			MANAGE_WEBHOOKS: 'Manage Webhooks',
			MANAGE_EMOJIS: 'Manage Emojis',
		},

		levelRoles: [
			{ level: 2, role: server.roles.cache.get('441943660016173058'), name: 'Elf' }, // elf
			{ level: 4, role: server.roles.cache.get('466738306881814536'), name: 'Goblin' }, // goblin
			{ level: 6, role: server.roles.cache.get('441944499149602816'), name: 'Gnome' }, // gnome
			{ level: 8, role: server.roles.cache.get('466738333649731587'), name: 'Brownie' }, // brownie
			{ level: 10, role: server.roles.cache.get('441944655450603520'), name: 'Fairy' }, // fairy
			{ level: 12, role: server.roles.cache.get('441945051296301057'), name: 'Leprechaun' }, // leprechaun
			{ level: 14, role: server.roles.cache.get('441945301721415681'), name: 'Faun' }, // faun
			{ level: 16, role: server.roles.cache.get('466739322054246401'), name: 'Harpy' }, // harpy
			{ level: 18, role: server.roles.cache.get('453950866815320085'), name: 'Leshy' }, // leshy
			{ level: 20, role: server.roles.cache.get('453950669573849091'), name: 'Nymph' }, // nymph
			{ level: 22, role: server.roles.cache.get('441945780119535637'), name: 'Dryad' }, // dryad
			{ level: 24, role: server.roles.cache.get('453947107825680396'), name: 'Centaur' }, // centaur
			{ level: 26, role: server.roles.cache.get('453950089451405322'), name: 'Warlock' }, // warlock
			{ level: 28, role: server.roles.cache.get('466738356831649793'), name: 'Phoenix' }, // phoenix
			{ level: 30, role: server.roles.cache.get('453947113643048982'), name: 'Griffin' }, // griffin
			{ level: 32, role: server.roles.cache.get('453949450902044715'), name: 'Sphinx' }, // sphinx
			{ level: 34, role: server.roles.cache.get('453947119842099222'), name: 'Unicorn' }, // unicorn
			{ level: 36, role: server.roles.cache.get('466739004432318466'), name: 'Dragon' }, // dragon
			{ level: 38, role: server.roles.cache.get('453950908640788480'), name: 'Hydra' }, // hydra
			{ level: 40, role: server.roles.cache.get('635836969527541770'), name: 'Behemoth' }, // behemoth
			{ level: 42, role: server.roles.cache.get('640501774985461790'), name: 'Eldritch Being' }, // eldritch being
			{ level: 44, role: server.roles.cache.get('799084406354346054'), name: 'Banshee' }, // banshee
			{ level: 46, role: server.roles.cache.get('799084468144308274'), name: 'Cockatrice' }, // cockatrice
			{ level: 48, role: server.roles.cache.get('799084509667655721'), name: 'Barghest' }, // barghest
			{ level: 50, role: server.roles.cache.get('801521919454609438'), name: 'Draugr' }, // draugr
			{ level: 52, role: server.roles.cache.get('799084536151277588'), name: 'Treant' }, // treant
			{ level: 54, role: server.roles.cache.get('799084584067137580'), name: 'Dullahan' }, // dullahan
			{ level: 56, role: server.roles.cache.get('801518871927455794'), name: 'Yokai' }, // yokai
			{ level: 58, role: server.roles.cache.get('801518874113474631'), name: 'Kelpie' }, // kelpie
			{ level: 60, role: server.roles.cache.get('801518876395044904'), name: 'Jötnar' }, // jötnar
			{ level: 62, role: server.roles.cache.get('801518878211571713'), name: 'Rusalka' }, // rusalka
			{ level: 64, role: server.roles.cache.get('801518880656064592'), name: 'Kitsune' }, // kitsune
			{ level: 66, role: server.roles.cache.get('801518881314177116'), name: 'Fomorian' }, // fomorian
			{ level: 68, role: server.roles.cache.get('801518884863606845'), name: 'Jörmungandr' }, // jörmungandr
			{ level: 70, role: server.roles.cache.get('799084559366881321'), name: 'Erlking' }, // erlking
			{ level: 72, role: server.roles.cache.get('801518887053033502'), name: 'River Deity' }, // river deity
			{ level: 74, role: server.roles.cache.get('801518889102999602'), name: 'Spriggan' }, // spriggan
			{ level: 76, role: server.roles.cache.get('801518890978246706'), name: 'Hippogriff' }, // hippogriff
			{ level: 78, role: server.roles.cache.get('801518911165825125'), name: 'Pixie' }, // pixie
			{ level: 80, role: server.roles.cache.get('801518914190180392'), name: 'Pegasus' }, // pegasus
			{ level: 82, role: server.roles.cache.get('801518919055573063'), name: 'Chimera' }, // chimera
			{ level: 84, role: server.roles.cache.get('801520771876913242'), name: 'Basilisk' }, // basilisk
			{ level: 86, role: server.roles.cache.get('801520780876841001'), name: 'Forest Spirit' }, // forest spirit
			{ level: 88, role: server.roles.cache.get('801520784555769888'), name: 'Moth Man' }, // moth man
			{ level: 90, role: server.roles.cache.get('799084616350040064'), name: 'Dirt' }, // dirt
			{ level: 92, role: server.roles.cache.get('799084438402891786'), name: 'David Bowie' }, // david bowie
			{ level: 94, role: server.roles.cache.get('801520795347320853'), name: 'Rel' }, // rel
			{ level: 96, role: server.roles.cache.get('801520798430265374'), name: 'Dwayne "The Rock" Johnson' }, // dwayne "the rock" johnson
			{ level: 98, role: server.roles.cache.get('799084638936367155'), name: 'Gandalf' }, // gandalf
			{ level: 100, role: server.roles.cache.get('801520799189958676'), name: 'how?' }, // how?
		],
		moment: 'ddd, MMM Do, YYYY h:mm A',
		privateTimeout: 21600000,
		blankField:  { name: '\u200B', value: '\u200B' }
	}
}
