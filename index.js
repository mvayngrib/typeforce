function getName (value) {
  if (value === undefined) return ''
  if (value === null) return ''
//  if (value.constructor.name !== undefined) return fn.name

  // why not constructor.name: https://kangax.github.io/compat-table/es6/#function_name_property
  var match = value.constructor.toString().match(/function (.*?)\(/)
  return match ? match[1] : null
}

var byType = {
  string: stringCheck,
  object: objCheck
}

var enforce = module.exports = function (type, value) {
  if (typeof type === 'string') {
    if (type[0] === '?') {
      if (value === null || value === undefined) {
        return
      }

      type = type.slice(1)
      if (!type.length) {
        return throwDefault('?', value)
      }
    }
  }

  var typeOfType = typeof type
  if (typeOfType in byType) {
    byType[typeOfType](type, value)
  } else {
    throwDefault(type, value)
  }
}

function stringCheck (type, value) {
  type.split('|').forEach(function (subType) {
    switch (subType) {
      case 'Array': {
        if (value !== null && value !== undefined && value.constructor === Array) return
        break
      }

      case 'Boolean': {
        if (typeof value === 'boolean') return
        break
      }

      case 'Buffer': {
        if (Buffer.isBuffer(value)) return
        break
      }

      case 'Function': {
        if (typeof value === 'function') return
        break
      }

      case 'Number': {
        if (typeof value === 'number') return
        break
      }

      case 'Object': {
        if (typeof value === 'object') return
        break
      }

      case 'String': {
        if (typeof value === 'string') return
        break
      }
    }

    if (getName(value) !== subType) throwDefault(type, value)
  })
}

function objCheck (type, value) {
  if (Array.isArray(type)) {
    var subType = type[0]

    enforce('Array', value)
    value.forEach(enforce.bind(undefined, subType))

    return
  }

  enforce('Object', value)
  for (var propertyName in type) {
    var propertyType = type[propertyName]
    var propertyValue = value[propertyName]

    try {
      enforce(propertyType, propertyValue)
    } catch (e) {
      throw new TypeError('Expected property "' + propertyName + '" of type ' + JSON.stringify(propertyType) + ', got ' + getName(propertyValue) + ' ' + propertyValue)
    }
  }
}

function throwDefault (type, value) {
  throw new TypeError('Expected ' + type + ', got ' + getName(value) + ' ' + value)
}
