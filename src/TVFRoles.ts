import { Guild } from 'discord.js';

export default (tvf: Guild) => {
	return {
		staff: {
			staff: tvf.roles.cache.get('452662935035052032'),
			moderators: tvf.roles.cache.get('435897654682320925'),
			support: tvf.roles.cache.get('761713326597865483'),
			hackerbeing: tvf.roles.cache.get('462606587404615700'),
			admins: tvf.roles.cache.get('452553630105468957'),
			modHead: tvf.roles.cache.get('761714520535334922'),
			supportHead: tvf.roles.cache.get('761714525161652224'),
		},
		community: {
			helper: tvf.roles.cache.get('481130628344184832'),
			welcomeTeam: tvf.roles.cache.get('499302826028302368')
		},
		other: {
			bot: tvf.roles.cache.get('451344230023954442'),
			kaizen: tvf.roles.cache.get('631002094467547148')
		}
	}
}
