import * as Discord from 'discord.js';

export default (tvf: Discord.Guild) => {
	return {
		channels: {
			general: tvf.channels.cache.get('435894444584075265') as Discord.TextChannel,
			tw: tvf.channels.cache.get('618002057189785601') as Discord.TextChannel,
			resources: tvf.channels.cache.get('435923980336234516') as Discord.TextChannel,
			rules: tvf.channels.cache.get('481124133606916096') as Discord.TextChannel,
			roles: tvf.channels.cache.get('481131558296616961') as Discord.TextChannel,
			verification: tvf.channels.cache.get('760809680598990878') as Discord.TextChannel,
			meetTheStaff: tvf.channels.cache.get('479744966575390733') as Discord.TextChannel,
			announcements: tvf.channels.cache.get('435910303864061962') as Discord.TextChannel,
			botCommands: tvf.channels.cache.get('464655374050656256') as Discord.TextChannel,
			staff: {
				private: {
					category: tvf.channels.cache.get('768113425867472936') as Discord.CategoryChannel,
					logs: tvf.channels.cache.get('768113624861507624') as Discord.TextChannel
				},
				isolation: {
					category: tvf.channels.cache.get('769232209886183455') as Discord.CategoryChannel,
					logs: tvf.channels.cache.get('769232273185833020') as Discord.TextChannel
				},
				support: tvf.channels.cache.get('761718388090863616') as Discord.TextChannel,
				moderators: {
					chat: tvf.channels.cache.get('452905389596475404') as Discord.TextChannel,
					logs: tvf.channels.cache.get('452822928355098635') as Discord.TextChannel,
					modlogs: tvf.channels.cache.get('499652797638115348') as Discord.TextChannel
				},
				hooters: tvf.channels.cache.get('454382546181160961') as Discord.TextChannel
			},
			community: {
				suggestions: tvf.channels.cache.get('474242779623456779') as Discord.TextChannel,
				starboard: tvf.channels.cache.get('646971709853007873') as Discord.TextChannel,
				discussion: tvf.channels.cache.get('458009085829316609') as Discord.TextChannel,
				helper: tvf.channels.cache.get('471799568015818762') as Discord.TextChannel
			}
		},

		roles: {
			staff: {
				staff: tvf.roles.cache.get('452662935035052032'),
				moderators: tvf.roles.cache.get('435897654682320925'),
				support: tvf.roles.cache.get('761713326597865483'),
				engagement: tvf.roles.cache.get('761713486597718026'),
				hackerbeing: tvf.roles.cache.get('462606587404615700'),
				admins: tvf.roles.cache.get('452553630105468957'),
				modHead: tvf.roles.cache.get('761714520535334922'),
				supportHead: tvf.roles.cache.get('761714525161652224'),
				engagementHead: tvf.roles.cache.get('761714529691631647')
			},
			community: {
				helper: tvf.roles.cache.get('481130628344184832'),
				welcomeTeam: tvf.roles.cache.get('499302826028302368')
			},
			other: {
				bot: tvf.roles.cache.get('451344230023954442'),
				kaizen: tvf.roles.cache.get('631002094467547148')
			},
		},

		colours: {
			red: '#ff6961',
			green: '#3aa4ae',
			orange: 'ffb861',
			yellow: '#ffc600',
			white: '#ffffff'
		},

		emojis: {
			wave: '👋',
			tick: '✅',
			grimacing: '😬',
			square: '▫',
			cross: '❌',
			confetti: '🎊',
			graph: '📈',
			suggestions: {
				upvote: tvf.emojis.cache.get('760820779344068609') ,
				downvote: tvf.emojis.cache.get('760820793507971093'),
			},
			question: '❓'
		},

		levelRoles: [
			{ level: 2, role: tvf.roles.cache.get('441943660016173058'), name: 'Elf' },
			{ level: 4, role: tvf.roles.cache.get('466738306881814536'), name: 'Goblin' },
			{ level: 6, role: tvf.roles.cache.get('441944499149602816'), name: 'Gnome' },
			{ level: 8, role: tvf.roles.cache.get('466738333649731587'), name: 'Brownie' },
			{ level: 10, role: tvf.roles.cache.get('441944655450603520'), name: 'Fairy' },
			{ level: 12, role: tvf.roles.cache.get('441945051296301057'), name: 'Leprechaun' },
			{ level: 14, role: tvf.roles.cache.get('441945301721415681'), name: 'Faun' },
			{ level: 16, role: tvf.roles.cache.get('466739322054246401'), name: 'Harpy' },
			{ level: 18, role: tvf.roles.cache.get('453950866815320085'), name: 'Leshy' },
			{ level: 20, role: tvf.roles.cache.get('453950669573849091'), name: 'Nymph' },
			{ level: 22, role: tvf.roles.cache.get('441945780119535637'), name: 'Dryad' },
			{ level: 24, role: tvf.roles.cache.get('453947107825680396'), name: 'Centaur' },
			{ level: 26, role: tvf.roles.cache.get('453950089451405322'), name: 'Warlock' },
			{ level: 28, role: tvf.roles.cache.get('466738356831649793'), name: 'Phoenix' },
			{ level: 30, role: tvf.roles.cache.get('453947113643048982'), name: 'Griffin' },
			{ level: 32, role: tvf.roles.cache.get('453949450902044715'), name: 'Sphinx' },
			{ level: 34, role: tvf.roles.cache.get('453947119842099222'), name: 'Unicorn' },
			{ level: 36, role: tvf.roles.cache.get('466739004432318466'), name: 'Dragon' },
			{ level: 38, role: tvf.roles.cache.get('453950908640788480'), name: 'Hydra' },
			{ level: 40, role: tvf.roles.cache.get('635836969527541770'), name: 'Behemoth' },
			{ level: 42, role: tvf.roles.cache.get('640501774985461790'), name: 'Eldritch Being' },
			{ level: 44, role: tvf.roles.cache.get('799084406354346054'), name: 'Banshee' },
			{ level: 46, role: tvf.roles.cache.get('799084468144308274'), name: 'Cockatrice' },
			{ level: 48, role: tvf.roles.cache.get('799084509667655721'), name: 'Barghest' },
			{ level: 50, role: tvf.roles.cache.get('801521919454609438'), name: 'Draugr' },
			{ level: 52, role: tvf.roles.cache.get('799084536151277588'), name: 'Treant' },
			{ level: 54, role: tvf.roles.cache.get('799084584067137580'), name: 'Dullahan' },
			{ level: 56, role: tvf.roles.cache.get('801518871927455794'), name: 'Yokai' },
			{ level: 58, role: tvf.roles.cache.get('801518874113474631'), name: 'Kelpie' },
			{ level: 60, role: tvf.roles.cache.get('801518876395044904'), name: 'Jötnar' },
			{ level: 62, role: tvf.roles.cache.get('801518878211571713'), name: 'Rusalka' },
			{ level: 64, role: tvf.roles.cache.get('801518880656064592'), name: 'Kitsune' },
			{ level: 66, role: tvf.roles.cache.get('801518881314177116'), name: 'Fomorian' },
			{ level: 68, role: tvf.roles.cache.get('801518884863606845'), name: 'Jörmungandr' },
			{ level: 70, role: tvf.roles.cache.get('799084559366881321'), name: 'Erlking' },
			{ level: 72, role: tvf.roles.cache.get('801518887053033502'), name: 'River Deity' },
			{ level: 74, role: tvf.roles.cache.get('801518889102999602'), name: 'Spriggan' },
			{ level: 76, role: tvf.roles.cache.get('801518890978246706'), name: 'Hippogriff' },
			{ level: 78, role: tvf.roles.cache.get('801518911165825125'), name: 'Pixie' },
			{ level: 80, role: tvf.roles.cache.get('801518914190180392'), name: 'Pegasus' },
			{ level: 82, role: tvf.roles.cache.get('801518919055573063'), name: 'Chimera' },
			{ level: 84, role: tvf.roles.cache.get('801520771876913242'), name: 'Basilisk' },
			{ level: 86, role: tvf.roles.cache.get('801520780876841001'), name: 'Forest Spirit' },
			{ level: 88, role: tvf.roles.cache.get('801520784555769888'), name: 'Moth Man' },
			{ level: 90, role: tvf.roles.cache.get('799084616350040064'), name: 'Dirt' },
			{ level: 92, role: tvf.roles.cache.get('799084438402891786'), name: 'David Bowie' },
			{ level: 94, role: tvf.roles.cache.get('801520795347320853'), name: 'Rel' },
			{ level: 96, role: tvf.roles.cache.get('801520798430265374'), name: 'Dwayne "The Rock" Johnson' },
			{ level: 98, role: tvf.roles.cache.get('799084638936367155'), name: 'Gandalf' },
			{ level: 100, role: tvf.roles.cache.get('801520799189958676'), name: 'how?' }
		],

		moment: 'ddd, MMM Do, YYYY h:mm A',
		privateTimeout: 21600000,
		blankField:  { name: '\u200B', value: '\u200B' }
	}
}
