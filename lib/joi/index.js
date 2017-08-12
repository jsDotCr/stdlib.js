const Joi = require('joi')
const { access, constants: { R_OK } } = require('fs')
const { promisify } = require('util')

const extendedJoi = Joi.extend(joi => {
  return {
    base: Joi.string(),
    name: 'path',
    rules: [
      {
        name: 'accessible',
        validate (params, value, state, options) {
          return promisify(access)(value, R_OK)
        }
      }
    ]
  }
})

module.exports = extendedJoi
