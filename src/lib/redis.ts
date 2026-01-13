import { createClient } from "redis";

const TOPIC_PREFIX = "TEST_NEXTJS";

let client: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    try {
      await client.connect();
      console.log("Redis client connected successfully");
    } catch (err) {
      console.error("Failed to connect Redis client:", err);
      client = null;
      throw err;
    }
  }
  return client;
}

export async function publishMessage(message: string) {
  try {
    const client = await getRedisClient();
    const channel = `${TOPIC_PREFIX}:chat`;
    console.log(`Publishing to ${channel}: ${message}`);
    await client.publish(channel, message);
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
}

export async function subscribeToMessages(
  callback: (message: string) => void
): Promise<() => Promise<void>> {
  try {
    const subscriber = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    subscriber.on("error", (err) => {
      console.error("Redis Subscriber Error:", err);
    });

    await subscriber.connect();
    console.log("Redis subscriber connected");

    const channel = `${TOPIC_PREFIX}:chat`;

    // Start subscription in background
    (async () => {
      try {
        await subscriber.subscribe(channel, (message) => {
          console.log(`Received message on ${channel}: ${message}`);
          callback(message);
        });
      } catch (error) {
        console.error("Subscription error:", error);
      }
    })();

    // Return cleanup function
    return async () => {
      try {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        console.log("Subscriber cleaned up");
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  } catch (error) {
    console.error("Failed to setup subscription:", error);
    throw error;
  }
}

export async function closeRedisClient() {
  if (client) {
    try {
      await client.quit();
      client = null;
      console.log("Redis client closed");
    } catch (error) {
      console.error("Error closing Redis client:", error);
    }
  }
}
