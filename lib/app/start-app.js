const config = require('config')

const { buildMonitor } = require('../monitor')
const { buildRedis, endRedis } = require('../utils')

const redis = buildRedis(config.redis)
const monitor = buildMonitor({ redis }, { name: 'app' })

module.exports = async ({ start }) => {
  const app = { config, redis, monitor }

  app.end = async ({ err, source }) => {
    try {
      monitor.error(`end ${source}`, { err })
      if (app.hooks && app.hooks.end) {
        await app.hooks.end({ err, source })
      }
    } catch (err) {
      monitor.error(`end ${source}`, { err })
    }
    try {
      await endRedis(redis)
    } catch (err) {
      monitor.logger.error(`endRedis ${source}`, { err })
    }
    try {
      monitor.logger.flush()
    } catch (err) {
      monitor.logger.error(`flush ${source}`, { err })
    }
    process.exit(1)
  }

  process.on('unhandledRejection', err => {
    app.end({ err, source: 'unhandledRejection' })
  })

  process.on('uncaughtException', err => {
    app.end({ err, source: 'uncaughtException' })
  })

  try {
    app.hooks = await start(app)
  } catch (err) {
    await app.end({ err, source: 'start app' })
  }
}
