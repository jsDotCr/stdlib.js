const { expect } = require('chai')
const { describe, it } = require('mocha')

describe('main export module', function () {
  it('exports an object', function () {
    expect(require('./index.js')).to.be.an('object')
  })
  it('exports up and down', function () {
    const mainModule = require('./index.js')
    expect(mainModule).to.include.all.keys('up', 'down')
  })
  it('exposes functions up and down', function () {
    const mainModule = require('./index.js')
    expect(mainModule.up).to.be.a('function')
    expect(mainModule.down).to.be.a('function')
  })
})
