const { bold, red } = require('chalk')
const down = require('../lib/down')
const listServices = require('../lib/list-services')

exports.command = 'down <env> [services..]'
exports.describe = 'Terminates the function(s) environment'
exports.builder = function (yargs) {
  return yargs
    .describe('env', 'current git branch name/slug')
    .describe('services', 'comma-separated list of services to tear down')
}

exports.handler = async function terminate ({ env, services }) {
  console.log(`Will try to ${bold(red('tear down'))}…`)

  try {
    services = await listServices(services)
  } catch (e) {
    console.error(e)
    process.exit(2)
  }

  services.forEach(({ serviceName, servicePath }) => {
    console.log(`… ${bold(serviceName)}`)
    down({ serviceName, env })
      .then(response => process.stdout)
      .catch(response => process.stderr)
  })
}
