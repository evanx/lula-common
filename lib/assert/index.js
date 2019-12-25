const stringifyValue = value => {
  if (typeof value === 'function') {
    return 'function'
  } else if (typeof value !== 'object') {
    return '' + value
  } else {
    return 'object'
  }
}

module.exports = ({ logger }, name) => ({
  truthy(type, object) {
    const entries = Object.entries(object)
      .filter(([, value]) => !value)
      .map(([key]) => key)
    if (entries.length) {
      throw new Error(`${name}: assert truthy: ${type}: ${entries.join(', ')}`)
    }
    logger.debug(object, `assert truthy: ${type}`)
  },
  string(type, object) {
    const entries = Object.entries(object)
      .filter(([, value]) => typeof value !== 'string')
      .map(([key]) => key)
    if (entries.length) {
      throw new Error(`${name}: assert string: ${type}: ${entries.join(', ')}`)
    }
    logger.debug(object, `assert string: ${type}`)
  },
  equal(type, object, expected) {
    const entries = Object.entries(expected).map(([key, expectedValue]) => [
      key,
      object[key],
      expectedValue,
    ])
    const invalidEntries = entries.filter(
      ([, actualValue, expectedValue]) => actualValue !== expectedValue,
    )
    if (invalidEntries.length) {
      const string = invalidEntries
        .map(tuple => tuple.map(value => stringifyValue(value)).join(':'))
        .join(', ')
      throw new Error(`${name}: assert equal: ${type}: ${string}`)
    }
    object = entries.reduce((object, entry) => {
      const [key, value] = entry
      object[key] = value
      return object
    }, {})
    logger.debug(object, `assert equal: ${type}`)
  },
  type(type, object, expected) {
    const entries = Object.entries(expected)
      .map(([key, expectedType]) => [key, typeof object[key], expectedType])
      .filter(([, actualType, expectedType]) => actualType !== expectedType)
    if (entries.length) {
      const string = entries
        .map(tuple => tuple.map(value => stringifyValue(value)).join(':'))
        .join(', ')
      throw new Error(`${name}: assert type: ${type}: ${string}`)
    }
    object = entries.reduce((object, entry) => {
      const [key, value] = entry
      object[key] = value
      return object
    }, {})
    logger.debug(object, `assert type: ${type}`)
  },
})
