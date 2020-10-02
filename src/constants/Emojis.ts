import * as Discord from 'discord.js';

export interface IEmojis {
	bin: string;
	wave: string;
	star: string;
	tick: string;
	thumbs: {
		up: string;
		down: string;
	};
	grimacing: string;
	confetti: string;
	square: string;
	bell: string;
	cross: string;
	hug: string;
	think: string;
	hearts: {
		revolving: string;
	};
	flushed: string;
	angel: string;
	graph: string;
	suggestions: {
		upvote: Discord.GuildEmoji;
		downvote: Discord.GuildEmoji;
	};
	question: string;
}

export default (server: Discord.Guild): IEmojis => {
	return {
		bin: '🗑',
		wave: '👋',
		star: '⭐',
		tick: '✅',
		thumbs: {
			up: '👍',
			down: '👎',
		},
		grimacing: '😬',
		confetti: '🎉',
		square: '▫',
		bell: '🔔',
		cross: '❌',
		hug: '🤗',
		think: '🤔',
		hearts: {
			revolving: '💞'
		},
		flushed: '😳',
		angel: '😇',
		graph: '📈',
		suggestions: {
			upvote: server.emojis.cache.get('760820779344068609'),
			downvote: server.emojis.cache.get('760820793507971093'),
		},
		question: '❓',
	};
};
