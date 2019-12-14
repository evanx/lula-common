const Redis = require('ioredis')

const { buildRedis, endRedis } = require('../utils')

const { buildMonitor } = require('.')

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
const monitor = buildMonitor({ redis, config }, { name: 'monitor.test' })

describe('monitor', () => {
  afterAll(() => {
    endRedis(redis)
  })

  it('should assert strings', async () => {
    expect(() =>
      monitor.assert.string('test', {
        _0: 0,
        _false: false,
        _int: 1,
        _null: null,
        _string: 'hello',
        _true: true,
        _undefined: undefined,
      }),
    ).toThrow(
      'monitor.test: assert string: test: _0, _false, _int, _null, _true, _undefined',
    )
  })

  it('should assert truthy', async () => {
    expect(() =>
      monitor.assert.truthy('test', {
        _0: 0,
        _false: false,
        _int: 1,
        _null: null,
        _string: 'hello',
        _true: true,
        _undefined: undefined,
      }),
    ).toThrow(
      'monitor.test: assert truthy: test: _0, _false, _null, _undefined',
    )
  })

  it('should assert type', async () => {
    expect(() =>
      monitor.assert.type(
        'test',
        {
          _int: 1,
          _fn: () => false,
          _string: 'hello',
          _true: true,
        },
        { _int: 'number', _fn: 'string', _string: 'string', _true: 'string' },
      ),
    ).toThrow(
      'monitor.test: assert type: test: _fn:string:function, _true:string:boolean',
    )
  })
})
