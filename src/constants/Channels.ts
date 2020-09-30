import * as Discord from 'discord.js';

export interface IChannels {
	general: Discord.TextChannel;
	tw: Discord.TextChannel;
	isolation: Discord.TextChannel;
	fk: Discord.TextChannel;
	helper: Discord.TextChannel;
	modlog: Discord.TextChannel;
	resources: Discord.TextChannel;
	announcements: Discord.TextChannel;
	starboard: Discord.TextChannel;
	private: Discord.TextChannel;
	rules: Discord.TextChannel;
	roles: Discord.TextChannel;
	discussion: Discord.TextChannel;
	verification: Discord.TextChannel;
	faq: Discord.TextChannel;
	staff: Discord.TextChannel;
	suggestions: Discord.TextChannel;
}

export default (server: Discord.Guild): IChannels => {
	return {
		general: (server.channels.cache.get('435894444584075265') as Discord.TextChannel),
		tw: (server.channels.cache.get('618002057189785601') as Discord.TextChannel),
		isolation: (server.channels.cache.get('586251824563224576') as Discord.TextChannel),
		fk: (server.channels.cache.get('453195365211176960') as Discord.TextChannel),
		helper: (server.channels.cache.get('471799568015818762') as Discord.TextChannel),
		modlog: (server.channels.cache.get('499652797638115348') as Discord.TextChannel),
		resources: (server.channels.cache.get('435923980336234516') as Discord.TextChannel),
		announcements: (server.channels.cache.get('435910303864061962') as Discord.TextChannel),
		starboard: (server.channels.cache.get('646971709853007873') as Discord.TextChannel),
		private: (server.channels.cache.get('454330124486049833') as Discord.TextChannel),
		rules: (server.channels.cache.get('481124133606916096') as Discord.TextChannel),
		roles: (server.channels.cache.get('481131558296616961') as Discord.TextChannel),
		discussion: (server.channels.cache.get('458009085829316609') as Discord.TextChannel),
		verification: (server.channels.cache.get('760809680598990878') as Discord.TextChannel),
		faq: (server.channels.cache.get('454062697567223808') as Discord.TextChannel),
		staff: (server.channels.cache.get('479744966575390733') as Discord.TextChannel),
		suggestions: (server.channels.cache.get('474242779623456779') as Discord.TextChannel),
	}
};
