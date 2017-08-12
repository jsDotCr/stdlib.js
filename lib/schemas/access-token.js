const Joi = require('../joi')
const { email, password } = require('../../config')

const accessTokenInputSchema = Joi.object().keys({
  username: Joi.string().default(() => email, 'Default email (from the env variables)'),
  password: Joi.string().default(() => password, 'Default password (from the env variables)')
})

const accessTokenResponseSchema = Joi.object().keys({
  body: Joi.object().keys({
    meta: Joi.object(),
    data: Joi.array().items(Joi.object().keys({
      id: Joi.any(),
      created_at: Joi.date(),
      expires_at: Joi.date(),
      user: Joi.object(),
      access_token: Joi.string()
    }))
  })
}).unknown(true)

exports.accessTokenInputSchema = accessTokenInputSchema
exports.accessTokenResponseSchema = accessTokenResponseSchema
