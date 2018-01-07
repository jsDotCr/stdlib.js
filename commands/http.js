const { bold } = require('chalk')
const debug = require('debug')('stdlibjs:http')
const chokidar = require('chokidar')
const { start, restart, stop } = require('../lib/http')
const listServices = require('../lib/list-services')

exports.command = 'http [services..]'
exports.describe = 'Sets up a local server for all (or the specified) services'
exports.builder = function (yargs) {
  return yargs
    .describe('services', 'comma-separated list of services to create a server for')
}

exports.handler = async function http ({ services }) {
  console.log(`Will ${bold('serve')}…`)
  let startingPort = process.env.STDLIBJS_HTTP_PORT || process.env.STDLIB_LOCAL_PORT || 8170

  const servicesList = await listServices(services)
  servicesList.forEach(({ serviceName, servicePath, projectPath }) => {
    console.log(`… ${bold(serviceName)} on port ${startingPort}`)
    let server
    chokidar.watch(servicePath, {
      cwd: servicePath,
      ignored: /(^|[/\\])\../,
      ignoreInitial: true
    })
      .on('ready', () => {
        debug('ready', arguments)
        server = start({ servicePath, projectPath }, startingPort)
      })
      .on('change', (changedPath) => {
        debug(`${changedPath} changed, restarting`)
        server = restart({ servicePath, projectPath }, server)
      })
      .on('error', () => stop(server))
  })
}
