import * as Discord from 'discord.js';

export interface IRoles {
	isolation: Discord.Role;
	staff: {
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
	community: {
		helper: Discord.Role;
		welcomeTeam: Discord.Role;
	};
	bot: Discord.Role;
	private: Discord.Role;
	newt2: Discord.Role;
}

export default (server: Discord.Guild): IRoles => {
	return {
		isolation: server.roles.cache.get('586251637539209216'),
		staff: {
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
		community: {
			helper: server.roles.cache.get('481130628344184832'),
			welcomeTeam: server.roles.cache.get('499302826028302368'),
		},
		bot: server.roles.cache.get('451344230023954442'),
		private: server.roles.cache.get('470942878676549652'),
		newt2: server.roles.cache.get('631002094467547148'),
	};
};
