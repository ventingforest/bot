import { Command } from '../interfaces';
import * as util from 'util';

/*
.......##.......##....########.##.....##....###....##......
......##.......##.....##.......##.....##...##.##...##......
.....##.......##......##.......##.....##..##...##..##......
....##.......##.......######...##.....##.##.....##.##......
...##.......##........##........##...##..#########.##......
..##.......##.........##.........##.##...##.....##.##......
.##.......##..........########....###....##.....##.########
*/
export const command: Command = {
    run: (client, msg, args) => {
        try {
            // get the code
            const code = args.join(' ');
        
            // allow the usage of the client
            if (code.includes('client')) {
                // @ts-ignore
                code.replace('client', client);
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
            return msg.reply(command.clean(evaled), { code: 'x1' });
        } catch (error) {
            console.error(error);
            return msg.reply(`\`ERROR\` \`\`\`xl\n${command.clean(error)}\n\`\`\``);
        }
    },
    config: {
        name: 'eval',
        description: 'Allows administrators to run snippets of JavaScript.',
        admin: true
    },
    clean: txt => typeof txt === 'string' ? txt.replace(/`/g, '`' + String.fromCharCode(8203)) : txt
}