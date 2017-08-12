const chai = require('chai')
const { describe, it, beforeEach, afterEach } = require('mocha')
// const proxyquire = require('proxyquire').noPreserveCache()
const rewire = require('rewire')
const sinon = require('sinon')
const { expect } = chai
chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))

describe('access token', function () {
  let sandbox = []
  beforeEach(function () {
    sandbox = []
  })
  describe('getter', function () {
    it('calls login() the first time – login succeeds', function () {
      const accessTokenResult = 42
      const accessToken = rewire('./access-token')
      sandbox.push(
        accessToken.__set__('login', () => Promise.resolve(accessTokenResult))
      )
      return expect(accessToken.getAccessToken())
        .to.eventually.equal(accessTokenResult)
    })
    it('calls login only once', async function () {
      const accessTokenResult = 42
      const loginStub = sinon.stub()
      const getAccessToken = rewire('./access-token')
      sandbox.push(
        getAccessToken.__set__('login', loginStub.resolves(accessTokenResult))
      )
      await getAccessToken()
      expect(loginStub).to.have.been.calledOnce // eslint-disable-line no-unused-expressions
      await getAccessToken()
      expect(loginStub).to.have.been.calledOnce // eslint-disable-line no-unused-expressions
      await getAccessToken()
      expect(loginStub).to.have.been.calledOnce // eslint-disable-line no-unused-expressions
    })
  })

  describe('login', function () {
    it('returns the access token if post returns it', async function () {
      const fakeAccessToken = 42
      const postStub = sinon.stub()
      const accessTokenModule = rewire('./access-token')
      const login = accessTokenModule.__get__('login')
      sandbox.push(
        accessTokenModule.__set__('post', postStub.resolves({ body: { data: [ { access_token: fakeAccessToken } ] } }))
      )
      const loginResult = await login()
      expect(postStub).to.have.been.calledOnce // eslint-disable-line no-unused-expressions
      return expect(loginResult).to.equal(fakeAccessToken)
    })

    it('rejects the promise if an error occurs', async function () {
      const postStub = sinon.stub()
      const accessTokenModule = rewire('./access-token')
      const login = accessTokenModule.__get__('login')
      sandbox.push(
        accessTokenModule.__set__('post', postStub.rejects({
          statusCode: 500,
          response: {
            body: 'erm... fail?'
          }
        }))
      )
      return expect(login()).to.be.rejected
    })
    it('calls the post API with expected parameters', async function () {
      const postStub = sinon.stub()
      const accessTokenModule = rewire('./access-token')
      sandbox.push(
        accessTokenModule.__set__('post', postStub.resolves({ body: { data: [ { access_token: 42 } ] } }))
      )
      const login = accessTokenModule.__get__('login')
      await login()
      expect(postStub.getCall(0).args[0]).to.be.an('URL')
        .that.has.property('href')
        .that.contains(accessTokenModule.__get__('api'))
      expect(postStub.getCall(0).args[1]).to.be.an('object')
        .and.to.have.property('body')
        .that.includes.keys('grant_type', 'username', 'password')
    })
  })

  afterEach(function () {
    sandbox.forEach(revert => revert())
  })
})
