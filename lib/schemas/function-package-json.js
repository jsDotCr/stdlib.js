const Joi = require('../joi')

const validFunctionSchema = Joi.object().keys({
  stdlib: Joi.object().keys({
    name: Joi.string().required(),
    timeout: Joi.number().max(30000),
    build: Joi.string().required(),
    publish: Joi.boolean(),
    personalize: Joi.object()
  }).unknown(true),
  name: Joi.string().required(),
  main: Joi.string().required(),
  version: Joi.string().required()
}).unknown(true)

module.exports = validFunctionSchema
