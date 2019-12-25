const Redis = require('ioredis')

const { buildRedis, buildSha1, endRedis } = require('../utils')

const { buildMonitor } = require('../monitor')

const config = {
  redis: {
    host: 'localhost',
    port: 6379,
  },
  logger: {
    level: 'debug',
    prettyPrint: true,
  },
}

const redis = buildRedis(config.redis)
const monitor = buildMonitor({ redis, config }, { name: 'utils.test' })

describe('utils', () => {
  afterAll(() => {
    endRedis(redis)
  })

  it('should sha1', async () => {
    expect(buildSha1('hello')).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })
})
