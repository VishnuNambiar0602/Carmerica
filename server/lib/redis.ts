import { createClient, type RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL;

let client: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType | null> | null = null;

export async function getRedisClient() {
  if (!redisUrl) return null;
  if (client?.isOpen) return client;
  if (connectPromise) return connectPromise;

  client = createClient({ url: redisUrl });
  client.on('error', () => {
    client = null;
  });

  connectPromise = client.connect().then(() => client).catch(() => {
    client = null;
    return null;
  }).finally(() => {
    connectPromise = null;
  });

  return connectPromise;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  if (!redis) return null;
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(typeof value === 'string' ? value : String(value)) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  const redis = await getRedisClient();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheDel(key: string) {
  const redis = await getRedisClient();
  if (!redis) return;
  await redis.del(key);
}