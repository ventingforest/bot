import Bottleneck from "bottleneck";

function createLimiter(quantity: number): Bottleneck {
    return new Bottleneck({
        maxConcurrent: 1,
        minTime: 1000 / quantity,
    })
}

// global rate limit: 50 req/sec
export const globalLimiter = createLimiter(50);

// per channel rate limit: 5 req/sec
export const channelLimiter = createLimiter(5);