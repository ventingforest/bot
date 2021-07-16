import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import * as util from 'util';
import { stripIndents } from 'common-tags';

const NL = '!!NL!!';
const NL_PATTERN = new RegExp(NL, 'g');

class Eval extends Command {
	public hrStart: [number, number] | undefined;
	public lastResult: any = null;
	private readonly _sensitivePattern!: any;

	constructor() {
		super('eval', {
			aliases: ['eval'],
			description: 'Allows newt to evaluate code without having to make any changes to the bot!',
			args: [
				{
					id: 'code',
					match: 'rest',
					type: 'sring',
					prompt: {
						start: (msg: Message): string => `${msg.author}, what would you like to evaluate?`
					}
				},
				{
					id: 'noreturn',
					type: 'boolean',
					match: 'flag',
					flag: ['--noreturn', '-nr'],
				}
			],
			ownerOnly: true
		});

		this.usage = 'eval <code>';
		this.examples = [
			'eval',
			'eval console.log(\'Hello\');',
			'eval msg.channel.send("Let\'s goooooo!");'
		];
	}

	public async exec(msg: Message, { code, noreturn }: { code: string, noreturn: boolean }): Promise<Message | Message[] | Promise<Message | Message[]>[]> {
		this.client.utils.deletePrompts(msg);
		let hrDiff;
		try {
			const hrStart = process.hrtime();
			code = code.replace('tvf', 'this.client');
			this.lastResult = eval(code);
			hrDiff = process.hrtime(hrStart);

			this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just evaluated the following code: ${code}`);
		} catch (error) {
			return msg.channel.send(`Error while evaluating: \`${error}\``);
		}

		this.hrStart = process.hrtime();
		const result = this._result(this.lastResult, hrDiff, code);

		if (noreturn) return msg.channel.send(`*Executed in **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.***`);
		if (Array.isArray(result)) return result.map(async (res): Promise<Message | Message[]> => msg.channel.send(res));
		return msg.channel.send(result);
	}

	private _result(result: any, hrDiff: [number, number], input: string | null = null): string | string[] {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(NL_PATTERN, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ? split[split.length - 1] : inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if (input) {
			return Util.splitMessage(stripIndents`
				*Executed in **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.***
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}

		return Util.splitMessage(stripIndents`
			*Callback executed after **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.***
			\`\`\`javascript
			${inspected}
			\`\`\`
		`, { maxLength: 1900, prepend, append });
	}

	private get sensitivePattern(): any {
		if (!this._sensitivePattern) {
			const token = this.client.token!.split('').join('[^]{0,2}');
			const revToken = this.client.token!.split('').reverse().join('[^]{0,2}');
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(`${token}|${revToken}`, 'g') });
		}

		return this._sensitivePattern;
	}
}

module.exports = Eval;
export default Eval;
