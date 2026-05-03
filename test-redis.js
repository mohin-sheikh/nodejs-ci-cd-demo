const Redis = require('ioredis');

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    password: 'redis123'
});

async function testRedis() {
    try {
        await redis.set('test-key', 'Hello Redis!');
        const value = await redis.get('test-key');
        console.log('Redis test successful:', value);

        const ping = await redis.ping();
        console.log('Redis ping:', ping);

        process.exit(0);
    } catch (error) {
        console.error('Redis test failed:', error);
        process.exit(1);
    }
}

testRedis();