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

  if ((typeof type) in byType) {
    byType[typeof type](type, value)
  } else {
    throwDefault(type, value)
  }
}

function stringCheck (type, value) {
  var passed = type.split('|').some(function (subType) {
    switch (subType) {
      case 'Array': {
        if (value !== null && value !== undefined && value.constructor === Array) {
          return true
        }

        break
      }

      case 'Boolean': {
        if (typeof value === 'boolean') return true
        break
      }

      case 'Buffer': {
        if (Buffer.isBuffer(value)) return true
        break
      }

      case 'Function': {
        if (typeof value === 'function') return true
        break
      }

      case 'Number': {
        if (typeof value === 'number') return true
        break
      }

      case 'Object': {
        if (typeof value === 'object') return true
        break
      }

      case 'String': {
        if (typeof value === 'string') return true
        break
      }
    }

    if (getName(value) === subType) return true
  })

  if (!passed) throwDefault(type, value)
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
