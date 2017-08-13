const debug = require('debug')('stdlib:token:functioninfos')

module.exports = {
  type: 'function-infos',
  test: ({ currentLine }) => currentLine.includes(': '),
  value: ({ currentLine }) => {
    let [ , type, value ] = currentLine.match(/^(.*?):\s?(.*)$/)
    debug('type', type)
    debug('value', value.trim())
    if (['url', 'code', 'shell', 'context', 'bg'].includes(type)) {
      if (type === 'context') {
        type = 'contextEnabled'
        value = value.includes('enabled')
      } else {
        value = value.trim()
      }
      return {
        type,
        value
      }
    } else {
      return {}
    }
  },
  belongsTo: 'functions'
}
