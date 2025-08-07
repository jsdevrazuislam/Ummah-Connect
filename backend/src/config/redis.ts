import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export function connectRedis() {
  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", err => console.error("❌ Redis error", err));
}

export default redis;
