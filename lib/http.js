const debug = require('debug')('stdlibjs:lib:http')
const { FunctionParser } = require('faaslang')
const LocalGateway = require('lib.cli/cli/local_gateway')
const { join } = require('path')

function startService (path, port) {
  if (!path || !port) {
    throw new Error('No path')
  }

  const { stdlib: manifest } = require(join(path, 'package.json'))
  const env = require(join(path, 'env.json'))

  if (manifest.build !== 'faaslang') {
    throw new Error('Not Faaslang')
  }

  const gateway = new LocalGateway({
    debug: true
  })
  let functionParser = new FunctionParser()

  try {
    gateway.service(manifest.name)
    gateway.environment(env.local || {})
    gateway.define(functionParser.load(path, 'functions'))
    debug('defined functions', Object.keys(gateway.definitions))
  } catch (e) {
    throw new Error(e)
  }

  gateway.listen(port)
  debug(`listening to ${port}`)
  debug('server name', gateway.name)
  debug('server supported methods', gateway.supportedMethods)
  debug('server log types', gateway.defaultLogType)

  return gateway
}

function stopService (server) {
  debug(`quitting service ${server.name} at port ${server.port}`)
  server.close()
}
function restartService (servicePath, server) {
  debug(`restarting service ${server.name} at port ${server.port}`)
  stopService(server)
  return startService(servicePath, server.port)
}

exports.start = startService
exports.restart = restartService
exports.stop = stopService
