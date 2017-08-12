require('dotenv').config()
const debug = require('debug')('stdlibjs:env')
const argv = require('yargs').argv
const { devBranch, releaseBranch, stdLibDevEnv, stdLibReleaseEnv } = require('../config')

/**
 * Is this a development environment?
 * @param {String} [env=argv.env] Environment slug
 * @returns true if env maps to the StdLib development environment, false otherwise
 */
function isDev (env = argv.env) {
  return env === devBranch
}

/**
 * Is this a production release?
 * @param {String} [env=argv.env] Environment slug
 * @returns true if env maps to the StdLib release environment, false otherwise
 */
function isRelease (env = argv.env) {
  return env === releaseBranch
}

/**
 * Is this anything else but a development env/release?
 * @returns true if env doesn't map to the StdLib release nor development environment, false otherwise
 */
function isFeature (env = argv.env) {
  return !isRelease(env) && !isDev(env)
}

/**
 * Maps the environment slug to the related StdLib environment
 * @param {String} [env=argv.env] Environment slug
 */
function getStdLibEnvironment (env = argv.env) {
  debug('getenv', argv)
  if (!env) {
    throw new Error('there is no environment defined!')
  }
  if (isRelease(env)) {
    debug('release')
    return stdLibReleaseEnv
  } else if (isDev(env)) {
    debug('dev')
    return stdLibDevEnv
  } else {
    debug('other env')
    return env
  }
}

exports.getStdLibEnvironment = getStdLibEnvironment
exports.isDev = isDev
exports.isFeature = isFeature
exports.isRelease = isRelease
