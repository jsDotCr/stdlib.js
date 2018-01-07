const debug = require('debug')('stdlibjs:lib:http')
const { FunctionParser } = require('faaslang')
const LocalGateway = require('lib.cli/cli/local_gateway')
const { join, relative } = require('path')

function startService (path, port) {
  if (!port) {
    throw new Error('No path or port')
  }
  let servicePath
  let projectPath = process.cwd()
  if (typeof (path) === 'string') {
    servicePath = path
  } else if (typeof (path) === 'object') {
    servicePath = path.servicePath
    projectPath = path.projectPath || projectPath
  }
  if (!projectPath || !servicePath) {
    throw new Error(`Service path is missing. First parameter to "startService" was: ${JSON.stringify(path)}`)
  }

  debug('project path', projectPath)
  const { stdlib: manifest } = require(join(servicePath, 'package.json'))
  const env = require(join(servicePath, 'env.json'))
  const functionsPath = join(relative(projectPath, servicePath), 'functions')

  if (manifest.build !== 'faaslang') {
    throw new Error(`Service at ${servicePath} does not declare itself as a Faaslang-compatible. Please check its package.json file (stdlib.build should be "faaslang")`)
  }

  const gateway = new LocalGateway({
    debug: true
  })
  let functionParser = new FunctionParser()

  try {
    gateway.service(manifest.name)
    gateway.environment(env.local || {})
    debug('functions path', functionsPath)
    gateway.define(functionParser.load(projectPath, functionsPath))
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
function restartService (paths, server) {
  debug(`restarting service ${server.name} at port ${server.port}`)
  stopService(server)
  return startService(paths, server.port)
}

exports.start = startService
exports.restart = restartService
exports.stop = stopService
