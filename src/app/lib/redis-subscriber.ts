import type { RedisOptions } from "ioredis";
import Redis from "ioredis";
import { broadcastEvent } from "./sse";

let subscriber: Redis | null = null;
let redisReader: Redis | null = null;

export function initRedisSubscriber(): Redis {
  if (subscriber) return subscriber;

  const redisOptions: RedisOptions = {
    // host: process.env.REDIS_URL,
    port: 6380,
    username: "default",
    // password: process.env.REDIS_ACCESS_KEY,
    tls: {},
    connectTimeout: 10000,
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 200, 5000);
    },
  };

  subscriber = new Redis(redisOptions);
  redisReader = new Redis(redisOptions);

  // Log when connected
  subscriber.on("connect", () => {
    console.info("Redis connected");
  });

  // Handle errors
  subscriber.on("error", (err) => {
    if (err.message.includes("NOAUTH")) {
      console.error("Redis authentication failed. Check REDIS_PASSWORD.");
      subscriber?.disconnect();
    }
  });

  // Subscribe to channel
  void subscriber
    .subscribe("channel-name")
    .then(async () => {
      if (redisReader) {
        const latest = await redisReader.get("topic-name").catch(() => null);
        if (latest) broadcastEvent(latest);
      }
    })
    .catch((err: Error) => {
      if (err.message.includes("NOAUTH")) {
        subscriber?.disconnect();
      }
    });

  // Handle new published value to channel
  subscriber.on("message", (_channel: string, message: string) => {
    void (async () => {
      try {
        if (!message && redisReader) {
          const latestAuction = await redisReader
            .get("topic-name")
            .catch(() => null);
          if(latestAuction){
            broadcastEvent(message);
          }
        } else {
          broadcastEvent(message);
        }
      } catch {
        console.log("On change - publishing issue");
      }
    })();
  });

  return subscriber;
}
