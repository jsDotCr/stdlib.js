const chai = require('chai')
const { describe, it } = require('mocha')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()
const { expect } = chai
chai.use(require('sinon-chai'))

describe('cli', function () {
  it('calls yargs', function () {
    const commandStub = sinon.stub()
    const demandCommandStub = sinon.stub()
    const helpStub = sinon.stub()
    const yargsStub = {
      commandDir: commandStub.returnsThis(),
      demandCommand: demandCommandStub.returnsThis(),
      help: helpStub.returnsThis()
    }
    proxyquire('./cli', {
      'yargs': yargsStub
    })
    expect(commandStub, 'commandStub').to.have.been.calledOnce.and.calledWith('commands')
    expect(demandCommandStub, 'demandCommandStub').to.have.been.calledOnce // eslint-disable-line no-unused-expressions
    expect(helpStub, 'helpStub').to.have.been.calledOnce // eslint-disable-line no-unused-expressions
  })
})
