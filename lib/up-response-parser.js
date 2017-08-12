const debug = require('debug')('stdlibjs:up:parser')
const { Writable } = require('stream')

class UpResponseParser extends Writable {
  constructor ({ env, serviceName, username, resolve, reject }) {
    super()

    this.env = env
    this.serviceName = serviceName
    this.username = username
    this.result = {}
    this.resolve = resolve
    this.reject = reject

    this.infoRegExp = new RegExp('\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}.\\d{3} \\[(.*)/(.*)\\] (.*)(!|...)')
    this.docRegExp = new RegExp('\\(?(.*?)\\)?\\n-{3,}\\nurl:\\s+(.*)\\ncode:\\s+(.*)\\nshell:\\s+(.*)\\ncontext:\\s+(.*)\\nbg:\\s+(.*)', 'm')
  }
  parseInfoLine (line) {
    const [ hasMatch, , , infos ] = this.infoRegExp.exec(line)
    if (hasMatch && infos) {
      debug('info match', infos)
      const { key, value } = this.getInfo(infos)
      debug('info k/v', key, value)
      this.result[key] = value
      return true
    } else {
      debug('info not match', line)
      return false
    }
  }
  parseDocLine (line) {
    debug('doc', line)
    const [ hasMatch, functionName, url, code, shell, context, bg ] = this.docRegExp.exec(line)
    if (hasMatch) {
      debug('doc match', functionName, url)
      this.result[functionName] = {
        name: functionName,
        url,
        code,
        shell,
        context,
        bg
      }
    } else {
      debug('doc not match', line)
      return false
    }
  }
  getInfo (info) {
    if (info.includes('Authenticated as')) {
      return {
        key: 'authentication',
        value: true
      }
    }
    if (info.includes('Extracting package contents')) {
      return {
        key: 'size',
        value: /\(size (\d*)\)/.exec(info)[1]
      }
    }
    if (info.includes('Compiling package')) {
      return {
        key: 'compile',
        value: true
      }
    }
    if (info.includes('Installing package dependencies')) {
      return {
        key: 'install',
        value: true
      }
    }
    if (info.includes('Uploading compiled package')) {
      return {
        key: 'upload',
        value: true
      }
    }
    if (info.includes('Registering compiled package')) {
      return {
        key: 'register',
        value: true
      }
    }
    if (info.includes('Starting service')) {
      return {
        key: 'start',
        value: true
      }
    }
    if (info.includes('now available')) {
      return {
        key: 'availableAs',
        value: /"(.*)"/.exec(info)[1]
      }
    }
  }
  write (data, _, next) {
    const line = data.toString()
    if (!this.parseInfoLine(line)) {
      this.parseDocLine(line)
    }
    next()
  }
  error (e) {
    this.reject(e)
  }
  final (done) {
    debug(2)
    this.resolve(this.response)
  }
}

module.exports = UpResponseParser
