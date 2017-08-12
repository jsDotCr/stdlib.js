require('dotenv').config()

/**
 * Git branch (or slug) that triggers the stdLib release of the "dev" (see LIB_DEV_ENV variable) environment
 * @type {String}
 */
const devBranch = 'develop'

/**
 * Git branch (or slug) that triggers the stdLib release of the versioned production environment
 * @type {String}
 */
const releaseBranch = 'master'

/**
 * StdLib environment name for the development branch
 * @type {String}
 */
const stdLibDevEnv = 'dev'

/**
 * StdLib flag for the release environment. There's no real need to change this, it should be just fine
 * @type {String}
 */
const stdLibReleaseEnv = '--release'

/**
 * List of default glob paths to ignore in a function
 * @type {String[]}
 */
const defaultIgnores = [
  'node_modules/**',
  '.stdLib',
  '.git/**',
  '.DS_Store'
]

const baseEndpoint = {
  /**
   * API endpoint (user-related data)
   */
  api: process.env['STDLIB_ENDPOINT_API'] || 'https://api.polybit.com',
  /**
   * Registry API endpoint (package-related data)
   */
  registry: process.env['STDLIB_ENDPOINT_REGISTRY'] || 'https://registry.stdLib.com'
}

/**
 * Default configuration options for API calls
 * @type {{ timeout: Number, headers: Object }}
 */
const defaultApiConfiguration = {
  json: true,
  timeout: 30000
}

const token = process.env['STDLIB_ACCESS_TOKEN']
const email = process.env['STDLIB_EMAIL']
const password = process.env['STDLIB_PASSWORD']

function spawnOptions (modulePath = '.') {
  return {
    env: process.env,
    cwd: modulePath,
    stdio: 'inherit'
  }
}

exports.baseEndpoint = baseEndpoint
exports.defaultApiConfiguration = defaultApiConfiguration
exports.defaultIgnores = defaultIgnores
exports.devBranch = devBranch
exports.email = email
exports.password = password
exports.releaseBranch = releaseBranch
exports.spawnOptions = spawnOptions
exports.stdLibDevEnv = stdLibDevEnv
exports.stdLibReleaseEnv = stdLibReleaseEnv
exports.token = token
