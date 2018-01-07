const debug = require('debug')('stdlibjs:listservices')
const { accessSync, constants: { R_OK }, readdir } = require('fs')
const { join, resolve } = require('path')
const { promisify } = require('util')
const { getUsername } = require('./user')

/**
 * Retrieves the list of services, eventually filtred by the whitelist parameter
 * @param {String[]} [whitelist]=[] List of allowed functions
 * @returns {PromiseLike<Object[]>} List of functions
 */
async function listServices (whitelist = []) {
  const projectPath = process.cwd()
  let username
  let servicesDir
  let services
  try {
    username = await getUsername()
    servicesDir = resolve(projectPath, username)
  } catch (e) {
    console.error(e)
    process.exit(3)
  }
  debug('service dir', servicesDir)
  try {
    services = await promisify(readdir)(servicesDir)
  } catch (e) {
    console.error(e)
    process.exit(4)
  }
  return services.reduce((serviceListAccumulator, serviceName, i) => {
    const servicePath = join(servicesDir, serviceName)
    const servicePackageJson = join(servicePath, 'package.json')

    if (whitelist.length && !whitelist.includes(serviceName)) {
      debug('skipping', serviceName)
      return serviceListAccumulator
    }

    try {
      accessSync(servicePackageJson, R_OK)
      serviceListAccumulator.push({
        projectPath,
        serviceName,
        servicePath,
        packageJson: require(servicePackageJson)
      })
    } catch (e) {
      console.error('err!', e)
      process.exit(1)
    }

    return serviceListAccumulator
  }, [])
}

module.exports = listServices
