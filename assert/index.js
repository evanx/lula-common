const stringifyValue = value => {
  if (typeof value === 'function') {
    debugger
    return 'function'
  } else if (typeof value !== 'object') {
    return '' + value
  } else {
    return 'object'
  }
}

module.exports = ({ logger }, name) => ({
  truthy(type, object) {
    const fields = Object.entries(object)
      .filter(([, value]) => !value)
      .map(([key]) => key)
    if (fields.length) {
      throw new Error(`${name}: assert truthy: ${type}: ${fields.join(', ')}`)
    }
    logger.debug(object, `assert truthy: ${type}`)
  },
  string(type, object) {
    const fields = Object.entries(object)
      .filter(([, value]) => typeof value !== 'string')
      .map(([key]) => key)
    if (fields.length) {
      throw new Error(`${name}: assert string: ${type}: ${fields.join(', ')}`)
    }
    logger.debug(object, `assert string: ${type}`)
  },
  equal(type, object, expected) {
    const fields = Object.entries(expected)
      .map(([key, value]) => [key, value, object[key]])
      .filter(([, value, actualValue]) => actualValue !== value)
    if (fields.length) {
      const string = fields
        .map(tuple => tuple.map(value => stringifyValue(value)).join(':'))
        .join(', ')
      throw new Error(`${name}: assert equal: ${type}: ${string}`)
    }
    logger.debug(object, `assert equal: ${type}`)
  },
  type(type, object, expected) {
    const fields = Object.entries(expected)
      .map(([key, expectedType]) => [key, expectedType, typeof object[key]])
      .filter(([, expectedType, actualType]) => actualType !== expectedType)
    if (fields.length) {
      const string = fields
        .map(tuple => tuple.map(value => stringifyValue(value)).join(':'))
        .join(', ')
      throw new Error(`${name}: assert type: ${type}: ${string}`)
    }
    logger.debug(object, `assert type: ${type}`)
  },
})
