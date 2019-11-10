import * as util from 'util';

const clean = (txt) =>
	typeof txt === 'string'
		? txt.replace(/`/g, '`' + String.fromCharCode(8203))
		: txt;

const evalCommand: Command = {
	run: (tvf, msg, args) => {
		try {
			// get the code
			const code = args.join(' ');

			// allow the usage of the tvf
			if (code.includes('tvf')) {
				// @ts-ignore
				code.replace('tvf', tvf);
			}

			// allow the usage of the guild
			if (code.includes('guild')) {
				// @ts-ignore
				code.replace('guild', msg.guild);
			}

			// evaluate the code
			let evaled = eval(code);

			// make sure the evaluated code is in a string
			if (typeof evaled === 'string') {
				evaled = util.inspect(evaled);
			}

			// reply with a cleaned version fo the evaluated code
			return msg.reply(`\`SUCCESS\` \`\`\`${clean(evaled)}\n\`\`\``);
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
		}
	},
	config: {
		name: 'eval',
		description: 'Allows administrators to run snippets of JavaScript.',
		module: 'Admin',
		allowGeneral: true,
	},
};

export default evalCommand;
