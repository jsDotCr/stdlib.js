const { bold, cyan } = require('chalk')
const debug = require('debug')('stdlibjs:cmd:up')
const listServices = require('../lib/list-services')
const up = require('../lib/up')

exports.command = 'up <env> [services..]'
exports.describe = 'Release/updates the service(s)'
exports.builder = function (yargs) {
  return yargs
    .describe('env', 'current git branch name/slug')
    .describe('services', 'comma-separated list of services to upload')
}

exports.handler = async function ({ env, services = [] }) {
  console.log(`Will ${cyan('deploy')}…`)
  debug(env, services)

  try {
    services = await listServices(services)
  } catch (e) {
    console.error(e)
    process.exit(2)
  }

  services.forEach(({ serviceName, servicePath }) => {
    console.log(`… ${bold(serviceName)}`)
    up({ serviceName, env })
      .then(response => process.stdout)
      .catch(response => process.stderr)
  })
}
