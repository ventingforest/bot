import { Command } from '../interfaces';

/*
.......##.......##....########..####.##....##..######..
......##.......##.....##.....##..##..###...##.##....##.
.....##.......##......##.....##..##..####..##.##.......
....##.......##.......########...##..##.##.##.##...####
...##.......##........##.........##..##..####.##....##.
..##.......##.........##.........##..##...###.##....##.
.##.......##..........##........####.##....##..######..
*/
export const command: Command = {
    run: (client, msg) => {
        const heartbeat = Math.round(client.pings.reduce((a, b) => a + b) / client.pings.length);
        console.log(`${heartbeat}ms ping.`);

        return msg.reply(`pong - ${heartbeat}ms heartbeat :o`);
    },
    config: {
        name: 'ping',
        description: 'Check if I\'m still alive <3'
    }
}