import * as Discord from 'discord.js';

export interface IRoles {
	isolation: Discord.Role;
	fk: Discord.Role;
	mod: Discord.Role;
	admin: Discord.Role;
	techAdmin: Discord.Role;
	bot: Discord.Role;
	helper: Discord.Role;
	test: Discord.Role;
	private: Discord.Role;
	newt2: Discord.Role;
	welcomeTeam: Discord.Role;
	approved: Discord.Role;
	developer: Discord.Role;
}

export default (server: Discord.Guild): IRoles => {
	return {
		isolation: server.roles.cache.get('586251637539209216'),
		fk: server.roles.cache.get('452662935035052032'),
		mod: server.roles.cache.get('435897654682320925'),
		admin: server.roles.cache.get('452553630105468957'),
		techAdmin: server.roles.cache.get('462606587404615700'),
		bot: server.roles.cache.get('451344230023954442'),
		helper: server.roles.cache.get('481130628344184832'),
		test: server.roles.cache.get('607863660894748673'),
		private: server.roles.cache.get('470942878676549652'),
		newt2: server.roles.cache.get('631002094467547148'),
		welcomeTeam: server.roles.cache.get('499302826028302368'),
		approved: server.roles.cache.get('463438193115529226'),
		developer: server.roles.cache.get('718196519664353300'),
	};
};
