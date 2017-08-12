const { bold } = require('chalk')
const { version: packageVersion } = require('../package.json')

exports.command = 'version'
exports.describe = 'Outputs stdlib.js version'

exports.handler = function version () {
  console.log(bold(packageVersion))
}
