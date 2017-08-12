const debug = require('debug')('stdlibjs:accesstoken')
var { post } = require('got')
const { URL } = require('url')
const { inspect, promisify } = require('util')
const { accessTokenInputSchema, accessTokenResponseSchema } = require('./schemas/access-token')
var { baseEndpoint: { api }, defaultApiConfiguration } = require('../config')
const Joi = require('./joi')
let accessToken = ''

async function getAccessToken () {
  debug('get access token')
  if (!accessToken) {
    debug('will fetch new access token')
    accessToken = await login()
  }
  debug('done, return')
  return accessToken
}

function login (options = {}) {
  const { username, password } = Joi.attempt(options, accessTokenInputSchema)
  debug('login as', username, password)
  return post(
    new URL('/v1/access_tokens', api),
    Object.assign({}, defaultApiConfiguration, {
      baseURL: api,
      body: {
        grant_type: 'password',
        username,
        password
      }
    })
  )
    .then(response => {
      const { body: { data: [ { access_token: apiAccessToken } ] } } = Joi.attempt(response, accessTokenResponseSchema)
      debug('ok', apiAccessToken)
      accessToken = apiAccessToken
      return apiAccessToken
    })
    .catch(({ code, details, isJoi, response, statusCode, url }) => {
      debug('ko', code, statusCode, response, url)
      let error
      if (isJoi) {
        error = new Error(`Validation error: ${inspect(details)}`)
      } else if (response) {
        error = new Error(`Login failed.\nServer replied with a ${statusCode} status and body: ${JSON.stringify(response.body)}`)
      } else {
        error = new Error(`Login errored. Code: ${code}, status: ${statusCode}. URL: ${url}`)
      }
      return Promise.reject(error)
    })
}

module.exports = getAccessToken
