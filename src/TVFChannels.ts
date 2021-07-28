import { Guild, TextChannel, CategoryChannel } from 'discord.js';

export default (tvf: Guild) => {
	return {
		general: tvf.channels.cache.get('435894444584075265') as TextChannel,
		tw: tvf.channels.cache.get('618002057189785601') as TextChannel,
		resources: tvf.channels.cache.get('435923980336234516') as TextChannel,
		rules: tvf.channels.cache.get('481124133606916096') as TextChannel,
		roles: tvf.channels.cache.get('481131558296616961') as TextChannel,
		meetTheStaff: tvf.channels.cache.get('479744966575390733') as TextChannel,
		announcements: tvf.channels.cache.get('435910303864061962') as TextChannel,
		botCommands: tvf.channels.cache.get('464655374050656256') as TextChannel,
		staff: {
			private: {
				category: tvf.channels.cache.get('768113425867472936') as CategoryChannel,
				logs: tvf.channels.cache.get('768113624861507624') as TextChannel
			},
			isolation: {
				category: tvf.channels.cache.get('769232209886183455') as CategoryChannel,
				logs: tvf.channels.cache.get('769232273185833020') as TextChannel
			},
			support: tvf.channels.cache.get('761718388090863616') as TextChannel,
			moderators: {
				chat: tvf.channels.cache.get('452905389596475404') as TextChannel,
				logs: tvf.channels.cache.get('452822928355098635') as TextChannel,
				modlogs: tvf.channels.cache.get('499652797638115348') as TextChannel
			},
			hooters: tvf.channels.cache.get('454382546181160961') as TextChannel
		},
		community: {
			suggestions: tvf.channels.cache.get('474242779623456779') as TextChannel,
			starboard: tvf.channels.cache.get('646971709853007873') as TextChannel,
			discussion: tvf.channels.cache.get('458009085829316609') as TextChannel,
			helper: tvf.channels.cache.get('471799568015818762') as TextChannel
		}
	}
}
