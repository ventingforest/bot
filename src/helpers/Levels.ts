import User from '../models/user';

export default class Levels {
    // calculates the amount of xp required for a level
    xpFor(x: number): number {
        return Math.floor(5/6 * x * (2 * x ** 2 + 27 * x + 91));
    }

    // gets the user's rank on the level leaderboard
    async rankInServer(id: string) {
        const docs = await User.find({}).sort([['xp', -1]]).exec();
        return docs.findIndex(d => d.id === id) + 1;
    }
}