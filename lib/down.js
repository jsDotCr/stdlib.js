const debug = require('debug')('stdlibjs:down')
const got = require('got')
const { join } = require('path')
const { URL } = require('url')
const getAccessToken = require('./access-token')
const { baseEndpoint: { registry }, defaultApiConfiguration } = require('../config')
const { isRelease, getStdLibEnvironment } = require('./environment')
const Joi = require('./joi')
const functionPackageJsonSchema = require('./schemas/function-package-json')
const { getUsername } = require('./user')

/**
 * Tears down a function from the specified environment
 * @param {{serviceName: string, env: string}} Service name and environment to remove
 * @returns {PromiseLike<Object>} Readable stream with the server response
 */
async function down ({ serviceName, env }) {
  let accessToken = ''
  let username = ''
  debug('down', serviceName, env)
  try {
    accessToken = await getAccessToken()
    debug('access token fetched, going with username now')
    username = await getUsername()
    debug('username fetched', username)
  } catch (e) {
    console.error(e)
    process.exit(5)
  }
  const packagePath = join(process.cwd(), username, serviceName)
  const { stdlib: { name, build }, version } = Joi.attempt(require(join(packagePath, 'package.json')), functionPackageJsonSchema)
  const endpoint = isRelease(env) ? `${name}@${version}` : `${name}@${getStdLibEnvironment(env)}`
  debug(serviceName, packagePath, isRelease(env), endpoint, build)

  return got.delete(
    new URL(endpoint, registry),
    Object.assign({}, defaultApiConfiguration, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Stdlib-Build': build || ''
      },
      json: false
    })
  )
    .then(({ body }) => {
      debug(body)
      if (body.includes('Not Found: No such package')) {
        return Promise.reject(new Error(body))
      }
      return Promise.resolve(body)
    })
    .catch((error, body) => {
      debug('fail')
      debug('error', error)
      debug('body', body)
      return Promise.reject(error)
    })
}

module.exports = down
