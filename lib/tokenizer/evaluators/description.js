const debug = require('debug')('stdlib:token:description')

module.exports = {
  type: 'description',
  test: ({ currentLine }) => /^\s{2}[^@]/g.test(currentLine),
  value: ({ currentLine }) => {
    debug(currentLine)
    return {
      value: currentLine.trim()
    }
  },
  belongsTo: 'functions'
}
