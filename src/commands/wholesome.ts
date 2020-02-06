const wholesome: Command = {
	run: async (tvf, msg) => msg.channel.send(await tvf.getRedditPost('wholesome', msg)),
	config: {
		name: 'wholesome',
		description: 'Gets a random image from r/wholesome!',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default wholesome;