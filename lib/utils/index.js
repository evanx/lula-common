const crypto = require('crypto')
const pino = require('pino')
const Redis = require('ioredis')

const buildId = () =>
  Math.random()
    .toString(36)
    .slice(2) +
  Math.random()
    .toString(36)
    .slice(1)

const buildPromise = fn =>
  new Promise((resolve, reject) =>
    fn((err, res) => (err ? reject(err) : resolve(res))),
  )

const buildLogger = loggerConfig => pino(loggerConfig)

const buildRedis = redisConfig => new Redis(redisConfig)

const buildSha1 = string =>
  crypto
    .createHash('sha1')
    .update(string)
    .digest('hex')

const clock = () => Date.now()

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const encodeParams = object =>
  Object.entries(object)
    .map(([key, value]) => key + '=' + encodeURIComponent(value))
    .join('&')

const endRedis = redisClient => redisClient.quit()

const multiAsync = async (redis, commands, hook) => {
  const results = await redis.multi(commands).exec()
  const err = results.find(([err]) => err)
  if (err) {
    throw new Error(err)
  }
  const res = results.map(([, res]) => res)
  if (hook) {
    hook({ commands, res })
  }
  return res
}

const parseRedisMs = res => {
  return parseInt(res[0] + res[1].padStart(6, '0').slice(0, 3))
}

const reduceRedis = fields => {
  const object = {}
  for (let i = 0; i < fields.length; i += 2) {
    object[fields[i]] = fields[i + 1]
  }
  return object
}

module.exports = {
  buildId,
  buildLogger,
  buildPromise,
  buildRedis,
  buildSha1,
  clock,
  delay,
  encodeParams,
  endRedis,
  multiAsync,
  parseRedisMs,
  reduceRedis,
}
