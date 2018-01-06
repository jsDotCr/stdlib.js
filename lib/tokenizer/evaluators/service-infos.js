const debug = require('debug')('stdlib:token:serviceinfos')

function matchNameTime ({ time, fn }) {
  return {
    fn,
    time
  }
}

function matchFullName ({ time, fn, text }) {
  return {
    fn,
    time,
    fullName: text.match(/"(.*?)"/)[1],
    error: text
  }
}

function matchEnvironment ({ time, fn, text }) {
  return {
    fn,
    time,
    environment: text.match(/"(.*?)"/)[1]
  }
}

function matchVersion ({ time, fn, text }) {
  return {
    fn,
    time,
    version: text.match(/\((.*?)\)/)[1]
  }
}

const textToValue = [
  {
    matches: 'Authenticated as',
    type: 'authentication',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        as: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'Compiling package with environment',
    type: 'compileWithEnvironment',
    value: matchEnvironment
  },
  {
    matches: 'Compiling package (',
    type: 'compileRelease',
    value: matchVersion
  },
  {
    matches: 'Removing package with environment',
    type: 'removeFromEnvironment',
    value: matchEnvironment
  },
  {
    matches: 'Removing package (',
    type: 'removeRelease',
    value: matchVersion
  },
  {
    matches: 'Extracting package contents',
    type: 'extractContents',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        size: text.match(/\(size (.*?)\)/)[1]
      }
    }
  },
  {
    matches: 'Installing package dependencies',
    type: 'installDependencies',
    value: matchNameTime
  },
  {
    matches: 'Preparing compilation package',
    type: 'prepareCompilation',
    value: matchNameTime
  },
  {
    matches: 'Uploading compiled package',
    type: 'upload',
    value: matchNameTime
  },
  {
    matches: 'Registering compiled package',
    type: 'register',
    value: matchNameTime
  },
  {
    matches: 'Starting service',
    type: 'start',
    value: matchNameTime
  },
  {
    matches: 'now available',
    type: 'available',
    value: matchFullName
  },
  {
    matches: 'has been removed',
    type: 'removed',
    value: matchFullName
  },
  {
    matches: 'Cleaning up registry',
    type: 'cleanUp',
    value: matchNameTime
  },
  {
    matches: 'No such package',
    type: 'packageNotFound',
    value: matchFullName
  },
  {
    matches: 'has already been removed',
    type: 'packageAlreadyRemoved',
    value: matchFullName
  },
  {
    matches: 'Bad Request: Conflict',
    type: 'packageVersionConflicts',
    value: ({ time, fn, text }) => {
      const [ , newVersion, oldVersion ] = text.match(/"(.*?)".*"(.*?)"/)
      return {
        fn,
        time,
        newVersion,
        oldVersion,
        error: text
      }
    }
  }
]

module.exports = {
  type: 'service-infos',
  test: ({ currentLine }) => /^[\d-/\s:.]{20,}\[(.*?)\]/g.test(currentLine),
  value: ({ currentLine }) => {
    let [ , time, fn, text ] = currentLine.match(/^(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\s\[(.*?)\]\s(.*?)(?:!|\.)?$/)
    debug('type', time, fn, text)
    const { type, value } = textToValue.find(({ matches, type, value }) => text.includes(matches)) || {}

    if (type && value) {
      return {
        type,
        value: value({ time, fn, text })
      }
    } else {
      return {}
    }
  },
  belongsTo: 'service'
}
