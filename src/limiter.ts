import Bottleneck from "bottleneck";

// global rate limit: 50 req/sec
export const globalLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000 / 50,
});

// per channel rate limit: 5 req/sec
export const channelLimiters = new Bottleneck.Group({
  maxConcurrent: 1,
  minTime: 1000 / 5,
});
