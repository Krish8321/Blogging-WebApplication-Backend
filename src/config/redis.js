import { createClient} from "redis";
import { env } from "./env.js"

const redisClient = createClient({
    url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("Redis Error: ", err);
});

export default redisClient;