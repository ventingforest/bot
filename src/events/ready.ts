import Client from '../structures/TVFClient';

const ready = (tvf: Client) => {
	tvf.bot.user.setActivity('over you cuties <3', {
		type: 'WATCHING',
	});

	return tvf.logger.info('TVF Bot is ready.');
};

export default ready;
