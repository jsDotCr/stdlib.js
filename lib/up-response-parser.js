const debug = require('debug')('stdlibjs:up:parser')
const { Writable } = require('stream')
const { inspect } = require('util')
const tokenizer = require('./tokenizer')

class UpResponseParser extends Writable {
  constructor ({ env, serviceName, username, resolve, reject }) {
    super()

    this.env = env
    this.serviceName = serviceName
    this.username = username
    this.response = []
    this.resolve = resolve
    this.reject = reject
  }
  _write (data, _, next) {
    this.response = this.response.concat(data.toString().split('\n'))
    next()
  }
  _final (done) {
    debug('final!', this.response)
    this.response = this.response.reduce(tokenizer, {})
    if (this.response.errors) {
      debug('errors found, tokenizer says', this.response)
      return this.reject(new Error(inspect(this.response.errors)))
    }
    this.resolve(this.response)
  }
}

module.exports = UpResponseParser
