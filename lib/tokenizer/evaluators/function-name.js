const debug = require('debug')('stdlib:token:functionname')

module.exports = {
  type: 'functionName',
  test: ({ nextLine }) => nextLine && nextLine.includes('---'),
  value: ({ currentLine }) => {
    debug(currentLine)
    return {
      value: currentLine
    }
  },
  section: ({ currentLine }) => currentLine,
  belongsTo: 'functions'
}
