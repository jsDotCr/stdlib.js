const debug = require('debug')('stdlib:token:params')

const type = 'params'

module.exports = {
  type,
  test: ({ currentLine }) => /^\s{2}@param/g.test(currentLine),
  value: ({ currentLine, section }) => {
    debug(currentLine)
    let [ , type, name, description ] = currentLine.match(/@param {(.*)} (.*?) (.*)/)
    const paramsValue = section[type] || []
    paramsValue.push({
      type,
      name,
      description
    })
    return {
      value: paramsValue
    }
  },
  belongsTo: 'functions'
}
