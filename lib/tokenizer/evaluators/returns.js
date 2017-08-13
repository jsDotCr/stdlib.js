const debug = require('debug')('stdlib:token:returns')

module.exports = {
  type: 'returns',
  test: ({ currentLine }) => /^\s{2}@returns/g.test(currentLine),
  value: ({ currentLine }) => {
    debug(currentLine)
    let [ , type ] = currentLine.match(/@returns? {(.*)}/)
    return {
      value: {
        type
      }
    }
  },
  belongsTo: 'functions'
}
