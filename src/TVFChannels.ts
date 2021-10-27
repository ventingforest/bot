import { TextChannel, CategoryChannel } from 'discord.js';
import TVFClient from './struct/TVFClient';

export default (tvf: TVFClient) => {
    const { server } = tvf;

    const ventingChannels: TextChannel[] = [];

    [
        '454100371229507595',
        '454100028097822740',
        '454099702724427776',
        '454099602174377992',
        '454099184245669888',
        '896459993321189397',
        '435911798747824128'
    ].forEach((id) => () => {
        const category = server.channels.cache.get(id) as CategoryChannel;
        tvf.logger.info(`${category.name} (${id})`);
        category.children.forEach((child) => {
            tvf.logger.info(child.name);
            ventingChannels.push(child as TextChannel);
            tvf.logger.info(`Channels: ${ventingChannels.length}`);
        });
    });

    return {
        general: server.channels.cache.get('435894444584075265') as TextChannel,
        tw: server.channels.cache.get('618002057189785601') as TextChannel,
        resources: server.channels.cache.get(
            '435923980336234516'
        ) as TextChannel,
        rules: server.channels.cache.get('481124133606916096') as TextChannel,
        roles: server.channels.cache.get('481131558296616961') as TextChannel,
        meetTheStaff: server.channels.cache.get(
            '479744966575390733'
        ) as TextChannel,
        announcements: server.channels.cache.get(
            '435910303864061962'
        ) as TextChannel,
        botCommands: server.channels.cache.get(
            '464655374050656256'
        ) as TextChannel,
        staff: {
            private: {
                category: server.channels.cache.get(
                    '768113425867472936'
                ) as CategoryChannel,
                logs: server.channels.cache.get(
                    '768113624861507624'
                ) as TextChannel
            },
            support: server.channels.cache.get(
                '761718388090863616'
            ) as TextChannel,
            moderators: {
                chat: server.channels.cache.get(
                    '452905389596475404'
                ) as TextChannel,
                logs: server.channels.cache.get(
                    '452822928355098635'
                ) as TextChannel,
                modlogs: server.channels.cache.get(
                    '499652797638115348'
                ) as TextChannel
            },
            hooters: server.channels.cache.get(
                '454382546181160961'
            ) as TextChannel
        },
        community: {
            suggestions: server.channels.cache.get(
                '474242779623456779'
            ) as TextChannel,
            starboard: server.channels.cache.get(
                '646971709853007873'
            ) as TextChannel,
            discussion: server.channels.cache.get(
                '458009085829316609'
            ) as TextChannel,
            helper: server.channels.cache.get(
                '471799568015818762'
            ) as TextChannel
        },
        venting: ventingChannels
    };
};
