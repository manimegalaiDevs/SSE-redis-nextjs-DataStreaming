import { initRedisSubscriber } from "./lib/redis-subscriber";
import ClientFetchingDataFromRedis from "./ClientFetchingDataFromRedis";

export default function Home() {
    initRedisSubscriber();
    return (
        <ClientFetchingDataFromRedis />
    );
}
