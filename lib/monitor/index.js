const assert = require('assert')
const pino = require('pino')

const buildAssert = require('../assert')

const env = {
  debugNames: !process.env.DEBUG ? [] : process.env.DEBUG.split(','),
  defaultLevel: process.env.LOG_LEVEL || 'info',
  prettyPrint: !process.env.LOG_PRETTY
    ? false
    : { colorize: true, translateTime: true },
}

const incrementLevelType = ({ redis }, { name, started }, level, type) =>
  redis
    .multi()
    .hincrby(`count:${name}:${level}:h`, type, 1)
    .hincrby(`time:${name}:h`, type, Date.now() - started)
    .exec()
    .catch(err => logger.error({ err, name, level, type }, 'monitor hincrby'))

const buildLevelFunctions = state =>
  ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].reduce(
    (result, level) => {
      result[level] = (type, data = {}) => {
        state.logger[level](data, type)
        state.incrementLevelType(level, type)
      }
      return result
    },
    {},
  )

const buildMonitor = ({ redis, config }, { name }, context = {}) => {
  assert.strictEqual(typeof name, 'string', 'name')
  const state = {
    name,
    started: Date.now(),
    level: env.debugNames.includes(name) ? 'debug' : env.defaultLevel,
    redis,
  }
  state.incrementLevelType = (level, type) =>
    incrementLevelType({ redis }, state, level, type)
  state.logger = pino({
    name,
    level: state.level,
    prettyPrint: env.prettyPrint,
  })
  state.incrementLevelType('info', 'start')
  state.logger.info(context, 'start')

  return Object.assign(
    {},
    state,
    {
      assert: buildAssert(state, name),
      child: ({ name }, context = {}) => {
        return buildMonitor({ redis }, { name }, context)
      },
      end: async () => {
        try {
        } catch (err) {
          state.logger.warn({ err }, 'end')
        }
      },
    },
    buildLevelFunctions(state),
  )
}

module.exports = { buildMonitor }
