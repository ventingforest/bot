import * as Discord from 'discord.js';

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
    friendlyPermissions: Object;
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
        }
    }
}