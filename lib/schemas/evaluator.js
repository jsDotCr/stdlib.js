const Joi = require('../joi')

const evaluatorSchema = Joi.object().keys({
  belongsTo: Joi.string(),
  section: Joi.func().arity(1),
  test: Joi.func().arity(1),
  type: Joi.string(),
  value: Joi.func().arity(1)
}).requiredKeys('belongsTo', 'test', 'type', 'value')

module.exports = evaluatorSchema
