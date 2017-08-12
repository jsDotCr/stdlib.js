const debug = require('debug')('stdlibjs:up')
const got = require('got')
const { join } = require('path')
const { Writable } = require('stream')
const { URL } = require('url')
const getAccessToken = require('./access-token')
const { baseEndpoint: { registry }, defaultApiConfiguration } = require('../config')
const { isRelease, getStdLibEnvironment } = require('./environment')
const Joi = require('./joi')
const getPackageStream = require('./pack')
const functionPackageJsonSchema = require('./schemas/function-package-json')
const UpResponseParser = require('./up-response-parser')
const { getUsername } = require('./user')

/**
 * Uploads a function to the specified environment
 * @param {{serviceName: string, env: string}} Service name and environment to upload
 * @returns {PromiseLike<Object>} Server response
 */
async function up ({ serviceName, env }) {
  let accessToken = ''
  let username = ''
  debug('up', serviceName, env)
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
  debug('endpoint', endpoint)
  let packageStream
  try {
    packageStream = await getPackageStream(packagePath)
  } catch (e) {
    console.error(e)
    process.exit(6)
  }
  debug(serviceName, packagePath, isRelease(env), endpoint, build)

  return new Promise((resolve, reject) => {
    packageStream
      .pipe(got.stream.post(
        new URL(endpoint, registry),
        Object.assign({}, defaultApiConfiguration, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Stdlib-Build': build || ''
          },
          json: false
        })
      ))
      .on('error', (error, body) => {
        debug('fail')
        debug('error', error)
        debug('body', body)
        reject(error)
      })
      .pipe(new UpResponseParser({ serviceName, env, username, resolve, reject }))
  })
}

module.exports = up
