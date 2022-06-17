import { PrismaClient } from '@prisma/client';
import { SapphireClient } from '@sapphire/framework';
import { Guild, GuildMember } from 'discord.js';
import { newtId, tvfId } from '~config';
import fetchRoles from '~tvf/roles';
import Utils from '~utils';
import fetchChannels from '~tvf/channels';

class Client extends SapphireClient {
    public db = new PrismaClient();
    public production = process.env.NODE_ENV === 'production';
    public utils = new Utils(this);
    public defaultPrefix: string;

    public tvf: Client.TVF = {
        server: null,
        roles: null,
        channels: null,
        newt: null
    };

    constructor() {
        const prefix = process.env.NODE_ENV === 'production' ? 'tvf ' : 'tvf beta ';

        super({
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_PRESENCES',
                'GUILD_BANS',
                'GUILD_MESSAGES',
                'GUILD_VOICE_STATES',
                'DIRECT_MESSAGES',
                'GUILD_MESSAGE_REACTIONS'
            ],
            presence: {
                status: 'idle'
            },
            defaultPrefix: prefix
        });

        this.defaultPrefix = prefix;
    }

    public async login(token: string) {
        const response = await super.login(token);

        // Fetch information about TVF
        this.tvf.server = await this.guilds.fetch(tvfId);
        this.tvf.roles = await fetchRoles(this.tvf.server);
        this.tvf.channels = await fetchChannels(this.tvf.server);
        this.tvf.newt = await this.tvf.server.members.fetch(newtId);

        return response;
    }
}

namespace Client {
    export interface TVF {
        server: Guild;
        roles: Awaited<ReturnType<typeof fetchRoles>>;
        channels: Awaited<ReturnType<typeof fetchChannels>>;
        newt: GuildMember;
    }
}

export default Client;
