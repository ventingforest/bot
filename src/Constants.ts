import * as Discord from 'discord.js';

type LevelReward = { level: number, role: Discord.Role };

export interface IConstants {
    // channels
    general: Discord.TextChannel;
	tw: Discord.TextChannel;
	resources: Discord.TextChannel;
	rules: Discord.TextChannel;
	roles: Discord.TextChannel;
    verification: Discord.TextChannel;
    meetTheStaff: Discord.TextChannel;
    announcements: Discord.TextChannel;
	staffChannels: {
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
	};
	communityChannels: {
		suggestions: Discord.TextChannel;
		starboard: Discord.TextChannel;
		discussion: Discord.TextChannel;
		helper: Discord.TextChannel;
	};

    // roles
    staffRoles: {
		staff: Discord.Role;
		moderators: Discord.Role;
		support: Discord.Role;
		engagement: Discord.Role;
		hackerbeing: Discord.Role;
		admins: Discord.Role;
		heads: {
			moderators: Discord.Role;
			support: Discord.Role;
			engagement: Discord.Role;
		};
	};
	communityRoles: {
		helper: Discord.Role;
		welcomeTeam: Discord.Role;
	};
	bot: Discord.Role;
    kaizen: Discord.Role;
    
    // colours
    red: string;
    green: string;
    orange: string;
    white: string;
    yellow: string;

    // emojis
    bin: string;
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

	/*levelRoles: {
		oldOne: number;
		dirt: number;
		dullahan: number;
		erlking: number;
		treant: number;
		barghest: number;
		cockatrice: number;
		davidBowie: number;
		banshee: number;
		eldritchBeing: number;
		behemoth: number;
		hydra: number;
		dragon: number;
		unicorn: number;
		sphinx: number;
		griffin: number;
		phoenix: number;
		warlock: number;
		centaur: number;
		dryad: number;
		nymph: number;
		leshy: number;
		harpy: number;
		faun: number;
		leprechaun: number;
		fairy: number;
		brownie: number;
		gnome: number;
		goblin: number;
		elf: number;
	};*/

	levelRoles: LevelReward[];
}


export default (server: Discord.Guild): IConstants => {
    return {
        // channels
        general: (server.channels.cache.get('435894444584075265') as Discord.TextChannel),
		tw: (server.channels.cache.get('618002057189785601') as Discord.TextChannel),
		resources: (server.channels.cache.get('435923980336234516') as Discord.TextChannel),
		rules: (server.channels.cache.get('481124133606916096') as Discord.TextChannel),
		roles: (server.channels.cache.get('481131558296616961') as Discord.TextChannel),
        verification: (server.channels.cache.get('760809680598990878') as Discord.TextChannel),
        meetTheStaff: (server.channels.cache.get('479744966575390733') as Discord.TextChannel),
        announcements: (server.channels.cache.get('435910303864061962') as Discord.TextChannel),
		staffChannels: {
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
		},
        communityChannels:{
			suggestions: (server.channels.cache.get('474242779623456779') as Discord.TextChannel),
			starboard: (server.channels.cache.get('646971709853007873') as Discord.TextChannel),
			discussion: (server.channels.cache.get('458009085829316609') as Discord.TextChannel),
			helper: (server.channels.cache.get('471799568015818762') as Discord.TextChannel),
		},

        // roles
        staffRoles: {
			staff: server.roles.cache.get('452662935035052032'),
			moderators: server.roles.cache.get('435897654682320925'),
			support: server.roles.cache.get('761713326597865483'),
			engagement: server.roles.cache.get('761713486597718026'),
			hackerbeing: server.roles.cache.get('462606587404615700'),
			admins: server.roles.cache.get('452553630105468957'),
			heads: {
				moderators: server.roles.cache.get('761714520535334922'),
				support: server.roles.cache.get('761714525161652224'),
				engagement: server.roles.cache.get('761714529691631647'),
			},
		},
		communityRoles: {
			helper: server.roles.cache.get('481130628344184832'),
			welcomeTeam: server.roles.cache.get('499302826028302368'),
		},
		bot: server.roles.cache.get('451344230023954442'),
		kaizen: server.roles.cache.get('631002094467547148'),

        // colours
        red: '#ff6961',
        green: '#61c2a2',
        orange: 'ffb861',
        white: '#f7f7f7',
        yellow: '#ffc600',

        // emojis
        bin: '🗑',
		wave: '👋',
		tick: '✅',
		grimacing: '😬',
		square: '▫',
        cross: '❌',
        confetti: '🎊',
		graph: '📈',
		suggestions: {
			upvote: server.emojis.cache.get('760820779344068609'),
			downvote: server.emojis.cache.get('760820793507971093'),
		},
		question: '❓',

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
            MANAGE_EMOJIS: 'Manage Emojis'
		},

		levelRoles: [
			{ level: 2, role: server.roles.cache.get('441943660016173058') }, // elf
			{ level: 4, role: server.roles.cache.get('466738306881814536') }, // goblin
			{ level: 6, role: server.roles.cache.get('441944499149602816') }, // gnome
			{ level: 8, role: server.roles.cache.get('466738333649731587') }, // brownie
			{ level: 10, role: server.roles.cache.get('441944655450603520') }, // fairy
			{ level: 12, role: server.roles.cache.get('441945051296301057') }, // leprechaun
			{ level: 14, role: server.roles.cache.get('441945051296301057') }, // faun
			{ level: 16, role: server.roles.cache.get('441945301721415681') }, // harpy
			{ level: 18, role: server.roles.cache.get('453950866815320085') }, // leshy
			{ level: 20, role: server.roles.cache.get('453950669573849091') }, // nymph
			{ level: 22, role: server.roles.cache.get('441945780119535637') }, // dryad
			{ level: 24, role: server.roles.cache.get('453947107825680396') }, // centaur
			{ level: 26, role: server.roles.cache.get('453950089451405322') }, // warlock
			{ level: 28, role: server.roles.cache.get('466738356831649793') }, // phoenix
			{ level: 30, role: server.roles.cache.get('453947113643048982') }, // griffin
			{ level: 32, role: server.roles.cache.get('453949450902044715') }, // sphinx
			{ level: 34, role: server.roles.cache.get('453947119842099222') }, // unicorn
			{ level: 36, role: server.roles.cache.get('466739004432318466') }, // dragon
			{ level: 38, role: server.roles.cache.get('453950908640788480') }, // hydra
			{ level: 40, role: server.roles.cache.get('635836969527541770') }, // behemoth
			{ level: 42, role: server.roles.cache.get('640501774985461790') }, // eldritch being
			{ level: 46, role: server.roles.cache.get('799084406354346054') }, // banshee
			{ level: 48, role: server.roles.cache.get('799084468144308274') }, // cockatrice
			{ level: 50, role: server.roles.cache.get('799084509667655721') }, // barghest
			{ level: 52, role: server.roles.cache.get('799084438402891786') }, // david bowie
			{ level: 54, role: server.roles.cache.get('799084536151277588') }, // treant
			{ level: 56, role: server.roles.cache.get('799084559366881321') }, // elrking
			{ level: 58, role: server.roles.cache.get('799084584067137580') }, // dullahan
			{ level: 60, role: server.roles.cache.get('799084616350040064') }, // dirt
			{ level: 62, role: server.roles.cache.get('799084638936367155') }, // old one
		]
    }
}