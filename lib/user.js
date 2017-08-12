const got = require('got')
const debug = require('debug')('stdlibjs:user')
const { URL } = require('url')
const getAccessToken = require('./access-token')
const { baseEndpoint: { api }, defaultApiConfiguration } = require('../config')

let user = {}

/**
 * Returns the cached username, or triggers an API call to fetch it
 * @returns {String} username
 */
async function getUsername () {
  debug('get username')
  if (!user.username) {
    debug('no user found. will fetch it')
    user = await getUserInfos()
  }
  return user.username
}

/**
 * Retrieves user informations, such as the username
 */
async function getUserInfos () {
  debug('user', `api endpoint is ${api}`)
  let accessToken = await getAccessToken()

  return got(
    new URL('v1/users', api),
    Object.assign({}, defaultApiConfiguration, {
      query: {
        me: true
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  )
    .then(({ body: { data: [ userInformations ] } }) => {
      debug('user ok', user)
      user = userInformations
      return userInformations
    })
    .catch(({ code, response, statusCode, url }) => {
      debug('user ko', code, statusCode, response, url)
      let error
      if (response) {
        error = new Error(`User informations retrieval failed.\nServer replied with a ${statusCode} status and body: ${JSON.stringify(response.body)}`)
      } else {
        error = new Error(`User info retrieval errored. Code: ${code}, status: ${statusCode}. URL: ${url}`)
      }
      return Promise.reject(error)
    })
}

exports.getUsername = getUsername
