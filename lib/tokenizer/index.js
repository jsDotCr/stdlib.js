const debug = require('debug')('stdlibjs:tokenizer')
const { join } = require('path')
const Joi = require('../joi')
const evaluatorList = require('require-all')(join(__dirname, '/evaluators'))
const evaluatorSchema = require('../schemas/evaluator')

let _currentSection = ''

function tokenizer (accumulator, currentLine, currentIndex, lines) {
  const prevLine = lines[currentIndex - 1]
  const nextLine = lines[currentIndex + 1]

  for (const evaluator of Object.values(evaluatorList)) {
    const { type, test, value, section, belongsTo } = Joi.attempt(evaluator, evaluatorSchema)
    if (!test({ currentLine, prevLine, nextLine })) {
      continue
    }
    debug('test ok', type, _currentSection, accumulator, currentLine, currentIndex)
    const { type: tokenKey = type, value: tokenValue } = value({
      currentLine,
      prevLine,
      nextLine,
      section: (accumulator[belongsTo] || {})[_currentSection]
    })
    if (tokenKey && typeof (tokenValue) !== 'undefined') {
      debug('value', tokenKey, tokenValue)
      if (!accumulator[belongsTo]) {
        accumulator[belongsTo] = {}
      }
      if (section) {
        let newSection = section({ currentLine })
        if (newSection) {
          debug('new section!', newSection)
          _currentSection = newSection
          accumulator[belongsTo][_currentSection] = {}
        }
      }
      if (tokenValue.error) {
        accumulator.errors = accumulator.errors || []
        accumulator.errors.push(Object.assign({}, tokenValue, {
          type: tokenKey
        }))
      }
      if (belongsTo === 'function') {
        accumulator[belongsTo][_currentSection][tokenKey] = tokenValue
      } else {
        accumulator[belongsTo][tokenKey] = tokenValue
      }
    }
  }
  return accumulator
}

module.exports = tokenizer
